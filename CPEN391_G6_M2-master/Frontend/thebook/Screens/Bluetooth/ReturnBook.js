import React from 'react';
import { Image, StyleSheet, Text, View, ListView, RefreshControl, TouchableOpacity } from 'react-native';
import { Container } from 'native-base';
import Head from '../Components/Head';
import Icon from 'react-native-vector-icons/FontAwesome';
import StarRating from 'react-native-star-rating';
import BluetoothSerial from 'react-native-bluetooth-serial';

/*
* Return Book Screen 
*/
export default class ReturnBook extends React.Component {

  constructor(props) {

    super(props);

    var source = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });

    this.state = {
      rating: 3,
      bookID: 2,
      w: '100%',
      count: -1,
      dataSource: source,
      loading: true,
      refresh: false,
      data: [
      ]
    };
  }

  componentWillMount() {
    global.screen = 3;
    clearInterval(this._interval);
  }


  /*
   * Load Book Info API Call 
   * @param bookID
   */
  loadBook = (bookID) => {

    try {
      let req = fetch('http://13.59.131.180:3001/bookinfo', {
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
        console.log(res)
        if (this.state.loading) {
          var arr = [];
          arr[0] = { title: res[0].title, Name: res[0].Name, rating: res[0].rating, image: res[0].image, id: res[0].Book_ID, count: 0 }

          this.setState({
            data: arr,
            loading: false,
            count: 0,
          });

        }
        else {
          var arr = [{}];
          arr[0] = { title: res[0].title, Name: res[0].Name, rating: res[0].rating, image: res[0].image, id: res[0].Book_ID, count: this.state.count + 1 }
          
          this.setState({
            data: this.state.data.concat(arr),
            count: this.state.count + 1,
          });
        }

      })
    } catch (error) {
      console.error(error);
    };
  }


  /*
   * Update Book Rating API Call 
   * @param bookID 
   * @param rating 
   */
  submitRating(bookID, rating) {

    try {
      AsyncStorage.getItem('@loginInfo:phoneNumber').then((value) => {
        console.log("phone " + value);
        let req = fetch('http://13.59.131.180:3001/updaterating', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phoneNumber: value,
            bookID: bookID,
            rating: rating,
          }),
        }).then((response) => {
          let res = JSON.parse(response._bodyText)
          console.log(res);

        })
      })
    } catch (error) {
      console.error(error);
    };
  }

  /**
  * Write message to device
  * @param  {String} message
  */
  write3(message) {
    BluetoothSerial.write(message)
      .then((res) => {
        console.log(`Write3 Successfuly wrote ${message} to device`)
      })
      .catch((err) => console.log(err.message))
  }

  /*
  * Read bookid from bluetooth
  * Then load correponding book infomation 
  */
  read3() {
    BluetoothSerial.withDelimiter('~').then((res) => {
      BluetoothSerial.on('read', (data) => {
        var response = data.data
        var id = response.substring(0, response.length - 1);
        console.log(`Read3 Received data ${id}`)
        this.setState({ bookid: id });
        this.loadBook(id);
      })
    })
  }


  componentDidMount() {
    global.screen = 3;
    this._interval = setInterval(() => {
      if (global.ref == 1) {
        this.setState({ refresh: true });
        global.ref = 0;
      }
    }, 1000);
  }

  //press scan button 
  toScan = () => {
    //bluetooth connection
    var id = 3;

    //send scan command to de1
    this.write3('b');
  }

  _onRefresh = () => {
    this.setState({ refreshing: true });
  }

  //update rating 
  updateRating (r, item) {
    newdata = this.state.data;
    global.rating = r;
    var arr = global.returnBook;

    arr[item.count].rating = r;
    global.returnBook = arr;
    
    this.setState({
      refresh: false
    });

    this.submitRating(item.id, r);
  }

  render() {
    return (
      <Container>
        <Head title="Library 1" navigation={this.props.navigation} />
        <Container style={{ position: 'absolute', width: '100%', top: 75, height: '88%' }}>
          <ListView
            refreshControl={
              <RefreshControl
                refreshing={this.state.refreshing}
                onRefresh={this._onRefresh}
              />
            }
            enableEmptySections={true}
            data={global.returnBook}
            dataSource={this.state.dataSource.cloneWithRows(global.returnBook)}
            renderRow={(data) => <LibraryBookRow {...data} />}
            renderSeparator={(rowID) => <View key={rowID} style={styles.separator} />}

          />
        </Container>
        <TouchableOpacity onPress={() => this.write3("b")} style={styles.addicon}>
          <Icon
            name="plus"
            color="white"
            size={30}
            style={{left: 12}}
          />
        </TouchableOpacity>
      </Container>
    );

  }
}

const LibraryBookRow = (item) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', padding: 10 }}>

    <Image source={{uri: item.image}} style={styles.image} />
    <View style={styles.bookrow}>
      <Text style={styles.title} >{item.title}</Text>
      <Text style={styles.author}>{item.Name}</Text>

      <View style={{flexDirection: 'row', alignItems: 'baseline'}}>
        <StarRating
          disabled={false}
          maxStars={5}
          rating={item.rating}
          fullStarColor={'#f4ed0e'}
          emptyStarColor={'#f4ed0e'}
          starSize={22}
          selectedStar={(rating) => {this.updateRating(rating, item)}}
        />
      </View>

    </View>


  </View>

);

const styles = StyleSheet.create({
  bookrow:{
    flexDirection: 'column', 
    alignItems: 'flex-start', 
    left: 20, 
    width: '65%' 
  },
  author:{
    paddingTop: 10, 
    fontSize: 18 
  },
  title:{
    paddingTop: 10, 
    fontSize: 18, 
    fontWeight: 'bold', 
    flexWrap: 'wrap' 
  },
  separator:{ 
    backgroundColor: 'grey', 
    height: 1, 
    width: this.state.w 
  },
  image:{
    flexWrap: 'wrap', 
    resizeMode: 'contain', 
    width: '30%', 
    height: '100%' 
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  addicon: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 50,
    height: 50,
    backgroundColor: '#284e8c',
    borderRadius: 25,
    textAlign: 'center',
    paddingTop: 10
  }
});
