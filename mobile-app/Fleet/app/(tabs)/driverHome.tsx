import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, Platform } from 'react-native';
import GoOnlineStep from '../../components/GoOnlineStep';
import RidesWithoutDriverStep from '../../components/RidesWithoutDriverPage';
import TravelToRideStep from '../../components/TravelToRideStep';
import DriverInProgressStep from '../../components/DriverInProgressStep';
import RideFinishedStep from '../../components/RideFinishedStep';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const getItemAsync = async (key: string): Promise<string | null> => {
  if (Platform.OS === 'web') {
    return AsyncStorage.getItem(key);
  } else {
    return await SecureStore.getItemAsync(key);
  }
};

const DriverHome: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [token, setToken] = useState<string | null>(null);
  const [driverID, setDriverID] = useState<string | null>(null);
  const [rideID, setRideID] = useState<string | null>(null);

  useEffect(() => {
    const fetchCredentials = async () => {
      try {
        const storedToken = await getItemAsync('driverToken');
        const storedDriverID = await getItemAsync('driverID');

        if (storedToken && storedDriverID) {
          setToken(storedToken);
          setDriverID(storedDriverID);
        } else {
          Alert.alert('Error', 'Token or Driver ID not found. Please log in again.');
        }
      } catch (error) {
        console.error('Error fetching credentials:', error);
      }
    };

    fetchCredentials();
  }, []);

  if (!token || !driverID) {
    return null; // Optionally show a loading indicator
  }

  return (
    <View style={styles.container}>
      {currentStep === 1 && (
        <GoOnlineStep
          token={token}
          driverID={driverID}
          onNextStep={() => setCurrentStep(2)}
        />
      )}
      {currentStep === 2 && token && driverID && (
        <RidesWithoutDriverStep
          token={token}
          driverID={driverID}
          onRideClaimed={(ride) => {
            setRideID(ride);
            setCurrentStep(3);
          }}
        />
      )}
      {currentStep === 3 && rideID && (
        <TravelToRideStep
          rideID={rideID}
          driverID={driverID}
          onRideStarted={() => setCurrentStep(4)} // Move to next step when ride starts
        />
      )}
      {currentStep === 4 && rideID && (
        <DriverInProgressStep
          rideID={rideID}
          driverID={driverID}
          onRideCompleted={() => setCurrentStep(5)} // Move to Ride Finished Step
          token={token}        />
      )}
      {currentStep === 5 && (
        <RideFinishedStep
          onGoHome={() => {
            setRideID(null);
            setCurrentStep(1); // Reset to home screen
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default DriverHome;
