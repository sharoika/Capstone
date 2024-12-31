// app/(auth)/register.tsx
import React, { useState } from 'react';
import { View, Text, Button, TextInput, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';

export default function RegisterScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
  });

  const handleInputChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleRegister = async () => {
    const { first_name, last_name, email, password, phone, address } = formData;

    // Basic validation
    if (!first_name || !last_name || !email || !password) {
      Alert.alert('Error', 'Please fill out all required fields.');
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name,
          last_name,
          email,
          password,
          phone,
          address,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'An error occurred while registering.');
      }

      const responseData = await response.json();
      Alert.alert('Success', responseData.message);
      router.push('/(auth)/login'); // Navigate to login screen after successful registration
    } catch (error) {
      console.error('Error during registration:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      <TextInput
        style={styles.input}
        placeholder="First Name"
        value={formData.first_name}
        onChangeText={(value) => handleInputChange('first_name', value)}
      />
      <TextInput
        style={styles.input}
        placeholder="Last Name"
        value={formData.last_name}
        onChangeText={(value) => handleInputChange('last_name', value)}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={formData.email}
        onChangeText={(value) => handleInputChange('email', value)}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={formData.password}
        onChangeText={(value) => handleInputChange('password', value)}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="Phone (optional)"
        value={formData.phone}
        onChangeText={(value) => handleInputChange('phone', value)}
        keyboardType="phone-pad"
      />
      <TextInput
        style={styles.input}
        placeholder="Address (optional)"
        value={formData.address}
        onChangeText={(value) => handleInputChange('address', value)}
      />
      <Button title="Register" onPress={handleRegister} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
    width: '100%',
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
});
