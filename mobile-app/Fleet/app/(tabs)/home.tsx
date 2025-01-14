import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { Platform} from 'react-native';
import * as SecureStore from 'expo-secure-store';

export default function HomeScreen() {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [fare, setFare] = useState('');
  const [riderID, setRiderID] = useState('');
   const router = useRouter();

   const getItemAsync = async (key) => {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key); // Use localStorage for web
    }
    return SecureStore.getItemAsync(key);
  };
  // Fetch riderID when the component mounts
  useEffect(() => {
    const fetchRiderID = async () => {
      try {
        const id = await getItemAsync('userObjectId'); // Replace with AsyncStorage if needed
        if (id) {
          setRiderID(id);
        } else {
          console.error('Rider ID not found in storage.');
          Alert.alert('Error', 'Unable to retrieve user information. Please log in again.');
          router.push('/(auth)/login');// Redirect to login if no ID
        }
      } catch (error) {
        console.error('Error fetching Rider ID:', error);
      }
    };

    fetchRiderID();
  }, []);

  // Handle the ride request
  const handleRidePress = async () => {
    if (!start || !end || !fare) {
      Alert.alert('Error', 'Please fill out all fields');
      return;
    }

    try {
      const token = await getItemAsync('userToken'); // Retrieve token
console.log(token);
      const response = await fetch('http://localhost:5000/api/rides/ride/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // Include the token
        },
        body: JSON.stringify({
          riderID, // Use the retrieved riderID
          start,
          end,
          fare: parseFloat(fare),
        }),
      });

      if (response.ok) {
        console.log('Ride created successfully');
        router.push('/(tabs)/driverSelection');
        //navigation.navigate('WaitingScreen'); // Navigate to WaitingScreen
      } else {
        const errorText = await response.text();
        console.error('Failed to create ride:', errorText);
        Alert.alert('Error', 'Failed to create ride');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'An error occurred while creating the ride');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Welcome! Book Your Ride Below</Text>

      {/* Input Fields */}
      <TextInput
        style={styles.input}
        placeholder="Start Location"
        value={start}
        onChangeText={setStart}
      />
      <TextInput
        style={styles.input}
        placeholder="End Location"
        value={end}
        onChangeText={setEnd}
      />
      <TextInput
        style={styles.input}
        placeholder="Fare (e.g., 20.50)"
        value={fare}
        onChangeText={setFare}
        keyboardType="numeric"
      />

      {/* Ride Button */}
      <TouchableOpacity style={styles.rideButton} onPress={handleRidePress}>
        <Text style={styles.rideButtonText}>Request Ride</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  rideButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  rideButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
