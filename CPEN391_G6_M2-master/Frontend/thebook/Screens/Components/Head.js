import React from 'react';
import {StyleSheet, Text,} from 'react-native';
import {Container, Header,} from "native-base";
import Icon from  'react-native-vector-icons/AntDesign';

/*
* Define Header Style
*/
export default class Head extends React.Component {
  render() {
    return (
      <Container>
        <Header style={styles.header}>
          <Icon
            style={styles.backbutton}
            name="arrowleft"
            color="white"
            size={35}
            onPress= {() =>this.props.navigation.goBack()}
          />
          <Text style={styles.title}>{this.props.title}</Text>
        </Header>

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
  },
  header: {
    height: 75,
    color: '#284e8c',

  },
  backbutton: {
    top: 30,
    left: 20,
    position: 'absolute',
  },
  title: {
    color: 'white',
    fontSize: 20,
    top: 30,
    position: 'absolute',
  }
});