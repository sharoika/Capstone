import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import Constants from 'expo-constants'

const apiUrl = Constants.expoConfig?.extra?.API_URL;
interface TravelToRideStepProps {
  rideID: string;
  driverID: string;
  token: string;
  onRideStarted: () => void; 
}

const TravelToRideStep: React.FC<TravelToRideStepProps> = ({ rideID, driverID, token, onRideStarted }) => {
  const [rideInProgress, setRideInProgress] = useState(false);
  const [location, setLocation] = useState<{ lat: number; long: number } | null>(null);
  const [startLocation, setStartLocation] = useState<string | null>(null);

  const region: Region | undefined = location
    ? {
        latitude: location.lat,
        longitude: location.long,
        latitudeDelta: 0.0012,  
        longitudeDelta: 0.0061, 
      }
    : undefined;

  const fetchLocation = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/location/getOne?userId=${driverID}&userType=driver`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.location) {
          setLocation(data.location); 
        } else {
          Alert.alert('Error', 'Location not found.');
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

  const checkRideStatus = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/ride/rides/${rideID}/status`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(data);
      setStartLocation(data.start);
      console.log(startLocation);
      if (data.isInProgress) {
        setRideInProgress(true);
        onRideStarted(); 
      }
    } catch (error) {
      console.error('Error checking ride status:', error);
    }
  };

  useEffect(() => {
    fetchLocation(); 
    checkRideStatus();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Travel to Ride</Text>
      <Text style={styles.info}>Ride ID: {rideID}</Text>
      <Text style={styles.info}>Driver ID: {driverID}</Text>
      <Text style={styles.status}>{rideInProgress ? 'Ride Started' : 'Waiting for ride to start...'}</Text>

      <TouchableOpacity style={styles.button} onPress={checkRideStatus}>
        <Text style={styles.buttonText}>Refresh Status</Text>
      </TouchableOpacity>

      {region ? (
        <MapView style={styles.map} region={region} showsUserLocation>
          {location && (
            <Marker
              coordinate={{
                latitude: location.lat,
                longitude: location.long,
              }}
              title="You are here"
            />
          )}
        </MapView>
      ) : (
        <Text>Loading map...</Text>
      )}

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
  button: {
    marginTop: 20,
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
  map: {
    width: '100%',
    height: 300,
    marginTop: 20,
  },
});

export default TravelToRideStep;
