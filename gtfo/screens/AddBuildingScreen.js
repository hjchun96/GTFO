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
import { checkBuilding, createBuilding, getImage } from "../fetch/FetchWrapper";
import KeyboardShift from '../components/KeyboardShift';

export default class AddBuildingScreen extends React.Component {
  static navigationOptions = {
    title: 'Add a building',
  };

  state = {
    name: '',
    longitude: '',
    latitude: '',
    photo: null,
  }

  render() {
    return (
      <KeyboardShift>
        {() => (
        <ScrollView style={{ paddingVertical: 20, marginBottom: 20 }}>
          <Card>
            <FormLabel>Building Name</FormLabel>
            <FormInput
              placeholder="Name..."
              onChangeText={input => this.state.name = input}
            />
          </Card>
          <Card style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <FormLabel>Floorplan Image</FormLabel>
            {this.state.photo && (
              <Image
                source={{ uri: this.state.photo.uri }}
                style={{ width: 150, height: 150 }}
              />)
            }
            <Button
              buttonStyle={{ marginTop: 20, marginBottom: 20 }}
              backgroundColor="#03A9F4"
              title="Choose floorplan image"
              onPress={() => this._handleChoosePhoto()}
            />
          </Card>
          <Card>
            <FormLabel>Building Location</FormLabel>
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

  _clearState = async () => {
    this.state.name = '';
    this.state.photo = null;
    this.state.longitude = '';
    this.state.latitude = '';
  }

  _addBuilding = async () => {
    if (!this.state.name || !this.state.photo) {
      alert("Please fill out all fields and choose a floorplan image.");
      return;
    }

    if (!this.state.longitude || !this.state.latitude) {
      alert("Please input the coordinates for the building")
      return;
    }

    checkBuilding(this.state.name)
      .then(res => {
        if (res) {
          alert("Building name already exists. Please pick a different name.");
          return null;
        } else {
          return AsyncStorage.getItem('userToken');
        }
      }).then(user => {
        if (user) {
          return createBuilding(this.state.name, this.state.photo.base64,
            this.state.longitude, this.state.latitude)
        } else {
          return null;
        }
      }).then(success => {
        // TODO: timing out
        if (success) {
          return getImage(this.state.name)
        }
      }).then(resp => resp.json())
        .then(json => {
          if (json.err) {
            console.log("Error fetching image");
            Alert.alert("Could not find floorplan image");
          } else {
            var image_string = 'data:image/png;base64,'+json.img[0];
            this.props.navigation.navigate("Building", {
              building_name: this.state.name,
              img: image_string,
            });
          }
      });
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
