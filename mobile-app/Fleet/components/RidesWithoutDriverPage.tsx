import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, FlatList, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import Constants from 'expo-constants';

const apiUrl = Constants.expoConfig?.extra?.API_URL;

interface RidesForDriverStepProps {
  token: string;
  driverID: string;
  onRideClaimed: (rideID: string) => void; 
  onGoOffline: () => void; 
}

const RidesForDriverStep: React.FC<RidesForDriverStepProps> = ({ token, driverID, onRideClaimed, onGoOffline }) => {
  const [ridesForDriver, setRidesForDriver] = useState<any[]>([]);
  const [selectedRide, setSelectedRide] = useState<string>('');
  const [offlineLoading, setOfflineLoading] = useState(false);

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
        onRideClaimed(rideID); 
      } else {
        Alert.alert('Error', data.message || 'Failed to claim ride');
      }
    } catch (error) {
      console.error('Error claiming ride:', error);
      Alert.alert('Error', 'An error occurred while claiming the ride');
    }
  };
  const toggleOffline = async () => {
    setOfflineLoading(true);

    try {
      const response = await fetch(`${apiUrl}/api/user/driver/${driverID}/offline`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        Alert.alert('Status', 'You are now offline');
        onGoOffline();
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'Failed to go offline');
      }
    } catch (error) {
      console.error('Error going offline:', error);
      Alert.alert('Error', 'An error occurred while changing your status');
    } finally {
      setOfflineLoading(false);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleClaimRide(item._id)}
    >
      <Text style={styles.cardTitle}>Start: Lat {item.start.coordinates[0]}, Long {item.start.coordinates[1]}</Text>
      <Text style={styles.cardSubtitle}>End: Lat {item.end.coordinates[0]}, Long {item.end.coordinates[1]}</Text>
      <Text style={styles.cardDetails}>Fare: {item.fare}</Text>
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
      )}<TouchableOpacity
        style={styles.offlineButton}
        onPress={toggleOffline}
        disabled={offlineLoading}
      >
        {offlineLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.offlineButtonText}>Go Offline</Text>
        )}
      </TouchableOpacity>
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
    color: '#4A90E2',
  },
  cardSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  cardDetails: {
    fontSize: 14,
    color: '#888',
  },
  offlineButton: {
    marginTop: 20,
    backgroundColor: '#FF5C5C',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  offlineButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default RidesForDriverStep;
