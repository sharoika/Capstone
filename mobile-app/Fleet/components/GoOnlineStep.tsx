import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';

interface GoOnlineStepProps {
  token: string;
  driverID: string;
  onNextStep: () => void;
}

const GoOnlineStep: React.FC<GoOnlineStepProps> = ({ token, driverID, onNextStep }) => {
  const [isOnline, setIsOnline] = useState(false);

  const toggleOnlineStatus = async () => {
    try {
      const response = await fetch(`${process.env.API_URL}/api/user/driver/${driverID}/online`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // Include driver token for authentication
        },
      });

      if (response.ok) {
        const data = await response.json();
        setIsOnline(data.driver.isOnline);
        const message = data.driver.isOnline
          ? 'You are now online!'
          : 'You are now offline!';
        Alert.alert('Status Updated', message);

        if (data.driver.isOnline) {
          onNextStep(); // Move to the next step if going online
        }
      } else {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        Alert.alert('Error', errorData.message || 'Failed to update status.');
      }
    } catch (error) {
      console.error('Error toggling online status:', error);
      Alert.alert('Error', 'An error occurred while updating your status.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.statusText}>
        {isOnline ? 'You are Online' : 'You are Offline'}
      </Text>
      <TouchableOpacity
        style={[styles.button, isOnline ? styles.offlineButton : styles.onlineButton]}
        onPress={toggleOnlineStatus}
      >
        <Text style={styles.buttonText}>{isOnline ? 'Go Offline' : 'Go Online'}</Text>
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
    padding: 24,
  },
  statusText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: 200,
  },
  onlineButton: {
    backgroundColor: '#39C9C2',
  },
  offlineButton: {
    backgroundColor: '#FF5C5C',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default GoOnlineStep;
