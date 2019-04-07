import React from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  Text,
  // Button,
  TouchableOpacity,
  FlatList,
  ListItem,
  AsyncStorage,
  StatusBar,
  Alert,
  RefreshControl,
} from 'react-native';
import { Header, Button } from 'react-native-elements'
import { Ionicons } from '@expo/vector-icons';
import { getAllBuildings, getImage } from "../fetch/FetchWrapper";
import { Location, Permissions, Constants } from 'expo';
import logo1 from '../assets/images/logo1.png';
import Icon from 'react-native-vector-icons/FontAwesome';
import PTRView from 'react-native-pull-to-refresh';

export default class HomeScreen extends React.Component {
  static navigationOptions = {
    header: null,
  };

  componentWillMount() {
    if (Platform.OS === 'android' && !Constants.isDevice) {
      this.setState({
        errorMessage: 'Oops, this will not work on Sketch in an Android emulator. Try it on your device!',
      });
    } else {
      this._getLocationAsync().then(() => this._getClosestBuildings());
    }
  }

  state = {
    coords: null,
    closestBuildings: [],
    refreshing: false
  }

  render() {
    const { closestBuildings } = this.state;
    if (closestBuildings.length == 0) {
      console.log("Loading closest buildings")
      return (
        <View style={styles.loading}>
          <Image source={logo1} style={styles.loadingImage} />
        </View>
      )
    }

    return (
      <View style={styles.container}>
        <StatusBar
          barStyle="light-content"
          containerStyle={{paddingBottom:100}}
        />
        <Header
          containerStyle={styles.welcomeContainer}
          backgroundColor="#0079C6"
          centerComponent={<Image source={logo1} style={styles.welcomeImage} />}
        />


        <Text style={styles.text}>
          Closest Buildings
        </Text>
        <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        refreshControl={<RefreshControl refreshing={this.state.refreshing} onRefresh={() => this._getLocationAsync().then(() => this._getClosestBuildings())}/>}
        >
          {closestBuildings.length != 0 &&
          (<FlatList style={{ backgroundColor:"#fff"}}
            data={closestBuildings}
            renderItem={({item}) =>
              <Button
                buttonStyle={styles.listitem}
                title={item.key}
                // icon={{name: 'building', type: 'font-awesome'}}
                textStyle={{ color: "#fff" }}
                onPress={() => this._handleBuildingPressed(item.key)}
              />}
          />)}
        </ScrollView>
        <Button
          small
          buttonStyle={styles.item}
          icon={{name: 'plus', type: 'font-awesome'}}
          title='Add a Building'
          onPress={() => this._handleAddBuildingButtonPressed()}
          />
      </View>
    );
  }

  _handleAddBuildingButtonPressed = () => {
    this.props.navigation.navigate("AddBuilding");
  }

  _getLocationAsync = async () => {
    this.setState({"refreshing":true});
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== 'granted') {
      this.setState({
        errorMessage: 'Permission to access location was denied',
      });
    }

    let location = await Location.getCurrentPositionAsync({});
    this.setState({ "coords": location.coords});
    console.log("got the coords:" + JSON.stringify(location.coords));

