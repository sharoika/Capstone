import React, { useState, useEffect } from 'react';
import { View, Text, Picker, Button, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Platform} from 'react-native';
import * as SecureStore from 'expo-secure-store';

const ConfirmTripScreen = ({ rideID }) => {
  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState('');
  const router = useRouter();

  // Function to fetch the token securely
  const getItemAsync = async (key) => {
    return Platform.OS === 'web'
      ? localStorage.getItem(key)
      : SecureStore.getItemAsync(key);
  };

  // Fetch list of available drivers
  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const token = await getItemAsync('userToken');
        const response = await fetch('http://10.0.2.2:5000/api/auth/drivers/list', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const driverList = await response.json();
          setDrivers(driverList);
        } else {
          Alert.alert('Error', 'Failed to fetch drivers');
        }
      } catch (error) {
        console.error('Error fetching drivers:', error);
        Alert.alert('Error', 'An error occurred while fetching drivers');
      }
    };

    fetchDrivers();
  }, []);

  // Handle trip confirmation
  const handleConfirm = async () => {
    if (!selectedDriver) {
       
      Alert.alert('Error', 'Please select a driver');
      return;
    }

    try {
        console.log(selectedDriver);
      const token = await getItemAsync('userToken');
      const response = await fetch(
        `http://10.0.2.2:5000/api/rides/${rideID}/confirm`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ driverID: selectedDriver }),
        }
      );

      if (response.ok) {
        Alert.alert('Success', 'Ride confirmed successfully');
        //router.push('/(tabs)/rideDetails'); // Redirect to a ride details or confirmation screen
      } else {
        const errorText = await response.text();
        console.error('Failed to confirm ride:', errorText);
        Alert.alert('Error', 'Failed to confirm ride');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'An error occurred while confirming the ride');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Select a Driver</Text>
      {drivers.length > 0 ? (
        <Picker
          selectedValue={selectedDriver}
          onValueChange={(value) => setSelectedDriver(value)}
          style={styles.picker}
        >
          <Picker.Item label="Select a driver" value="" />
          {drivers.map((driver) => (
            <Picker.Item
              key={driver._id}
              label={`${driver.name} (ID: ${driver._id})`}
              value={driver._id}
            />
          ))}
        </Picker>
      ) : (
        <Text>Loading drivers...</Text>
      )}
      <Button title="Confirm Trip" onPress={handleConfirm} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  picker: {
    width: '100%',
    height: 50,
    marginBottom: 20,
  },
});

export default ConfirmTripScreen;
