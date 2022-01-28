import React, {Component} from 'react';
import {Alert, TextInput,StyleSheet, ImageBackground,ScrollView, KeyboardAvoidingView, Text} from 'react-native';
import {AsyncStorage} from "react-native";
import AwesomeButton from "react-native-really-awesome-button";

/*
 Login screen, landing screen of the app, takes phone number and password as inputs from user, navigates to main screen if user is validated.
 Also has register button that navigates new users to the sign up screen.
*/

export default class Login extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      phone: '',
      password: '',
      gender: 0,
      age: 0
    };
  }
  
  onLogin = async () => {

    const { phone, password } = this.state;
    
    // Validate user supplied phone number and password by sending a POST req to backend
    await fetch('http:///13.59.131.180:3001/login', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumber: phone,
        password: password,
      }),
     }).then((response) => response.json())
    .then((responseJson) => {

      //Check JSON response from server to see if user is validated

      if(responseJson.valid == "1"){

        //Store user info (phone,age,password) in async storage if user is valid

        AsyncStorage.setItem('@loginInfo:phoneNumber', phone);
        AsyncStorage.setItem('@loginInfo:age', responseJson.age.toString());
        AsyncStorage.setItem('@loginInfo:gender', responseJson.gender.toString());
        this.setState({
          age: responseJson.age,
          gender: responseJson.gender
        });

        this.props.navigation.navigate('Main');
        
      }
      else{
        Alert.alert("Invalid Login",'please try again');
      }

    })
    .catch((error) => {
      console.error(error);
    });

   
  }

  //Retrieve user phone number from async storage and navigate to main screen
  componentWillMount(){
    try {
      const value = AsyncStorage.getItem('@loginInfo:phoneNumber');
      if(JSON.parse(value) != null){
        this.props.navigation.navigate('Main');
      }
    } catch (error) {
      // Handle errors here
    }

  }


  render() {
    return (

      <ImageBackground source={require('../../assets/book.jpg')} style={styles.background} >
        
        <KeyboardAvoidingView>
        <ScrollView contentContainerStyle={{flexGrow: 1}}>
        <TextInput
          value={this.state.phone}
          onChangeText={(phone) => this.setState({ phone })}
          placeholder={'Phone Number'}
          style={styles.input}
          keyboardType = "numeric"
        />
        <TextInput
          value={this.state.password}
          onChangeText={(password) => this.setState({ password })}
          placeholder={'Password'}
          secureTextEntry={true}
          style={styles.input}
        />

        <AwesomeButton
          style={styles.button}
          type="primary"
          height={40}
          width={215}
          backgroundColor="#3f90d3"
          onPress={this.onLogin.bind(this)}
        >
          <Text style={styles.login}>Login</Text>
      </AwesomeButton>

        <AwesomeButton
          style={styles.button2}
          type="primary"
          height={60}
          width={215}
          backgroundColor="#3f90d3"
          onPress={() => {this.props.navigation.navigate('Register')}}
        >
          <Text style={styles.text}>Register</Text>
      </AwesomeButton>

        </ScrollView>
        </KeyboardAvoidingView>
    </ImageBackground>

    );
  }
}

const styles = StyleSheet.create({
  login:{
    top: 0, 
    color: 'white', 
    fontSize: 18, 
    textAlign: 'center',
  },
  background:{
    width:'100%', 
    resizeMode: "stretch", 
    height:'100%'
  },
  input: {
    width: '60%',
    height: 44,
    padding: 10,
    borderWidth: 1,
    borderColor: 'black',
    marginBottom: 20,
    backgroundColor: 'white',
    opacity: 0.5,
    top: 200,
    left: '20%',
    borderColor: 'white',
    borderRadius: 5,
    fontSize: 16,

  },
  button: {
    width: '60%',
    marginTop:250,
    left: '20%',
  },
  button2: {
    top:20,
    left: '20%',
    width: '60%',
  },
  text: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    padding: 10,
    top: -10,
  },
});
