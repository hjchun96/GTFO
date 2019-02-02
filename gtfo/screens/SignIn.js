import React from "react";
import { View, Image, AsyncStorage, StyleSheet, ScrollView } from "react-native";
import { Card, Button, FormLabel, FormInput } from "react-native-elements";

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
      <ScrollView style={{ paddingVertical: 20 }}>
        <View style={styles.welcomeContainer}>
          <Image
            source={require('../assets/images/flame.png')}
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
      </ScrollView>
    );
  }

  _signInAsync = async () => {
    if (!this.state.email || !this.state.password) {
      alert("Please fill out all fields.");
      return;
    }
    // TODO: check that the user is valid
    await AsyncStorage.setItem('userToken', this.state.email);
    this.props.navigation.navigate('Main');
  }

}

const styles = StyleSheet.create({
  welcomeContainer: {
    alignItems: 'center',
    marginTop: 5,
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
