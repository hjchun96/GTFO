import React from "react";
import { View } from "react-native";
import { Card, Button, FormLabel, FormInput } from "react-native-elements";
// import { onSignIn } from "../auth";

export default class SignUpScreen extends React.Component {
  static navigationOptions = {
    title: 'Please sign up here.',
  };

  render() {
    return (
      <View style={{ paddingVertical: 20 }}>
        <Card>
          <FormLabel>Email</FormLabel>
          <FormInput placeholder="Email address..." />
          <FormLabel>Password</FormLabel>
          <FormInput secureTextEntry placeholder="Password..." />
          <FormLabel>Confirm Password</FormLabel>
          <FormInput secureTextEntry placeholder="Confirm Password..." />

          <Button
            buttonStyle={{ marginTop: 20 }}
            backgroundColor="#03A9F4"
            title="Sign up"
            onPress={() => alert("You signed up!")}
          />
        </Card>
      </View>
    );
  }

  _signUpAsync = async () => {
    // TODO: actually sign up the user
    await AsyncStorage.setItem('userToken', 'abc');
    this.props.navigation.navigate('Main');
    alert("You signed up!")
  }
}
