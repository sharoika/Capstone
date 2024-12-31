import { View, Text, TouchableOpacity, Image } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';

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

  return (
    <View style={{ flex: 1, padding: 20 }}>
      {/* User Information */}
      <View style={{ alignItems: 'center', marginBottom: 30 }}>
        <Image
          source={{ uri: user.profilePicture }} // User's profile picture
          style={{ width: 100, height: 100, borderRadius: 50, marginBottom: 10 }}
        />
        <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{user.name}</Text>
        <Text style={{ fontSize: 16, color: '#777' }}>{user.email}</Text>
      </View>

      {/* Settings Options */}
      <View style={{ width: '100%' }}>
        <TouchableOpacity 
          onPress={() => { /* Navigate to some other setting option */ }}
          style={{
            padding: 15,
            backgroundColor: '#ddd',
            borderRadius: 5,
            marginBottom: 10,
          }}
        >
          <Text style={{ fontSize: 16 }}>Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => { /* Navigate to notifications setting */ }}
          style={{
            padding: 15,
            backgroundColor: '#ddd',
            borderRadius: 5,
            marginBottom: 10,
          }}
        >
          <Text style={{ fontSize: 16 }}>Notifications</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => { /* Navigate to privacy settings */ }}
          style={{
            padding: 15,
            backgroundColor: '#ddd',
            borderRadius: 5,
            marginBottom: 10,
          }}
        >
          <Text style={{ fontSize: 16 }}>Privacy Settings</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={handleLogout} 
          style={{
            padding: 15,
            backgroundColor: '#f00', // Red background color for logout
            borderRadius: 5,
            marginTop: 20,
          }}
        >
          <Text style={{ color: '#fff', fontSize: 16 }}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
