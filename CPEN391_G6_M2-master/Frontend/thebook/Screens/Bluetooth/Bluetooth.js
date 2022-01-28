import React from 'react';
import { StyleSheet, Text, View, Image, ScrollView, RefreshControl } from 'react-native';
import { Container,} from "native-base";
import Head from '../Components/Head';
import AwesomeButton from "react-native-really-awesome-button";
import Icon from 'react-native-vector-icons/FontAwesome';
import LibraryBookRow from '../BookList/LibraryBookRow';

/*
 * Bluetooth Screen  
 */
export default class Bluetooth extends React.Component {
  constructor(props) {

    super(props);

    this.state = {
      isEnabled: false,
      refreshing: false,
      devices: [],
      connected: false,
      libraryId: 1,
    }
  }


  componentDidMount() {
    global.screen = 1;
    this.loadNewBook();//return newest book in the library
    this.setState({
      libraryId: this.props.navigation.state.params.libraryId
    })
  }


  /*
  * Retrieve Newest Book in Specific Library
  * @param libraryID
  */
  loadNewBook() {
    try {
      let req = fetch('http:/13.59.131.180:3001/newbook', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          libraryID: this.state.libraryId,
        }),
      }).then((response) => {
        let res = JSON.parse(response._bodyText)
        this.setState({
          data: res[0],
        })

      })
    } catch (error) {
      console.error(error);
    };
  }


  _onRefresh = () => {
    this.loadNewBook();
  }


  render() {
    var { navigate } = this.props.navigation;
    return (
      <Container>
        <Head title="Library 1" navigation={this.props.navigation} />
        <Container style={{position: 'absolute', width: '100%', top: 75}}>
          <ScrollView
            style={styles.book}
            refreshControl={
              <RefreshControl
                refreshing={this.state.refreshing}
                onRefresh={this._onRefresh}
              />
            }
          >
            <LibraryBookRow {...this.state.data} />
          </ScrollView>
          <Image style={styles.booktitle} resizeMode="contain" source={require('../../assets/new.gif')} />
          <View style={styles.view} />

          <AwesomeButton
            style={styles.take}
            type="primary"
            height={200}
            width={90}
            backgroundColor="#7da8ed"
            onPress={() => navigate("TakeBook", { navigate: this.props.navigation })}
          >
            <Icon style={styles.icon} name="book" color="white" size={50} />
            <Text style={styles.text}>Take {"\n"}a {"\n"}Book</Text>
          </AwesomeButton>

          <AwesomeButton
            style={styles.return}
            type="primary"
            height={200}
            width={90}
            backgroundColor="#b3afff"
            onPress={() => navigate("ReturnBook")}
          >
            <Icon style={styles.icon} name='history' color='white' size={50} />
            <Text style={styles.text}>Return{"\n"} a {"\n"}Book</Text>
          </AwesomeButton>
          <AwesomeButton
            style={styles.leave}
            type="primary"
            height={200}
            width={90}
            backgroundColor="#64c657"
            onPress={() => navigate("LeaveBook", { libraryId: this.state.libraryId })}
          >
            <Icon style={styles.icon} name="plus-circle" color="white" size={50} />
            <Text style={styles.text}>Leave {"\n"}a {"\n"}Book</Text>
          </AwesomeButton>

          <AwesomeButton
            style={styles.list}
            type="primary"
            height={100}
            width={300}
            backgroundColor="#ff8b68"
            onPress={() => navigate("Library", { libraryId: this.state.libraryId })}
          >
            <Image style={styles.listimg} resizeMode='stretch' source={require('../../assets/book.gif')} />
            <Text style={styles.textlist}>Book List</Text>
            <Image style={styles.listimg2} resizeMode='stretch' source={require('../../assets/reading.gif')} />
          </AwesomeButton>

        </Container>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  view:{
    backgroundColor: 'grey', 
    height: 1, 
    width: '90%', 
    left: '5%', 
    position: 'absolute', 
    top: 160
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  booktitle: {
    width: 60,
    top: -185,
    position: 'absolute',
    left: 20,
  },
  book: {
    position: 'absolute',
    top: 30,
    width: '88%',
    left: '12%'
  },
  list: {
    top: 390,
    left: 30,
    position: 'absolute',
  },
  listimg: {
    width: 50,
    height: 70,
    left: -70,
    top: 15,
    position: 'absolute',
  },
  listimg2: {
    width: 50,
    height: 70,
    left: 130,
    top: 15,
    position: 'absolute',

  },
  textlist: {
    color: 'white',
    fontSize: 26,
    textAlign: 'center',
  },
  text: {
    color: 'white',
    fontSize: 26,
    textAlign: 'center',
    top: 20
  },
  leave: {
    top: 180,
    right: 30,
    position: 'absolute',
  },
  take: {
    top: 180,
    left: 30,
    position: 'absolute',
  },
  return: {
    top: 180,
    left: 135,
    position: 'absolute',
  },
  icon: {
    position: 'absolute',
    top: 10
  }

});
