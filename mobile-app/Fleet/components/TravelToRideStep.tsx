import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Constants from 'expo-constants';

const apiUrl = Constants.expoConfig?.extra?.API_URL;
interface TravelToRideStepProps {
  rideID: string;
  driverID: string;
  token: string;
  onRideStarted: () => void; // Callback to move to next step
}

const TravelToRideStep: React.FC<TravelToRideStepProps> = ({ rideID, driverID, token, onRideStarted }) => {
  const [rideInProgress, setRideInProgress] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      checkRideStatus();
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, []);

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
      if (data.isInProgress) {
        setRideInProgress(true);
        onRideStarted(); // Move to next screen when ride starts
      }
    } catch (error) {
      console.error('Error checking ride status:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Travel to Ride</Text>
      <Text style={styles.info}>Ride ID: {rideID}</Text>
      <Text style={styles.info}>Driver ID: {driverID}</Text>
      <Text style={styles.status}>{rideInProgress ? 'Ride Started' : 'Waiting for ride to start...'}</Text>

      <TouchableOpacity style={styles.button} onPress={checkRideStatus}>
        <Text style={styles.buttonText}>Refresh Status</Text>
      </TouchableOpacity>
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
});

export default TravelToRideStep;
