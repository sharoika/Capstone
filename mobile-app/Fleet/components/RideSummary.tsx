import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import Geocoder from 'react-native-geocoding';

const { width, height } = Dimensions.get('window');
const apiUrl = Constants.expoConfig?.extra?.API_URL;
const GOOGLE_API_KEY = 'AIzaSyBkmAjYL9HmHSBtxxI0j3LB1tYEwoCnZXg';
Geocoder.init(GOOGLE_API_KEY);

interface RideFinishedStepProps {
  onReturnHome: () => void;
  rideID: string;
  token: string;
}

const RideFinishedStep: React.FC<RideFinishedStepProps> = ({ rideID, token,  onReturnHome}) => {
  const [rideDetails, setRideDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startAddress, setStartAddress] = useState<string | null>(null);
  const [endAddress, setEndAddress] = useState<string | null>(null);
  const scaleValue = new Animated.Value(1);

  useEffect(() => {
    const fetchRideDetails = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/ride/rides/${rideID}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch ride details");
        }

        const data = await response.json();
        setRideDetails(data);

        if (data.start?.coordinates && data.end?.coordinates) {
          convertCoordinatesToAddress(data.start.coordinates, setStartAddress);
          convertCoordinatesToAddress(data.end.coordinates, setEndAddress);
        }
      } catch (err) {
        setError("Error fetching ride details");
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRideDetails();
  }, [rideID, token]);

  const convertCoordinatesToAddress = async (coords: number[], setAddress: (address: string | null) => void) => {
    try {
      const { latitude, longitude } = { latitude: coords[1], longitude: coords[0] };
      const response = await Geocoder.from(latitude, longitude);
      const address = response.results[0]?.formatted_address || "Address not found";
      setAddress(address);
    } catch (error) {
      console.error("Error converting coordinates:", error);
      setAddress("Address not available");
    }
  };

  const onPressIn = () => {
    Animated.spring(scaleValue, { toValue: 0.95, useNativeDriver: true }).start();
  };

  const onPressOut = () => {
    Animated.spring(scaleValue, { toValue: 1, useNativeDriver: true }).start();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.View style={[styles.overlayContainer, { transform: [{ scale: scaleValue }] }]}> 
        <View style={styles.card}>
          {error ? (
            <Text>{error}</Text>
          ) : (
            <>
              <Text style={styles.headerText}>Ride Completed!</Text>
              <Text style={styles.infoText}>From: {startAddress || "Loading..."}</Text>
              <Text style={styles.infoText}>To: {endAddress || "Loading..."}</Text>

              <TouchableOpacity
                style={styles.returnButton}
                onPress={onReturnHome}
              >
                <Text style={styles.returnButtonText}>Return to Home</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f6f7f9",
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: width * 0.8,
    height: height * 0.4,
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
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  returnButton: {
    backgroundColor: "#173252",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    width: '80%',
  },
  returnButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default RideFinishedStep;
