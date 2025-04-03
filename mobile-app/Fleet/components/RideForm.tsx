import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import Constants from 'expo-constants';
import { MaterialIcons } from 'react-native-vector-icons';
import { customMapStyle } from '../styles/customMapStyle'

const apiUrl = Constants.expoConfig?.extra?.API_URL;
interface RideFormProps {
  token: string;
  riderID: string;
  onRideCreated: (rideID: string) => void;
}
const customPin = <MaterialIcons name="location-pin" size={40} color="#8EC3FF" />;

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
  useEffect(() => {
    if (start && end) {
      fetchCoordinatesAndRoute();
    }
  }, [start, end]);

  useEffect(() => {
    if (location && mapRef.current && !start && !end) {
      mapRef.current.animateToRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      console.log("Map centered on updated location:", location);
    }
  }, [location, start, end]);

  const handleConfirmRide = async () => {
    if (!start || !end) {
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
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        region={region}
        customMapStyle={customMapStyle}
      >
        {location && (
          <Marker coordinate={location} title="Your Location">
            {customPin}
          </Marker>
        )}
        {start && (
          <Marker coordinate={{ latitude: start.coordinates[1], longitude: start.coordinates[0] }} title="Start Location">
            {customPin}
          </Marker>
        )}

        {end && (
          <Marker coordinate={{ latitude: end.coordinates[1], longitude: end.coordinates[0] }} title="End Location">
            {customPin}
          </Marker>
        )}
        {routeCoordinates.length > 0 && (
          <Polyline coordinates={routeCoordinates} strokeWidth={4} strokeColor="#4A90E2" />
        )}
      </MapView>

      <View style={styles.overlayContainer}>
        <View style={styles.overlay}>
          <Text>Start Location:</Text>
          <GooglePlacesAutocomplete
            placeholder="Enter start location"
            onPress={(data, details) => handleLocationSelect(data, details, 'start')}
            query={{ key: GOOGLE_API_KEY, language: 'en' }}
            styles={{ container: { flex: 0 }, textInput: styles.input }}
            fetchDetails
          />

          <Text>End Location:</Text>
          <GooglePlacesAutocomplete
            placeholder="Enter end location"
            onPress={(data, details) => handleLocationSelect(data, details, 'end')}
            query={{ key: GOOGLE_API_KEY, language: 'en' }}
            styles={{ container: { flex: 0 }, textInput: styles.input }}
            fetchDetails
          />



          <Text>Estimated Time: {estimatedTime || 'N/A'}</Text>
          <Text>Distance: {distance || 'N/A'}</Text>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText} onPress={handleConfirmRide}>Confirm Ride</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
    margin: 0,
    padding: 0,
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  overlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 20,
    margin: 0,
    borderRadius: 10,
    elevation: 5,
  },
  bottomCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 16,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 16,
    paddingLeft: 8,
  },
  button: {
    backgroundColor: '#4A90E2',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});


export default RideForm;
