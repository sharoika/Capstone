import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView, ActivityIndicator, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronRight, Edit2, Banknote, Bell, Lock, LogOut, Receipt, User } from 'lucide-react-native';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';

const apiUrl = Constants.expoConfig?.extra?.API_URL;
const GOOGLE_API_KEY =  Constants.expoConfig?.extra?.GOOGLE_API_KEY;

interface Rider {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  homeLocation?: string;
  completedRides?: string[];
  profilePicture?: string;
}

// Function to get stored data based on platform
const getItemAsync = async (key: string): Promise<string | null> => {
  return Platform.OS === 'web' ? localStorage.getItem(key) : await SecureStore.getItemAsync(key);
};

export default function Settings() {
  const router = useRouter();
  const [id, setId] = useState<string | null>(null);
  const [rider, setRider] = useState<Rider | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [address, setAddress] = useState<string | null>(null);

  // Safe navigation helper
  const navigateTo = (path: string) => {
    try {
      router.push(path as any);
    } catch (error) {
      console.error(`Error navigating to ${path}:`, error);
      Alert.alert('Navigation Error', `Could not navigate to ${path}`);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = await getItemAsync('userObjectId');
        const token = await getItemAsync('userToken');

        if (userId && token) {
          setId(userId);

          const response = await fetch(`${apiUrl}/api/user/riders/${userId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            throw new Error('Failed to fetch rider data');
          }

          const data: Rider = await response.json();
          setRider(data);
          if (data.homeLocation) {
            const coordinates = data.homeLocation.split(',');
            const latitude = parseFloat(coordinates[0].trim());
            const longitude = parseFloat(coordinates[1].trim());
            fetchAddressFromCoordinates(latitude, longitude); // Ensure this function is correctly called here
          }
        }
      } catch (error) {
        console.error('Error fetching rider data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Function to fetch address from coordinates
  const fetchAddressFromCoordinates = async (latitude: number, longitude: number) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_API_KEY}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch address from coordinates');
      }

      const data = await response.json();

      if (data.status === 'OK' && data.results.length > 0) {
        const formattedAddress = data.results[0]?.formatted_address;
        setAddress(formattedAddress); // Set the address state
      } else {
        console.error('Error fetching address:', data.status);
        setAddress('Address not found'); // Provide a fallback address
      }
    } catch (error) {
      console.error('Error fetching address:', error);
      setAddress('Unable to fetch address'); // Set error message
    }
  };



  if (loading) {
    return <ActivityIndicator size="large" color="#4A90E2" style={styles.loader} />;
  }

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('userObjectId');
    await SecureStore.deleteItemAsync('userToken');
    await SecureStore.deleteItemAsync('userType');
    router.push('/(auth)/login');
  };


  const createTestReceipt = async () => {
    try {
      const token = await getItemAsync('userToken');
      const userId = await getItemAsync('userObjectId');

      if (!token || !userId) {
        Alert.alert('Error', 'You must be logged in to create a test receipt');
        return;
      }

      // Generate a valid MongoDB ObjectId-like string
      const generateObjectId = () => {
        const timestamp = Math.floor(new Date().getTime() / 1000).toString(16).padStart(8, '0');
        const machineId = Math.floor(Math.random() * 16777216).toString(16).padStart(6, '0');
        const processId = Math.floor(Math.random() * 65536).toString(16).padStart(4, '0');
        const counter = Math.floor(Math.random() * 16777216).toString(16).padStart(6, '0');
        return timestamp + machineId + processId + counter;
      };

      const testReceiptData = {
        rideID: generateObjectId(),
        riderID: userId,
        driverID: generateObjectId(),
        timestamp: new Date().toISOString(),
        baseFare: 2.50,
        distanceFare: 12.75,
        tipAmount: 3.00,
        totalAmount: 18.25,
        paymentMethod: "Credit Card",
        distance: 8.5,
        duration: 25,
        pickupLocation: "123 Main St, City",
        dropoffLocation: "456 Oak Ave, City"
      };

      console.log('Sending test receipt data:', testReceiptData);
      console.log('API URL:', `${apiUrl}/api/receipt/receipts/generate`);

      const response = await axios.post(`${apiUrl}/api/receipt/receipts/generate`, testReceiptData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Receipt creation response:', response.data);

      if (response.status === 201 || response.status === 200) {
        Alert.alert('Success', 'Test receipt created successfully!');
      } else {
        Alert.alert('Error', 'Failed to create test receipt');
      }
    } catch (error) {
      console.error('Error creating test receipt:', error);
      Alert.alert('Error', `Failed to create test receipt: ${error}`);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileImageContainer}>
          {rider?.profilePicture ? (
            <Image source={{ uri: rider.profilePicture }} style={styles.profileImage} />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <User color="#4A90E2" size={40} />
            </View>
          )}
        </View>
        <Text style={styles.userName}>{rider?.firstName} {rider?.lastName}</Text>
        <Text style={styles.userEmail}>{rider?.email}</Text>
        {rider?.phone && <Text style={styles.userPhone}>{rider.phone}</Text>}
        {address ? (
          <Text style={styles.userHomeLocation}>{address}</Text> // Display the fetched address
        ) : (
          <Text style={styles.userHomeLocation}>Loading address...</Text> // Show loading message until address is fetched
        )}
         </View>

      <View style={styles.settingsContainer}>
        <TouchableOpacity style={styles.settingOption} onPress={() => navigateTo('/editProfile')}>
          <View style={styles.settingOptionContent}>
            <Edit2 color='#4A90E2' size={24} />
            <Text style={styles.settingOptionText}>Edit Profile</Text>
          </View>
          <ChevronRight color="#6D6D6D" size={24} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingOption} onPress={() => navigateTo('/paymentSettings')}>
          <View style={styles.settingOptionContent}>
            <Banknote color='#4A90E2' size={24} />
            <Text style={styles.settingOptionText}>Payment Settings</Text>
          </View>
          <ChevronRight color="#6D6D6D" size={24} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingOption}
          onPress={() => Alert.alert('Coming Soon', 'Notifications feature is coming soon!')}
        >
          <View style={styles.settingOptionContent}>
            <Bell color='#4A90E2' size={24} />
            <Text style={styles.settingOptionText}>Notifications</Text>
          </View>
          <ChevronRight color="#6D6D6D" size={24} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingOption}
          onPress={() => Alert.alert('Coming Soon', 'Privacy settings coming soon')}
        >
          <View style={styles.settingOptionContent}>
            <Lock color='#4A90E2' size={24} />
            <Text style={styles.settingOptionText}>Privacy Settings</Text>
          </View>
          <ChevronRight color="#6D6D6D" size={24} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingOption}
          onPress={() => Alert.alert('Coming Soon', 'You can contact support at support@ridefleet.ca')}
        >
          <View style={styles.settingOptionContent}>
          <MaterialIcons name="help-outline" color='#4A90E2' size={24} />
            <Text style={styles.settingOptionText}>Contact Support</Text>
          </View>
          <ChevronRight color="#6D6D6D" size={24} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <LogOut color="#FFFFFF" size={24} />
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  profileImageContainer: {
    paddingTop: Platform.OS === 'ios' ? 30 : 20,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 16,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  profileImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  userName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#4A90E2',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#4A90E2',
  },
  userPhone: {
    fontSize: 16,
    color: '#6D6D6D',
    marginTop: 4,
  },
  userHomeLocation: {
    fontSize: 16,
    color: '#6D6D6D',
    marginTop: 4,
  },
  settingsContainer: {
    padding: 24,
  },
  settingOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  settingOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingOptionText: {
    fontSize: 16,
    marginLeft: 12,
    color: '#333333',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A90E2',
    marginHorizontal: 24,
    marginTop: 24,
    marginBottom: 40,
    padding: 16,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
