// app/(auth)/login.tsx
import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const router = useRouter();

  const handleLogin = async () => {
    // Simulate login logic
    // Replace with actual login logic, and check for successful login
    router.push('/(tabs)/home');  // Navigate to home screen if login is successful
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Login Screen</Text>
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
}
