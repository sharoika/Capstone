import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { StripeProvider } from '@stripe/stripe-react-native';
import * as Location from 'expo-location';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

export default function MainLayout() {
  const [userType, setUserType] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();
  const apiUrl = Constants.expoConfig?.extra?.API_URL;

  useEffect(() => {
    const fetchUserData = async () => {
      const type = await SecureStore.getItemAsync("userType");
      setUserType(type);

      let userToken = null;
      let storedUserId = null;
      if (type === 'driver') {
        userToken = await SecureStore.getItemAsync("driverToken");
        storedUserId = await SecureStore.getItemAsync("driverID");
      } else {
        userToken = await SecureStore.getItemAsync("userToken");
        storedUserId = await SecureStore.getItemAsync("userObjectId");
      }
      setToken(userToken);
      setUserId(storedUserId);

      // Set isLoggedIn state once data is fetched
      if (userToken && storedUserId) {
        setIsLoggedIn(true);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/(auth)/login');
    }
  }, [isLoggedIn, router]);

  useEffect(() => {
    const sendLocationToBackend = async (lat: number, long: number) => {
      if (!userType || !token || !userId) return;
      const payload = {
        userId,
        userType,
        lat,
        long,
        timestamp: new Date().toISOString(),
      };
      try {
        const response = await fetch(`${apiUrl}/api/location/location/update`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json();
        console.log('Location update response:', data);
      } catch (error) {
        console.error('Error sending location:', error);
      }
    };

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
          sendLocationToBackend(location.coords.latitude, location.coords.longitude);
        }
      } catch (error) {
        console.log("Error getting location:", error);
      }
    };

    const interval = setInterval(() => {
      getLocation();
    }, 50000);

    return () => clearInterval(interval);
  }, [userType, token, userId]);

  return (
    <StripeProvider
      publishableKey={"pk_test_51QtMoYJyF40wM9B0Se1fgklXHRop2iczcT3HjYwnp8sJ6Si5MJaPzNHjlm06TXbPLR23RJZYFKA1XvQoy7HQFcfE00IXRjG8RP"}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(pages)" options={{ headerShown: false }} />
      </Stack>
    </StripeProvider>
  );
}
