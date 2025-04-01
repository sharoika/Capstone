import React, { useState, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './home';
import ProfileScreen from './settings';
import DriverHomeScreen from './driverHome';
import DriverProfileScreen from './settingsDriver';
import ReceiptsScreen from './receipts';
import PaymentSettingsScreen from '../(pages)/paymentSettings';
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
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home-outline';

          if (route.name === 'Ride') {
            iconName = 'car-outline';
          } else if (route.name === 'Profile') {
            iconName = 'person-outline'; 
          } else if (route.name === 'Drive') {
            iconName = 'car-outline';
          } else if (route.name === 'Driver Profile') {
            iconName = 'person-circle-outline';
          } else if (route.name === 'History') {
            iconName = 'receipt-outline';
          }
          const iconColor = (route.name === "Ride" || route.name === "Drive") ? "white" : color;

          return <Ionicons name={iconName} size={size} color={iconColor} />;
        },
        tabBarStyle: {
          borderTopWidth: 0,
          height: 70,
        },
        tabBarItemStyle: {
          justifyContent: "flex-end",
          alignItems: "center",
          paddingTop: 8, 
        },
        tabBarLabelStyle: {
          fontSize: 12,
        },
      })}
    >
      {userType === "driver" && (
        <>
              <Tab.Screen name="History" component={ReceiptsScreen} />
       <Tab.Screen name="Drive" component={DriverHomeScreen}         options={{
             tabBarItemStyle: { backgroundColor: '#4A90E2', borderRadius: 10,   paddingTop: 8,  },
             tabBarLabelStyle: { color: "white" ,  fontSize: 12, },
        }} />

      <Tab.Screen name="Profile" component={DriverProfileScreen} />
        </>
      )}
      {userType === "rider" && (
        <>
          <Tab.Screen name="History" component={ReceiptsScreen} />
         
          <Tab.Screen name="Ride" component={HomeScreen}            options={{
          tabBarItemStyle: { backgroundColor: '#4A90E2', borderRadius: 10,   paddingTop: 8,  },
          tabBarLabelStyle: { color: "white" ,  fontSize: 12, },
        }}
       
            />
           <Tab.Screen name="Profile" component={ProfileScreen} />
        </>
      )}
    </Tab.Navigator>
  );
};

export default TabNavigator;
