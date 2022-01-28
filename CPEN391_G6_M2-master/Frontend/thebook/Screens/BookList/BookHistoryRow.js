import React from 'react';
import { Image, Text, View, StyleSheet } from 'react-native';
import { styles } from 'react-native-really-awesome-button/src/styles';

/*
* Define the style of rendering a list of book 
*/
export default class BookHistoryRow extends React.Component {
  render() {
    var td = String(this.props.Takeout_Date).substring(0, 10);
    var rd = String(this.props.Return_Date).substring(0, 10);

    return (
      <View style={{flexDirection: 'row', alignItems: 'center', padding: 10}}>

        <Image source={{uri: this.props.Image }} style={styles.image} />
        <View style={{flexDirection: 'column', alignItems: 'flex-start', width: '65%'}}>

          <Text style={styles.title} >{`${this.props.Title}`}</Text>
          <Text style={{fontSize: 18, flexWrap: 'wrap'}}>{`${this.props.NAME}`}</Text>
          <Text style={{paddingTop: 10, fontSize: 18}} >Takeout Date: {`${td}`}</Text>
          <Text style={{fontSize: 18 }}>Return Date: {`${rd}`}</Text>
          
          <View style={{flexDirection: 'row', alignItems: 'baseline'}}>

            <StarRating
              disabled={false}
              maxStars={5}
              rating={this.props.Ratings}
              fullStarColor={'#f4ed0e'}
              emptyStarColor={'#f4ed0e'}
              starSize={22}
              selectedStar={(rating) => {this.props.onStarRatingPress(rating)}}
            />
          </View>

        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  image: {
    flexWrap: 'wrap',
    resizeMode: 'contain',
    width: '30%',
    height: '100%',
    marginRight: 10
  },
  title: {
    paddingTop: 10,
    fontSize: 18,
    fontWeight: 'bold',
    flexWrap: 'wrap'
  }
})