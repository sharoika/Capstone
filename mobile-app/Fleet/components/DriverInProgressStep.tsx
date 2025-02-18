import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';

interface DriverInProgressStepProps {
  rideID: string;
  driverID: string;
  token: string;
  onRideCompleted: () => void; // Callback to move to the next step
}

const DriverInProgressStep: React.FC<DriverInProgressStepProps> = ({ rideID, driverID, token, onRideCompleted }) => {
  useEffect(() => {
    const interval = setInterval(() => {
      checkRideStatus();
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const checkRideStatus = async () => {
    try {
      const response = await fetch(`${process.env.API_URL}/api/ride/rides/${rideID}/status`, {
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
});

export default DriverInProgressStep;
