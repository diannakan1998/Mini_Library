import React, { Component } from 'react';
import {
  Image, View,
  TextInput,StyleSheet,
  ScrollView, KeyboardAvoidingView, AsyncStorage, RefreshControl
} from 'react-native';
import { Button } from 'react-native-elements';
import { Container } from 'native-base';
import Head from '../Components/Head';
import { ImagePicker, Permissions } from 'expo';
import StarRating from 'react-native-star-rating';
import BluetoothSerial from 'react-native-bluetooth-serial';

/*
 * Leave A Book Screen 
 */
export default class leaveAbook extends Component {
  constructor(props) {
    super(props);

    this.state = {
      title: '',
      author: '',
      photo: 'https://www.worldanvil.com/uploads/images/a070470a51e30703dfe044542a0a8725.png',
      starCount: 0,
      bookid: 0,
      libraryid: -1
    };
  }


  componentDidMount() {
    global.screen = 4;
    this.setState({ libraryid: this.props.navigation.state.params.libraryId });
  }


  /*
  * Permission Check 
  */
  askPermissionsAsync = async () => {
    await Permissions.askAsync(Permissions.CAMERA);
    await Permissions.askAsync(Permissions.CAMERA_ROLL);
  };


  /*
  * Choose picture from album 
  */
  _onChoosePic = async () => {
    await this.askPermissionsAsync();

    const {
      cancelled,
      uri,
    } = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [3, 4],
      base64: false,
    });

    if (!cancelled) {
      this.setState({ photo: uri });
    }
  }

  /*
  * Take Picture 
  */
  _onTakePic = async () => {
    await this.askPermissionsAsync();

    const {
      cancelled,
      uri,
    } = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [3, 4],
      base64: false,
    });

    if (!cancelled) {
      this.setState({ photo: uri });
    }
  }


  onSubmit = async () => {

    const { title, author, photo } = this.state;

    // call to bluetooth to send data goes here
    this.leaveAbook();
  }

  /**
   * Write message to device
   * @param  {String} message
   */
  write4(message) {
    BluetoothSerial.write(message)
      .then((res) => {
        console.log(`Write4 Successfuly wrote ${message} to device`)

        this.props.navigation.navigate("Bluetooth");
      })
      .catch((err) => console.log(err.message))
  }


  /*
 * Read message from bluetooth
 */
  read4() {

    BluetoothSerial.withDelimiter('~').then((res) => {
      BluetoothSerial.on('read', (data) => {
        var response = data.data
        console.log(`Read4 Received data ${response}`)
        this.setState({ bookid: response });
        this.loadBook(response);
      })
    })
  }


  /*
  * Leave A Book API Call then send new book ID to DE1 
  * @param title: title of book 
  * @param author: author of book 
  * @param photo: photo of book 
  * @param libraryID 
  * @param rating: rating of book 
  * @param phoneNumber: user phoneNumber
  */
  leaveAbook() {

    try {
      AsyncStorage.getItem('@loginInfo:phoneNumber').then((value) => {
        let req = fetch('http://13.59.131.180:3001/leaveabook', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: this.state.title,
            author: this.state.author,
            photo: this.state.photo,
            libraryid: this.props.navigation.state.params.libraryId,
            rating: this.state.starCount,
            phoneNumber: value
          }),
        }).then((response) => {
          let res = JSON.parse(response._bodyText)
          this.setState({ bookid: res.success }); ///to fix

          //send book id to DE1
          this.write4('~' + res.success + '~');

        })
      });
    } catch (error) {
      console.error(error);
    };
  }


  render() {
    return (
      <Container>
        <Head title="Library 1" navigation={this.props.navigation} />

        <Container style={styles.container}>
          <ScrollView contentContainerStyle={{flexGrow: 1}}
            refreshControl={
              <RefreshControl
                refreshing={this.state.refreshing}
                onRefresh={this._onRefresh}
              />
            }
          >
            <Image source={{uri:this.state.photo}} style={styles.photo} />
            <KeyboardAvoidingView>

              <TextInput
                value={this.state.title}
                onChangeText={(title) => this.setState({title})}
                placeholder={'Title'}
                style={styles.input}
              />

              <TextInput
                value={this.state.author}
                onChangeText={(author) => this.setState({author})}
                placeholder={'Author'}
                style={styles.input}
              />
            </KeyboardAvoidingView>
            <View style={{width: '40%', left: '30%', top: 20}}>
              <StarRating
                disabled={false}
                maxStars={5}
                rating={this.state.starCount}
                fullStarColor={'#f4ed0e'}
                emptyStarColor={'#f4ed0e'}
                starSize={24}
                selectedStar={(rating) => {this.setState({starCount: rating})}}
              />
            </View>
            <View style={{ marginTop: 20 }}>

              <Container style={styles.button}>
                <Button
                  title="Choose Photo"
                  onPress={this._onChoosePic}
                />
              </Container>

              <Container style={styles.button}>
                <Button
                  title="Take Photo"
                  onPress={this._onTakePic}
                />
              </Container>


              <Container style={styles.button}>
                <Button
                  title="Submit"
                  onPress={this.onSubmit.bind(this)}
                />
              </Container>

            </View>

          </ScrollView>
        </Container>

      </Container>

    );
  }
}

const styles = StyleSheet.create({
  container:{
    position: 'absolute', 
    width: '100%', 
    top: 75 
  },
  photo:{
    width: '40%', 
    height: 180, 
    resizeMode: 'stretch', 
    top: 15, 
    left: '30%'
  },
    separator:{ 
    backgroundColor: 'grey', 
    height: 1, 
    width: this.state.w 
  },
  input: {
    width: '60%',
    height: 44,
    padding: 10,
    borderWidth: 2,
    borderColor: '#3f90d3',
    marginBottom: 20,
    backgroundColor: 'white',
    opacity: 1,
    top: 30,
    left: '20%',
    borderRadius: 5,
    fontSize: 16,

  },
  button: {
    width: '60%',
    height: 42,
    marginTop: 10,
    left: '20%',
    borderRadius: 5,
    backgroundColor: '#3f90d3'
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
});
