import React from "react";
import { ImagePicker, Permissions, FileSystem } from 'expo';
import base64 from 'base64-js'
import {
  View,
  Image,
  Platform,
  AsyncStorage,
  StyleSheet,
  ScrollView
} from "react-native";
import {
  Card,
  Button,
  FormLabel,
  FormInput
} from "react-native-elements";
// import RNFS from 'react-native-fs';
import { checkBuilding, createBuilding, getImage } from "../fetch/FetchWrapper";
import KeyboardShift from '../components/KeyboardShift';
import Spinner from 'react-native-loading-spinner-overlay';

export default class AddBuildingScreen extends React.Component {
  static navigationOptions = ({navigation, navigationOptions}) => {
    return {
        title: 'Add a building',
        headerStyle: {
          backgroundColor: "#0079C6"
        },
        headerTintColor: "#fff",
      };
  };

  state = {
    name: '',
    longitude: '',
    latitude: '',
    photo: null,
    icon: null,
    spinner: false,
  }

  render() {
    return (
      <KeyboardShift style={styles.keyboardShiftStyle}>
        {() => (
          <ScrollView style={styles.scrollViewStyle}>
            <Spinner
              visible={this.state.spinner}
              textContent={'Loading...'}
              textStyle={styles.spinnerTextStyle}
            />
            <Card>
              <FormLabel labelStyle={styles.formLabel}>Building Name</FormLabel>
              <FormInput
                placeholder="Name..."
                onChangeText={input => this.state.name = input}
              />
            </Card>
            <Card style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <FormLabel labelStyle={styles.formLabel}>Floorplan Image</FormLabel>
              {this.state.photo && (
                <Image
                  source={{ uri: this.state.photo.uri }}
                  style={styles.photoImage}
                />)
              }
              <Button
                buttonStyle={{ marginTop: 20, marginBottom: 20 }}
                backgroundColor="#03A9F4"
                title="Choose floorplan image"
                onPress={() => this._handleChoosePhoto("photo")}
              />
            </Card>
            <Card style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <FormLabel labelStyle={styles.formLabel}>Floorplan Icon (optional)</FormLabel>
              {this.state.icon && (
                <Image
                  source={{ uri: this.state.icon.uri }}
                  style={styles.iconImage}
                />)
              }
              <Button
                buttonStyle={{ marginTop: 20, marginBottom: 20 }}
                backgroundColor="#03A9F4"
                title="Choose floorplan icon"
                onPress={() => this._handleChoosePhoto("icon")}
              />
            </Card>
            <Card>
              <FormLabel labelStyle={styles.formLabel}>Building Location</FormLabel>
              <View style={{}}>
                <FormInput
                  placeholder="Latitude..."
                  onChangeText={input => this.state.latitude = input}
                />
                <FormInput
                  placeholder="Longitude..."
                  onChangeText={input => this.state.longitude = input}
                />
            </View>
          </Card>
          <Button
            buttonStyle={{ marginTop: 20, marginBottom: 20}}
            backgroundColor="#03A9F4"
            title="Register building"
            onPress={() => this._addBuilding()}
          />
      </ScrollView>)}
    </KeyboardShift>
    );
  }
  // TODO: have a button that allows adding additional floorplan images

  _handleChoosePhoto = async (type) => {
    const permission = await Permissions.getAsync(Permissions.CAMERA_ROLL);
    const options = {
      noData: true,
      base64: true,
      allowsEditing: false
    }
    let result = null;
    if (permission.status !== 'granted') {
      const newPermission = await Permissions.askAsync(Permissions.CAMERA_ROLL);
      if (newPermission.status === 'granted') {
        result = await ImagePicker.launchImageLibraryAsync(options);
      }
    } else {
      result = await ImagePicker.launchImageLibraryAsync(options);
    }
    if (type === "photo") {
      this.setState({photo: result});
    } else {
      this.setState({icon: result});
    }
  }

  _clearState = async () => {
    this.state.name = '';
    this.state.photo = null;
    this.state.longitude = '';
    this.state.latitude = '';
  }

  _addBuilding = async () => {
    if (!this.state.name || !this.state.photo) {
      this.setState({spinner: false});
      setTimeout(() => {
        alert("Please fill out all fields and choose a floorplan image.");
      }, 100);
      return;
    }

    if (!this.state.longitude || !this.state.latitude) {
      this.setState({spinner: false});
      setTimeout(() => {
        alert("Please input the coordinates for the building");
      }, 100);
      this.setState({spinner: false});
      return;
    }

    this.setState({spinner: true}, () => { this.setState({spinner: true}) });

    checkBuilding(this.state.name)
      .then(res => {
        if (res) {
          this.setState({spinner: false});
          setTimeout(() => {
            alert("Building name already exists. Please pick a different name.");
          }, 100);
          return null;
        } else {
          return AsyncStorage.getItem('userToken');
        }
      }).then(user => {
        if (user) {
          if (!this.state.icon) {
            return createBuilding(this.state.name, this.state.photo.base64,
            this.state.latitude, this.state.longitude, null);
          }
          return createBuilding(this.state.name, this.state.photo.base64,
            this.state.latitude, this.state.longitude, this.state.icon.base64);
        } else {
          return null;
        }
      }).then(success => {
        if (success) {
          console.log(success);
          return getImage(this.state.name);
        }
      }).then(json => {
        if (json) {
          this.setState({spinner: false});
          if (json.err) {
            console.log("Error fetching image");
            alert("Could not find floorplan image");
          } else {
            var image_string = 'data:image/png;base64,'+json.img[0];
            this.props.navigation.navigate("Building", {
              building_name: this.state.name,
              img: image_string,
              h: json.h,
              w: json.w,
            });
          }
        }
      });
      this.setState({spinner: false});
  }
}

/**
 * Helper to convert string to byte array
 */
function stringToUint8Array(str) {
  const length = str.length;
  const array = new Uint8Array(new ArrayBuffer(length));
  for(let i = 0; i < length; i++) {
    array[i] = str.charCodeAt(i);
  }
  return array;
}

const styles = StyleSheet.create({
  keyboardShiftStyle: {
    flex: 1,
    paddingTop: 30,
    paddingBottom: 30,
  },
  scrollViewStyle: {
    ...Platform.select({
      ios: {
        marginTop: 60
      },
      android: {
        marginTop: 30
      }
    })
  },
  spinnerTextStyle: {
    color: '#FFF'
  },
  iconImage: {
    width: 50,
    height: 50,
    marginTop: 20,
    marginLeft: 70,
    flex: 1
  },
  photoImage: {
    width: 150,
    height: 150,
    marginTop: 20,
    marginLeft: 70,
    flex: 1
  },
  formLabel: {
    color: '#696969',
  }
});
