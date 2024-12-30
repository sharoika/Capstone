// app/(tabs)/settings.tsx
import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';

export default function Settings() {
  const router = useRouter();

  // Handle logout logic
  const handleLogout = () => {
    // Perform your logout logic here (e.g., clearing authentication tokens)
    // After logging out, navigate the user to the login screen
    router.push('/(auth)/login'); // Redirect to login screen
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Welcome to settings screen!</Text>
      
      {/* Logout button */}
      <TouchableOpacity 
        onPress={handleLogout} 
        style={{
          padding: 10,
          backgroundColor: '#f00', // Red background color for logout
          borderRadius: 5,
          marginTop: 20,
        }}
      >
        <Text style={{ color: '#fff' }}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}
