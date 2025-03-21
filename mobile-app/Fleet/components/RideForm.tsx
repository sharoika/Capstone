import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import Geocoder from 'react-native-geocoding';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import Constants from 'expo-constants';

const apiUrl = Constants.expoConfig?.extra?.API_URL;
interface RideFormProps {
  token: string;
  riderID: string;
  onRideCreated: (rideID: string) => void;
}

const RideForm: React.FC<RideFormProps> = ({ token, riderID, onRideCreated }) => {
  const [start, setStart] = useState<{ type: string; coordinates: [number, number] } | null>(null);
  const [end, setEnd] = useState<{ type: string; coordinates: [number, number] } | null>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [region, setRegion] = useState({
    latitude: 37.7749, 
    longitude: -122.4194,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [routeCoordinates, setRouteCoordinates] = useState<{ latitude: number; longitude: number }[]>([]);
  const [estimatedTime, setEstimatedTime] = useState<string>('');
  const [distance, setDistance] = useState<string>('');

  const mapRef = useRef<MapView>(null);

  const GOOGLE_API_KEY = 'AIzaSyBkmAjYL9HmHSBtxxI0j3LB1tYEwoCnZXg'; 

  const fetchLocation = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/location/getOne?userId=${riderID}&userType=rider`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("response dataaaa", data.location);
        
        if (data.location && data.location.lat && data.location.long) {
          const mappedLocation = {
            latitude: data.location.lat, 
            longitude: data.location.long, 
          };
          console.log("mapped: ", mappedLocation);
          setLocation(mappedLocation); 
          console.log("Location: ", location);
          setRegion({
            latitude: mappedLocation.latitude,
            longitude: mappedLocation.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
        } else {
          Alert.alert('Error', 'Location not founddd.');
        }
      } else {
        const errorData = await response.json();
        console.error('Error fetching location:', errorData);
        Alert.alert('Error', errorData.message || 'Failed to fetch location.');
      }
    } catch (error) {
      console.error('Error fetching location:', error);
      Alert.alert('Error', 'An error occurred while fetching location.');
    }
  };

  useEffect(() => {
    fetchLocation(); 
    console.log("Updated Locationnnnnnnnnnnnnnnnnn: ", location);
    const interval = setInterval(() => {
      fetchLocation();
    }, 10000);
  
    return () => clearInterval(interval); 
  }, []);

   const fetchCoordinatesAndRoute = async () => {
    if (!start || !end) {
      Alert.alert('Error', 'Please provide both start and end locations.');
      return;
    }

    try {
      const [startLng, startLat] = start.coordinates; 
      const [endLng, endLat] = end.coordinates;
  
      console.log("Start Coordinates:", startLat, startLng);  
      console.log("End Coordinates:", endLat, endLng);  
  
      if (!startLat || !startLng || !endLat || !endLng) {
        throw new Error("Invalid coordinates extracted.");
      }
  
      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${startLat},${startLng}&destination=${endLat},${endLng}&key=${GOOGLE_API_KEY}`;
      console.log("Fetching URL:", url); 
      const directionsResponse = await fetch(url);
      const directionsData = await directionsResponse.json();

      if (directionsData.routes.length) {
        const points = decodePolyline(directionsData.routes[0].overview_polyline.points);
        setRouteCoordinates(points);

        const durationInSeconds = directionsData.routes[0].legs[0].duration.value;
        const durationText = directionsData.routes[0].legs[0].duration.text;
        setEstimatedTime(durationText);
        const distance = directionsData.routes[0].legs[0].distance.text; 
        setDistance(distance);
        mapRef.current?.animateToRegion({
          latitude: startLat,
          longitude: startLng,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
      } else {
        Alert.alert('Error', 'No routes found between the locations.');
      }
    } catch (error) {
      console.error('Error fetching route:', error);
      Alert.alert('Error', 'An error occurred while fetching the route.');
    }
  };

  const decodePolyline = (t: string) => {
    let points = [];
    let index = 0, len = t.length;
    let lat = 0, lng = 0;

    while (index < len) {
      let b, shift = 0, result = 0;
      do {
        b = t.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlat = result & 1 ? ~(result >> 1) : result >> 1;
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = t.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlng = result & 1 ? ~(result >> 1) : result >> 1;
      lng += dlng;

      points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
    }

    return points;
  };

  const customMapStyle = [ // these maps themes were sources from https://snazzymaps.com/style/91/muted-monotone
    {
        "stylers": [
            {
                "visibility": "on"
            },
            {
                "saturation": -100
            },
            {
                "gamma": 0.54
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "labels.icon",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "water",
        "stylers": [
            {
                "color": "#FFFFFF"
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "labels.icon",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "labels.text",
        "stylers": [
            {
                "visibility": "simplified"
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#ffffff"
            }
        ]
    },
    {
        "featureType": "road.local",
        "elementType": "labels.text",
        "stylers": [
            {
                "visibility": "simplified"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#ffffff"
            }
        ]
    },
    {
        "featureType": "transit.line",
        "elementType": "geometry",
        "stylers": [
            {
                "gamma": 0.48
            }
        ]
    },
    {
        "featureType": "transit.station",
        "elementType": "labels.icon",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "gamma": 7.18
            }
        ]
    }
];
const handleLocationSelect = (data: any, details: any | null, type: 'start' | 'end') => {
  if (details && details.geometry && details.geometry.location) {
    const coordinates: [number, number] = [details.geometry.location.lng, details.geometry.location.lat];
    if (type === 'start') {
      setStart({ type: 'Point', coordinates });
    } else {
      setEnd({ type: 'Point', coordinates });
    }
  }
};
  const handleConfirmRide = async () => {
    if (!start || !end ) {
      Alert.alert('Error', 'Please fill in all the fields.');
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/api/ride/ride`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, 
        },
        body: JSON.stringify({
          riderID,
          start,
          end,
          distance,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        onRideCreated(data.rideID); 
      } else {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        Alert.alert('Error', errorData.message || 'Failed to create ride.');
      }
    } catch (error) {
      console.error('Error creating ride:', error);
      Alert.alert('Error', 'An error occurred while creating the ride.');
    }
  };
  return (
    <View style={styles.container}>
      <Text>Start Location:</Text>
      <GooglePlacesAutocomplete
        placeholder="Enter start location"
        onPress={(data, details) => handleLocationSelect(data, details, 'start')}
        query={{
          key: GOOGLE_API_KEY,
          language: 'en',
        }}
        styles={{
          container: { flex: 0 },
          textInput: styles.input,
        }}
        fetchDetails={true}
        debounce={300}
      />

      <Text>End Location:</Text>
      <GooglePlacesAutocomplete
        placeholder="Enter end location"
        onPress={(data, details) => handleLocationSelect(data, details, 'end')}
        query={{
          key: GOOGLE_API_KEY,
          language: 'en',
        }}
        styles={{
          container: { flex: 0 },
          textInput: styles.input,
        }}
        fetchDetails={true}
        debounce={300}
      />


      <TouchableOpacity style={styles.button} onPress={fetchCoordinatesAndRoute}>
        <Text style={styles.buttonText}>Show Route</Text>
      </TouchableOpacity>

      {location ? (
        <MapView
          ref={mapRef}
          style={styles.map}
          region={region}
          onRegionChangeComplete={setRegion}
          customMapStyle={customMapStyle}
        >
          {routeCoordinates.length > 0 && (
            <Polyline
              coordinates={routeCoordinates}
              strokeWidth={4}
              strokeColor="#00f"
            />
          )}
      <Marker
  coordinate={{
    latitude: location.latitude,
    longitude: location.longitude,
  }}
  title="Your Location"
  description="This is your current location"
>
  <View
    style={{
      width: 40,
      height: 40,
      backgroundColor: 'blue',
      borderRadius: 20, 
      borderWidth: 2,
      borderColor: 'white',
    }}
  />
</Marker>
        </MapView>
      ) : (
        <Text>Loading map...</Text>
      )}

      <View style={styles.bottomCard}>
        <Text>Estimated Time: {estimatedTime || 'Calculate route to see estimate'}</Text>
        <Text>Distance: {distance || 'Calculate route to see distance'}</Text>
        <TouchableOpacity style={styles.button} onPress={handleConfirmRide}>
          <Text style={styles.buttonText}>Confirm Ride</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 16,
    paddingLeft: 8,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#39C9C2',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  map: {
    flex: 1,
    marginTop: 16,
  },
  bottomCard: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#fff',
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
});

export default RideForm;
