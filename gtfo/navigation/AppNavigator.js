import React from 'react';
import { createSwitchNavigator, createStackNavigator, createAppContainer } from 'react-navigation';

import MainTabNavigator from './MainTabNavigator';
import AuthNavigator from './AuthNavigator';
import AuthLoadingScreen from '../screens/AuthLoadingScreen';

export default createSwitchNavigator(
  {
    AuthLoading: AuthLoadingScreen, // fetches authentication state, etc.
    Main: MainTabNavigator, // core app
    Auth: AuthNavigator,    // sign-in/up stack
  },
  {
    initialRouteName: 'AuthLoading',
  }
);
