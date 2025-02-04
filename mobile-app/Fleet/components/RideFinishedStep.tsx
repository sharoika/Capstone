import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface RideFinishedStepProps {
  onGoHome: () => void; // Callback to reset the flow
}

const RideFinishedStep: React.FC<RideFinishedStepProps> = ({ onGoHome }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ride Completed!</Text>
      <Text style={styles.info}>You've successfully completed the ride.</Text>

      <TouchableOpacity style={styles.button} onPress={onGoHome}>
        <Text style={styles.buttonText}>Go Back to Home</Text>
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

export default RideFinishedStep;
