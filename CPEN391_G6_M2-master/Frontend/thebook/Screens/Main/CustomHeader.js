import React from 'react';
import {StyleSheet,TextInput, AsyncStorage, Image, ScrollView, TouchableOpacity, ImageBackground} from 'react-native';
import {IconButton,} from 'react-native-paper';
       
       
export default class CustomHeader extends React.Component {   
    constructor(props) {
        super(props);
        this.state = {name: '', location: '', gender: '0'};
        global.name = '';
        global.location='';
      }

    componentDidMount = () => {
      AsyncStorage.getItem('@loginInfo:gender').then((value) => this.setState({'gender': value}));

    }

    onSearchUpdate (){
      console.log("here "+ this.state.name );
      global.name = this.state.name;
      global.location = this.state.location;
    }

    render() {
      var { navigate } = this.props.navigation;
      // render differently according to gender

      return (
      <ImageBackground source={require('../../assets/galaxy4.gif')} style={styles.nav} >
          <ScrollView contentContainerStyle={{flexGrow: 1}}>
        <TouchableOpacity  style={styles.profilebutton} onPress={()=>  this.props.openDraw()}>
        
        {() => {
            if(this.state.gender == '0'){
              return (          
                <Image
                borderRadius={25}
                style={{width: 50, height: 50}}
                source={require('../../assets/female.jpg')}
                />
              );
            } else {
              return (
                <Image
                borderRadius={25}
                style={{width: 50, height: 50}}
                source={require('../../assets/male.jpg')}
                />
              );
            }
        }}

        </TouchableOpacity>
          <TextInput
            style={styles.searchform}
            placeholder="Name..."
            onChangeText={(name) => this.setState({name})}
          />
          <TextInput
            style={styles.searchform2}
            placeholder="Location..."
            onChangeText={(location) => this.setState({location})}
          />

          <IconButton
            style={styles.nfcbutton}
            icon="bluetooth"
            color="white"
            size={35}
            onPress= {() => navigate("BluetoothCon", {navigate: this.props.navigation})}
          />

        <TouchableOpacity onPress={() => {this.onSearchUpdate()}} style={styles.searchbutton}>
          <IconButton
            icon="search"
            color="white"
            size={35}
            
          />
        </TouchableOpacity>
        </ScrollView>
        </ImageBackground>
        );
    }
}



const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%'
    },
    nav: {
      backgroundColor: '#284e8c',
      height: 140,
      width: '100%',
      position: 'absolute',
      top: 0, 
      flex: 1, 
      right: 0,
    },
  
    searchform: {
      height : 40,
      borderRadius: 4,
      borderWidth: 0.5,
      borderColor: '#d6d7da',
      position: 'absolute',
      top: 35,
      left: 70, 
      flex: 1, 
      right: 0,
      width: '65%',
      color: 'white',
      padding: 5,
      fontSize: 16,
      backgroundColor: '#284e8c',
      opacity: 0.8,
      // color: 'black',
    },
    searchform2: {
      height : 40,
      borderRadius: 4,
      borderWidth: 0.5,
      borderColor: '#d6d7da',
      position: 'absolute',
      color: 'white',
      top: 85,
      left: 70, 
      flex: 1, 
      right: 0,
      width: '65%',
      padding: 5,
      fontSize: 16,
      backgroundColor: '#284e8c',
      opacity: 0.7,
      // color: 'black',
    },
    searchbutton: {
      position: 'absolute',
      top: 80,
      right: 10,
      width: 50,
      height: 50,
    },
    nfcbutton: {
      position: 'absolute',
      top: 20,
      right: 0,
      width: 50,
      height: 50,
    },
    profilebutton: {
      position: 'absolute',
      top: 50,
      left: 10,
      width: 50,
      height: 50,
    },

  });
  