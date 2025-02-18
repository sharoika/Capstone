// app/_layout.tsx
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';

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
    <Stack screenOptions={{ headerShown: false }}>  {/* Disable header for this layout */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(pages)" options={{ headerShown: false }} />
    </Stack>
  );
}
