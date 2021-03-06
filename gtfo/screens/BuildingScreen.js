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
import Spinner from 'react-native-loading-spinner-overlay';

import { getImageWithPath, getNNImage } from "../fetch/FetchWrapper";
import picture from '../assets/images/houston.png'
import SwitchButton from '../components/SwitchButton.js'
export default class BuildingScreen extends React.Component {

  static navigationOptions = ({ navigation }) => {
    return {
      title: navigation.getParam('building_name', 'undefined'),
      headerStyle: {
        backgroundColor: "#0079C6"
      },
      headerTintColor: "#fff"
    };
  }

  componentDidMount = () => {
    this.setState({
      rendered_image: {uri: this.props.navigation.getParam('img', '') },
      loading: false,
      h: this.props.navigation.getParam('h', ''),
      w: this.props.navigation.getParam('w', ''),
    });
  }

  state = {
    viewDirections: false,
    rendered_image: '',
    nn_image: '',
    building_name: '',
    startXCoord: -1,
    startYCoord: -1,
    endXCoord: -1,
    endYCoord: -1,
    routeStatus: "START",
    switch1Value: false,
    loading: true,
  }

  toggleSwitch1 = (value) => {
    this.setState({switch1Value: value})
  }

  render() {
    if (this.state.loading) {
      return null;
    }

    let routeStatus = this.state.routeStatus;
    let button, startMarker, endMarker;
    let spinner = null;

    if (routeStatus === "START" || routeStatus === "WAITING_FOR_ENDPOINT") {
      button = <View></View>
    } else if (routeStatus === "END") {
      button = <Button
      title="Get directions"
      onPress={() => this._handleSetEnd()}
      />
    } else if (routeStatus === "WAITING") {
      button = (<Button
      title="Loading path"
      onPress={function() {}}
      />);
      spinner = (<Spinner
        visible={this.state.routeStatus === "WAITING"}
        textContent={'Loading route...'}
        textStyle={styles.spinnerTextStyle}
      />);
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
        <PinchZoomView minimumZoomScale = {1.0} maximumZoomScale = {4.0} bounces={true}
          alwaysBounceHorizontal={true} alwaysBounceVertical={true} bouncesZoom={true}>
          <TouchableWithoutFeedback onPress={(evt) => this._handlePress(evt) } >
            <View style={styles.container}>
              <View style={styles.contentContainer}>
                {spinner}
                <ImageBackground
                  resizeMode="contain"
                  source = {this.state.switch1Value ? this.state.nn_image : this.state.rendered_image}
                  style = {styles.floorPlan}
                >
                  {endMarker}
                  {startMarker}

                </ImageBackground>
              </View>
              { this.state.nn_image != '' &&
                <View style={{flex: 1}}>
                  <SwitchButton
                    toggleSwitch1 = {this.toggleSwitch1}
                    switch1Value = {this.state.switch1Value}/>
                </View>
              }
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
    const width = this.state.w;
    const height = this.state.h;

    console.log("Image's width: " + width)
    console.log("Image's height: " + height)

    var aspect = height / width
    var offset = 375 * (1 - aspect) / 2

    srcX = this.state.startXCoord * width / 375.0;
    srcY = (this.state.startYCoord - offset) * height / (375 - 2 * offset);
    tgtX = this.state.endXCoord * width / 375.0;
    tgtY = (this.state.endYCoord - offset) * height / (375 - 2 * offset);

    src = srcX.toString() + "," + srcY.toString();
    dest = tgtX.toString() + "," + tgtY.toString();

    this.setState({routeStatus : "WAITING"});
    path_image = getImageWithPath(src, dest, this.state.building_name);
    path_image.then(response => {
      return response.json();
    }).then(json => {
      if (json.err) {
        setTimeout(() => {
          alert("Invalid Start/End location selected");
        }, 100);
        this._handleStartOver();
        return null;
      } else {
        var img_string = 'data:image/png;base64,'+json.img[0];
        this.setState({
          routeStatus : "DIRECTIONS",
          viewDirections: true,
          rendered_image: {uri : img_string}
        });
        return getNNImage(this.state.building_name);
      }}).then(res => {
        if (res) {
          return res.json();
        } else {
          return null;
        }
      }).then(json => {
        if (json) {
          if (json.err) {
            console.log("error fetching NN image");
            return;
          } else {
            var img_string = 'data:image/png;base64,'+json.img[0];
            this.setState({
              nn_image: {uri : img_string}
            });
          }
        }
      });
    }

    _handleStartOver = async () => {
      this.setState({
        switch1Value: false,
        startXCoord: -1,
        startYCoord: -1,
        endXCoord: -1,
        endYCoord: -1,
        routeStatus: "START",
        rendered_image: {uri: this.props.navigation.getParam('img', '') },
      }, () => {
        this.setState({routeStatus: "START"});
      });
    }

    _handlePress = async (evt) => {
      console.log("x: " + evt.nativeEvent.locationX + ", y: " + evt.nativeEvent.locationY)
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
    },
    contentContainer: {
      // paddingTop: 30, // TO DANIEL: THIS WASN'T COMMENTED BEFORE
      alignItems: 'center',
    },
    floorPlan: {
      height: 375,
      width: 375,
      resizeMode: 'contain',
      marginLeft: 0,
      marginTop: 0
    },
    directions: {
      fontSize: 30,
      color: "red",
    },
    overlay: {
      opacity: 0.5,
      width: 50,
      height: 50,
      resizeMode: 'contain',
      // alignItems: 'flex-end',
      backgroundColor: 'transparent'
    },
    spinnerTextStyle: {
      color: '#FFF'
    },
  });
