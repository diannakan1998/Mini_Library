import React, { Component } from 'react';
import { Alert, View, StyleSheet, KeyboardAvoidingView, ImageBackground, Button, ScrollView, ToastAndroid } from 'react-native';
import { AsyncStorage } from "react-native";
//Library to build register form structure
import t from 'tcomb-form-native'; // 0.6.9
import { TextInput } from 'react-native-paper';
import { Container } from 'native-base';
//Library to perform front-end form validation
import { validate } from 'tcomb-validation';

/*
Screen that displays a form for new users to sign up. User needs to input a valid phone number, age, gender and chosen password 
to register. Form is validated on the front-end using the validate() function from 'tcomb-validation'. 
Screen has a sign up button and a back button that leads to the main app page.
*/

//Create a new form
const Form = t.form.Form;

//Define the gender field of the form 
var Gender = t.enums({
  '1': 'Male',
  '0': 'Female',
  '2': 'Other'
});

//Validation check for phone number field (checks if value entered is a 10 digit numerical value)
const PhoneNumber = t.refinement(t.String, function (n) {
  return (n.length == 10 && !isNaN(n));
});
PhoneNumber.getValidationErrorMessage = function (n) {
  if (!n)
    return 'Phone number is required';
  else
    return 'Invalid Phone Number';
};

//Validation check for age (checks if value entered is a positive number)
const Age = t.refinement(t.String, function (n) {
  return !isNaN(n);
});
Age.getValidationErrorMessage = function (n) {
  if (!n)
    return 'Age is required';
  else
    return 'Age must be a number';
};


//Define all the form fields

var User = t.struct({
  phone: PhoneNumber,
  name: t.maybe(t.String),
  password: t.String,
  age: Age,
  gender: Gender
});

const formStyles = {
  ...Form.stylesheet,
  formGroup: {
    normal: {
      marginBottom: 10,
    },
  },
  controlLabel: {
    normal: {
      color: 'black',
      fontSize: 18,
      marginBottom: 7,
      fontWeight: '600'
    },
    // the style applied when a validation error occours
    error: {
      color: 'black',
      fontSize: 18,
      marginBottom: 7,
      fontWeight: '600'
    }
  }
}

const options = {
  fields: {
    phone: {
      //error: 'Phone number is required',
      keyboardType: 'numeric'
    },
    password: {
      password: true,
      secureTextEntry: true,
      error: 'Password is required',

    },

    age: { keyboardType: 'numeric' },
    gender: {
      nullOption: { value: '', text: 'Select Gender' },
      error: 'Gender is required'
    },
  },
  stylesheet: formStyles,
};

var values = {
  name: '',
  password: '',
  age: '',
  gender: '',
  phone: ''
};

export default class Register extends Component {

  constructor(props) {
    super(props);
    this.state = { values };
  }

  //Function called on sign up button click
  handleSubmit = async () => {

    // Retrieve field values from form
    const value = this._form.getValue();

    //Validate form values entered by user
    var result = validate(value, User);

    //console messages for debugging
    console.log('validated?: ', result.isValid());
    console.log('value: ', value);

    //If form is valid, send a POST request to server
    if (result.isValid()) {
      await fetch('http://13.59.131.180:3001/signup', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: value.phone,
          password: value.password,
          Age: value.age,
          Gender: value.gender
        }),
      }).then((response) => response.json())
        .then((responseJson) => {

          //Check if new user was successfully added on the backend
          if (responseJson.valid == "1") {

            AsyncStorage.setItem('@loginInfo:phoneNumber', value.phone);
            AsyncStorage.setItem('@loginInfo:age', value.age);
            AsyncStorage.setItem('@loginInfo:gender', value.gender);
            this.props.navigation.navigate('Main');
          }
          else {
            Alert.alert("Sign Up failed", 'please try again');
          }

        })
        .catch((error) => {
          console.error(error);
        });
    }
    else if (!result.isValid())
      ToastAndroid.show('Fix form errors to sign up', ToastAndroid.SHORT);
  };


  render() {
    return (
      <ImageBackground source={require('../../assets/book.jpg')} style={{ width: '100%', resizeMode: "stretch", height: '100%', opacity: 2 }} >
        <View style={styles.container}>
          <KeyboardAvoidingView>
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
              <Form
                ref={c => this._form = c}
                type={User}
                options={options}
                value={values}
                onChange={this.onChange}
              />
              <Container style={styles.button}>
                <Button
                  title="Sign Up"
                  color="black"
                  onPress={this.handleSubmit}
                />
              </Container>
              <Container style={styles.button}>
                <Button
                  color="black"
                  title="Back"
                  onPress={() => this.props.navigation.navigate('Login')}
                />
              </Container>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </ImageBackground>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    marginTop: 50,
    padding: 20,
    backgroundColor: 'lightsteelblue',
  },
  button: {
    width: '60%',
    height: 35,
    left: '20%',
    marginTop: 10,
    borderRadius: 5,
    backgroundColor: '#3f90d3'
  }
});