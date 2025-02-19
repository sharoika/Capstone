import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import Constants from 'expo-constants';
import MapView, { Marker, Region } from 'react-native-maps';
import * as Location from 'expo-location';

const apiUrl = Constants.expoConfig?.extra?.API_URL;
interface DriverInProgressStepProps {
  rideID: string;
  driverID: string;
  token: string;
  onRideCompleted: () => void;
}

const DriverInProgressStep: React.FC<DriverInProgressStepProps> = ({ rideID, driverID, token, onRideCompleted }) => {
  const [driverLocation, setDriverLocation] = useState<Location.LocationObject | null>(null);
  const [region, setRegion] = useState<Region | null>(null);

   useEffect(() => {
    const fetchDriverLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Location access is needed to show the driver\'s position on the map.',
        );
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

    fetchDriverLocation();

    const interval = setInterval(() => {
      checkRideStatus();
    }, 5000); 

    return () => clearInterval(interval);
  }, []);
  const checkRideStatus = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/ride/rides/${rideID}/status`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.isCompleted) {
        clearInterval(); 
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
        <MapView style={styles.map} region={region}>
          <Marker
            coordinate={{
              latitude: driverLocation.coords.latitude,
              longitude: driverLocation.coords.longitude,
            }}
            title="Driver's Location"
          />
        </MapView>
      ) : (
        <ActivityIndicator size="large" color="#007bff" />
      )}
      <ActivityIndicator size="large" color="#007bff" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  info: {
    fontSize: 18,
    marginBottom: 10,
  },
  status: {
    fontSize: 18,
    marginVertical: 20,
    color: 'blue',
  },  
  map: {
    width: '100%',
    height: 300,
    marginTop: 20,
  },
});

export default DriverInProgressStep;
