import React from 'react';
import {StyleSheet,View, ListView, TouchableOpacity, ScrollView, RefreshControl} from 'react-native';
import {Container} from 'native-base';
import Head from '../Components/Head';
import LibraryBookRow from '../BookList/LibraryBookRow';
import Icon from 'react-native-vector-icons/FontAwesome';
import BluetoothSerial from 'react-native-bluetooth-serial';

/*
 * Take A Book Screen 
 */
export default class TakeBook extends React.Component {

  constructor(props) {

    super(props);

    var source = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });

    this.state = {
      starCount: 3.5,
      w: '100%',
      refreshing: false,
      dataSource: source,
      init: 0,
      bookID: -1,
      data: []
    };
  }


  componentWillMount() {
    global.screen = 2;
    clearInterval(this._interval);
  }


  componentDidMount() {
    this._interval = setInterval(() => {
      if (global.ref == 1) {
        this.setState({ refresh: true });
        global.ref = 0;
      }
    }, 1000);
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
        if (this.state.init == 0) {
          this.setState({
            data: res,
            init: 1
          })
        }
        else {
          this.setState({
            data: this.state.data.concat(res)
          });
        }
        console.log(this.state.data);

      })
    } catch (error) {
      console.error(error);
    };
  }

  /**
 * Write message to device
 * @param  {String} message
 */
  write1 = (message) => {
    BluetoothSerial.write(message)
      .then((res) => {
        console.log(`Write1 Successfuly wrote ${message} to device`)
      })
      .catch((err) => console.log(err.message))
  }


  _onRefresh = () => {
    this.setState({ refreshing: true });
  }

  
  render() {
    return (
      <Container>
        <Head title="Library 1" navigation={this.props.navigation} />
        <Container style={{position: 'absolute', width: '100%', top: 75, height: '88%'}}>
          <ScrollView >
            <ListView
              refreshControl={
                <RefreshControl
                  refreshing={this.state.refreshing}
                  onRefresh={this._onRefresh}
                />
              }
              data={global.takeBook}
              dataSource={this.state.dataSource.cloneWithRows(global.takeBook)}
              enableEmptySections={true}

              renderRow={(data) => <LibraryBookRow {...data} />}
              renderSeparator={(rowID) => <View key={rowID} style={styles.separator} />}

            />
          </ScrollView>
        </Container>
        <TouchableOpacity onPress={() => this.write1("a")} style={styles.addicon}>
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
