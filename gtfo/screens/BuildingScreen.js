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
import {
  AppRegistry,
  TextInput
} from 'react-native';
import PinchZoomView from 'react-native-pinch-zoom-view';

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

		let routeStatus = this.state.routeStatus;
		console.log("route staus: " + this.state.routeStatus);
		let button, startMarker, endMarker;
		if (routeStatus === "START" || routeStatus === "WAITING_FOR_ENDPOINT") {
			button = <View></View>
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

						<React.Fragment>
						<PinchZoomView minScale = {1.0} maxScale = {4.0}>
							<TouchableWithoutFeedback onPress={(evt) => this._handlePress(evt) } >
			      <View style={styles.container}>

			        <View style={styles.contentContainer}>
			          <ImageBackground
                  resizeMode="contain"
			            source = {this.state.rendered_image}
			            style = {styles.floorPlan}
			          >
													{endMarker}
													{startMarker}

													</ImageBackground>
			        </View>
			      </View>
									</TouchableWithoutFeedback>
								</PinchZoomView>
								<View>
									{button}
								</View>
								</React.Fragment>
    	);
	  }

		_handleSetEnd = async () => {
      const {width, height} = Image.resolveAssetSource(picture);
      console.log("width: " + width);
      console.log("height: " + height);

			srcX = this.state.startXCoord * width / 375.0;
			srcY = (this.state.startYCoord - 43) * height / 288;
			tgtX = this.state.endXCoord * width / 375.0;
			tgtY = (this.state.endYCoord - 43) * height / 288;

      console.log("srcX: " + srcX);
      console.log("srcY: " + srcY);
      console.log("tgtX: " + tgtX);
      console.log("tgtY: " + tgtY);

      src = srcX.toString() + "," + srcY.toString();
      dest = tgtX.toString() + "," + tgtY.toString();

      this.setState({routeStatus : "WAITING"});
	  path_image = getImageWithPath(src, dest, this.state.building_name);
	  path_image.then(response => {
	  	return response.json();
  	  }).then(json => {
						console.log("error");
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
			console.log(this.state.routeStatus);
			if (this.state.routeStatus == "START") {
				this.setState({ startXCoord: evt.nativeEvent.locationX,
				 														 startYCoord: evt.nativeEvent.locationY,
																				routeStatus : "WAITING_FOR_ENDPOINT",
																	});
			} else if (this.state.routeStatus == "WAITING_FOR_ENDPOINT") {
				this.setState({ endXCoord: evt.nativeEvent.locationX,
				 														 endYCoord: evt.nativeEvent.locationY,
																				routeStatus : "END",
																	});
			} else if (this.state.routeStatus == "END") {
				this.setState({ endXCoord: evt.nativeEvent.locationX,
				 														 endYCoord: evt.nativeEvent.locationY
																	});
			}
			console.log("Registered click");

  }

		_getStartMarkerStyle = function() {
				return {
						left: this.state.startXCoord - 25,
						top: this.state.startYCoord - 50,
						position: 'absolute',
						alignItems: 'flex-start',
	   }
  }

		_getEndMarkerStyle = function() {
				return {
						left: this.state.endXCoord - 25,
						top: this.state.endYCoord - 50,
						position: 'absolute',
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
								resizeMode: 'contain',
								// alignItems: 'flex-end',
        backgroundColor: 'transparent'
  }
});
