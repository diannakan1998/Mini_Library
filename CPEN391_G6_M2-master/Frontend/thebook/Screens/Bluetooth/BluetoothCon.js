import React, { Component } from 'react'
import {
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  TouchableHighlight,
  View,
  ActivityIndicator,
  AsyncStorage, Image
} from 'react-native'
import { Container, Header } from 'native-base';
import BluetoothSerial from 'react-native-bluetooth-serial'
import { ToastAndroid } from 'react-native';

/*
 * Bluetooth Connection Screen 
 */
export default class BluetoothCon extends React.Component {
  constructor(props) {
    super(props);
    global.screen = 0;
    global.takeBook = [];
    global.returnBook = [];
    global.ref = 0;
    global.bookidt = 0;
    global.bookidr = 0;
    this.state = {
      isEnabled: false,
      discovering: false,
      devices: [],
      unpairedDevices: [],
      connected: false,
      connecting: false,
      section: 0,
      phoneNumber: 1,
      bookID: -1,
    }
  }



  componentWillMount() {
    global.ref = 0;
    global.bookidt = 0;
    global.bookidr = 0;

    Promise.all([
      BluetoothSerial.isEnabled(),
      BluetoothSerial.list()
    ])
      .then((values) => {
        const [isEnabled, devices] = values
        this.setState({ isEnabled, devices })
      })

    BluetoothSerial.on('bluetoothEnabled', () => console.log('Bluetooth enabled'))
    BluetoothSerial.on('bluetoothDisabled', () => console.log('Bluetooth disabled'))
    BluetoothSerial.on('error', (err) => console.log(`Error: ${err.message}`))
    BluetoothSerial.on('connectionLost', () => {
      if (this.state.device) {
        ToastAndroid.showWithGravity(
          `Connection to device ${this.state.device.name} has been lost`,
          ToastAndroid.SHORT,
          ToastAndroid.CENTER,
        );
        console.log(`Connection to device ${this.state.device.name} has been lost`)
      }
      this.setState({ connected: false })
    })
  }



  componentDidMount() {
    AsyncStorage.getItem('@loginInfo:phoneNumber').then((value) => this.setState({ 'phoneNumber': value }));
  }

  

/*
 * Load Book Information API CALL
 * @param: bookID
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
        if (global.screen == 2) {
          global.takeBook = global.takeBook.concat(res);
          console.log(global.takeBook);
          global.ref = 1;
          this.setState({ connected: true });
          console.log("screen 2 ref");
        } else if (global.screen == 3) {
          global.count++;
          var arr=[];
          arr[0] = {title: res[0].title, Name: res[0].Name, rating: 0, image: res[0].image, id: res[0].Book_ID, count: global.count}
          global.returnBook = global.returnBook.concat(arr);
          console.log(global.returnBook);
          global.ref = 1;
          this.setState({ connected: true });
          console.log("data" + global.returnBook);
        }

      })
    } catch (error) {
      console.error(error);
    };
  }

  /**
   * [android]
   * request enable of bluetooth from user
   */
  requestEnable() {
    BluetoothSerial.requestEnable()
      .then((res) => this.setState({ isEnabled: true }))
      .catch((err) => console.log(err.message))
  }

  /**
   * [android]
   * enable bluetooth on device
   */
  enable() {
    BluetoothSerial.enable()
      .then((res) => this.setState({ isEnabled: true }))
      .catch((err) => console.log(err.message))
  }

  /**
   * [android]
   * disable bluetooth on device
   */
  disable() {
    BluetoothSerial.disable()
      .then((res) => this.setState({ isEnabled: false }))
      .catch((err) => console.log(err.message))
  }

  /**
 * [android]
 * Discover unpaired devices, works only in android
 */
  discoverUnpaired() {
    if (this.state.discovering) {
      return false
    } else {
      this.setState({ discovering: true })
      BluetoothSerial.discoverUnpairedDevices()
        .then((unpairedDevices) => {
          this.setState({ unpairedDevices, discovering: false })
        })
        .catch((err) => console.log(err.message))
    }
  }

  /**
   * [android]
   * Discover unpaired devices, works only in android
   */
  cancelDiscovery() {
    if (this.state.discovering) {
      BluetoothSerial.cancelDiscovery()
        .then(() => {
          this.setState({ discovering: false })
        })
        .catch((err) => console.log(err.message))
    }
  }

  /**
   * [android]
   * Pair device
   */
  pairDevice(device) {
    BluetoothSerial.pairDevice(device.id)
      .then((paired) => {
        if (paired) {
          ToastAndroid.showWithGravity(
            `Device ${device.name} paired successfully`,
            ToastAndroid.SHORT,
            ToastAndroid.CENTER,
          );

          const devices = this.state.devices
          devices.push(device)
          this.setState({ devices, unpairedDevices: this.state.unpairedDevices.filter((d) => d.id !== device.id) })
        } else {
          ToastAndroid.showWithGravity(
            `Device ${device.name} paired failed`,
            ToastAndroid.SHORT,
            ToastAndroid.CENTER,
          );
        }
      })
      .catch((err) => console.log(err.message))
  }

