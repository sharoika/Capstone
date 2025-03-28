import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal, Animated, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import Receipt from './Receipt';
import Geocoder from 'react-native-geocoding';
import MapView, { Marker } from "react-native-maps";
import { customMapStyle } from '../styles/customMapStyle'

const apiUrl = Constants.expoConfig?.extra?.API_URL;
const GOOGLE_API_KEY = 'AIzaSyBkmAjYL9HmHSBtxxI0j3LB1tYEwoCnZXg';

Geocoder.init(GOOGLE_API_KEY);
const { width, height } = Dimensions.get('window');

interface RideSummaryProps {
  rideID: string;
  token: string;
  onReturnHome: () => void;
}

const RideSummary: React.FC<RideSummaryProps> = ({ rideID, token, onReturnHome }) => {
  const [rideDetails, setRideDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<any>(null);
  const [receiptModalVisible, setReceiptModalVisible] = useState(false);
  const [loadingReceipt, setLoadingReceipt] = useState(false);
  const [startAddress, setStartAddress] = useState<string | null>(null);
  const [endAddress, setEndAddress] = useState<string | null>(null);
  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const fadeAnim = new Animated.Value(0);
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

        if (data.status === 'COMPLETED') {
          fetchReceipt();
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

  const fetchReceipt = async () => {
    setLoadingReceipt(true);
    try {
      const response = await fetch(`${apiUrl}/api/receipt/receipts/ride/${rideID}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setReceipt(data);
      } else {
        console.log("No receipt found for this ride");
      }
    } catch (err) {
      console.error("Error fetching receipt:", err);
    } finally {
      setLoadingReceipt(false);
    }
  };

  const viewReceipt = () => {
    setReceiptModalVisible(true);
  };

  const closeReceiptModal = () => {
    setReceiptModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <MapView
        style={StyleSheet.absoluteFillObject}
        region={region}
           customMapStyle={customMapStyle}
      >
      </MapView>

      <Animated.View style={[styles.overlayContainer]}>
        <View style={styles.card}>
          {error ? (
            <Text>{error}</Text>
          ) : (
            <>
              <Text style={styles.headerText}>Ride Summary</Text>
              <Text style={styles.infoText}>From: {startAddress || "Loading..."}</Text>
              <Text style={styles.infoText}>To: {endAddress || "Loading..."}</Text>
              <Text style={styles.infoText}>Distance: {rideDetails?.distance || 'N/A'} km</Text>
              <Text style={styles.fareText}>
                Fare: ${rideDetails?.fare ? (rideDetails.fare / 100).toFixed(2) : '0.00'}
              </Text>

              {receipt && (
                <TouchableOpacity
                  style={styles.receiptButton}
                  onPress={viewReceipt}
                  disabled={loadingReceipt}
                >
                  <Ionicons name="receipt-outline" size={20} color="#ffffff" />
                  <Text style={styles.receiptButtonText}>
                    {loadingReceipt ? "Loading Receipt..." : "View Receipt"}
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity style={styles.returnButton} onPress={onReturnHome}>
                <Text style={styles.returnButtonText}>Return to Home</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </Animated.View>

      <Modal
        animationType="slide"
        transparent={false}
        visible={receiptModalVisible}
        onRequestClose={closeReceiptModal}
      >
        {receipt && <Receipt receipt={receipt} onClose={closeReceiptModal} />}
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f6f7f9",
    ...StyleSheet.absoluteFillObject,
  },
  overlayContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    ...StyleSheet.absoluteFillObject,
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
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    marginBottom: 8,
  },
  fareText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#4A90E2",
    marginBottom: 12,
  },
  receiptButton: {
    backgroundColor: "#4A90E2",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  receiptButtonText: {
    color: "#fff",
  },
  returnButton: {
    backgroundColor: "#173252",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
  },
  returnButtonText: {
    color: "#fff",
  },
});

export default RideSummary;
