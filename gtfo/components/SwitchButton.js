import React, { Component } from 'react'
import { View, Switch, StyleSheet, Text } from 'react-native'

export default SwitchButton = (props) => {
   return (
      <View style = {{flexDirection:"row", flex:1, alignItems:'stretch'}}>
         <Switch
         onValueChange = {props.toggleSwitch1}
         value = {props.switch1Value}/>
         <Text>
          View NN output
          </Text>
      </View>
   )
}