  /**
   * [android]
   * toggle bluetooth
   */
  toggleBluetooth(value) {
    if (value === true) {
      this.enable()
    } else {
      this.disable()
    }
  }

  /**
    * Connect to bluetooth device by id
    * @param  {Object} device
    */
  connect(device) {
    this.setState({ connecting: true })
    BluetoothSerial.connect(device.id)
      .then((res) => {
        console.log(`Connected to device ${device.name}`)
        ToastAndroid.showWithGravity(
          `Connected to device ${device.name}`,
          ToastAndroid.SHORT,
          ToastAndroid.CENTER,
        );
        this.setState({ device, connected: true, connecting: false })
        this.write('!' + this.state.phoneNumber + '!');
      })
      .catch((err) => console.log(err.message))
  }

  /*
  * Read message from bluetooth
  */
  read() {
    if (!this.state.connected) {
      console.log('Unable to read,You must connect to device first')
    }

    BluetoothSerial.withDelimiter('~').then((res) => {
      BluetoothSerial.on('read', (data) => {
        var response = data.data;
        var d = response.substring(0, response.length - 1);
        console.log(`Read Received data ${response.substring(0, response.length - 1)}`)

        if (global.screen == 0) {
          this.props.navigation.navigate('Bluetooth', { libraryId: d });
        } else if (global.screen == 2 && global.bookidt != d) {
          global.bookidt = d;
          this.loadBook(d);
        } else if (global.screen == 3 && global.bookidr != d) {
          global.bookidr = d;
          console.log("globalr " + global.bookidr);
          this.loadBook(d);
        }

      })
    })
  }

  /**
   * Disconnect from bluetooth device
   * @param  {Object} device
   */
  disconnect(device) {
    if (!this.state.connected) {
      ToastAndroid.showWithGravity(
        'Unable to disconnect, You must connect to device first',
        ToastAndroid.SHORT,
        ToastAndroid.CENTER,
      );
      this.props.navigation.goBack();
    } else {
      BluetoothSerial.disconnect()
        .then(() => {
          this.setState({ connected: false })
          ToastAndroid.showWithGravity(
            `Disconnect to device ${device.name}`,
            ToastAndroid.SHORT,
            ToastAndroid.CENTER,
          );
          this.props.navigation.goBack();

        })
        .catch((err) => console.log(err.message))
    }
  }


  /**
   * Toggle connection when we have active device
   * @param  {Boolean} value
   */
  toggleConnect(value) {
    if (value === true && this.state.device) {
      this.connect(this.state.device)
    } else {
      this.disconnect()
    }
  }

  onDevicePress(device) {
    if (this.state.section === 0) {
      this.connect(device)
    } else {
      this.pairDevice(device)
    }
  }

  /**
   * Write message to device
   * @param  {String} message
   */
  write(message) {
    if (!this.state.connected) {
      console.log('Unable to write,You must connect to device first')
    }

    BluetoothSerial.write(message)
      .then((res) => {
        console.log(`Write Successfuly wrote ${message} to device`)

        this.read();
      })
      .catch((err) => console.log(err.message))
  }

  /**
 * Write message to device
 * @param  {String} message
 */
  write2(message) {
    if (!this.state.connected) {
      console.log('Unable to write2,You must connect to device first')
    }

    BluetoothSerial.write(message)
      .then((res) => {
        console.log(`Write2 Successfuly wrote ${message} to device`)

        this.disconnect(this.state.device);
        this.props.navigation.goBack();
      })
      .catch((err) => console.log(err.message))
  }

