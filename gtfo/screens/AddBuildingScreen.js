import React from "react";
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

  render() {
    return (
      <View style={{ paddingVertical: 20 }}>
        <Card>
          <FormLabel>Building Name</FormLabel>
          <FormInput
            placeholder="Name..."
            onChangeText={input => this.state.email = input}
          />
          <Button
            buttonStyle={{ marginTop: 20 }}
            backgroundColor="#03A9F4"
            title="Register building"
            onPress={() => console.log("pressed")}
        />
      </Card>
    </View> );
  }
}
