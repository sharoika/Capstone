import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronRight, Edit2, Bell, Lock, LogOut } from 'lucide-react-native';
import * as SecureStore from 'expo-secure-store';

interface Driver {
  firstName: string;
  lastName: string;
  email: string;
  vehicleMake: string;
  vehicleModel: string;
  vehiclePlate: string;
}
const getItemAsync = async (key: string): Promise<string | null> => {
  if (Platform.OS === 'web') {
    return localStorage.getItem(key);
  } else {
    return await SecureStore.getItemAsync(key);
  }
};

export default function Settings() {
  const router = useRouter();


  const [driver, setDriver] = useState<Driver | null>(null);
  const [loading, setLoading] = useState<boolean>(true); 


  const fetchDriverData = async () => {
    const driverId = await getItemAsync('driverID');
    const token = await getItemAsync('driverToken');
    try {
      const response = await fetch(`http://10.0.2.2:5000/api/user/drivers/${driverId}`, {
        headers: {
          Authorization: `Bearer ${token}`, 
        },
      });

      if (!response.ok) {
        throw new Error('Driver not found');
      }

      const data: Driver = await response.json();
      setDriver(data); 
    } catch (error) {
      console.error('Error fetching driver data:', error);
    } finally {
      setLoading(false); 
    }
  };

  useEffect(() => {
    fetchDriverData(); 
  }, []);

  const handleLogout = () => {
    router.push('/(auth)/login'); 
  };

  const SettingOption = ({ icon, title, onPress }: { icon: JSX.Element; title: string; onPress: () => void }) => (
    <TouchableOpacity style={styles.settingOption} onPress={onPress}>
      <View style={styles.settingOptionContent}>
        {icon}
        <Text style={styles.settingOptionText}>{title}</Text>
      </View>
      <ChevronRight color="#6D6D6D" size={24} />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>

        {loading ? (
          <Text style={styles.loadingText}>Loading driver data...</Text>
        ) : (
          driver && (
            <View style={styles.driverInfo}>
              <Text style={styles.driverName}>
                {driver.firstName} {driver.lastName}
              </Text>
              <Text style={styles.driverEmail}>{driver.email}</Text>
              <Text style={styles.driverVehicle}>
                {driver.vehicleMake} {driver.vehicleModel}
              </Text>
              <Text style={styles.driverPlate}>Plate: {driver.vehiclePlate}</Text>
            </View>
          )
        )}
      </View>

      <View style={styles.settingsContainer}>
        <SettingOption
          icon={<Edit2 color="#39C9C2" size={24} />}
          title="Edit Profile"
          onPress={() => {
          }}
        />
        <SettingOption
          icon={<Bell color="#39C9C2" size={24} />}
          title="Notifications"
          onPress={() => {
          }}
        />
        <SettingOption
          icon={<Lock color="#39C9C2" size={24} />}
          title="Privacy Settings"
          onPress={() => {
          }}
        />
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
});
