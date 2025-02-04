import type React from "react"
import { View, Text, TouchableOpacity, StyleSheet } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

interface RideSummaryProps {
  rideDetails: any
  onReturnHome: () => void
}

const RideSummary: React.FC<RideSummaryProps> = ({ rideDetails, onReturnHome }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.headerText}>Ride Summary</Text>
        {rideDetails ? (
          <View style={styles.summaryCard}>
            <View style={styles.infoSection}>
              <Text style={styles.infoLabel}>Ride ID</Text>
              <Text style={styles.infoText}>{rideDetails._id}</Text>
            </View>

            <View style={styles.infoSection}>
              <Text style={styles.infoLabel}>Start Location</Text>
              <Text style={styles.infoText}>{rideDetails.start}</Text>
            </View>

            <View style={styles.infoSection}>
              <Text style={styles.infoLabel}>End Location</Text>
              <Text style={styles.infoText}>{rideDetails.end}</Text>
            </View>

            <View style={styles.infoSection}>
              <Text style={styles.infoLabel}>Distance</Text>
              <Text style={styles.infoText}>{rideDetails.distance} km</Text>
            </View>

            <View style={styles.infoSection}>
              <Text style={styles.infoLabel}>Total Fare</Text>
              <Text style={styles.fareText}>${rideDetails.fare}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.summaryCard}>
            <Text style={styles.noDataText}>No ride details available</Text>
          </View>
        )}

        <TouchableOpacity style={styles.returnButton} onPress={onReturnHome} activeOpacity={0.8}>
          <Text style={styles.returnButtonText}>Return to Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

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
    color: "#39c9c2",
  },
  noDataText: {
    fontSize: 14,
    color: "#6d6d6d",
    textAlign: "center",
  },
  returnButton: {
    backgroundColor: "#39c9c2",
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
})

export default RideSummary

