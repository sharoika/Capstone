import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator, Alert } from 'react-native';

interface RideInProgressProps {
  rideID: string;
  token: string;
  onRideFinished: () => void;
}

const RideInProgress: React.FC<RideInProgressProps> = ({ rideID, token, onRideFinished }) => {
  const [rideDetails, setRideDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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

  const handleFinishRide = async () => {
    try {
      const response = await fetch(`http://10.0.2.2:5000/api/rides/rides/${rideID}/finish`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to finish the ride');
      }

      const data = await response.json();
      console.log('Ride finished:', data.ride);
      onRideFinished();
    } catch (err) {
      console.error('Error finishing the ride:', err);
      Alert.alert('Error', 'Unable to finish the ride');
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
          <Text style={styles.text}>Ride ID: {rideDetails._id}</Text>
          <Text style={styles.text}>Start: {rideDetails.start}</Text>
          <Text style={styles.text}>End: {rideDetails.end}</Text>
          <Text style={styles.text}>Fare: ${rideDetails.fare}</Text>
          <Button title="Finish Ride" onPress={handleFinishRide} />
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
});

export default RideInProgress;
