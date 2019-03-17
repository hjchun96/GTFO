import React from "react";
import { ImagePicker, Permissions, FileSystem } from 'expo';
import base64 from 'base64-js'
import {
  View,
  Image,
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
import { checkBuilding, createBuilding } from "../fetch/FetchWrapper";

export default class AddBuildingScreen extends React.Component {
  static navigationOptions = {
    title: 'Add a building',
  };

  state = {
    name: '',
    photo: null,
  }

  render() {
    return (
      <View style={{ paddingVertical: 20 }}>
        <Card>
          <FormLabel>Building Name</FormLabel>
          <FormInput
            placeholder="Name..."
            onChangeText={input => this.state.name = input}
          />
          <Card style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            {this.state.photo && (
              <Image
                source={{ uri: this.state.photo.uri }}
                style={{ width: 150, height: 150 }}
              />)
            }
          </Card>
          <Button
            buttonStyle={{ marginTop: 20, marginBottom: 20 }}
            backgroundColor="#03A9F4"
            title="Choose floorplan image"
            onPress={() => this._handleChoosePhoto()}
          />
          <Button
            buttonStyle={{ marginTop: 20 }}
            backgroundColor="#03A9F4"
            title="Register building"
            onPress={() => this._addBuilding()}
          />
      </Card>
    </View> );
  }
  // TODO: have a button that allows adding additional floorplan images

  _handleChoosePhoto = async () => {
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
    this.setState({photo: result});
  }

  _addBuilding = async () => {
    if (!this.state.name || !this.state.photo) {
      alert("Please fill out all fields and choose a floorplan image.");
      this.state.name = null;
      this.state.photo = null;
      return;
    }

    if (!checkBuilding(this.state.name)) {
      alert("Building name already exists. Please pick a different name.");
      this.state.name = null;
      this.state.photo = null;
      return;
    }

    let user = await AsyncStorage.getItem('userToken');
    createBuilding(user, this.state.photo.base64);


    // TODO: this kicks off  wall extraction and sends image result to server
    // 1) allow user to upload image
    // 2) check that building doesn't already exist
    /* the rest of this can be done async */
    // 3) save to S3 (returns URL)
    // 4) Call on the extract walls endpoint with building name/URL to original image (which also creates an entry on S3)
    // 5) Create building
    // 6) Add building to this user as admin (username, buildingID)
    // 7) Add a building to this user (after S3 sends back URL)

    this.props.navigation.navigate('Building');
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
