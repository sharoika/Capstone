// app/_layout.tsx
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { StripeProvider } from '@stripe/stripe-react-native';

export default function MainLayout() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);  // Change this based on your auth logic
  const router = useRouter();

  useEffect(() => {
    // Simulate an authentication check or check the actual auth status
    if (!isLoggedIn) {
      router.push('/(auth)/login');  // Navigate to login if not logged in
    }
  }, [isLoggedIn, router]);

  return (
    <StripeProvider
      publishableKey={"pk_test_51QtMoYJyF40wM9B0Se1fgklXHRop2iczcT3HjYwnp8sJ6Si5MJaPzNHjlm06TXbPLR23RJZYFKA1XvQoy7HQFcfE00IXRjG8RP"}>
      <Stack screenOptions={{ headerShown: false }}>  {/* Disable header for this layout */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(pages)" options={{ headerShown: false }} />
      </Stack>
    </StripeProvider>
  );
}
