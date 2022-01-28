import React, {Component} from 'react';
import Main from './Main.js'
import Bluetooth from '../Bluetooth/Bluetooth'
import Chat from '../Chat/Chat'
import {DrawerActions, createAppContainer, createStackNavigator} from "react-navigation";
import LibraryBooks from '../BookList/LibraryBooks.js';
import ReturnBook from '../Bluetooth/ReturnBook';
import TakeBook from '../Bluetooth/TakeBook';
import Search from './Search';
import LeaveBook from '../Bluetooth/LeaveBook';
import BluetoothCon from '../Bluetooth/BluetoothCon';

//create navigation stack with all screens in app

const Stack = createStackNavigator(
  {
      Main: Main,
    Bluetooth: {screen:Bluetooth,
      navigationOptions: {
          header: () => null,
      }
  },
    Chat: Chat,
    Library: {screen: LibraryBooks,
      navigationOptions: {
        header: () => null,
      }
    },
    TakeBook: {
      screen: TakeBook,
      navigationOptions: {
        header: () => null,
     },
    },
    ReturnBook: {
      screen: ReturnBook,
      navigationOptions: {
        header: () => null,
     },
    },
    Search: {
      screen: Search,
      navigationOptions: {
        header: ()=> null,
      }
    },
    LeaveBook: {
      screen: LeaveBook, 
      navigationOptions: {
        header: ()=> null,
      }
    },
    BluetoothCon: {
      screen: BluetoothCon, 
      navigationOptions: {
        header: ()=> null,
      }
    }
   
  },{
    initialRouteName: 'Main',
    navigationOptions: {
        header: () => null,
    },
  },
);

//create app container
const AppContainer = createAppContainer(Stack);

export default class StackNav extends Component {
    render(){
        return <AppContainer screenProps={{openDraw: () => this.props.navigation.dispatch(DrawerActions.openDrawer())}}/>
    }
}
