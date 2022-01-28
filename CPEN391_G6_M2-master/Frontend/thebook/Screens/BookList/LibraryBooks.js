import React from 'react';
import { Image, StyleSheet, Text, View, ListView, ScrollView } from 'react-native';
import { Container } from 'native-base';
import Head from '../Components/Head';
import LibraryBookRow from './LibraryBookRow';

export default class LibraryBooks extends React.Component {

  constructor(props) {

    super(props);

    var source = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    
    this.state = {
      libraryid: 1,
      libraryname: 'Library 1',
      starCount: 3.5,
      w: '100%',
      dataSource: source,
      data: [
      ]
    };
  }

  componentDidMount() {
    this.setState({
      libraryid: this.props.navigation.state.params.libraryId
    })
    console.log(this.state.libraryid);
    this.loadLibraryBook(this.state.libraryid);

  }

  /*
  * Load Books at Specific Library 
  * @param: LibraryID
  */
  loadLibraryBook = (libraryid) => {
    try {
      let req = fetch('http://13.59.131.180:3001/available', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          libraryID: libraryid,
        }),
      }).then((response) => {
        let res = JSON.parse(response._bodyText)
        console.log(res)
        this.setState({
          data: res,
        })

        console.log(this.state.data);

      })
    } catch (error) {
      console.error(error);
    };
  }


  render() {
    return (
      <Container >
        <Head title="Library 1" navigation={this.props.navigation}/> 

        <Container style={{position: 'absolute', width: '100%', top: 75, height:'88%'}}>
        <ListView
          data={this.state.data}
          dataSource={this.state.dataSource.cloneWithRows(this.state.data)}
          enableEmptySections={true}

          renderRow={(data) => <LibraryBookRow {...data} />}
          renderSeparator={(rowID) => <View key={rowID} style={styles.separator} />}

        />
       </Container>
       <View style={{width: '100%', height: 100}}></View>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  separator:{ 
    backgroundColor: 'grey', 
    height: 1, 
    width: this.state.w 
  },
});
