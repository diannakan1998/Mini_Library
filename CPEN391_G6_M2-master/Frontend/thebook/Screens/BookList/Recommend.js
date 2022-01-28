import React from 'react';
import {StyleSheet, Text, View, ListView, AsyncStorage } from 'react-native';
import { Container } from 'native-base';
import LibraryBookRow from './LibraryBookRow';

/*
* Recommend Books for Users 
*/
export default class Recommend extends React.Component {

  constructor(props) {

    super(props);
    var source = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    this.state = {
      w: '100%',
      dataSource: source,
      data: [
       
      ]
    };
  }

  componentDidMount() {
    this.loadBookRecommendation();
  }

  /*
  * Load Book Recommendation API CALL 
  * @param: PhoneNumber
  */
  loadBookRecommendation = () => {
    console.log("recommed");
    const { libraryID } = this.state;

    try {
      AsyncStorage.getItem('@loginInfo:phoneNumber').then((value) => {
        var phoneNumber = value;
          console.log(phoneNumber);
        let req = fetch('http://13.59.131.180:3001/recommendation', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phoneNumber: phoneNumber,
          }),
        }).then((response) => {
          var resp = response._bodyText;
          console.log("here " +response._bodyText);
          let res = JSON.parse(response._bodyText.replace(/'/g, '"'))
          console.log(res)
          this.setState({
            data: res,
          })

          console.log(this.state.data);

        })
      })
    } catch (error) {
      console.error(error);
    };
  }




  render() {
    return (
      <Container >

          <Text style={styles.text}>    Recommendations</Text>

          <ListView
            enableEmptySections={true}
            data={this.state.data}
            dataSource={this.state.dataSource.cloneWithRows(this.state.data)}

            renderRow={(data) => <LibraryBookRow {...data} />}
            renderSeparator={(rowID) => <View key={rowID} style={styles.separator} />}

          />

      </Container>

    );
  }
}

const styles = StyleSheet.create({
  text:{
    fontSize: 24, 
    color:'grey', 
    top: 20, 
    bottom: 50, 
    borderBottomWidth: 1, 
    borderBottomColor: 'grey', 
    marginBottom: 30
  },
  separator:{ 
    backgroundColor: 'grey', 
    height: 1, 
    width: this.state.w 
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  text: {
    marginLeft: 12,
    fontSize: 20,
  },
  photo: {
    height: 40,
    width: 40,
    borderRadius: 20,
  },

});
