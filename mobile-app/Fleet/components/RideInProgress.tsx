import type React from "react"
import { useState, useEffect } from "react"
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

interface RideInProgressProps {
  rideID: string
  token: string
  onRideFinished: () => void
}

const RideInProgress: React.FC<RideInProgressProps> = ({ rideID, token, onRideFinished }) => {
  const [rideDetails, setRideDetails] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRideDetails = async () => {
      try {
        const response = await fetch(`http://10.0.2.2:5000/api/rides/rides/${rideID}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch ride details")
        }

        const data = await response.json()
        setRideDetails(data)
      } catch (err) {
        setError("Error fetching ride details")
        console.error("Error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchRideDetails()
  }, [rideID, token])

  const handleFinishRide = async () => {
    try {
      const response = await fetch(`http://10.0.2.2:5000/api/rides/rides/${rideID}/finish`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to finish the ride")
      }

      const data = await response.json()
      console.log("Ride finished:", data.ride)
      onRideFinished()
    } catch (err) {
      console.error("Error finishing the ride:", err)
      Alert.alert("Error", "Unable to finish the ride")
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#39c9c2" />
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Current Ride</Text>
        </View>
        {rideDetails && (
          <>
            <View style={styles.rideInfo}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Ride ID</Text>
                <Text style={styles.infoText}>{rideDetails._id}</Text>
              </View>
              <View style={styles.separator} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Start Location</Text>
                <Text style={styles.infoText}>{rideDetails.start}</Text>
              </View>
              <View style={styles.separator} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>End Location</Text>
                <Text style={styles.infoText}>{rideDetails.end}</Text>
              </View>
              <View style={styles.separator} />
              <View style={styles.fareContainer}>
                <Text style={styles.fareLabel}>Current Fare</Text>
                <Text style={styles.fareText}>${rideDetails.fare}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.finishButton} onPress={handleFinishRide} activeOpacity={0.8}>
              <Text style={styles.finishButtonText}>End Ride</Text>
            </TouchableOpacity>
          </>
        )}
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
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  headerText: {
    fontSize: 28,
    fontWeight: "600",
    color: "#173252",
  },
  rideInfo: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  infoRow: {
    marginVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: "#6d6d6d",
    marginBottom: 4,
  },
  infoText: {
    fontSize: 16,
    color: "#173252",
    fontWeight: "500",
  },
  separator: {
    height: 1,
    backgroundColor: "#f6f7f9",
    marginVertical: 8,
  },
  fareContainer: {
    marginTop: 8,
  },
  fareLabel: {
    fontSize: 14,
    color: "#6d6d6d",
    marginBottom: 4,
  },
  fareText: {
    fontSize: 24,
    fontWeight: "600",
    color: "#39c9c2",
  },
  finishButton: {
    backgroundColor: "#39c9c2",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  finishButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f6f7f9",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f6f7f9",
  },
  errorText: {
    fontSize: 16,
    color: "#ff4444",
    textAlign: "center",
  },
})

export default RideInProgress

