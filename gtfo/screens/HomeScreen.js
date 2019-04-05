import React from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  Text,
  Button,
  TouchableOpacity,
  FlatList,
  ListItem,
  AsyncStorage,
  Alert,
} from 'react-native';
import { Icon, Header } from 'react-native-elements'
import { Ionicons } from '@expo/vector-icons';
import { getAllBuildings, getImage } from "../fetch/FetchWrapper";
import { Location, Permissions, Constants } from 'expo';
import logo1 from '../assets/images/logo1.png';
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
    closestBuildings: []
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
        <Header
              placement="left"
              containerStyle={styles.welcomeContainer}
              backgroundColor="#0079C6"
              centerComponent={<Image source={logo1} style={styles.welcomeImage} />}
        />
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
          {closestBuildings.length != 0 &&
          (<FlatList
            data={closestBuildings}
            renderItem={({item}) =>
              <Button
                style={styles.item}
                title={item.key}
                textStyle={{ color: "#0079C6" }}
                onPress={() => this._handleBuildingPressed(item.key)}
              />}
          />)}
        </ScrollView>
        <Button
          buttonStyle={styles.addBuildingButton}
          title="Add a building"
          textStyle={{ color: "#0079C6" }}
          onPress={() => this._handleAddBuildingButtonPressed()}
        />
      </View>
    );
  }

  _handleAddBuildingButtonPressed = () => {
    this.props.navigation.navigate("AddBuilding");
  }

  _getLocationAsync = async () => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== 'granted') {
      this.setState({
        errorMessage: 'Permission to access location was denied',
      });
    }

    let location = await Location.getCurrentPositionAsync({});
    this.setState({ "coords": location.coords });

    return Promise.resolve(1);
  }

  _handleBuildingPressed = (building_name) => {
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
            this.props.navigation.navigate("Building", {
              building_name: building_name,
              img: image_string,
            });
          }
        })
    }
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
        distance = Math.pow(Math.abs(lat - myLat), 2) + Math.pow(Math.abs(lon - myLon), 2);
        closestBuildings.push({name, distance});
      }
    }

    closestBuildings.sort((ele1, ele2) => {
        return ele1.distance > ele2.distance;
    })

    var res = [];
    for (var i = 0; i < closestBuildings.length; i++) {
      res.push({key: closestBuildings[i].name});
    }

    this.setState({ closestBuildings: res })
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    flex: 1,
    paddingTop: 30,
    paddingVertical: 10,
    alignItems: 'center',
  },
  welcomeContainer: {
    alignItems: 'center',
    paddingTop: 40,
  },
  welcomeImage: {
    maxWidth: 110,
    maxHeight: 50,
    // width: auto,
    // height: auto,
    resizeMode: 'contain',
  },
  homeScreenFilename: {
    marginVertical: 7,
  },
  addBuildingButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
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
    backgroundColor: '#fbfbfb',
    paddingVertical: 20,
    paddingBottom: 20,
  },
  sectionHeader: {
    paddingTop: 2,
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 2,
    fontSize: 14,
    fontWeight: 'bold',
    backgroundColor: 'rgba(247,247,247,1.0)',
  },
  item: {
    padding: 10,
    marginBottom: 15,
    fontSize: 30,
    height: 44,
    fontFamily: "Roboto",
  },
  header: {
    backgroundColor: "#0079C6",

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
