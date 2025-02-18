import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, FlatList, Text, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';

interface RidesForDriverStepProps {
  token: string;
  driverID: string;
  onRideClaimed: (rideID: string) => void; 
}

const RidesForDriverStep: React.FC<RidesForDriverStepProps> = ({ token, driverID, onRideClaimed }) => {
  const [ridesForDriver, setRidesForDriver] = useState<any[]>([]);
  const [selectedRide, setSelectedRide] = useState<string>('');

  useEffect(() => {
    const interval = setInterval(fetchRidesForDriver, 5000);
    return () => clearInterval(interval);
  }, [token, driverID]);

  const fetchRidesForDriver = async () => {
    try {
      const response = await fetch(`${process.env.API_URL}/api/ride/rides/driver/${driverID}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
  
      if (!response.ok) {
        const errorData = await response.json(); 
        throw new Error(`Error ${response.status}: ${errorData.message || response.statusText}`);
      }
  
      const data = await response.json();
      setRidesForDriver(data.rides);  
    } catch (error) {
      console.error('Error fetching rides:', error.message);
    }
  };

  const handleClaimRide = async () => {
    if (!selectedRide) {
      Alert.alert('Error', 'Please select a ride');
      return;
    }

    try {
      const response = await fetch(`${process.env.API_URL}/api/ride/rides/${selectedRide}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ driverID }),
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok) {
        Alert.alert('Success', 'Ride claimed successfully');
        onRideClaimed(selectedRide); 
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
      <Text style={styles.title}>Rides for Driver</Text>
      {ridesForDriver.length === 0 ? (
        <Text>No rides available at the moment.</Text>
      ) : (
        <Picker selectedValue={selectedRide} onValueChange={setSelectedRide} style={styles.picker}>
          <Picker.Item label="Select a ride" value="" />
          {ridesForDriver.map((ride) => (
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

export default RidesForDriverStep;
