import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import Constants from 'expo-constants';

const apiUrl = Constants.expoConfig?.extra?.API_URL;
interface WaitingForConfirmationProps {
  rideID: string;
  token: string;
  onConfirmed: () => void;
}

const WaitingForConfirmation: React.FC<WaitingForConfirmationProps> = ({ rideID, token, onConfirmed }) => {
  const [status, setStatus] = useState<string>('selected');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkRideStatus = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/ride/rides/${rideID}/status`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        setStatus(data.status);

        if (data.status === 'accepted') {
          setLoading(false);
          onConfirmed(); 
        }
      } catch (error) {
        console.error("Error checking ride status:", error);
      }
    };

    const interval = setInterval(checkRideStatus, 3000); 

    return () => clearInterval(interval);
  }, [rideID, token, onConfirmed]);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        {loading ? "Waiting for driver confirmation..." : "Ride Confirmed!"}
      </Text>
      {loading && <ActivityIndicator size="large" color="#0000ff" />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 18, marginBottom: 10 },
});

export default WaitingForConfirmation;
