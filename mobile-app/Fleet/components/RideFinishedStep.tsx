import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';

interface RideFinishedStepProps {
  onGoHome: () => void; 
}

const RideFinishedStep: React.FC<RideFinishedStepProps> = ({ onGoHome }) => {
  const scaleValue = new Animated.Value(1);
const onPressIn = () => {
  Animated.spring(scaleValue, { toValue: 0.95, useNativeDriver: true }).start();
};

const onPressOut = () => {
  Animated.spring(scaleValue, { toValue: 1, useNativeDriver: true }).start();
};
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ride Completed!</Text>
      <Text style={styles.info}>You've successfully completed the ride.</Text>

      <Animated.View style={[styles.button, { transform: [{ scale: scaleValue }] }]}>
        <TouchableOpacity 
          style={styles.button} 
          onPress={onGoHome} 
          onPressIn={onPressIn} 
          onPressOut={onPressOut}
        >
          <Text style={styles.buttonText}>Go Back to Home</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F2',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333', // Darker text for better contrast
    marginBottom: 20,
  },
  info: {
    fontSize: 16,
    color: '#666', // Lighter text color for info
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#007bff', // Modern blue
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30, // More rounded corners
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#007bff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5, // Android shadow
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default RideFinishedStep;
