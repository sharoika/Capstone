import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator, Alert } from 'react-native';

interface StartRideProps {
  rideID: string;
  token: string;
  onRideStarted: () => void;
}

const StartRide: React.FC<StartRideProps> = ({ rideID, token, onRideStarted }) => {
  const [rideDetails, setRideDetails] = useState<any>(null); // Store fetched ride details
  const [loading, setLoading] = useState(true);  // Handle loading state
  const [error, setError] = useState<string | null>(null); // Handle errors

  useEffect(() => {
    // Fetch ride details on component mount
    const fetchRideDetails = async () => {
      try {
        const response = await fetch(`http://10.0.2.2:5000/api/rides/rides/${rideID}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch ride details');
        }

        const data = await response.json();
        setRideDetails(data);
      } catch (err) {
        setError('Error fetching ride details');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRideDetails();
  }, [rideID, token]);

  const handleStartRide = async () => {
    try {
      const response = await fetch(`http://10.0.2.2:5000/api/rides/rides/${rideID}/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to start the ride');
      }

      const data = await response.json();
      console.log('Ride started:', data.ride);
      onRideStarted();
      Alert.alert('Success', 'Ride started successfully');
    } catch (err) {
      console.error('Error starting the ride:', err);
      Alert.alert('Error', 'Unable to start the ride');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {rideDetails && (
        <>
          <Text style={styles.text}>Ride ID: {rideDetails.rideID}</Text>
          <Text style={styles.text}>Start Location: {rideDetails.start}</Text>
          <Text style={styles.text}>End Location: {rideDetails.end}</Text>
          <Text style={styles.text}>Fare: ${rideDetails.fare}</Text>
          <Text style={styles.text}>Ride Booked: {rideDetails.rideBooked ? 'Yes' : 'No'}</Text>
          <Text style={styles.text}>Ride In Progress: {rideDetails.rideInProgress ? 'Yes' : 'No'}</Text>
          <Text style={styles.text}>Ride Finished: {rideDetails.rideFinished ? 'Yes' : 'No'}</Text>

          {rideDetails.rider && (
            <View style={styles.detailsContainer}>
              <Text style={styles.text}>Rider: {rideDetails.rider.name}</Text>
              <Text style={styles.text}>Rider Email: {rideDetails.rider.email}</Text>
            </View>
          )}

          {rideDetails.driver && (
            <View style={styles.detailsContainer}>
              <Text style={styles.text}>Driver: {rideDetails.driver.name}</Text>
              <Text style={styles.text}>Driver Email: {rideDetails.driver.email}</Text>
            </View>
          )}

          <Button title="Start Ride" onPress={handleStartRide} />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    fontSize: 16,
    marginBottom: 10,
  },
  detailsContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    width: '100%',
  },
});

export default StartRide;
