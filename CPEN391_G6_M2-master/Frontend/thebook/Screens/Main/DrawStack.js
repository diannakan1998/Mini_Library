import React from "react";
import SideBar from './SideBar'
import {createDrawerNavigator, createAppContainer} from "react-navigation";
import StackNav from './StackNav'
import Profile from '../Profile/Profile'
import Icon from  'react-native-vector-icons/FontAwesome';
import BookRentals from "../BookList/BookRental";
import BookRentalHistory from "../BookList/BookRentalHistory";

const DrawStack1 = createDrawerNavigator(
  {
    Home: {screen: StackNav,
      navigationOptions: {
        drawerLabel: () => null
      }
    },
    Current: {screen: BookRentals,
      navigationOptions: {
        drawerIcon: <Icon  name="book" color="grey" size={30} />
      }
    },
    History: {screen: BookRentalHistory, 
      navigationOptions: {
        drawerIcon: <Icon  name="history" color="grey" size={30} />
      }
    },
    Profile: {screen: Profile,
      navigationOptions: {
        drawerLabel: () => 'Profile',
        drawerIcon: <Icon  name="user" color="grey" size={30} />
      }
    },

  },
  {
    initialRouteName: 'Home',
    contentComponent: SideBar,
    contentOptions: {
      labelStyle: {
        width: 200,
        color: 'grey',
        fontSize: 20,
        padding: 10,
        marginTop: 15,
        borderBottomWidth: 0.5,
        borderBottomColor: 'grey',
        width: 180,

      }
    }
  }
);


const DrawStack = createAppContainer(DrawStack1);

export default DrawStack;