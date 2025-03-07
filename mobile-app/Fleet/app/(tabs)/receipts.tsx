import React, { useState, useEffect } from 'react'; 
import { StyleSheet, Modal, View, TouchableOpacity, FlatList, Text, Platform } from 'react-native';
import { useColorScheme } from 'react-native';
import ThemedText from '../../components/ThemedText';
import ThemedView from '../../components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';


const apiUrl = Constants.expoConfig?.extra?.API_URL;

interface User {
  _id: string;
  type: string;
}

interface Ride {
  _id: string;
  start: { type: string; coordinates: [number, number] };
  end: { type: string; coordinates: [number, number] };
  status: string;
  fare: number;
  stripeTransactionId: string;
  stripeTransactionTime: string;
}

const getItemAsync = async (key: string): Promise<string | null> => {
  return Platform.OS === 'web' ? localStorage.getItem(key) : await SecureStore.getItemAsync(key);
};

export default function RidesScreen() {
  const colorScheme = useColorScheme();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const loadAuthData = async () => {
      try {
        const userType = await getItemAsync("userType");
        if (!userType) return;

        let userToken = null;
        let userId = null;

        if (userType === 'driver') {
          userToken = await getItemAsync("driverToken");
          userId = await getItemAsync("driverID");
        } else {
          userToken = await getItemAsync("userToken");
          userId = await getItemAsync("userObjectId");
        }

        if (userToken && userId) {
          setToken(userToken);
          setUser({ _id: userId, type: userType });
        }
      } catch (error) {
        console.error("Error loading auth data:", error);
      }
    };
    loadAuthData();
  }, []);

  useEffect(() => {
    if (token && user) {
      fetchRides();
    }
  }, [token, user]);

  const fetchRides = async () => {
    if (!token || !user) return;
    setLoading(true);
    setError('');
    try {
      const endpoint = user.type === 'driver' 
        ? `${apiUrl}/api/user/drivers/${user._id}/rides` 
        : `${apiUrl}/api/user/riders/${user._id}/rides`;

      const response = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch rides');
      const data: Ride[] = await response.json();
      setRides(data);
    } catch (err) {
      console.error('Error fetching rides:', err);
      setError('Failed to load rides. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Rides</ThemedText>
        <TouchableOpacity style={styles.refreshButton} onPress={fetchRides}>
          <Ionicons name="refresh" size={22} color={colorScheme === 'dark' ? '#fff' : '#173252'} />
        </TouchableOpacity>
      </View>
      {error ? (
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <TouchableOpacity style={styles.retryButton} onPress={fetchRides}>
            <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={rides}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.rideItem}>
            <ThemedText>Status: {item.status}</ThemedText>
            <ThemedText>Fare: ${item.fare / 100}</ThemedText>
            <ThemedText>Transaction ID: {item.stripeTransactionId}</ThemedText>
            <ThemedText>
              Transaction Time: {item.stripeTransactionTime ? new Date(item.stripeTransactionTime).toLocaleString() : 'N/A'}
            </ThemedText>
          </View>
          )}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f7f9',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
  },
  refreshButton: {
    padding: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#e53935',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#173252',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  rideItem: {
    backgroundColor: '#fff',
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
});