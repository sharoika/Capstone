import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export default function HomeScreen() {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [fare, setFare] = useState('');
  const [riderID, setRiderID] = useState('');
  const router = useRouter();

  const getItemAsync = async (key) => {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return SecureStore.getItemAsync(key);
  };

  useEffect(() => {
    const fetchRiderID = async () => {
      try {
        const id = await getItemAsync('userObjectId');
        if (id) {
          setRiderID(id);
        } else {
          console.error('Rider ID not found in storage.');
          Alert.alert('Error', 'Unable to retrieve user information. Please log in again.');
          router.push('/(auth)/login');
        }
      } catch (error) {
        console.error('Error fetching Rider ID:', error);
      }
    };

    fetchRiderID();
  }, []);

  const handleRidePress = async () => {
    if (!start || !end || !fare) {
      Alert.alert('Error', 'Please fill out all fields');
      return;
    }

    try {
      const token = await getItemAsync('userToken');
      console.log(token);
      const response = await fetch('http://localhost:5000/api/rides/ride/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          riderID,
          start,
          end,
          fare: parseFloat(fare),
        }),
      });

      if (response.ok) {
        const data = await response.json(); // Assuming the response contains the rideID
        const { rideID } = data; // Replace with actual key for rideID from the server response
        console.log('Ride created successfully, ID:', rideID);
  
        // Save rideID to SecureStore or localStorage
        if (Platform.OS === 'web') {
          localStorage.setItem('rideID', rideID); // Use localStorage for web
        } else {
          await SecureStore.setItemAsync('rideID', rideID); // SecureStore for mobile
        }
  
        router.push('/(tabs)/driverSelection'); // Navigate to next screen
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
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Image 
            source={require('../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.welcomeText}>Welcome to Fleet</Text>
          <Text style={styles.subText}>Book Your Ride Below</Text>
        </View>

        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Start Location"
            placeholderTextColor="#8E8E93"
            value={start}
            onChangeText={setStart}
          />
          <TextInput
            style={styles.input}
            placeholder="End Location"
            placeholderTextColor="#8E8E93"
            value={end}
            onChangeText={setEnd}
          />
          <TextInput
            style={styles.input}
            placeholder="Fare (e.g., 20.50)"
            placeholderTextColor="#8E8E93"
            value={fare}
            onChangeText={setFare}
            keyboardType="numeric"
          />

          <TouchableOpacity style={styles.rideButton} onPress={handleRidePress}>
            <Text style={styles.rideButtonText}>Request Ride</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#173252',
    marginBottom: 8,
  },
  subText: {
    fontSize: 16,
    color: '#6D6D6D',
    marginBottom: 24,
  },
  formContainer: {
    width: '100%',
  },
  input: {
    width: '100%',
    height: 48,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
    color: '#173252',
  },
  rideButton: {
    backgroundColor: '#39C9C2',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  rideButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

