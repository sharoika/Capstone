// RidesWithoutDriverStep.tsx
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, FlatList, Text, TouchableOpacity } from 'react-native';
import axios from 'axios';

interface RidesWithoutDriverStepProps {
  token: string;
  driverID: string;
}

const RidesWithoutDriverStep: React.FC<RidesWithoutDriverStepProps> = ({ token, driverID }) => {
  const [ridesWithoutDriver, setRidesWithoutDriver] = useState<any[]>([]);

  useEffect(() => {
    // Fetch rides without a driver every 5 seconds
    const interval = setInterval(() => {
      fetchRidesWithoutDriver();
    }, 5000); // Poll every 5 seconds

    // Clean up the interval when the component is unmounted
    return () => clearInterval(interval);
  }, [token, driverID]);

  const fetchRidesWithoutDriver = async () => {
    try {
      const response = await axios.get('http://10.0.2.2:5000/api/rides/rides/without-driver', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const rides = response.data.rides;
      setRidesWithoutDriver(rides); // Update state with the fetched rides
    } catch (error) {
      console.error('Error fetching rides without a driver:', error.response?.data || error.message);
    }
  };

  const handleClaimRide = (rideID: string) => {
    // Handle claiming a ride by the driver
    console.log(`Driver ${driverID} is claiming ride with ID: ${rideID}`);
    // You can call an API to confirm the ride and assign it to the driver here
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rides Without a Driver</Text>
      {ridesWithoutDriver.length === 0 ? (
        <Text>No rides without a driver at the moment.</Text>
      ) : (
        <FlatList
          data={ridesWithoutDriver}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.rideItem}>
              <Text style={styles.rideText}>Start: {item.start}</Text>
              <Text style={styles.rideText}>End: {item.end}</Text>
              <Text style={styles.rideText}>Fare: ${item.fare}</Text>
              <TouchableOpacity
                style={styles.claimButton}
                onPress={() => handleClaimRide(item._id)}
              >
                <Text style={styles.claimButtonText}>Claim Ride</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  rideItem: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  rideText: {
    fontSize: 16,
    marginBottom: 5,
  },
  claimButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  claimButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default RidesWithoutDriverStep;
