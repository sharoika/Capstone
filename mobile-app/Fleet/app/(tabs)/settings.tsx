import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView, ActivityIndicator, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronRight, Edit2, Bell, Lock, LogOut } from 'lucide-react-native';
import * as SecureStore from 'expo-secure-store';
interface Rider {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  homeLocation?: string;
  riderID?: string;
  completedRides?: string[];
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
  const [id, setId] = useState<string | null>(null);
  const [rider, setRider] = useState<Rider | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = await getItemAsync('userObjectId');
        if (userId) {
          setId(userId);
          const response = await fetch(`http://10.0.2.2:5000/api/auth/riders/${userId}`);
          const data: Rider = await response.json();
          setRider(data);
        }
      } catch (error) {
        console.error('Error fetching rider data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#39C9C2" style={styles.loader} />;
  }

  const handleLogout = () => {
    router.push('/(auth)/login');
  };

  interface SettingOptionProps {
    icon: JSX.Element;
    title: string;
    onPress: () => void;
  }

  const SettingOption: React.FC<SettingOptionProps> = ({ icon, title, onPress }) => (
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
        <Image
          source={{ uri: 'https://example.com/default-profile.png' }}
          style={styles.profilePicture}
        />
        <Text style={styles.userName}>{rider?.firstName} {rider?.lastName}</Text>
        <Text style={styles.userEmail}>{rider?.email}</Text>
        <Text style={styles.userPhone}>Phone: {rider?.phone || 'N/A'}</Text>
        <Text style={styles.userHomeLocation}>Home Location: {rider?.homeLocation || 'N/A'}</Text>
        <Text style={styles.userRiderID}>Rider ID: {rider?.riderID || 'N/A'}</Text>
        <Text style={styles.userCompletedRides}>Completed Rides: {rider?.completedRides?.length || 0}</Text>
      </View>

      <View style={styles.settingsContainer}>
        <SettingOption icon={<Edit2 color="#39C9C2" size={24} />} title="Edit Profile" onPress={() => {}} />
        <SettingOption icon={<Bell color="#39C9C2" size={24} />} title="Notifications" onPress={() => {}} />
        <SettingOption icon={<Lock color="#39C9C2" size={24} />} title="Privacy Settings" onPress={() => {}} />
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <LogOut color="#FFFFFF" size={24} />
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { alignItems: 'center', padding: 24, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  profilePicture: { width: 100, height: 100, borderRadius: 50, marginBottom: 16 },
  userName: { fontSize: 24, fontWeight: '600', color: '#173252', marginBottom: 4 },
  userEmail: { fontSize: 16, color: '#6D6D6D' },
  userPhone: { fontSize: 16, color: '#6D6D6D', marginTop: 4 },
  userHomeLocation: { fontSize: 16, color: '#6D6D6D', marginTop: 4 },
  userRiderID: { fontSize: 16, color: '#6D6D6D', marginTop: 4 },
  userCompletedRides: { fontSize: 16, color: '#6D6D6D', marginTop: 4 },
  settingsContainer: { padding: 24 },
  settingOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  settingOptionContent: { flexDirection: 'row', alignItems: 'center' },
  settingOptionText: { fontSize: 16, color: '#173252', marginLeft: 16 },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#39C9C2', marginHorizontal: 24, marginTop: 24, marginBottom: 40, padding: 16, borderRadius: 8 },
  logoutButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600', marginLeft: 8 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});