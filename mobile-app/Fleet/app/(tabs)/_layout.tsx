// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import React from 'react';

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="home" options={{ headerShown: false }}/>
      <Tabs.Screen name="settings" options={{ headerShown: false }}/>
    </Tabs>
  );
}
