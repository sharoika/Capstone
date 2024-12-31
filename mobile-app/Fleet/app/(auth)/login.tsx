// app/(auth)/login.tsx
import React, { useState } from 'react';
import { View, Text, Button, TextInput, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    // Basic validation
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    try {
      console.log('Email:', email, 'Password:', password);
      const response = await axios.post(`http://ridefleet.ca/api/auth/login`, {
        username: email,
        password: password,
      });

      console.log(response.data);
      const { token, message } = response.data;

      if (token) {
        // Save token to localStorage or SecureStore if needed
        Alert.alert('Success', message);

        // Navigate to home screen
        
      } else {
        Alert.alert('Error', 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Error during login:', error);
      Alert.alert('Error', 'Invalid email or password.');
    }
    router.push('/(tabs)/home');
  };

  const handleRegister = () => {
    router.push('/(auth)/register'); // Navigate to the register screen
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Login" onPress={handleLogin} />
      <View style={styles.registerContainer}>
        <Text style={styles.registerText}>Don't have an account?</Text>
        <Button title="Register" onPress={handleRegister} />
      </View>
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
  registerContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  registerText: {
    fontSize: 16,
    marginBottom: 10,
  },
});
