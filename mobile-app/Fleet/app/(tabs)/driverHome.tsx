import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Platform, ActivityIndicator } from 'react-native';
import GoOnlineStep from '../../components/GoOnlineStep';
import RidesWithoutDriverStep from '../../components/RidesWithoutDriverPage';
import TravelToRideStep from '../../components/TravelToRideStep';
import DriverInProgressStep from '../../components/DriverInProgressStep';
import RideFinishedStep from '../../components/RideFinishedStep';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const apiUrl = Constants.expoConfig?.extra?.API_URL;

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
  const [isApproved, setIsApproved] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState<boolean>(false);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedToken = await getItemAsync('driverToken');
        const storedDriverID = await getItemAsync('driverID');

        if (storedToken && storedDriverID) {
          setToken(storedToken);
          setDriverID(storedDriverID);

          const response = await fetch(`${apiUrl}/api/user/driver/${storedDriverID}`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${storedToken}` }
          });

          if (!response.ok) {
            // You might want to handle different error statuses here
            console.error('Unable to fetch driver details.');
          } else {
            const driverData = await response.json();
            setIsApproved(driverData.applicationApproved);
          }
        } else {
          console.error('Token or Driver ID not found. Please log in again.');
        }
      } catch (error) {
        console.error('Error fetching driver data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (!token || !driverID) {
    return (
      <View style={styles.cardContainer}>
        <Text style={styles.cardTitle}>Error</Text>
        <Text style={styles.cardMessage}>Credentials not found. Please log in again.</Text>
      </View>
    );
  }

  // Show card if driver is not approved
  if (!isApproved) {
    return (
      <View style={styles.cardContainer}>
        <Text style={styles.cardTitle}>Access Denied</Text>
        <Text style={styles.cardMessage}>
          Your application is not approved. Please contact support.
        </Text>
      </View>
    );
  }

  // Render the driver steps if approved
  return (
    <View style={styles.container}>
      {currentStep === 1 && (
        <GoOnlineStep
          token={token}
          driverID={driverID}
          onNextStep={() => setCurrentStep(2)}
          onStatusChange={(isOnline) => {
            if (isOnline) {
              setCurrentStep(2);
            }
          }}
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
          onGoOffline={() => setCurrentStep(1)}
        />
      )}
      {currentStep === 3 && rideID && (
        <TravelToRideStep
          rideID={rideID}
          driverID={driverID}
          token={token}
          onRideStarted={() => setCurrentStep(4)}
        />
      )}
      {currentStep === 4 && rideID && (
        <DriverInProgressStep
          rideID={rideID}
          driverID={driverID}
          token={token}
          onRideCompleted={() => setCurrentStep(5)}
        />
      )}
      {currentStep === 5 && (
        <RideFinishedStep
          rideID={rideID}
          token={token}
          onGoHome={() => {
            setRideID(null);
            setCurrentStep(2);
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
  cardContainer: {
    flex: 1,
    margin: 20,
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#f8d7da',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#f5c2c7',
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#721c24',
  },
  cardMessage: {
    fontSize: 16,
    textAlign: 'center',
    color: '#721c24',
  },
});

export default DriverHome;
