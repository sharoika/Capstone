import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      {/* Hero Image Placeholder */}
      <View style={styles.heroImage} />
      
      {/* Welcome Text */}
      <Text style={styles.welcomeText}>Welcome to Home Screen</Text>

      {/* Ride Button */}
      <TouchableOpacity style={styles.rideButton} onPress={() => console.log('Ride button pressed')}>
        <Text style={styles.rideButtonText}>Ride</Text>
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
  heroImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#D3D3D3',  // Placeholder color for the image
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
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
