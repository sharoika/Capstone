import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronRight, Edit2, Bell, Lock, LogOut } from 'lucide-react-native';

export default function Settings() {
  const router = useRouter();

  // Mock user data (you can replace this with real data from your app's state or API)
  const user = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    profilePicture: 'https://example.com/path-to-profile-picture.jpg', // Placeholder image URL
  };

  // Handle logout logic
  const handleLogout = () => {
    // Perform your logout logic here (e.g., clearing authentication tokens)
    // After logging out, navigate the user to the login screen
    router.push('/(auth)/login'); // Redirect to login screen
  };

  const SettingOption = ({ icon, title, onPress }) => (
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
          source={{ uri: user.profilePicture }}
          style={styles.profilePicture}
        />
        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userEmail}>{user.email}</Text>
      </View>

      <View style={styles.settingsContainer}>
        <SettingOption 
          icon={<Edit2 color="#39C9C2" size={24} />}
          title="Edit Profile"
          onPress={() => {/* Navigate to edit profile */}}
        />
        <SettingOption 
          icon={<Bell color="#39C9C2" size={24} />}
          title="Notifications"
          onPress={() => {/* Navigate to notifications settings */}}
        />
        <SettingOption 
          icon={<Lock color="#39C9C2" size={24} />}
          title="Privacy Settings"
          onPress={() => {/* Navigate to privacy settings */}}
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

