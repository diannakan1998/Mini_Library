import React from 'react';
import {Image,StyleSheet,View,} from 'react-native';
import {MapView} from 'expo';

/*
 Map showing library locations and user locataion
*/
export default class Map extends React.Component {
    constructor(props) {
        super(props);

        //default state
        this.state = {
            longitude: -122.6653281029795,
            latitude: 45.52220671242907,
            selectedMarkerIndex: -1,

            region: {
                latitude: 49.26216,
                longitude: -123.25007,
                latitudeDelta: 0.3,
                longitudeDelta: 0.3,
            },

            markers: [
            ],
        };
    }

    //Load library locations
    loadLocations = async() => {
        try {
            let req = await fetch('http://13.59.131.180:3001/locations', {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
            }).then((response) => {
                
                //Extract new library location markers from JSON response
                let res = JSON.parse(response._bodyText)
                this.setState({
                    markers: res,
                })
            })
        } catch (error) {
            console.error(error);
        };
    }

    /* Display library information if marker pressed by user
       @param: index of library 
    */
    onPressMarker(e, index) {
        this.setState({ selectedMarkerIndex: index });
        this.props.onSearchMap(2, global.markers[index].longitude, global.markers[index].lattitude, global.markers[index].Library_ID, global.markers[index].Address);

    }

    onRegionChange(region) {
        global.region = region;
    }

    render() {
        return (
            <View style={styles.container}>

                <View style={styles.map}>

                    <MapView
                        ref={map => this.map = map}
                        region={global.region}
                        style={styles.container}
                        showsUserLocation={true}
                        showsMyLocationButton={false}
                        onRegionChange={this.onRegionChange}
                        // showsMyLocationButton={true}
                    >
                        {global.markers.map((marker, index) => {
                            if(this.state.selectedMarkerIndex === index){
                            return (
                                    <MapView.Marker key={index}
                                    coordinate={{
                                        latitude: marker.lattitude,
                                        longitude: marker.longitude
                                    }}
                                    onPress={(e) => this.onPressMarker(e, index)}
                                    >
                                    <Image source={markerImage} style={{width:40,height:40, resizeMode: 'contain'}}/>
                                    </MapView.Marker> 
                            );
                            }
                            return(
                                <MapView.Marker key={index}
                                coordinate={{
                                    latitude: marker.lattitude,
                                    longitude: marker.longitude
                                }}
                                    onPress={(e) => this.onPressMarker(e, index)}
                                    >
                                <Image source={selectedMarker} style={{width:40,height:40, resizeMode: 'contain'}}/>
                                </MapView.Marker> 
                            );
                        })}
                    </MapView>
                </View>

            </View>
        );
    }
}

const markerImage = require('../../assets/marker.png');
const selectedMarker = require('../../assets/marker-selected.png');


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%'
    },
    map: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ecf0f1',

        position: 'absolute',
        left: 0,
        width: '100%',
        height: '100%'
    },
    mapview: {
        alignSelf: 'stretch',
        height: 670,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
    },
    markerWrap: {
        alignItems: "center",
        justifyContent: "center",
    },
    marker: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "rgba(130,4,150, 0.9)",
    },
    cardImage: {
        flex: 3,
        width: "100%",
        height: "100%",
        alignSelf: "center",
    },
});
