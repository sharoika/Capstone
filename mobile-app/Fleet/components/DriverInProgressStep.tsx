import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import Constants from 'expo-constants';
import MapView, { Marker, Polyline, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import Geocoder from 'react-native-geocoding';

const apiUrl = Constants.expoConfig?.extra?.API_URL;
const GOOGLE_API_KEY = 'AIzaSyBkmAjYL9HmHSBtxxI0j3LB1tYEwoCnZXg';

interface DriverInProgressStepProps {
  rideID: string;
  driverID: string;
  token: string;
  onRideCompleted: () => void;
}

const DriverInProgressStep: React.FC<DriverInProgressStepProps> = ({ rideID, driverID, token, onRideCompleted }) => {
  const [driverLocation, setDriverLocation] = useState<Location.LocationObject | null>(null);
  const [region, setRegion] = useState<Region | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<{ latitude: number; longitude: number }[]>([]);
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    Geocoder.init(GOOGLE_API_KEY);
    fetchDriverLocation();
    fetchRideDetails();
    const interval = setInterval(() => {
      fetchRideDetails();
      checkRideStatus();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchDriverLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Location access is needed to show the driver\'s position on the map.');
      return;
    }
    const driverLocation = await Location.getCurrentPositionAsync({});
    setDriverLocation(driverLocation);
    setRegion({
      latitude: driverLocation.coords.latitude,
      longitude: driverLocation.coords.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  };

  const fetchRideDetails = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/ride/rides/${rideID}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch ride details');
      const data = await response.json();
      updateMapRoute(data.start, data.end);
    } catch (error) {
      console.error('Error fetching ride details:', error);
    }
  };

  const updateMapRoute = async (start: { coordinates: [number, number] }, end: { coordinates: [number, number] }) => {
    try {
      const startCoords = start.coordinates;
      const endCoords = end.coordinates;
      const directionsResponse = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${startCoords[1]},${startCoords[0]}&destination=${endCoords[1]},${endCoords[0]}&key=${GOOGLE_API_KEY}`
      );
      const directionsData = await directionsResponse.json();
      if (directionsData.routes.length) {
        const points = decodePolyline(directionsData.routes[0].overview_polyline.points);
        setRouteCoordinates(points);
      }
    } catch (error) {
      console.error('Error updating map route:', error);
    }
  };

  const decodePolyline = (t: string) => {
    let points = [];
    let index = 0, len = t.length, lat = 0, lng = 0;
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

  const checkRideStatus = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/ride/rides/${rideID}/status`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
      const data = await response.json();
      if (data.isCompleted) {
        Alert.alert('Ride Completed', 'The ride has been successfully completed.');
        onRideCompleted();
      }
    } catch (error) {
      console.error('Error checking ride status:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ride In Progress</Text>
      <Text style={styles.info}>Ride ID: {rideID}</Text>
      <Text style={styles.info}>Driver ID: {driverID}</Text>
      <Text style={styles.status}>Driving passenger to destination...</Text>
      {driverLocation && region ? (
        <MapView ref={mapRef} style={styles.map} region={region}>
          <Polyline coordinates={routeCoordinates} strokeColor="#007bff" strokeWidth={3} />
          <Marker coordinate={{ latitude: driverLocation.coords.latitude, longitude: driverLocation.coords.longitude }} title="Driver's Location" />
        </MapView>
      ) : (
        <ActivityIndicator size="large" color="#007bff" />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  info: { fontSize: 18, marginBottom: 10 },
  status: { fontSize: 18, marginVertical: 20, color: 'blue' },
  map: { width: '100%', height: 300, marginTop: 20 },
});

export default DriverInProgressStep;