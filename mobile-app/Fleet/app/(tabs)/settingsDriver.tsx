import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ScrollView, Platform, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronRight, Edit2, Bell, Lock, LogOut } from 'lucide-react-native';
import * as SecureStore from 'expo-secure-store';
import Modal from "react-native-modal"; 
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
  return Platform.OS === 'web' ? localStorage.getItem(key) : await SecureStore.getItemAsync(key);
};

export default function Settings() {
  const router = useRouter();
  const [driver, setDriver] = useState<Driver | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [updating, setUpdating] = useState<boolean>(false);

  useEffect(() => {
    const fetchDriverData = async () => {
      const driverId = await getItemAsync('driverID');
      const token = await getItemAsync('driverToken');

      try {
        const response = await fetch(`${process.env.API_URL}/api/user/drivers/${driverId}`, {
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
      const response = await fetch(`http://10.0.2.2:5000/api/user/drivers/${driverId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(driver),
      });

      if (!response.ok) throw new Error('Update failed');

      Alert.alert('Success', 'Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      Alert.alert('Error', 'Could not update profile');
      console.error('Error updating profile:', error);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        {loading ? (
          <Text style={styles.loadingText}>Loading driver data...</Text>
        ) : (
          driver && (
            <View style={styles.driverInfo}>
              <Text style={styles.driverName}>{driver.firstName} {driver.lastName}</Text>
              <Text style={styles.driverEmail}>{driver.email}</Text>
              <Text style={styles.driverVehicle}>{driver.vehicleMake} {driver.vehicleModel}</Text>
              <Text style={styles.driverPlate}>Plate: {driver.vehiclePlate}</Text>
            </View>
          )
        )}
      </View>

      <View style={styles.settingsContainer}>
        <TouchableOpacity style={styles.settingOption} onPress={() => setIsEditing(true)}>
          <View style={styles.settingOptionContent}>
            <Edit2 color="#39C9C2" size={24} />
            <Text style={styles.settingOptionText}>Edit Profile</Text>
          </View>
          <ChevronRight color="#6D6D6D" size={24} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingOption}>
          <View style={styles.settingOptionContent}>
            <Bell color="#39C9C2" size={24} />
            <Text style={styles.settingOptionText}>Notifications</Text>
          </View>
          <ChevronRight color="#6D6D6D" size={24} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingOption}>
          <View style={styles.settingOptionContent}>
            <Lock color="#39C9C2" size={24} />
            <Text style={styles.settingOptionText}>Privacy Settings</Text>
          </View>
          <ChevronRight color="#6D6D6D" size={24} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={() => router.push('/(auth)/login')}>
        <LogOut color="#FFFFFF" size={24} />
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>

      <Modal isVisible={isEditing} onBackdropPress={() => setIsEditing(false)}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Edit Profile</Text>
          <TextInput style={styles.input} placeholder="First Name" value={driver?.firstName} onChangeText={(text) => setDriver((prev) => (prev ? { ...prev, firstName: text } : prev))} />
          <TextInput style={styles.input} placeholder="Last Name" value={driver?.lastName} onChangeText={(text) => setDriver((prev) => (prev ? { ...prev, lastName: text } : prev))} />
          <TextInput style={styles.input} placeholder="Email" keyboardType="email-address" value={driver?.email} onChangeText={(text) => setDriver((prev) => (prev ? { ...prev, email: text } : prev))} />
          <TextInput style={styles.input} placeholder="Vehicle Make" value={driver?.vehicleMake} onChangeText={(text) => setDriver((prev) => (prev ? { ...prev, vehicleMake: text } : prev))} />
          <TextInput style={styles.input} placeholder="Vehicle Model" value={driver?.vehicleModel} onChangeText={(text) => setDriver((prev) => (prev ? { ...prev, vehicleModel: text } : prev))} />

          <TouchableOpacity style={styles.button} onPress={handleUpdateProfile} disabled={updating}>
            <Text style={styles.buttonText}>{updating ? 'Updating...' : 'Update Profile'}</Text>
          </TouchableOpacity>
        </View>
      </Modal>
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
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#173252',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#6D6D6D',
  },
  driverInfo: {
    marginTop: 16,
    alignItems: 'center',
  },
  driverName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#173252',
  },
  driverEmail: {
    fontSize: 16,
    color: '#6D6D6D',
  },
  driverVehicle: {
    fontSize: 16,
    color: '#39C9C2',
    marginTop: 4,
  },
  driverPlate: {
    fontSize: 14,
    color: '#6D6D6D',
    marginTop: 4,
  },
  loadingText: {
    fontSize: 16,
    color: '#6D6D6D',
    marginTop: 16,
  },
  settingsContainer: {
    padding: 24,
  },
  
  settingOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  settingOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingOptionText: {
    fontSize: 16,
    color: '#173252',
    marginLeft: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#39C9C2',
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
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  input: { width: '100%', borderBottomWidth: 1, padding: 10, marginBottom: 10 },
  button: { backgroundColor: '#39C9C2', padding: 15, borderRadius: 8, width: '100%', alignItems: 'center' },
  buttonText: { color: 'white', fontSize: 16 },
});

