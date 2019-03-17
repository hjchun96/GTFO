import React from "react";
import {
  View,
  Image,
  Text,
  StyleSheet,
  ScrollView
} from "react-native";
import {
  Card,
  Button,
  FormLabel,
  FormInput
} from "react-native-elements";

import { getImageWithPath } from "../fetch/FetchWrapper";

export default class BuildingScreen extends React.Component {
  //
  static navigationOptions = ({ navigation }) => {
    return {
      title: navigation.getParam('building_name', 'undefined'),
    };
  }
  state = {
    directions: '',
    viewDirections: false,
    rendered_image: '',
    building_name: '',
  }

  render() {
    this.state.building_name = this.navigationOptions;

    if (!this.state.viewDirections) {
      this.state.rendered_image = require('../assets/images/5.png');// TODO: CHANGE THIS TO BUILDING NAME
    }
    return (
      <View style={styles.container}>

        <View style={styles.contentContainer}>
          <Image
            source = {this.state.rendered_image}
            style = {styles.floorPlan}
          />
          <Text style={styles.directions}>
            {this.state.directions}
          </Text>
        </View>
        <Button
          title="Get directions"
          onPress={() => this._handleGetDirections()}
        />
      </View>
    );
  }

  _handleGetDirections = async () => {
    // directions handler gives perfect directions
    path_image = require('../assets/images/robot-dev.png');//getImageWithPath("40", "100", this.state.building_name);
    this.setState({directions: "1) Go to the exit.", viewDirections: true, rendered_image:path_image});
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingBottom: 30,
  },
  contentContainer: {
    paddingTop: 30,
    alignItems: 'center',
  },
  floorPlan: {
    width: 400,
    height: 400,
    resizeMode: 'contain',
    marginTop: 3,
    marginLeft: -10,
    paddingBottom: 30,
  },
  directions: {
    fontSize: 30,
    color: "red",
  }
});
