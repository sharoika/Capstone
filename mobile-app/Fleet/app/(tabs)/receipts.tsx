import React, { useState, useEffect } from 'react'; 
import { StyleSheet, Modal, View, TouchableOpacity, FlatList, Text, Platform } from 'react-native';
import { useColorScheme } from 'react-native';
import ThemedText from '../../components/ThemedText';
import ThemedView from '../../components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import Geocoder from 'react-native-geocoding';

const GOOGLE_API_KEY = 'AIzaSyBkmAjYL9HmHSBtxxI0j3LB1tYEwoCnZXg';
Geocoder.init(GOOGLE_API_KEY);

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
  startAddress: string;
  endAddress: string;
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

      if (data.length === 0) {
        setRides([]); 
        setLoading(false);
        return; 
      }

      setRides(await Promise.all(data.map(async (ride) => {
        const startAddress = await convertCoordinatesToAddress(ride.start.coordinates);
        const endAddress = await convertCoordinatesToAddress(ride.end.coordinates);
        return { ...ride, startAddress, endAddress };
      })));
    } catch (err) {
      setError('Failed to load rides. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const convertCoordinatesToAddress = async (coords: number[]): Promise<string> => {
    if (!coords || coords.length < 2 || coords[0] === undefined || coords[1] === undefined) {
      return "Address not available"; // Handle missing or invalid coordinates
    }
    
    try {
      const { latitude, longitude } = { latitude: coords[1], longitude: coords[0] };
      const response = await Geocoder.from(latitude, longitude);
      const address = response.results[0]?.formatted_address || "Address not found";
      return address;
    } catch (error) {
      console.error("Error converting coordinates:", error);
      return "Address not available";
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
      {loading ? (
          <ThemedText style={styles.loadingText}>Loading...</ThemedText>
        ) : rides.length === 0 ? (
          <View style={styles.noRidesContainer}>
            <ThemedText style={styles.noRidesText}>No ride history found at this time.</ThemedText>
          </View>
        ) : (
          <FlatList
            data={rides}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.rideItem}>
                <View style={styles.cardContent}>
                  <ThemedText style={styles.driverName}>Status: {item.status}</ThemedText>
                  <ThemedText style={styles.details}>Distance: {item.distance ? `${item.distance} km` : 'N/A'}</ThemedText>
                  <ThemedText style={styles.details}>Fare: ${item.fare / 100}</ThemedText>
                  <ThemedText style={styles.details}>Start Location: {item.startAddress || 'Loading...'}</ThemedText>
                  <ThemedText style={styles.details}>End Location: {item.endAddress || 'Loading...'}</ThemedText>
                  <ThemedText style={styles.totalFare}>Transaction Time: {item.stripeTransactionTime ? new Date(item.stripeTransactionTime).toLocaleString() : 'N/A'}</ThemedText>
                </View>
              </TouchableOpacity>
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
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  profile: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#8EC3FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    fontSize: 24,
    color: '#1A2242',
  },
  cardContent: {
    marginLeft: 16,
  },
  driverName: {
    fontSize: 18,
    color: '#1A2242',
    fontWeight: '600',
  },
  details: {
    fontSize: 14,
    color: '#666',
  },
  totalFare: {
    fontSize: 16,
    color: '#4A90E2',
  },
  noRidesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  noRidesText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#4A90E2',
    textAlign: 'center',
    marginTop: 20,
  },
  
});
