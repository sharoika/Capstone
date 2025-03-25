import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Animated, Dimensions } from 'react-native';
import Constants from 'expo-constants';
import MapView from 'react-native-maps';

const apiUrl = Constants.expoConfig?.extra?.API_URL;
interface WaitingForConfirmationProps {
  rideID: string;
  token: string;
  onConfirmed: () => void;
}
const { width, height } = Dimensions.get('window');
const WaitingForConfirmation: React.FC<WaitingForConfirmationProps> = ({ rideID, token, onConfirmed }) => {
  const [status, setStatus] = useState<string>('selected');
  const [loading, setLoading] = useState(true);
  const fadeAnim = new Animated.Value(0);
  
  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  useEffect(() => {

    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();


    const checkRideStatus = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/ride/rides/${rideID}/status`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        setStatus(data.status);

        if (data.status === 'accepted') {
          setLoading(false);
          onConfirmed(); 
        }
      } catch (error) {
        console.error("Error checking ride status:", error);
      }
    };

    const interval = setInterval(checkRideStatus, 3000); 

    return () => clearInterval(interval);
  }, [rideID, token, onConfirmed]);


  return (
    <View style={styles.container}>
      <MapView
        style={StyleSheet.absoluteFillObject}
        region={region}
        onRegionChangeComplete={setRegion}
      >
      </MapView>

      <View style={styles.overlayContainer}>
        <View style={styles.card}>
        <Text style={styles.text}>
            {loading ? "Waiting for driver confirmation..." : "Ride Confirmed!"}
          </Text>
        <Animated.View style={ { opacity: fadeAnim }}>
                  {loading && (
            <View style={{ transform: [{ scale: 2.4 }] }}>
            <ActivityIndicator size="large" color="#4A90E2" />
          </View>
          )}

        </Animated.View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {    ...StyleSheet.absoluteFillObject, 
    flex: 1,
    margin: 0,
    padding: 0,},
  text: {
    fontSize: 20,
    color: '#8EC3FF',
    marginBottom: 20,
    textAlign: 'center',
    padding: 24,
  },
  confirmedText: {
    fontSize: 22,
    color: '#4A90E2',
    fontWeight: 'bold',
    marginTop: 20,
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: width * 0.8,    
    height: height * 0.8, 
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    justifyContent: 'center',  
    alignItems: 'center',
  },
  details: {
    marginTop: 10,
  },
});

export default WaitingForConfirmation;
