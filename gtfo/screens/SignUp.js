import React from "react";
import { View, AsyncStorage } from "react-native";
import { Card, Button, FormLabel, FormInput } from "react-native-elements";
import { checkUser, createUser } from "../fetch/FetchWrapper";

export default class SignUpScreen extends React.Component {
  static navigationOptions = {
    title: 'Please sign up here.',
  };

  state = {
    email: '',
    password: '',
    confirmedPassword: '',
  };

  render() {
    return (
      <View style={{ paddingVertical: 20 }}>
        <Card>
          <FormLabel>Email</FormLabel>
          <FormInput
            placeholder="Email address..."
            onChangeText={input => this.state.email = input}
          />
          <FormLabel>Password</FormLabel>
          <FormInput
            secureTextEntry placeholder="Password..."
            onChangeText={input => this.state.password = input}
          />
          <FormLabel>Confirm Password</FormLabel>
          <FormInput secureTextEntry placeholder="Confirm Password..."
            onChangeText={input => this.state.confirmedPassword = input}
          />
          <Button
            buttonStyle={{ marginTop: 20 }}
            backgroundColor="#03A9F4"
            title="Sign up"
            onPress={() => this._signUpAsync()}
          />
        </Card>
      </View>
    );
  }

  _signUpAsync = async () => {
    if (!this.state.email || !this.state.password || !this.state.confirmedPassword) {
      alert("Please fill out all fields.");
      return;
    }
    if (this.state.password != this.state.confirmedPassword) {
      alert("Passwords do not match.");
      return;
    }

    let email = this.state.email;
    let password = this.state.password;

    createUser(this.state.email, this.state.password)
      .then(response => AsyncStorage.setItem('userToken', this.state.email))
      .then(this.props.navigation.navigate('Main'));

    // checkUser(email, password)
    //   .then(response => {
    //     if (response) {
    //       alert("An account with this email address already exists. Please try again.");
    //     } else {
    //       alert("success");
    //     }
    //   })
    // // TODO: check if email exists (need fix on server for this)
  }
}
