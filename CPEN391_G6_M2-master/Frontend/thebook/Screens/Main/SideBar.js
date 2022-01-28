import React from "react";
import {StyleSheet,Text, ImageBackground, Image,AsyncStorage, TouchableOpacity, Alert} from "react-native";
import {Container, Body} from "native-base";
import {DrawerItems} from "react-navigation";
import Icon from  'react-native-vector-icons/FontAwesome';

export default class Sidebar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {age: '0', gender: '0'};
  }

  componentDidMount = () => {
    AsyncStorage.getItem('@loginInfo:gender').then((value) => this.setState({'gender': value}));
    AsyncStorage.getItem('@loginInfo:age').then((value) => this.setState({'age': value}));
  }

  render() {
    // render differently according to different gender
      return (
    <Container style={styles.container}>
        <ImageBackground source={require('../../assets/galaxy2.gif')} 
        style={styles.profile}>

        {() => {
            if(this.state.gender == '0'){
              return (               
                <Image
                  borderRadius={75}
                  style={ styles.avatar}
                  source={require('../../assets/female.jpg')}
                />
              );
            } else {
              return (
                <Image
                  borderRadius={75}
                  style={ styles.avatar}
                  source={require('../../assets/male.jpg')}
                />
              );
            }
        }}

        {() => {
            if(this.state.gender == '0'){
              return (               
                <Image
                style={ styles.icon}
                source={require('../../assets/womanicon.png')}/>
              );
            } else {
              return (
                <Image
              style={ styles.icon}
              source={require('../../assets/manicon.png')}/>
              );
            }
        }}

          <Text style={styles.age}>{this.state.age}</Text>
      </ImageBackground>

      <Body style={{width:'100%', backgroundColor: 'white', paddingTop:30}}>
      <DrawerItems {...this.props}/>
      <TouchableOpacity onPress={()=>
              Alert.alert(
                'Log out',
                'Do you want to logout?',
                [
                  {text: 'Cancel', onPress: () => {return null}},
                  {text: 'Confirm', onPress: () => {
                    AsyncStorage.clear();
                    this.props.navigation.navigate('Login')
                  }},
                ],
                { cancelable: false }
              )  
            } style={{width: '100%', left: 20, marginTop:15}}>
              <Icon  name="power-off" color='grey' size={30} />
              <Text style={styles.labelStyle}>Logout</Text>
            </TouchableOpacity>

      </Body>
    </Container>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    height: '100%',
  },
  profile: {
    width: '100%',
    height: 275,
  },
  avatar: {
    height: 150,
    width: 150,
    top:50,
    left: 60,
  },
  icon: {
    width: 30,
    height: 30,
    top: 70,
    left: 85,

  },
  age: {
    top: 37,
    left: 150,
    color: 'white',
    fontSize: 25,
  },
  nav: {
    width: '80%',
    color: 'black',
    fontSize: 18,
    padding: 10,
    marginLeft: 0,
    marginTop: 30,
    backgroundColor: 'white',
    borderRadius:10,
    
  },
  labelStyle: {width: 200,
    color: 'grey',
    fontSize: 20,
    fontWeight:'bold',
    padding: 10,
    marginTop: -40,
    borderBottomWidth: 0.5,
    borderBottomColor: 'grey',
    width: 180,
    left:58
  }
});
