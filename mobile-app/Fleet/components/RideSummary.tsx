import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import Receipt from './Receipt';

const apiUrl = Constants.expoConfig?.extra?.API_URL;
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
        
        // Check if the ride is completed, then try to fetch receipt
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
      <View style={styles.container}>
        <Text style={styles.headerText}>Ride Summary</Text>
        {loading ? (
          <Text>Loading...</Text>
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : rideDetails ? (
          <View style={styles.summaryCard}>
            <View style={styles.infoSection}>
              <Text style={styles.infoLabel}>Ride ID</Text>
              <Text style={styles.infoText}>{rideDetails.rideID}</Text>
            </View>
            <View style={styles.infoSection}>
              <Text style={styles.infoLabel}>Start Location</Text>
              <Text style={styles.infoText}></Text>
            </View>
            <View style={styles.infoSection}>
              <Text style={styles.infoLabel}>End Location</Text>
              <Text style={styles.infoText}></Text>
            </View>
            <View style={styles.infoSection}>
              <Text style={styles.infoLabel}>Distance</Text>
              <Text style={styles.infoText}>{rideDetails.distance} km</Text>
            </View>
            <View style={styles.infoSection}>
              <Text style={styles.infoLabel}>Total Fare</Text>
              <Text style={styles.fareText}>${rideDetails.fare}</Text>
            </View>
            
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
          </View>
        ) : (
          <Text style={styles.noDataText}>No ride details available</Text>
        )}

        <TouchableOpacity style={styles.returnButton} onPress={onReturnHome} activeOpacity={0.8}>
          <Text style={styles.returnButtonText}>Return to Home</Text>
        </TouchableOpacity>
      </View>
      
      <Modal
        animationType="slide"
        transparent={false}
        visible={receiptModalVisible}
        onRequestClose={closeReceiptModal}
      >
        {receipt && (
          <Receipt receipt={receipt} onClose={closeReceiptModal} />
        )}
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f6f7f9",
  },
  container: {
    flex: 1,
    padding: 12,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "600",
    color: "#173252",
    marginBottom: 12,
  },
  summaryCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoSection: {
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: "#6d6d6d",
    marginBottom: 2,
  },
  infoText: {
    fontSize: 14,
    color: "#173252",
    fontWeight: "500",
  },
  fareText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#4A90E2",
  },
  noDataText: {
    fontSize: 14,
    color: "#6d6d6d",
    textAlign: "center",
  },
  errorText: {
    fontSize: 14,
    color: "red",
    textAlign: "center",
  },
  returnButton: {
    backgroundColor: "#4A90E2",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  returnButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  receiptButton: {
    backgroundColor: "#173252",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  receiptButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
});

export default RideSummary;