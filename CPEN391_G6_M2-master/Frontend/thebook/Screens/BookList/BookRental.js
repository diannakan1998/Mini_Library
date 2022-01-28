import React from 'react';
import { Image, StyleSheet, Text, View, ListView, ScrollView, TouchableOpacity, AsyncStorage } from 'react-native';
import Head from '../Components/Head';
import { Container } from 'native-base';
import { SwipeListView } from 'react-native-swipe-list-view';
import RentalRow from './RentalRow';

/*
* Book Rental Screen 
* Show User Current Rental 
*/
export default class BookRentals extends React.Component {

  constructor(props) {

    super(props);
    var ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    this.state = {
      w: '100%',
      phoneNumber: '',
      dataSource: ds,
      data: [
 
      ]
    };
  }

  componentDidMount() {
    this.loadBookRentals();
  }


  /*
  * RenewBooks API Call
  * @param : bookID
  * Update TakeOut_Date in database
  */
  renewBook = (bookID) => {

    try {
      console.log("renew");
      let req = fetch('http://13.59.131.180:3001/renew', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookID: bookID,
        }),
      }).then((response) => {
        let res = JSON.parse(response._bodyText)
        alert("Renewed Success");
        this.loadBookRentals();

      })
    } catch (error) {
      console.error(error);
    };
  }

  
  /*
  * Load Current BookRentals API Call 
  * @param: PhoneNumber
  */
  loadBookRentals = () => {

    const { libraryID } = this.state;

    try {
      AsyncStorage.getItem('@loginInfo:phoneNumber').then((value) => {
        this.setState({ 'phoneNumber': value })
        console.log(this.state.phoneNumber);
        // phoneNumber = '1';
        let req = fetch('http://13.59.131.180:3001/curRentals', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phoneNumber: this.state.phoneNumber,
          }),
        }).then((response) => {
          let res = JSON.parse(response._bodyText)
          console.log(res)
          this.setState({
            data: res,
          })
  
          console.log(this.state.data);
  
        })
    });
      
    } catch (error) {
      console.error(error);
    };
  }


  render() {
    return (
      <Container >
        <Head title="Current Rentals" navigation={this.props.navigation} />
        
        <Container style={{position: 'absolute', width: '100%', top: 75, height: '85%'}}>
          <ScrollView>
            <SwipeListView
              enableEmptySections={true}
              dataSource={this.state.dataSource.cloneWithRows(this.state.data)}
              renderRow={(data) => <RentalRow {...data}/>}
              renderHiddenRow={(data, secId, rowId, rowMap) => (
                <View style={styles.rowBack}>
                  <TouchableOpacity style={styles.backRightBtn} onPress={this.renewBook.bind(this,data.Book_ID)}>
                    <Text style={{ fontSize: 20, color: 'white' }}>Renew{'\n'}for 21 days</Text>
                  </TouchableOpacity>
                </View>
              )}

              rightOpenValue={-120}
            />

            <Image resizeMode='contain' style={styles.image} source={require('../../assets/swipe.gif')} />
          </ScrollView>
        </Container>
      </Container>
    );
  }
}


const styles = StyleSheet.create({
  image:{ 
    marginTop: 20, 
    left: 250, 
    width: 100, 
    height: 80 
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%'
  },
  backRightBtn: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    width: 120,
    backgroundColor: '#ff9438',
    right: 0,
    borderRadius: 16,

  },
  rowBack: {
    alignItems: 'center',
    backgroundColor: '#DDD',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 15,
  },
});