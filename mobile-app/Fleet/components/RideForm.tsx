import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import Geocoder from 'react-native-geocoding';

interface RideFormProps {
  token: string;
  riderID: string;
  onRideCreated: (rideID: string) => void;
}

const RideForm: React.FC<RideFormProps> = ({ token, riderID, onRideCreated }) => {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [fare, setFare] = useState('');
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [region, setRegion] = useState({
    latitude: 37.7749, // Default coordinates
    longitude: -122.4194,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [routeCoordinates, setRouteCoordinates] = useState<{ latitude: number; longitude: number }[]>([]);

  const mapRef = useRef<MapView>(null);

  const GOOGLE_API_KEY = 'AIzaSyBkmAjYL9HmHSBtxxI0j3LB1tYEwoCnZXg'; // Replace with your actual API key

  useEffect(() => {
    Geocoder.init(GOOGLE_API_KEY); 
    console.log('Geolocation API');
    (async () => {
      try {
        const response = await fetch(
          `https://www.googleapis.com/geolocation/v1/geolocate?key=${GOOGLE_API_KEY}`,
          { method: 'POST' }
        );
        console.log('Geolocation API Response:', response);
        if (response.ok) {
          const data = await response.json();
          const { location } = data;
          if (location && location.lat != null && location.lng != null) {
            setLocation({ latitude: location.lat, longitude: location.lng });
            setRegion({
              latitude: location.lat,
              longitude: location.lng,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            });
          } else {
            Alert.alert('Error', 'Location data is invalid or missing.');
          }
        } else {
          Alert.alert('Error', 'Failed to fetch location.');
        }
      } catch (error) {
        console.error('Error fetching location:', error);
        Alert.alert('Error', 'An error occurred while fetching location.');
      }
    })();
  }, []);

  const fetchCoordinatesAndRoute = async () => {
    if (!start || !end) {
      Alert.alert('Error', 'Please provide both start and end locations.');
      return;
    }

    try {
      // Convert start and end addresses to coordinates
      const startCoords = (await Geocoder.from(start)).results[0].geometry.location;
      const endCoords = (await Geocoder.from(end)).results[0].geometry.location;

      // Fetch route from Google Directions API
      const directionsResponse = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${startCoords.lat},${startCoords.lng}&destination=${endCoords.lat},${endCoords.lng}&key=${GOOGLE_API_KEY}`
      );

      const directionsData = await directionsResponse.json();

      if (directionsData.routes.length) {
        const points = decodePolyline(directionsData.routes[0].overview_polyline.points);
        setRouteCoordinates(points);
        mapRef.current?.animateToRegion({
          latitude: startCoords.lat,
          longitude: startCoords.lng,
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
  const handleConfirmRide = async () => {
    if (!start || !end || !fare) {
      Alert.alert('Error', 'Please fill in all the fields.');
      return;
    }

    try {
      const response = await fetch('http://10.0.2.2:5000/api/rides/ride', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // Pass the token for authentication
        },
        body: JSON.stringify({
          riderID,
          start,
          end,
          fare: parseFloat(fare), // Ensure fare is sent as a number
        }),
      });

      if (response.ok) {
        const data = await response.json();
        Alert.alert('Success', 'Ride created successfully!');
        onRideCreated(data.rideID); // Move to the next step using the rideID
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
      <TextInput
        style={styles.input}
        placeholder="Start Location"
        value={start}
        onChangeText={setStart}
      />
      <Text>End Location:</Text>
      <TextInput
        style={styles.input}
        placeholder="End Location"
        value={end}
        onChangeText={setEnd}
      />
      <Text>Fare:</Text>
      <TextInput
        style={styles.input}
        placeholder="Fare (e.g., 20.50)"
        value={fare}
        onChangeText={setFare}
        keyboardType="numeric"
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
            <Image
              source={require('../assets/images/favicon.png')}
              style={{ width: 40, height: 40 }}
            />
          </Marker>
        </MapView>
      ) : (
        <Text>Loading map...</Text>
      )}

      <View style={styles.bottomCard}>
        <Text>Estimated Time: 15 mins</Text>
        <Text>Fare: $15.00</Text>
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
