import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, FlatList, Text, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';

interface RidesWithoutDriverStepProps {
  token: string;
  driverID: string;
  onRideClaimed: (rideID: string) => void; // Callback to move to next step
}

const RidesWithoutDriverStep: React.FC<RidesWithoutDriverStepProps> = ({ token, driverID, onRideClaimed }) => {
  const [ridesWithoutDriver, setRidesWithoutDriver] = useState<any[]>([]);
  const [selectedRide, setSelectedRide] = useState<string>('');

  useEffect(() => {
    const interval = setInterval(fetchRidesWithoutDriver, 5000);
    return () => clearInterval(interval);
  }, [token, driverID]);

  const fetchRidesWithoutDriver = async () => {
    try {
      const response = await fetch('http://10.0.2.2:5000/api/ride/rides/without-driver', {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setRidesWithoutDriver(data.rides);
    } catch (error) {
      console.error('Error fetching rides:', error);
    }
  };

  const handleClaimRide = async () => {
    if (!selectedRide) {
      Alert.alert('Error', 'Please select a ride');
      return;
    }

    try {
      const response = await fetch(`http://10.0.2.2:5000/api/ride/rides/${selectedRide}/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ driverID }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'Ride claimed successfully');
        onRideClaimed(selectedRide); // Navigate to TravelToRideStep
      } else {
        Alert.alert('Error', data.message || 'Failed to claim ride');
      }
    } catch (error) {
      console.error('Error claiming ride:', error);
      Alert.alert('Error', 'An error occurred while claiming the ride');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rides Without a Driver</Text>
      {ridesWithoutDriver.length === 0 ? (
        <Text>No rides available at the moment.</Text>
      ) : (
        <Picker selectedValue={selectedRide} onValueChange={setSelectedRide} style={styles.picker}>
          <Picker.Item label="Select a ride" value="" />
          {ridesWithoutDriver.map((ride) => (
            <Picker.Item key={ride._id} label={`Start: ${ride.start}, End: ${ride.end}`} value={ride._id} />
          ))}
        </Picker>
      )}
      <TouchableOpacity style={styles.claimButton} onPress={handleClaimRide}>
        <Text style={styles.claimButtonText}>Claim Ride</Text>
      </TouchableOpacity>
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
  picker: {
    width: '100%',
    height: 50,
    marginBottom: 20,
  },
  claimButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  claimButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default RidesWithoutDriverStep;
