import React, { useState, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './home';
import ProfileScreen from './settings';
import DriverHomeScreen from './driverHome';
import DriverProfileScreen from './settingsDriver';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { View, Text, ActivityIndicator } from 'react-native';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const [userType, setUserType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserType = async () => {
      const type = await SecureStore.getItemAsync("userType");
      setUserType(type);
      setLoading(false); 
    };

    fetchUserType();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName = '';

          if (route.name === 'Home') {
            iconName = 'home-outline'; 
          } else if (route.name === 'Profile') {
            iconName = 'person-outline'; 
          } else if (route.name === 'Driver Home') {
            iconName = 'car-outline';
          } else if (route.name === 'Driver Profile') {
            iconName = 'person-circle-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      {userType === "driver" && (
        <>
          <Tab.Screen name="Driver Home" component={DriverHomeScreen} />
          <Tab.Screen name="Driver Profile" component={DriverProfileScreen} />
        </>
      )}
      {userType === "rider" && (
        <>
          <Tab.Screen name="Home" component={HomeScreen} />
          <Tab.Screen name="Profile" component={ProfileScreen} />
        </>
      )}
    </Tab.Navigator>
  );
};

export default TabNavigator;
