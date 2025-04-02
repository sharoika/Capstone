import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import RideForm from '../../components/RideForm';
import DriverSelection from '../../components/DriverSelection';
import StartRide from '../../components/StartRide';
import RideInProgress from '../../components/RideInProgress';
import RideSummary from '../../components/RideSummary'; 
import WaitingForConfirmation from '../../components/WaitingForConfirmation';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// Utility function to get item (token or riderID) from SecureStore (mobile) or localStorage (web)
const getItemAsync = async (key: string): Promise<string | null> => {
  if (Platform.OS === 'web') {
    return localStorage.getItem(key);
  } else {
    return await SecureStore.getItemAsync(key);
  }
};

const HomeScreen: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [rideID, setRideID] = useState('');
  const [token, setToken] = useState<string>('');
  const [riderID, setRiderID] = useState<string>('');
  const [rideDetails, setRideDetails] = useState<any>(null); 

  useEffect(() => {
    const fetchTokenAndRiderID = async () => {
      try {
        const storedToken = await getItemAsync('userToken');
        const storedRiderID = await getItemAsync('userObjectId');

        if (storedToken && storedRiderID) {
          setToken(storedToken);
          setRiderID(storedRiderID);
        } else {
          Alert.alert('Error', 'Token or Rider ID not found. Please log in again.');
        }
      } catch (error) {
        console.error('Error fetching token or riderID:', error);
      }
    };

    fetchTokenAndRiderID();
  }, []);

  if (!token || !riderID) {
    return null; 
  }
  return (
    <View style={styles.container}>
      {currentStep === 1 && (
        <RideForm
          token={token}
          riderID={riderID}
          onRideCreated={(id: string) => {
            setRideID(id);
            setCurrentStep(2);
          }}
        />
      )}
      {currentStep === 2 && (
        <DriverSelection
          rideID={rideID}
          token={token}
          onDriverConfirmed={() => {
            setCurrentStep(3); 
          }}
        />
      )}
      {currentStep === 3 && (
  <WaitingForConfirmation
    rideID={rideID}
    token={token}
    onConfirmed={() => {
      setCurrentStep(4); // Move to StartRide step after confirmation
    }}
  />
)}
      {currentStep === 4 && (
        <StartRide
          rideID={rideID}
          token={token}
          onRideStarted={() => {
            setCurrentStep(5); // Move to RideInProgress step
          }}
        />
      )}
      {currentStep === 5 && (
        <RideInProgress
          rideID={rideID}
          token={token}
          onRideFinished={(details: any) => {
            console.log('Ride finished', details);
            setRideDetails(details); // Store ride details for the summary
            setCurrentStep(6); // Move to RideSummary step
          }}
        />
      )}
    {currentStep === 6 && (
      <RideSummary
        rideDetails={rideDetails}
        rideID={rideID}
        token={token}
        onReturnHome={() => {
          console.log('Returning to home...');
          setCurrentStep(1);
          setRideID('');
          setRideDetails(null); 
        }}
      />
    )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff' },
});

export default HomeScreen;
