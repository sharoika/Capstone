// app/(auth)/register.tsx
import { View, Text, Button } from 'react-native';
import React from 'react';

export default function RegisterScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Register Screen</Text>
      <Button title="Register" onPress={() => alert('Registering user...')} />
    </View>
  );
}
