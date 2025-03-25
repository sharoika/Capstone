import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Constants from 'expo-constants';
import MapView, { Marker } from 'react-native-maps';
import { customMapStyle } from '../styles/customMapStyle'; 

const apiUrl = Constants.expoConfig?.extra?.API_URL;
interface GoOnlineStepProps {
  token: string;
  driverID: string;
  onNextStep: () => void;
}

const GoOnlineStep: React.FC<GoOnlineStepProps> = ({ token, driverID, onNextStep }) => {
  const [isOnline, setIsOnline] = useState(false);
  const [location, setLocation] = useState<{ lat: number; long: number } | null>(null);

  const fetchLocation = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/location/getOne?userId=${driverID}&userType=driver`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.location) {
          setLocation(data.location); 
        } else {
          Alert.alert('Error', 'Location not found.');
        }
      } else {
        const errorData = await response.json();
        console.error('Error fetching location:', errorData);
        Alert.alert('Error', errorData.message || 'Failed to fetch location.');
      }
    } catch (error) {
      console.error('Error fetching location:', error);
      Alert.alert('Error', 'An error occurred while fetching location.');
    }
  };

  const toggleOnlineStatus = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/user/driver/${driverID}/online`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, 
        },
      });

      if (response.ok) {
        const data = await response.json();
        setIsOnline(data.driver.isOnline);
        const message = data.driver.isOnline
          ? 'You are now online!'
          : 'You are now offline!';

        if (data.driver.isOnline) {
          onNextStep(); 
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

  useEffect(() => {
    fetchLocation(); 
  }, [driverID]);

  const region = location
  ? {
      latitude: location.lat,
      longitude: location.long,
      latitudeDelta: 0.0012,  
      longitudeDelta: 0.0061, 
    }
  : undefined;

  return (
    <View style={styles.container}>
      <MapView style={styles.map} region={region} customMapStyle={customMapStyle}>
        {location && (
          <Marker
            coordinate={{
              latitude: location.lat,
              longitude: location.long,
            }}
            title="Driver's Location"
          />
        )}
      </MapView>

      <View style={styles.overlay}>
        <Text style={styles.statusText}>
          {isOnline ? 'You are Online' : 'You are Offline'}
        </Text>
        <TouchableOpacity
          style={[styles.button, isOnline ? styles.offlineButton : styles.onlineButton]}
          onPress={toggleOnlineStatus}
        >
          <Text style={styles.buttonText}>{'Go Online'}</Text>
        </TouchableOpacity>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    padding: 20,
    elevation: 5, 
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
  locationText: {
    fontSize: 18,
    marginTop: 16,
    color: '#555',
  },
  onlineButton: {
    backgroundColor: '#4A90E2',
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
