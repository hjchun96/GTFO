import React from 'react';
import { Platform } from 'react-native';
import { createStackNavigator } from 'react-navigation';

import SignInScreen from '../screens/SignIn';
import SignUpScreen from '../screens/SignUp';

export default createStackNavigator({
  SignIn: {
    screen: SignInScreen,
    navigationOptions: {
      title: "Sign in"
    }
  },
  SignUp: {
    screen: SignUpScreen,
    navigationOptions: {
      title: "Welcome"
    }
  }
});
