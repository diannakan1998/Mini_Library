import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity, AsyncStorage, Alert
} from 'react-native';
import {Container} from 'native-base';
import Head from '../Components/Head';

/* 
User Profile Screen of app - displays personalised avatar, age, gender (with icon) for the logged in user.
Also has buttons for viewing current user rentals and account history and loggin out.
*/
export default class Profile extends Component {

  constructor(props) {
    super(props);

    this.state = {
      phone: '1234567890',
      gender: '0',
      age: '20'
    };
  }

  //Retrieve user information from async storage
  componentDidMount() {
    try {
      AsyncStorage.getItem('@loginInfo:gender').then((value) => {
        this.setState({ gender: value });
        console.log(value)
      });
      AsyncStorage.getItem('@loginInfo:age').then((value) => this.setState({age: value}));
      AsyncStorage.getItem('@loginInfo:phoneNumber').then((value) => this.setState({phone: value}));


    } catch (error) {
      // Handle errors here
      console.log(error);
    }

  }

  logout = () => {
    Alert.alert(
      'Log out',
      'Do you want to logout?',
      [
        { text: 'Cancel', onPress: () => { return null } },
        {
          text: 'Confirm', onPress: () => {
            AsyncStorage.clear();
            this.props.navigation.navigate('Login')
          }
        },
      ],
      { cancelable: false }
    );
  }

  render() {
    const { navigate } = this.props.navigation;
    //Render profile screen for female users
    return (
      <Container>
        <Head title="Profile" navigation={this.props.navigation} />
        <View style={{ position: 'absolute', width: '100%', top: 75 }}>
          <Image style={styles.header} source={require('../../assets/galaxy2.gif')} />

          {() => {
            if (this.state.gender == '0') {
              return (
                <Image style={styles.avatar} source={require("../../assets/female.jpg")} />
              );
            } else {
              return (
                <Image style={styles.avatar} source={require("../../assets/male.jpg")} />
              );
            }
          }}
          <View style={styles.body}>
            <View style={styles.bodyContent}>
              <Text style={styles.phone}>{"+1 "}{this.state.phone}</Text>

              {() => {
                if (this.state.gender == '0') {
                  return (
                    <Image
                      style={styles.icon}
                      source={require('../../assets/womanicon.png')} />
                  );
                } else {
                  return (
                    <Image
                      style={styles.icon}
                      source={require('../../assets/manicon.png')} />
                  );
                }
              }}

              <Text style={styles.age}>{this.state.age}</Text>
              <TouchableOpacity style={styles.buttonContainer}>
                <Text style={styles.text} onPress={() => navigate('Current')}>
                  View Current Rentals
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.buttonContainer}>
                <Text style={styles.text} onPress={() => navigate('History')}>
                  View Account History
                Î</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.buttonContainer} onPress={() => {
                Alert.alert(
                  'Log out',
                  'Do you want to logout?',
                  [
                    { text: 'Cancel', onPress: () => {return null} },
                    {
                      text: 'Confirm', onPress: () => {
                        AsyncStorage.clear();
                        this.props.navigation.navigate('Login')
                      }
                    },
                  ],
                  { cancelable: false }
                );
              }}>
                <Text style={{ fontSize: 20, color: 'white' }} >Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#284e8c",
    height: 130,
    width: '100%',
  },
  text:{ 
    fontSize: 20, 
    color: 'white' 
  },
  avatar: {
    width: 130,
    height: 130,
    borderRadius: 63,
    borderWidth: 4,
    borderColor: "white",
    marginBottom: 10,
    alignSelf: 'center',
    position: 'absolute',
    marginTop: 65
  },
  name: {
    fontSize: 22,
    color: "#FFFFFF",
    fontWeight: '600',
  },
  body: {
    marginTop: 40,
    width: '100%',
  },
  bodyContent: {
    flex: 1,
    alignItems: 'center',
    padding: 30,
    width: '100%',

  },
  phone: {
    fontSize: 28,
    color: "#696969",
    fontWeight: "600",
    top: 40
  },
  gender: {
    fontSize: 24,
    color: "#284e8c",
    marginTop: 10
  },
  age: {
    fontSize: 20,
    color: "#696969",
    marginTop: 10,
    textAlign: 'center',
    marginBottom: 20
  },
  buttonContainer: {
    // marginTop:10,
    height: 60,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    width: '80%',
    borderRadius: 30,
    backgroundColor: "#284e8c",
  },
  icon: {
    width: 25,
    height: 25,
    top: -40,
    left: -40,

  },
  age: {
    top: -70,
    left: 40,
    color: '#284e8c',
    fontSize: 25,
  },
});
