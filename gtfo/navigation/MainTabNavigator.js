import React from 'react';
import { Platform } from 'react-native';
import { createStackNavigator, createBottomTabNavigator } from 'react-navigation';

import TabBarIcon from '../components/TabBarIcon';
import HomeScreen from '../screens/HomeScreen';
import LinksScreen from '../screens/LinksScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AddBuildingScreen from '../screens/AddBuildingScreen';
import BuildingScreen from '../screens/BuildingScreen';

export default createStackNavigator({
  Home: HomeScreen,
  AddBuilding: AddBuildingScreen,
  Building: BuildingScreen,
});
