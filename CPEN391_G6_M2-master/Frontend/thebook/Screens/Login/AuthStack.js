import React, {Component} from 'react';
import {createSwitchNavigator, createAppContainer} from "react-navigation";
import DrawStack from '../Main/DrawStack';
import Login from './Login';
import Register from './Register';

/*
Uses library 'react-navigation' to create Container for app state and links top-level switch navigator to app environment
*/

//Create navigator
const Auth = createSwitchNavigator(
    {
      Login: Login,
      Main: DrawStack,
      Register: Register,
      
    },
    {
      // Hides Header globally
      navigationOptions: {
        header: null,
      }
     },
    {
      initialRouteName: 'Login',
    }
  );

//Create container
const AppContainer = createAppContainer(Auth);

export default class AuthStack extends Component {
    render(){
        return <AppContainer/>
    }
}
  