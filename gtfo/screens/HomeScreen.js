import React from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  Text,
  Button,
  TouchableOpacity,
  FlatList,
  ListItem,
  AsyncStorage,
} from 'react-native';
import { Icon, Header } from 'react-native-elements'
import { Ionicons } from '@expo/vector-icons';
import { getUserBuildings } from "../fetch/FetchWrapper";
import logo1 from '../assets/images/logo1.png';

export default class HomeScreen extends React.Component {
  static navigationOptions = {
    header: null,
  };

  render() {
    // TODO: fetch buildings and display here
    // also get user email (from redux)
    let buildings = getUserBuildings('test');
    for (let i = 0; i < buildings.length; i++) {
      buildings[i].key = buildings[i].name;
    }
    return (
      <View style={styles.container}>
        <Header
              placement="left"
              containerStyle={styles.welcomeContainer}
              backgroundColor="#0079C6"
              centerComponent={<Image source={logo1} style={styles.welcomeImage} />}
        />
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
          <FlatList
            data={buildings}
            renderItem={({item}) =>
              <Button 
                style={styles.item}
                title={item.key}
                textStyle={{ color: "#0079C6" }}
                onPress={() => this._handleBuildingPressed(item.key)}
              />}
          />
        </ScrollView>
        <Button
          buttonStyle={styles.addBuildingButton}
          title="Add a building"
          textStyle={{ color: "#0079C6" }}
          onPress={() => this._handleAddBuildingButtonPressed()}
        />
      </View>
    );
  }

  _handleAddBuildingButtonPressed = () => {
    this.props.navigation.navigate("AddBuilding");
  }

  _handleBuildingPressed = (building_name) => {
    this.props.navigation.navigate("Building", {building_name: building_name});
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    paddingTop: 30,
    alignItems: 'center',
  },
  welcomeContainer: {
    alignItems: 'center',
    paddingTop: 40,
  },
  welcomeImage: {
    maxWidth: 110,
    maxHeight: 50,
    // width: auto,
    // height: auto,
    resizeMode: 'contain',
  },
  homeScreenFilename: {
    marginVertical: 7,
  },
  addBuildingButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    ...Platform.select({
      ios: {
        shadowColor: 'black',
        shadowOffset: { height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 20,
      },
    }),
    alignItems: 'center',
    backgroundColor: '#fbfbfb',
    paddingVertical: 20,
    paddingBottom: 20,
  },
  sectionHeader: {
    paddingTop: 2,
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 2,
    fontSize: 14,
    fontWeight: 'bold',
    backgroundColor: 'rgba(247,247,247,1.0)',
  },
  item: {
    paddingTop: 10,
    paddingLeft: 10,
    paddingBottom: 10,
    paddingRight: 10,
    fontSize: 30,
    height: 44,
    fontFamily: "Roboto",
  },
  header: {
    backgroundColor: "#0079C6",

  }
});
