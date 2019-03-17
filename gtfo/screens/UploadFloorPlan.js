import React from 'react'
import { View, Text, Image, Button } from 'react-native'
import ImagePicker from 'react-native-image-picker'

// TODO: Daniel pls vet this

export default class UploadFloorPlan extends React.Component {
  state = {
    photo: null,
  }

  handleChoosePhoto = () => {
    const options = {
      noData: true,
    }
    ImagePicker.launchImageLibrary(options, response => {
      if (response.uri) {
        this.setState({ photo: response })
      }
    })
  }

  handleUploadPhoto = () => {
    // TODO: fill in these variables
    uploadURL = "http://localhost:3000/api/upload";
    userId = 71

  fetch(uploadURL, {
    method: "POST",
    body: createFormData(this.state.photo, { userId: userId })
  })
    .then(response => response.json())
    .then(response => {
      console.log("upload success", response);
      alert("Upload success!");
      this.setState({ photo: null });
    })
    .catch(error => {
      console.log("upload error", error);
      alert("Upload failed!");
    });
};

  render() {
    const { photo } = this.state
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        {photo && (
          <React.Fragment>
            <Image
              source={{ uri: photo.uri }}
              style={{ width: 300, height: 300 }}
            />
            <Button title="Upload" onPress=[this.handleUploadPhoto} />
          </React.Fragment>
        )}
        <Button title="Choose Photo" onPress={this.handleChoosePhoto} />
      </View>
    )
  }
}
