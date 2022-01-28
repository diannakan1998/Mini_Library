import React from 'react';
import {StyleSheet, ListView, Animated, Dimensions, View,Text, Image, TouchableOpacity,} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import CustomHeader from './CustomHeader'
import LibraryBookRow from '../BookList/LibraryBookRow';
import {Container} from 'native-base';
import Map from '../Map/Map';
import Recommend from '../BookList/Recommend';
import SlidingUpPanel from 'rn-sliding-up-panel';
import {Permissions } from 'expo';
import Geocode from "react-geocode";

/*
  Main screen of app, displays locations of the various libraries and user location on a map.
  Also allows users to search for books based on title and location.
*/

const { height } = Dimensions.get('window')

export default class Main extends React.Component {
  constructor(props) {
    super(props);
    
    //Set up google map api
    Geocode.setApiKey("AIzaSyCXVvN-WgMeA5ztKGsjNrP0JbMh2-OI8B8");

    var source = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });

    global.region = null;
    global.markers = [];
    
    this.state = {
      locpermission: -1,
      page: 3,
      phone: '', age: 0, gender: 1,
      name: '', location: '',
      libname: 'library 1',
      libraryid: 1,
      w: '100%',
      dataSource: source,
      bookTitle: "A Game of Thrones",
      longitude: -123.25007,
      latitude: 49.26216,
      address: '',
      searchLat: 49.26216,
      searchLong: -123.45007,
      maplocs: [],
      userlocation: null,
      userLat: null,
      userLong: null,
      region: null,
      data: [],

    };

  }

  static defaultProps = {
    draggableRange: {
      top: height,
      bottom: 220
    }
  }

  /*
  * Convert Address to Latitude and Longitude 
  */
  convertLatLong(address) {
    Geocode.fromAddress(address).then(
      response => {
        const { lat, lng } = response.results[0].geometry.location;
        console.log(lat, lng);
        global.region = {
          latitude: lat,
          longitude: lng,
          latitudeDelta: 0.3,
          longitudeDelta: 0.3,
        },
          this.setState({
            searchLat: lat,
            searchLong: lng,
            page: 3
          })
        this.updateBookList();
      },
      error => {
        console.error(error);
      }
    );
  }

  /*
  * Convert Latitude, Longitude to Address 
  */
  convertAddress(latitude, longitude) {
    Geocode.fromLatLng(latitude, longitude).then(
      response => {
        const address = response.results[0].formatted_address;
        this.setState({
          address: address
        })

      },
      error => {
        console.error(error);
      }
    );
  }

  _draggedValue = new Animated.Value(200)


  componentWillMount() {
    clearInterval(this._interval);
    this.loadLocations();
  }


  componentDidMount = () => {

    //get user location
    this.getCurrentLocation();

    //load library locations
    this.loadLocations();

    global.name = '';
    global.location = '';

    this._interval = setInterval(() => {
      var name = this.state.name;
      var location = this.state.location;

      this.setState({
        name: global.name,
        location: global.location,
      })

      if (name != global.name || location != global.location) {

        //convert location to lat long
        if(global.location == ''){
          this.getCurrentLocation();
        } else {
          this.convertLatLong(global.location);
        }

      }
    }, 1000);

  }


  static navigationOptions = ({ screenProps }) => ({
    title: '',
    header: props => <CustomHeader {...screenProps} {...props} />,
    drawerLabel: () => null
  })


  //Navigate to recommendations
  toRecommend = () => {
    this.setState(
      {
        page: 1
      });
  }

  //Navaigate to map
  toMap = () => {
    this.setState(
      {
        page: 3
      });
  }

  //Navigate to chat window
  toChat = () => {
    this.props.navigation.navigate("Chat");
  }


  updateSearchMap = (p, lon, lat, lid, addr) => {
    this.convertAddress(lat, lon);
    this.setState({ page: p, longitude: lon, latitude: lat, libraryid: lid });
    console.log("libid " + this.state.libraryid + " " + this.state.longitude);
    this.loadBooks(lid);
  }

  //get books from this location with title like name
  loadBooks = (lid) => {

    try {
      console.log(lid);
      let req = fetch('http://13.59.131.180:3001/searchBookinLib', { ///to add backend
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          libraryID: lid,
          userTitle: global.name,
        }),
      }).then((response) => {
        let res = JSON.parse(response._bodyText);
        // console.log(res);
        this.setState({
          data: res,
        });

        // console.log("state" + this.state.data);

      })
    } catch (error) {
      console.error(error);
    };
  }

  /*
  * Search libraries with books like name around userlat and user long
  */
  updateBookList = () => {
    try {
      console.log("update");
      let req = fetch('http://13.59.131.180:3001/searchBook', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userTitle: global.name,
        }),
      }).then((response) => {
        let res = JSON.parse(response._bodyText)
        global.markers = res;
        this.setState({
          markers: res,
        })
      })
    } catch (error) {
      console.error(error);
    };
  }

  /*
  * Load Locations of All Libraries
  */
  loadLocations = async () => {
    console.log("here");
    try {
      let req = await fetch('http://13.59.131.180:3001/locations', {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      }).then((response) => {
        let res = JSON.parse(response._bodyText)
        global.markers = res;
        console.log("load" + global.markers);
      })
    } catch (error) {
      console.error(error);
    };
  }

  /*
  * Get Current Location of User 
  */
  getCurrentLocation = async () => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== 'granted') {
      this.setState({
        errorMessage: 'Permission to access location was denied',
        locpermission: -1,
      });
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.setState({
          region: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            latitudeDelta: 0.3,
            longitudeDelta: 0.3,
          },
        });
        global.region = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        };
        // console.log(position.coords.latitude);
        this.updateBookList();
      },
      (error) => console.log(error.message),
      { enableHighAccuracy: true, timeout: 200000, maximumAge: 1000 }
    )

  }


  render() {
    const { top, bottom } = this.props.draggableRange

    const draggedValue = this._draggedValue.interpolate({
      inputRange: [bottom, top],
      outputRange: [0, 1],
      extrapolate: 'clamp'
    })

    const transform = [{ scale: draggedValue }]

    // screen for recommendation
    if (this.state.page == 1) {
      return (
        <View style={styles.container}>
          <Container style={{ position: 'relative', marginTop: 140, width: '100%' }}>
            <Recommend />
          </Container>
          <Icon
            name="map-marker"
            color="white"
            size={30}
            style={styles.mapicon}
            onPress={() => this.toMap()}
          />

          <Icon
            name="wechat"
            color="white"
            size={30}
            style={styles.boticon}
            onPress={() => { this.toChat() }}
          />

        </View>
      );
    } else if (this.state.page == 2) { //screen for tapped marker with slide panel
      return (
        <View style={styles.container}>
          <Container style={{position: 'relative', marginTop: 140, width: '100%'}}>
            <Map navigation={this.props.navigation} onSearchMap={this.updateSearchMap} region={this.state.region}/>
            <Icon
              name="book"
              color="white"
              size={30}
              style={styles.bookicon2}
              onPress={() => { this.toRecommend() }}
            />
            <Icon
              name="wechat"
              color="white"
              size={30}
              style={styles.boticon2}
              onPress={() => { this.toChat() }}
            />
            <SlidingUpPanel
              showBackdrop={false}
              ref={c => (this._panel = c)}
              draggableRange={this.props.draggableRange}
              animatedValue={this._draggedValue}>

              {dragHandler => (
                <View style={styles.panel}>

                  <View style={styles.panelHeader} {...dragHandler}>
                    <Text style={styles.library}>Library {this.state.libraryid}</Text>
                    <Text style={styles.address}>{this.state.address}</Text>
                    <TouchableOpacity style={styles.arrow} onPress={() => { this.setState({page: 3}) }}>
                      <Image style={{ flex: 1, resizeMode: 'contain', width: null, height: null }}
                        source={require('../../assets/down-arrow.gif')} />
                    </TouchableOpacity>
                  </View>

                  <Container style={{ position: 'absolute', width: '100%', top: 80, height: '65%' }}>

                    <ListView
                      data={this.state.data}
                      dataSource={this.state.dataSource.cloneWithRows(this.state.data)}
                      enableEmptySections={true}

                      renderRow={(data) => <LibraryBookRow {...data} />}
                      renderSeparator={(rowID) => <View key={rowID} style={styles.separator} />}

                    />
                  </Container>
                </View>
              )}
            </SlidingUpPanel>

          </Container>
        </View>
      );
    } else { //screen for map with marker only
      return (
        <View style={styles.container}>
          <Container style={{ position: 'relative', marginTop: 140, width: '100%' }}>
            <Map navigation={this.props.navigation} onSearchMap={this.updateSearchMap} data={this.state.maplocs} />
          </Container>

          <Icon
            name="book"
            color="white"
            size={30}
            style={styles.mapicon}
            onPress={() => {this.toRecommend()}}
          />

          <Icon
            name="wechat"
            color="white"
            size={30}
            style={styles.boticon}
            onPress={() => {this.props.navigation.navigate("Chat")}}
          />

        </View>
      );
    }
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
  library:{ 
    fontSize: 20, 
    left: -100, 
    color: '#FFF' 
  },
  address:{ 
    fontSize: 14, 
    left: -20, 
    top: 10, 
    color: '#FFF', 
    width: 280 
  },
  separator:{ 
    backgroundColor: 'grey', 
    height: 1, 
    width: this.state.w 
  },
  map: {
    position: 'absolute',
    top: 140,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'grey'
  },
  book: {
    position: 'absolute',
    top: 140,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'white'
  },
  mapicon: {
    position: 'absolute',
    top: 160,
    right: 20,
    width: 50,
    height: 50,
    backgroundColor: '#284e8c',
    borderRadius: 25,
    textAlign: 'center',
    padding: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 10, height: 10
    },
    shadowOpacity: 0.5,
    shadowRadius: 25
  },
  bookicon2: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 50,
    height: 50,
    backgroundColor: '#284e8c',
    borderRadius: 25,
    textAlign: 'center',
    padding: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 10, height: 10
    },
    shadowOpacity: 0.5,
    shadowRadius: 25
  },
  boticon: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 50,
    height: 50,
    backgroundColor: '#284e8c',
    borderRadius: 25,
    textAlign: 'center',
    paddingTop: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 10, height: 10
    },
    shadowOpacity: 0.5,
    shadowRadius: 25
  },
  boticon2: {
    position: 'absolute',
    bottom: 120,
    right: 20,
    width: 50,
    height: 50,
    backgroundColor: '#284e8c',
    borderRadius: 25,
    textAlign: 'center',
    paddingTop: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 10, height: 10
    },
    shadowOpacity: 0.5,
    shadowRadius: 25
  },
  panel: {
    flex: 1,
    backgroundColor: 'white',
    position: 'relative'
  },
  panelHeader: {
    height: 80,
    backgroundColor: '#284e8c',
    alignItems: 'center',
    justifyContent: 'center'
  },
  favoriteIcon: {
    position: 'absolute',
    top: 100,
    right: 20,
    backgroundColor: '#284e8c',
    width: 50,
    height: 50,
    paddingTop: 10,
    paddingLeft: 8,
    borderRadius: 25,
    zIndex: 1
  },
  dragHandler: {
    alignSelf: 'stretch',
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ccc'
  },
  arrow: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 50,
    height: 50,
    paddingTop: 10
  }
});
