import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import Constants from 'expo-constants';
import MapView, { Marker, Polyline, Region } from 'react-native-maps';

const apiUrl = Constants.expoConfig?.extra?.API_URL;
const GOOGLE_API_KEY = 'AIzaSyBkmAjYL9HmHSBtxxI0j3LB1tYEwoCnZXg';

interface DriverInProgressStepProps {
  rideID: string;
  driverID: string;
  token: string;
  onRideCompleted: () => void;
}

interface Location {
  latitude: number;
  longitude: number;
}

const DriverInProgressStep: React.FC<DriverInProgressStepProps> = ({ rideID, driverID, token, onRideCompleted }) => {
  const [startLocation, setStartLocation] = useState<Location | null>(null);
  const [endLocation, setEndLocation] = useState<Location | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<Location[]>([]);
  const mapRef = useRef<MapView | null>(null);

  useEffect(() => {
    fetchRideDetails();
    const interval = setInterval(() => {
      fetchRideDetails();
      checkRideStatus();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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
      setStartLocation({ latitude: data.start.coordinates[1], longitude: data.start.coordinates[0] });
      setEndLocation({ latitude: data.end.coordinates[1], longitude: data.end.coordinates[0] });
    } catch (error) {
      console.error('Error fetching ride details:', error);
    }
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
        onRideCompleted();
      }
    } catch (error) {
      console.error('Error checking ride status:', error);
    }
  };

  const fetchRoute = async () => {
    if (!startLocation || !endLocation) return;
    const origin = `${startLocation.latitude},${startLocation.longitude}`;
    const destination = `${endLocation.latitude},${endLocation.longitude}`;

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${GOOGLE_API_KEY}`
      );
      const data = await response.json();
      if (data.routes.length > 0) {
        setRouteCoordinates(decodePolyline(data.routes[0].overview_polyline.points));
      }
    } catch (error) {
      console.error('Error fetching route:', error);
    }
  };

  const decodePolyline = (encoded: string): Location[] => {
    let points: Location[] = [];
    let index = 0, lat = 0, lng = 0;

    while (index < encoded.length) {
      let b, shift = 0, result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      lat += result & 1 ? ~(result >> 1) : result >> 1;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      lng += result & 1 ? ~(result >> 1) : result >> 1;

      points.push({ latitude: lat * 1e-5, longitude: lng * 1e-5 });
    }
    return points;
  };

  useEffect(() => {
    if (startLocation && endLocation) fetchRoute();
  }, [startLocation, endLocation]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ride In Progress</Text>
      <Text style={styles.info}>Ride ID: {rideID}</Text>
      <Text style={styles.info}>Driver ID: {driverID}</Text>
      <Text style={styles.status}>Driving passenger to destination...</Text>
      {startLocation && endLocation && (
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={{
            latitude: startLocation.latitude,
            longitude: startLocation.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        >
          <Marker coordinate={startLocation} title="Start Location" />
          <Marker coordinate={endLocation} title="End Location" />
          {routeCoordinates.length > 0 && (
            <Polyline coordinates={routeCoordinates} strokeWidth={4} strokeColor="#00f" />
          )}
        </MapView>
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
