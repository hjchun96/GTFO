import React from "react";
import {
  View,
  Image,
  Text,
  StyleSheet,
		ImageBackground,
		TouchableWithoutFeedback,
  Alert,
  ScrollView
} from "react-native";
import {
  Card,
  Button,
  FormLabel,
  FormInput
} from "react-native-elements";

import { getImageWithPath } from "../fetch/FetchWrapper";
import picture from '../assets/images/houston.png'
export default class BuildingScreen extends React.Component {
  //
  static navigationOptions = ({ navigation }) => {
    return {
      title: navigation.getParam('building_name', 'undefined'),
    };
  }
  state = {
    viewDirections: false,
    rendered_image: require('../assets/images/houston.png'),
    building_name: '',
		startXCoord: -1,
		startYCoord: -1,
		endXCoord: -1,
		endYCoord: -1,
		routeStatus: "START",
  }

  render() {

		const routeStatus = this.state.routeStatus;
		let button, startMarker, endMarker;
		if (routeStatus === "START") {
			button = <Button
					title="Choose Endpoint"
					onPress={() => this._handleSetStart()}
			/>
		} else if (routeStatus === "END") {
			button = <Button
					title="Get directions"
					onPress={() => this._handleSetEnd()}
			/>
		} else if (routeStatus === "WAITING") {
			button = <Button
					title="Loading path"
					onPress={function() {}}
			/>
		} else {
			button = <Button
					title="Start Over"
					onPress={() => this._handleStartOver()}
			/>
		}

		if (this.state.startXCoord != -1) {
			startMarker = <View style = {this._getStartMarkerStyle()} pointerEvents="none"><Image style = {styles.overlay} source = {require('../assets/images/src.png')} /></View>;
		}

		if (this.state.endXCoord != -1) {
			endMarker = <View style = {this._getEndMarkerStyle()} pointerEvents="none"><Image style = {styles.overlay} source = {require('../assets/images/dest.png')} /></View>;
		}

	    const {navigation} = this.props;
	    this.state.building_name = navigation.getParam('building_name', 'undefined');
	    return (
					<TouchableWithoutFeedback onPress={(evt) => this._handlePress(evt) } >
	      <View style={styles.container}>

	        <View style={styles.contentContainer}>
	          <ImageBackground
	            source = {this.state.rendered_image}
	            style = {styles.floorPlan}
	          >
											{startMarker}
											{endMarker}
											</ImageBackground>
	        </View>
									{button}
	      </View>
						</TouchableWithoutFeedback>
    	);
	  }

	_handleSetStart = async () => {
		this.setState({routeStatus : "END"});
	}

		_handleSetEnd = async () => {
      const {width, height} = Image.resolveAssetSource(picture);
      console.log("width: " + width);
      console.log("height: " + height);

      newSrcX = Math.max(Math.min(this.state.startXCoord + 50, 375 - 1), 0);
      newSrcY = Math.max(Math.min(this.state.startYCoord + 25, 375 - 1), 0);
      newTgtX = Math.max(Math.min(this.state.endXCoord, 375 - 1), 0);
      newTgtY = Math.max(Math.min(this.state.endYCoord + 75, 375 - 1), 0);

      console.log("new srcX: " + newSrcX);
      console.log("new srcY: " + newSrcY);
      console.log("new destX: " + newTgtX);
      console.log("new destY: " + newTgtY);


      srcX = newSrcX * width/375.0;
      srcY = newSrcY * height/375.0;
      destX = newTgtX * width/375.0;
      destY = newTgtY * height/375.0;
      console.log("srcX: " + srcX);
      console.log("srcY: " + srcY);
      console.log("destX: " + destX);
      console.log("destY: " + destY);
      srcX_str = srcX.toString();
      srcY_str = srcY.toString();
      destX_str = destX.toString();
      destY_str = destY.toString();
      src = srcX_str.concat(",").concat(srcY_str);
      dest = destX_str.concat(",").concat(destY_str);
      this.setState({routeStatus : "WAITING"});
	  path_image = getImageWithPath(src, dest, this.state.building_name);
	  path_image.then(response => {
	  	return response.json();
  	  }).then(json => {
  	  	console.log(json.err);
  	  	if(json.err) {
  	  		Alert.alert("Invalid Start / End location selected", json.err[0]);
  	  		this._handleStartOver();
        	return;
  	  	}

  	  	var image_string = 'data:image/png;base64,'+json.img[0];

  	  	this.setState({
  				routeStatus : "DIRECTIONS",
  				viewDirections: true,
  				rendered_image: {uri : image_string}
        });
  	  });

  }

  _handleStartOver = async () => {
				this.setState({
					startXCoord: -1,
					startYCoord: -1,
					endXCoord: -1,
					endYCoord: -1,
					routeStatus: "START",
					rendered_image: require('../assets/images/houston.png')
				});
  }

		_handlePress = async (evt) => {

			if (this.state.routeStatus == "START") {
				this.setState({ startXCoord: evt.nativeEvent.locationX - 25,
				 														 startYCoord: evt.nativeEvent.locationY - 25
																	});
			} else if (this.state.routeStatus == "END") {
				this.setState({ endXCoord: evt.nativeEvent.locationX - 50,
				 														 endYCoord: evt.nativeEvent.locationY -75
																	});
			}
			console.log("Registered click");

  }

		_getStartMarkerStyle = function() {
				return {
						left: this.state.startXCoord,
						top: this.state.startYCoord,
						alignItems: 'flex-start',
	   }
  }

		_getEndMarkerStyle = function() {
				return {
						left: this.state.endXCoord,
						top: this.state.endYCoord,
						alignItems: 'flex-start',
	   }
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
    width: 375,
    height: 375,
    resizeMode: 'contain',
    marginTop: -30,
    marginLeft: 0,
    paddingBottom: 30,
  },
  directions: {
    fontSize: 30,
    color: "red",
  },
		overlayContainer: {
			left: 50,
			top: 10,
			alignItems: 'flex-start',
		},
		overlay: {
        opacity: 0.5,
								width: 50,
				    height: 50,
								alignItems: 'flex-end',
        backgroundColor: 'transparent'
  }
});
