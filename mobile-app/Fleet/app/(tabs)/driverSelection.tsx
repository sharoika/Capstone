import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator, Picker } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const ConfirmTripScreen = ({ rideID }) => {
  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const getItemAsync = async (key) => {
    return Platform.OS === 'web'
      ? localStorage.getItem(key)
      : SecureStore.getItemAsync(key);
  };

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const token = await getItemAsync('userToken');
        const response = await fetch('http://localhost:5000/api/drivers', {
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
      } finally {
        setIsLoading(false);
      }
    };

    fetchDrivers();
  }, []);

  const handleConfirm = async () => {
    if (!selectedDriver) {
      Alert.alert('Error', 'Please select a driver');
      return;
    }

    try {
      const token = await getItemAsync('userToken');
      const response = await fetch(
        `http://localhost:5000/api/rides/${rideID}/confirm`,
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
        router.push('/(tabs)/rideDetails');
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
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.header}>Select a Driver</Text>
        {isLoading ? (
          <ActivityIndicator size="large" color="#39C9C2" />
        ) : drivers.length > 0 ? (
          <View style={styles.pickerContainer}>
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
          </View>
        ) : (
          <Text style={styles.noDriversText}>No drivers available</Text>
        )}
        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
          <Text style={styles.confirmButtonText}>Confirm Trip</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
  },
  header: {
    fontSize: 28,
    fontWeight: '600',
    color: '#173252',
    marginBottom: 24,
  },
  pickerContainer: {
    width: '100%',
    marginBottom: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E1E1E1',
    overflow: 'hidden',
  },
  picker: {
    width: '100%',
    height: 50,
    color: '#173252',
  },
  noDriversText: {
    fontSize: 16,
    color: '#6D6D6D',
    marginBottom: 24,
  },
  confirmButton: {
    backgroundColor: '#39C9C2',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default ConfirmTripScreen;

