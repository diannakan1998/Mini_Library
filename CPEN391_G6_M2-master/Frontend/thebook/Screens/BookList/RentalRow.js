import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

/*
* The style of Rendering a List of Books 
*/
export default class RentalRow extends React.Component {
    render() {
      var td = String(this.props.Takeout_Date).substring(0,10);
      var rd = String(this.props.Return_Date).substring(0,10);
  
      return(
        <View style={styles.row}>
  
          <Image source={{uri: this.props.Image}} style={styles.image} />
          <View style={{flexDirection: 'column', alignItems: 'flex-start', width: '65%', left: 30}}>
          
            <Text style={styles.title} >{this.props.Title}</Text>
            <Text style={{fontSize: 18, flexWrap: 'wrap'}}>{this.props.NAME}</Text>
            <Text style={{paddingTop: 10, fontSize: 18}} >Takeout Date: {td}</Text>
            <Text style={{fontSize: 18 }} >Return Date: {rd}</Text>
  
          </View>
        </View>
      );
    }
  }

  const styles = StyleSheet.create({
    row:{ 
      flexDirection: 'row', 
      alignItems: 'center', 
      padding: 10, 
      backgroundColor: 'white', 
      borderRadius: 15, 
      borderTopWidth: 0.5, 
      borderBottomWidth: 0.5 
    },
    image: {
      flexWrap: 'wrap',
      resizeMode: 'contain',
      width: '30%',
      height: '100%',
      marginRight: 10
    },
    title: {
      paddingTop: 10,
      fontSize: 18,
      fontWeight: 'bold',
      flexWrap: 'wrap'
    }
  })
  