  render() {
    const activeTabStyle = {borderBottomWidth: 6, borderColor: '#001196'}
    return (
      <View style={{ flex: 1 }}>
        <Container>
          <Header style={styles.header}>
            <Text style={styles.title}>Connecting ... </Text>
          </Header>
        </Container>
        <Container style={{position: 'absolute', width: '100%', top: 75, height: '88%'}}>
          <View style={styles.topBar}>
            {Platform.OS === 'android'
              ? (
                <View style={styles.enableInfoWrapper}>
                  <Text style={{fontSize: 12, color: '#FFFFFF'}}>
                    {this.state.isEnabled ? 'disable' : 'enable'}
                  </Text>
                  <Switch
                    onValueChange={this.toggleBluetooth.bind(this)}
                    value={this.state.isEnabled}
                    trackColor={{true: '#e6e5ea', false: '#3e3d42'}}
                  />
                </View>
              ) : null}
          </View>

          {Platform.OS === 'android'
            ? (
              <View style={[styles.topBar, {justifyContent: 'center', paddingHorizontal: 0}]}>
                <TouchableOpacity style={[styles.tab, this.state.section === 0 && activeTabStyle]} onPress={() => this.setState({ section: 0 })}>
                  <Text style={{ fontSize: 14, color: '#FFFFFF' }}>PAIRED DEVICES</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.tab, this.state.section === 1 && activeTabStyle]} onPress={() => this.setState({ section: 1 })}>
                  <Text style={{ fontSize: 14, color: '#FFFFFF' }}>UNPAIRED DEVICES</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          {this.state.discovering && this.state.section === 1
            ? (
              <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                <ActivityIndicator
                  style={{ marginBottom: 15 }}
                  size={60} 
                  />
                <Button
                  textStyle={{ color: '#FFFFFF' }}
                  style={styles.buttonRaised}
                  title='Cancel Discovery'
                  onPress={() => this.cancelDiscovery()} 
                  />
              </View>
            ) : (
              <DeviceList
                showConnectedIcon={this.state.section === 0}
                connectedId={this.state.device && this.state.device.id}
                devices={this.state.section === 0 ? this.state.devices : this.state.unpairedDevices}
                onDevicePress={(device) => this.onDevicePress(device)} 
                />

            )}

          <Button
            style={{ position: 'absolute', bottom: 20 }}
            title={'disconnect'}
            onPress={() => this.write2("c")}
          />

          <View style={{ alignSelf: 'flex-end', height: 52 }}>
            <ScrollView
              horizontal
              contentContainerStyle={styles.fixedFooter}>
              {Platform.OS === 'android' && this.state.section === 1
                ? (
                  <Button
                    title={this.state.discovering ? '... Discovering' : 'Discover devices'}
                    onPress={this.discoverUnpaired.bind(this)} 
                    />
                ) : null}
              {Platform.OS === 'android' && !this.state.isEnabled
                ? (
                  <Button
                    title='Request enable'
                    onPress={() => this.requestEnable()} 
                    />

                ) : null}
            </ScrollView>
          </View>
        </Container>
      </View>
    )
  }
}


const Button = ({ title, onPress, style, textStyle }) =>
  <TouchableOpacity style={[styles.button, style]} onPress={onPress}>
    <Text style={[styles.buttonText, textStyle]}>{title.toUpperCase()}</Text>
  </TouchableOpacity>

/*
 * Render bluetooth device list 
 */
const DeviceList = ({ devices, connectedId, showConnectedIcon, onDevicePress }) =>
  <ScrollView style={styles.container}>
    <View style={styles.listContainer}>
      {devices.map((device, i) => {
        return (
          <TouchableHighlight
            underlayColor="#DDDDDD"
            key={`${device.id}_${i}`}
            style={styles.listItem} onPress={() => onDevicePress(device)}>
            <View style={{ flexDirection: 'row' }}>
              {showConnectedIcon
                ? (
                  <View style={{ width: 48, height: 48, opacity: 0.4 }}>
                    {connectedId === device.id
                      ? (
                        <Image style={styles.image} source={require('./images/ic_done_black_24dp.png')} />
                      ) : null}
                  </View>
                ) : null}
              <View style={styles.view}>
                <Text style={{fontWeight: 'bold'}}>{device.name}</Text>
                <Text>{`<${device.id}>`}</Text>
              </View>
            </View>
          </TouchableHighlight>
        )
      })}
    </View>
  </ScrollView>

const styles = StyleSheet.create({
  view:{
    justifyContent: 'space-between', 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  image:{
    resizeMode: 'contain', 
    width: 24, 
    height: 24, 
    flex: 1 
  },
  container: {
    flex: 0.9,
    backgroundColor: '#F5FCFF'
  },
  topBar: {
    height: 56,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 6,
    backgroundColor: '#5d719b'
  },
  enableInfoWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  tab: {
    alignItems: 'center',
    flex: 0.5,
    height: 56,
    justifyContent: 'center',
    borderBottomWidth: 6,
    borderColor: 'transparent'
  },
  connectionInfoWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 25
  },
  connectionInfo: {
    fontWeight: 'bold',
    alignSelf: 'center',
    fontSize: 18,
    marginVertical: 10,
    color: '#18207a'
  },
  listContainer: {
    borderColor: '#ccc',
    borderTopWidth: 0.5
  },
  listItem: {
    flex: 1,
    height: 48,
    paddingHorizontal: 16,
    borderColor: '#ccc',
    borderBottomWidth: 0.5,
    justifyContent: 'center'
  },
  fixedFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ddd'
  },
  button: {
    height: 36,
    margin: 5,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonText: {
    color: '#08084c',
    fontWeight: 'bold',
    fontSize: 14
  },
  buttonRaised: {
    backgroundColor: '#18207a',
    borderRadius: 2,
    elevation: 2
  },
  header: {
    height: 75,
    color: '#284e8c',

  },
  title: {
    color: 'white',
    fontSize: 20,
    top: 30,
    position: 'absolute',
  }
})
