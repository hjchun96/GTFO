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
import { getUserBuildings } from "../fetch/FetchWrapper";

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
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
          <View style={styles.welcomeContainer}>
            <Image
              source={
                __DEV__
                  ? require('../assets/images/flame.png')
                  : require('../assets/images/flame.png')
              }
              style={styles.welcomeImage}
            />
          </View>
          <FlatList
            data={buildings}
            renderItem={({item}) =>
              <TouchableOpacity
                onPress={() => this._handleBuildingPressed()}
                textStyle={{ color: "#bcbec1" }}>
                <Text style={styles.item}>{item.key}</Text>
              </TouchableOpacity>}
          />
        </ScrollView>
        <Button
          buttonStyle={styles.addBuildingButton}
          title="Add a building"
          textStyle={{ color: "#bcbec1" }}
          onPress={() => this._handleAddBuildingButtonPressed()}
          textStyle={{ color: "#bcbec1" }}
        />
      </View>
    );
  }

  _handleAddBuildingButtonPressed = () => {
    this.props.navigation.navigate("AddBuilding");
  }

  _handleBuildingPressed = () => {
    this.props.navigation.navigate("Building");
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
    marginTop: 10,
    marginBottom: 20,
  },
  welcomeImage: {
    width: 100,
    height: 80,
    resizeMode: 'contain',
    marginTop: 3,
    marginLeft: -10,
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
    padding: 10,
    fontSize: 26,
    height: 44,
  }
});
