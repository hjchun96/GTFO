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
import {getFloorplanFromName} from '../assets/asset_mapper.js'
// import {imageExporter} from '../assets/image_exporter.js'
import {loadImages} from '../assets/image_exporter.js'
export default class BuildingScreen extends React.Component {

  static navigationOptions = {
    title: 'Your building',
  }

  state = {
    directions: '',
    viewDirections: false,
  }

  render() {
				buildingName = this.props.navigation.state.params.building_name;
				// image_name = getFloorplanFromName(this.props.navigation.state.params.building_name);
				// asset_path = "../assets/images/";
				// img_name = asset_path + image_name;
				floorplanMap = loadImages();

    return (
      <View style={styles.container}>
        <Image
          source = {floorplanMap[buildingName]}
          style = {styles.floorPlan}
        />
        <Button
          title="Get directions"
          onPress={() => this._handleGetDirections()}
        />
        <View style={styles.contentContainer}>
          <Text style={styles.directions}>
            {this.state.directions}
          </Text>
        </View>
      </View>
    );
  }

  _handleGetDirections = async () => {
    // directions handler gives perfect directions
    this.setState({directions: "1) Go to the exit.", viewDirections: true});
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
