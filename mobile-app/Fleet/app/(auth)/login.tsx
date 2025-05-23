import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Alert, Image, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const apiUrl = Constants.expoConfig?.extra?.API_URL;

const saveToStorage = async (key: string, value: string) => {
  if (Platform.OS === 'web') {
    await AsyncStorage.setItem(key, value);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
};

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }
    console.log("here");
    try {
      const response = await axios.post(`${apiUrl}/api/auth/rider/login`, {
        email,
        password,
      });
      const { token, user, message } = response.data;
      if (token && user?.id) {
        router.push('/(tabs)/home');
        console.log("token:  ",token);
        console.log("userId:  ",user.id);
        await Promise.all([
          saveToStorage('userToken', token),
          saveToStorage('userObjectId', user.id),
          saveToStorage('userType', "rider"),
        ]);
      } else {
        Alert.alert('Error', 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Error during login:', error);
      Alert.alert('Error', 'Invalid email or password.');
    }
  };

  const handleRegister = () => {
    router.push('/(auth)/register');
  };

  const handleDriverLogin = () => {
    router.push('/(auth)/driverLogin');
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
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

          <View >
            <TouchableOpacity style={[styles.button, styles.nextButton]} onPress={handleLogin}>
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.footer}>
          <Text style={styles.loginText}>Don't have an account?</Text>
          <TouchableOpacity onPress={handleRegister}>
            <Text style={styles.loginLink}>Register</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.backButton]} onPress={handleDriverLogin}>
            <Text style={styles.buttonText}>Driver Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#FFFFFF'
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
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#173252'
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
  buttonWrapper: {
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
  backButton: {
    marginTop: 12,
    backgroundColor: '#CCCCCC',
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
  loginLink: {
    fontSize: 16,
    color: '#4A90E2',
    fontWeight: '600'
  }
});
