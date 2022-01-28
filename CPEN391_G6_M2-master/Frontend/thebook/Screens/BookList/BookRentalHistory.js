import React from 'react';
import { StyleSheet,View, ListView, AsyncStorage } from 'react-native';
import Head from '../Components/Head';
import { Container } from 'native-base';
import BookHistoryRow from './BookHistoryRow';

/*
* Book Rental History Screen 
*/
export default class BookRentalHistory extends React.Component {

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
    this.loadBookRentalHistory();
  }

  
  /*
  * Load Book Rental History API Call 
  * @param: PhoneNumber 
  */
  loadBookRentalHistory = () => {

    const { libraryID } = this.state;

    try {
      AsyncStorage.getItem('@loginInfo:phoneNumber').then((value) => {
        this.setState({ 'phoneNumber': value });
        console.log(this.state.phoneNumber);
        console.log("here");

        // var phoneNumber = '1';
        let req = fetch('http://13.59.131.180:3001/history', {
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
        <Head title="History" navigation={this.props.navigation} />
        
        <Container style={{position: 'absolute', width: '100%', height: '90%', top: 75}}>

          <ListView
            enableEmptySections={true}
            data={this.state.data}
            dataSource={this.state.dataSource.cloneWithRows(this.state.data)}

            renderRow={(data) => <BookHistoryRow {...data} />}
            renderSeparator={(rowID) => <View key={rowID} style={styles.separator} />}

          />

        </Container>
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
    width: '100%'
  },
  separator:{ 
    backgroundColor: 'grey', 
    height: 1, 
    width: this.state.w 
  },
});
