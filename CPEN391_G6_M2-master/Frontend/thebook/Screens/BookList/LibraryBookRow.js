import React from 'react';
import { Image, Text, View, StyleSheet } from 'react-native';
import StarRating from 'react-native-star-rating';

/*
* Define the style of Library Book Row 
*/
export default class LibraryBookRow extends React.Component {

  render() {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 10 }}>

        <Image source={{ uri: this.props.image }} style={styles.image} />

        <View style={{ flexDirection: 'column', alignItems: 'flex-start', left: 20, width: '65%' }}>
          <Text style={style.title} >{`${this.props.title}`}</Text>
          <Text style={{ paddingTop: 10, fontSize: 18 }}>{`${this.props.Name}`}</Text>

          <View style={{ flexDirection: 'row', alignItems: 'baseline' }}     >
            <StarRating
              disabled={false}
              maxStars={5}
              rating={this.props.rating}
              fullStarColor={'#f4ed0e'}
              emptyStarColor={'#f4ed0e'}
              starSize={22}
              selectedStar={(rating) => { this.props.onStarRatingPress(rating) }}
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
    width: 80,
    height: 107,
    resizeMode: 'stretch'
  },
  title: {
    paddingTop: 10,
    fontSize: 18,
    fontWeight: 'bold',
    flexWrap: 'wrap'
  }
})

