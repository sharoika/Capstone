import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Alert, Image, ScrollView, KeyboardAvoidingView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { ProgressBar } from 'react-native-paper'; 
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'; 
const apiUrl = Constants.expoConfig?.extra?.API_URL;
const GOOGLE_API_KEY = 'AIzaSyBkmAjYL9HmHSBtxxI0j3LB1tYEwoCnZXg'; 
export default function RegisterScreen() {
  const router = useRouter();
  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    homeLocation: '',
  });
  const [locationCoords, setLocationCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    const getLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }

     
      try {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        if (location.coords) {
          const newCoords = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };

          setLocationCoords(newCoords);
          setFormData((prevData) => ({
            ...prevData,
            homeLocation: `${newCoords.latitude}, ${newCoords.longitude}`,
          }));
          if (mapRef.current) {
            mapRef.current.animateToRegion({
              ...newCoords,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }, 1000);
          }
        }
      } catch (error) {
        console.log('Error getting location:', error);
      }
    };

    getLocation();
  }, []);

  const handleLocationSelect = (data: any, details: any | null) => {
    if (details && details.geometry && details.geometry.location) {
      const { lat, lng } = details.geometry.location;
      const newCoords = { latitude: lat, longitude: lng };
      
      setLocationCoords(newCoords);
      setFormData((prevData) => ({
        ...prevData,
        homeLocation: `${lat}, ${lng}`,
      }));

      if (mapRef.current) {
        mapRef.current.animateToRegion({
          ...newCoords,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }, 1000);
      }
    }
  };
  const handleInputChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const handleRegister = async () => {
    const { firstName, lastName, email, password, phone, homeLocation } = formData;

    if (!firstName || !lastName || !email || !password) {
      Alert.alert('Error', 'Please fill out all required fields.');
      return;
    }

    try {
      console.log(apiUrl);
      const response = await fetch(`${apiUrl}/api/auth/rider/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, phone, password, homeLocation }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'An error occurred while registering.');
      }
      Alert.alert('Success', 'Registration successful!', [
        { text: 'OK', onPress: () => router.push('/(auth)/login') }
      ]);
    } catch (error: any) {
      console.error('Error during registration:', error.message);
      Alert.alert('Error', error.message);
    }
  };


  return (
    <KeyboardAvoidingView 
    style={{ flex: 1 }}
  >
    
      <View style={styles.container}>
        <View style={styles.header}>
          <Image source={require('../../assets/images/logo.png')} style={styles.logo} resizeMode="contain" />
              </View>

        <ProgressBar progress={step / 5} color="#4A90E2" style={styles.progressBar} />

        {step === 1 && (
          <View style={styles.formContainer}>
            <TextInput
              style={styles.input}
              placeholder="First Name"
              placeholderTextColor="#8E8E93"
              value={formData.firstName}
              onChangeText={(value) => handleInputChange('firstName', value)}
            />
            <TextInput
              style={styles.input}
              placeholder="Last Name"
              placeholderTextColor="#8E8E93"
              value={formData.lastName}
              onChangeText={(value) => handleInputChange('lastName', value)}
            />
            <TouchableOpacity style={styles.nextButton} onPress={nextStep}>
              <Text style={styles.buttonText}>Next</Text>
            </TouchableOpacity>
          </View>
        )}
        {step === 2 && (
          <View style={styles.formContainer}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#8E8E93"
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#8E8E93"
              value={formData.password}
              onChangeText={(value) => handleInputChange('password', value)}
              secureTextEntry
            />
            <TextInput
              style={styles.input}
              placeholder="Phone (optional)"
              placeholderTextColor="#8E8E93"
              value={formData.phone}
              onChangeText={(value) => handleInputChange('phone', value)}
              keyboardType="phone-pad"
            />
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.backButton} onPress={prevStep}>
                <Text style={styles.buttonText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.nextButton} onPress={nextStep}>
                <Text style={styles.buttonText}>Next</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        {step === 3 && (
          <View style={styles.formContainer}>
            <GooglePlacesAutocomplete
              placeholder="Search for home location"
              onPress={handleLocationSelect}
              query={{
                key: GOOGLE_API_KEY,
                language: 'en',
              }}
              fetchDetails={true}
              styles={{
                container: { flex: 0 },
                textInput: styles.input,
              }}
            />
            {locationCoords && (
              
              <MapView
              ref={mapRef} 
                style={styles.map}
                initialRegion={{
                  latitude: locationCoords.latitude,
                  longitude: locationCoords.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
              >
                <Marker coordinate={locationCoords} title="Home Location" />
              </MapView>
            )}
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.backButton} onPress={prevStep}>
                <Text style={styles.buttonText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.nextButton} onPress={handleRegister}>
                <Text style={styles.buttonText}>Next</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}



        <View style={styles.footer}>
          <Text style={styles.loginText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.loginLink}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1 },
  container: { flex: 1, backgroundColor: '#FFFFFF', padding: 24 },
  header: { alignItems: 'center', marginTop: 60, marginBottom: 40 },
  logo: { width: 196, height: 144 },
  title: { fontSize: 28, fontWeight: '600', color: '#173252' },
  progressBar: { height: 8, borderRadius: 8, marginBottom: 20 },
  formContainer: { width: '100%' },
  input: { height: 48, backgroundColor: '#F5F5F5', borderRadius: 8, paddingHorizontal: 16, fontSize: 16, marginBottom: 16, color: '#000000' },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  nextButton: { backgroundColor: '#4A90E2', height: 48, borderRadius: 8, paddingHorizontal: 32, justifyContent: 'center', alignItems: 'center' },
  backButton: { backgroundColor: '#CCCCCC', height: 48, borderRadius: 8, paddingHorizontal: 32, justifyContent: 'center', alignItems: 'center' },
  registerButton: { backgroundColor: '#4A90E2', height: 48, borderRadius: 8, paddingHorizontal: 32, justifyContent: 'center', alignItems: 'center' },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  footer: { marginTop: 24, alignItems: 'center' },
  loginText: { fontSize: 14, color: '#6D6D6D', marginBottom: 8 },
  loginLink: { fontSize: 16, color: '#4A90E2', fontWeight: '600' },
  map: { width: '100%', height: 200, borderRadius: 8, marginTop: 16, marginBottom: 16, },
  actionButton: { backgroundColor: '#39C9C2', padding: 12, borderRadius: 8, alignItems: 'center' },
})

