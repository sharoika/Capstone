// app/(auth)/_layout.tsx
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen name="login" options={{ headerShown: false }}/>
      <Stack.Screen name="register" options={{ headerShown: false }}/>
      <Stack.Screen name="driverLogin" options={{ headerShown: false }}/>
      <Stack.Screen name="driverRegister" options={{ headerShown: false }}/>
    </Stack>
  );
}
