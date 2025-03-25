import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';

const apiUrl = Constants.expoConfig?.extra?.API_URL;

const saveToStorage = async (key: string, value: string) => {
  if (Platform.OS === 'web') {
    await AsyncStorage.setItem(key, value);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
};

export default function DriverLoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    try {
      const response = await axios.post(`${apiUrl}/api/auth/driver/login`, {
        email,
        password,
      });
      console.log(response.data);
      const { token, driver, message } = response.data;
      if (token && driver.id) {
        console.log("Token received:", token);
        await saveToStorage('driverToken', token);
        await saveToStorage('driverID', driver.id);
        await saveToStorage('userType', 'driver');
        router.push('/(tabs)/driverHome');
      } else {
        Alert.alert('Error', 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Error during login:', error);
      Alert.alert('Error', 'Invalid email or password.');
    }
  };

  const handleRegister = () => {
    router.push('/(auth)/driverRegister');
  };


  const handleBackToRiderLogin = () => {
    router.push('/(auth)/login');
  };
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require('../../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#8E8E93"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#8E8E93"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={[styles.button, styles.nextButton]} onPress={handleLogin}>
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.loginText}>Don't have an account?</Text>
          <TouchableOpacity onPress={handleRegister}>
            <Text style={styles.loginLink}>Register As A Driver</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.backToRiderButton]} onPress={handleBackToRiderLogin}>
            <Text style={styles.buttonText}>Back to Rider Login</Text>
          </TouchableOpacity>
        </View>
      </View>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
    padding: 24
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 24
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 20
  },
  logo: {
    width: 196,
    height: 144
  },
  formContainer: {
    width: '100%',
    marginBottom: 20
  },
  input: {
    height: 48,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 16,
    color: '#000000'
  },
  buttonContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  button: {
    width: '100%',
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  nextButton: {
    backgroundColor: '#4A90E2',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600'
  },
  footer: {
    marginTop: 48,
    alignItems: 'center',
    paddingBottom: 32
  },
  loginText: {
    fontSize: 14,
    color: '#6D6D6D',
    marginBottom: 8
  },
  backToRiderButton: { 
    marginTop: 12,
    backgroundColor: '#8EC3FF',  
  },
  loginLink: {
    fontSize: 16,
    color: '#4A90E2',
    fontWeight: '600'
  }
});