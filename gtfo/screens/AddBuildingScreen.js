import React from "react";
import { ImagePicker, Permissions } from 'expo';
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
      return;
    }

    // TODO: this kicks off  wall extraction and sends image result to server
    // 1) allow user to upload image
    // 2) save to the device in a directory with building name (need to discuss this...
    // alternatively could host on server file system -- definitely don't want it in a DB)
    // because how would we get non-admin members to have access to floor plan images?

    // We should work on getting this stored in bulk storage like S3/server file system. My reasons:
    // 1. complexity associated with storing on device and maintaining cross-platform compatibility--different file systems
    // 2. complexity with getting images to non-admin members that didn't upload images

    // 3) Call on the extract walls endpoint (how is that result sent to our server?)
    // 4) add a building to this user

    // for now i'm just gonna allow image uploads and pass it to the flask server
    this.props.navigation.navigate('Building');
  }

}
