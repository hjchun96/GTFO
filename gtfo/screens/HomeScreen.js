import React from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  AsyncStorage,
  StatusBar,
  Alert,
  RefreshControl,
} from 'react-native';
import { Header, Button, ListItem } from 'react-native-elements'
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
        <Text style={styles.text}>Closest Buildings</Text>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          refreshControl={<RefreshControl refreshing={this.state.refreshing} onRefresh={() => this._getLocationAsync().then(() => this._getClosestBuildings())}/>}
        >
          {closestBuildings.length != 0 &&
            closestBuildings.map((building, i) => (
              <ListItem
                key={i}
                // leftAvatar={{ source: { uri: building.avatar_url } }}
                title={building.name}
                subtitle={building.distance + " km away"}
                onPress={() => this._handleBuildingPressed(building.name)}
              />
            ))
          }
        </ScrollView>
        <Button
          small
          buttonStyle={styles.addBuildingButton}
          icon={{name: 'plus', type: 'font-awesome'}}
          title='ADD A BUILDING'
          // color= "#0079C6"
          onPress={() => this._handleAddBuildingButtonPressed()}
          />
      </View>
    );
  }

  _getDistance = (lat1, lon1, lat2, lon2) => {
    var R = 6371; // Radius of the earth in km
    var dLat = this._degreeToRadius(lat2-lat1);  // deg2rad below
    var dLon = this._degreeToRadius(lon2-lon1);
    var a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this._degreeToRadius(lat1)) * Math.cos(this._degreeToRadius(lat2)) *
      Math.sin(dLon/2) * Math.sin(dLon/2)
      ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c; // Distance in km
    return d;
  }

  _degreeToRadius = (deg) => {
    return deg * (Math.PI/180)
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

    for (var i = 0; i < buildings.length; i++) {
      var name = buildings[i].name;
      var lat = parseFloat(buildings[i].lat);
      var lon = parseFloat(buildings[i].lon);

      if (Math.abs(lat - myLat) <= .01 && Math.abs(lon - myLon) <= .01) {
        distance = this._getDistance(myLat, myLon, lat, lon).toFixed(3);
        closestBuildings.push({name, distance});
        this._retrieveBuildingImg(name);
      }
    }

    closestBuildings.sort((ele1, ele2) => {
        return ele1.distance > ele2.distance;
    })
    this.setState({ closestBuildings, "refreshing": false })
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    backgroundColor: '#fff',
    paddingTop: 20,
    paddingVertical: 10,
    // alignItems: 'center',
    alignItems: 'stretch',
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
  addBuildingButton: {
    backgroundColor: "#0079C6",
    marginVertical: 5,
    borderRadius:10,
    // width:"70%",
    alignItems: 'center'
  },
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
  },
  header: {
    backgroundColor: "#0079C6",

  },
  text: {
    textAlign: 'center',
    paddingTop: 10,
    fontWeight: "800",
    fontSize: 24,
    fontFamily: 'System',
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
