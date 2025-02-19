import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, FlatList, Text, TouchableOpacity } from 'react-native';
import Constants from 'expo-constants';

const apiUrl = Constants.expoConfig?.extra?.API_URL;

interface RidesForDriverStepProps {
  token: string;
  driverID: string;
  onRideClaimed: (rideID: string) => void; 
}

const RidesForDriverStep: React.FC<RidesForDriverStepProps> = ({ token, driverID, onRideClaimed }) => {
  const [ridesForDriver, setRidesForDriver] = useState<any[]>([]);
  const [selectedRide, setSelectedRide] = useState<string>('');

  useEffect(() => {
    const interval = setInterval(fetchRidesForDriver, 5000);
    return () => clearInterval(interval);
  }, [token, driverID]);

  const fetchRidesForDriver = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/ride/rides/driver/${driverID}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
  
      if (!response.ok) {
        const errorData = await response.json(); 
        throw new Error(`Error ${response.status}: ${errorData.message || response.statusText}`);
      }
  
      const data = await response.json();
      setRidesForDriver(data.rides);  
    } catch (error) {
      console.error('Error fetching rides:', error.message);
    }
  };

  const handleClaimRide = async (rideID: string) => {
    if (!rideID) {
      Alert.alert('Error', 'Please select a ride');
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/api/ride/rides/${rideID}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ driverID }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'Ride claimed successfully');
        onRideClaimed(rideID); 
      } else {
        Alert.alert('Error', data.message || 'Failed to claim ride');
      }
    } catch (error) {
      console.error('Error claiming ride:', error);
      Alert.alert('Error', 'An error occurred while claiming the ride');
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleClaimRide(item._id)}
    >
      <Text style={styles.cardTitle}>Start: {item.start}</Text>
      <Text style={styles.cardSubtitle}>End: {item.end}</Text>
      <Text style={styles.cardDetails}>Date: {item.date}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rides for Driver</Text>
      {ridesForDriver.length === 0 ? (
        <Text>No rides available at the moment.</Text>
      ) : (
        <FlatList
          data={ridesForDriver}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    marginBottom: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  cardSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  cardDetails: {
    fontSize: 14,
    color: '#888',
  },
});

export default RidesForDriverStep;
