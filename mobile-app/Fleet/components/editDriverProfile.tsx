import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

const apiUrl = Constants.expoConfig?.extra?.API_URL;
interface Driver {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear?: string;
  vehiclePlate: string;
}

const getItemAsync = async (key: string): Promise<string | null> => {
  if (Platform.OS === 'web') {
    return localStorage.getItem(key);
  } else {
    return await SecureStore.getItemAsync(key);
  }
};

export default function editDriverProfile() {
  const router = useRouter();
  const [driver, setDriver] = useState<Driver | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [updating, setUpdating] = useState<boolean>(false);

  useEffect(() => {
    const fetchDriverData = async () => {
      const driverId = await getItemAsync('driverID');
      const token = await getItemAsync('driverToken');
      try {
        const response = await fetch(`${apiUrl}/api/user/drivers/${driverId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error('Failed to fetch driver details');
        
        const data: Driver = await response.json();
        setDriver(data);
      } catch (error) {
        console.error('Error fetching driver data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDriverData();
  }, []);

  const handleUpdateProfile = async () => {
    if (!driver) return;

    setUpdating(true);
    const driverId = await getItemAsync('driverID');
    const token = await getItemAsync('driverToken');

    try {
      const response = await fetch(`${apiUrl}/api/user/drivers/${driverId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(driver),
      });

      if (!response.ok) throw new Error('Update failed');

      Alert.alert('Success', 'Profile updated successfully');
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Could not update profile');
      console.error('Error updating profile:', error);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#39C9C2" style={styles.loader} />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Edit Profile</Text>

      <TextInput
        style={styles.input}
        placeholder="First Name"
        value={driver?.firstName}
        onChangeText={(text) => setDriver((prev) => (prev ? { ...prev, firstName: text } : prev))}
      />
      <TextInput
        style={styles.input}
        placeholder="Last Name"
        value={driver?.lastName}
        onChangeText={(text) => setDriver((prev) => (prev ? { ...prev, lastName: text } : prev))}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        value={driver?.email}
        onChangeText={(text) => setDriver((prev) => (prev ? { ...prev, email: text } : prev))}
      />
      <TextInput
        style={styles.input}
        placeholder="Phone"
        keyboardType="phone-pad"
        value={driver?.phone}
        onChangeText={(text) => setDriver((prev) => (prev ? { ...prev, phone: text } : prev))}
      />
      <TextInput
        style={styles.input}
        placeholder="Vehicle Make"
        value={driver?.vehicleMake}
        onChangeText={(text) => setDriver((prev) => (prev ? { ...prev, vehicleMake: text } : prev))}
      />
      <TextInput
        style={styles.input}
        placeholder="Vehicle Model"
        value={driver?.vehicleModel}
        onChangeText={(text) => setDriver((prev) => (prev ? { ...prev, vehicleModel: text } : prev))}
      />
      <TextInput
        style={styles.input}
        placeholder="Vehicle Year"
        keyboardType="numeric"
        value={driver?.vehicleYear}
        onChangeText={(text) => setDriver((prev) => (prev ? { ...prev, vehicleYear: text } : prev))}
      />
      <TextInput
        style={styles.input}
        placeholder="Vehicle Plate"
        value={driver?.vehiclePlate}
        onChangeText={(text) => setDriver((prev) => (prev ? { ...prev, vehiclePlate: text } : prev))}
      />

      <TouchableOpacity style={styles.button} onPress={handleUpdateProfile} disabled={updating}>
        <Text style={styles.buttonText}>{updating ? 'Updating...' : 'Update Profile'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#173252',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    padding: 12,
    borderWidth: 1,
    borderColor: '#D1D1D1',
    borderRadius: 8,
    marginBottom: 10,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#39C9C2',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
