import React from "react";
import { View, Image, AsyncStorage, StyleSheet, ScrollView } from "react-native";
import { Card, Button, FormLabel, FormInput } from "react-native-elements";
import { checkUser, createUser } from "../fetch/FetchWrapper";
import KeyboardShift from '../components/KeyboardShift';
import logo1 from '../assets/images/logo1.png';

export default class SignInScreen extends React.Component {
  static navigationOptions = {
    title: 'Please sign in',
  };

  state = {
    email: '',
    password: '',
  };

  render() {
    return (
      <KeyboardShift>
        {() => (
        <ScrollView style={{ paddingVertical: 20 }}>
          <View style={styles.welcomeContainer}>
            <Image
              source={logo1}
              style={styles.welcomeImage}
            />
          </View>
          <Card title="Sign In">
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
            <Button
              buttonStyle={{ marginTop: 20 }}
              backgroundColor="#03A9F4"
              title="Sign in"
              onPress={() => this._signInAsync()}
            />
            <Button
              buttonStyle={{ marginTop: 20 }}
              backgroundColor="transparent"
              textStyle={{ color: "#bcbec1" }}
              title="Sign up"
              onPress={() => this.props.navigation.navigate("SignUp")}
            />
          </Card>
        </ScrollView>)}
      </KeyboardShift>
    );
  }

  _signInAsync = async () => {
    if (!this.state.email || !this.state.password) {
      alert("Please fill out all fields.");
      return;
    }

    checkUser(this.state.email, this.state.password)
      .then(res => {
        if (!res) {
          alert("Invalid email or password.");
          return null;
        } else {
          AsyncStorage.setItem('userToken', this.state.email);
          return this.state.email;
        }
      })
      .then(res => {
        if (res) {
          this.props.navigation.navigate('Main');
        }
      });
  }
}

const styles = StyleSheet.create({
  welcomeContainer: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 10,
  },
  welcomeImage: {
    width: 100,
    height: 80,
    resizeMode: 'contain',
    marginTop: 3,
    marginLeft: -10,
  },
});