    return Promise.resolve(1);
  }

  _retrieveBuildingImg = (building_name) => {
    if (building_name != '') {
      // Call endpoint
      var image = getImage(building_name);
      image.then(resp => resp.json())
        .then(json => {
          if (json.err) {
            console.log("Error fetching image");
            Alert.alert("Could not find floorplan image");
          } else {
            var image_string = 'data:image/png;base64,'+json.img[0];
            this.setState({[building_name]: image_string})
          }
        })
    }
  }

  _handleBuildingPressed = (building_name) => {
    this.props.navigation.navigate("Building", {
      building_name: building_name,
      img: this.state[building_name],
    });
  }

  _getClosestBuildings = async () => {
    var buildings = await getAllBuildings();
    var closestBuildings = [];

    var myLat = this.state.coords.latitude;
    var myLon = this.state.coords.longitude;

    console.log("myLat: " + myLat + ", myLon: " + myLon)

    for (var i = 0; i < buildings.length; i++) {
      var name = buildings[i].name;
      var lat = parseFloat(buildings[i].lat);
      var lon = parseFloat(buildings[i].lon);

      console.log("Building " + name + " lives on lat: " + lat + ", lon: " + lon);

      if (Math.abs(lat - myLat) <= .01 && Math.abs(lon - myLon) <= .01) {
        distance = Math.pow(Math.abs(lat - myLat), 2) + Math.pow(Math.abs(lon - myLon), 2);
        closestBuildings.push({name, distance});
        this._retrieveBuildingImg(name);
      }
    }

    closestBuildings.sort((ele1, ele2) => {
        return ele1.distance > ele2.distance;
    })

    var res = [];
    for (var i = 0; i < closestBuildings.length; i++) {
      res.push({key: closestBuildings[i].name});

    }
    console.log("set the closestBuildings, done refreshing.");
    this.setState({ closestBuildings: res, "refreshing": false })
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    // paddingTop:10,
  },
  contentContainer: {
    backgroundColor: '#fff',
    flex: 1,
    paddingTop: 20,
    paddingVertical: 10,
    // alignItems: 'center',
    alignItems: 'stretch',
    marginLeft: 60,
    marginRight: 60,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginTop:30
    // height: 200,
    // paddingTop: 100,
  },
  welcomeImage: {
    maxWidth: 110,
    maxHeight: 50,
    marginTop: 200,
    marginVertical: -10,
    resizeMode: 'contain',
  },
  homeScreenFilename: {
    marginVertical: 7,
  },
  // homeScreenFilename: {
  //   marginVertical: 7,
  // },
  // addBuildingButton: {
  //   position: 'absolute',
  //   bottom: 0,
  //   left: 0,
  //   right: 0,
  //   ...Platform.select({
  //     ios: {
  //       shadowColor: 'black',
  //       shadowOffset: { height: -3 },
  //       shadowOpacity: 0.1,
  //       shadowRadius: 3,
  //     },
  //     android: {
  //       elevation: 20,
  //     },
  //   }),
  //   alignItems: 'center',
  //   backgroundColor: '#fff',
  //   paddingVertical: 20,
  //   paddingBottom: 20,
  // },
  addBuildingButton: {
    position: 'absolute',
    // bottom: 30,
    // left: 10,
    // right: 10,
    ...Platform.select({
      ios: {
        shadowColor: 'black',
        shadowOffset: { height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 20,
      },
    }),
    alignItems: 'center',
    paddingVertical: 20,
    paddingBottom: 20,
  },
  // sectionHeader: {
  //   paddingTop: 2,
  //   paddingLeft: 10,
  //   paddingRight: 10,
  //   paddingBottom: 2,
  //   fontSize: 14,
  //   fontWeight: 'bold',
  //   backgroundColor: 'rgba(247,247,247,1.0)',
  // },
  listitem: {
    backgroundColor: "#0079C6",
    borderWidth: 3.0,
    borderColor: '#000000',
    marginVertical: 2,
  },

  item: {
    backgroundColor: "#0079C6",
    borderWidth: 3.0,
    borderColor: '#000000',
    marginVertical: 5,

    // padding: 10,
    // marginBottom: 15,
    // fontSize: 30,
    // height: 44,
    // ...Platform.select({
    //     ios: {
    //       shadowColor: 'black',
    //       shadowOffset: { height: -3 },
    //       shadowOpacity: 0.1,
    //       shadowRadius: 3,
    //     },
    //     android: {
    //       elevation: 20,
    //     },
    //   }),
    // fontFamily: "Roboto",
  },
  header: {
    backgroundColor: "#0079C6",

  },
  text: {
    textAlign: 'center',
    paddingTop: 10,
    fontWeight: "800",
    fontSize: 24,
  },
  loading: {
    backgroundColor: "#0079C6",
    alignItems: 'center',
    flex: 1,
  },
  loadingImage: {
    flex: 1,
    width: 300,
    height: 'auto',
    resizeMode: 'contain',
  },
});
