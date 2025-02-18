import type React from "react"
import { useState, useEffect, useRef } from "react"
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import MapView, { Marker, Polyline } from 'react-native-maps'
import Geocoder from 'react-native-geocoding'
import Constants from 'expo-constants';

const apiUrl = Constants.expoConfig?.extra?.API_URL;
interface RideInProgressProps {
  rideID: string
  token: string
  onRideFinished: () => void
}

const RideInProgress: React.FC<RideInProgressProps> = ({ rideID, token, onRideFinished }) => {
  const [rideDetails, setRideDetails] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [routeCoordinates, setRouteCoordinates] = useState<{ latitude: number; longitude: number }[]>([])
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null)
  
  const mapRef = useRef<MapView>(null)
  const GOOGLE_API_KEY = 'AIzaSyBkmAjYL9HmHSBtxxI0j3LB1tYEwoCnZXg'

  useEffect(() => {
    Geocoder.init(GOOGLE_API_KEY)
    fetchRideDetails()
    const interval = setInterval(fetchRideDetails, 10000) // Update every 10 seconds
    return () => clearInterval(interval)
  }, [rideID, token])

  const fetchRideDetails = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/ride/rides/${rideID}`, {
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
      await updateMapRoute(data.start, data.end)
    } catch (err) {
      setError("Error fetching ride details")
      console.error("Error:", err)
    } finally {
      setLoading(false)
    }
  }

  const updateMapRoute = async (start: string, end: string) => {
    try {
      // Convert addresses to coordinates
      const startCoords = (await Geocoder.from(start)).results[0].geometry.location
      const endCoords = (await Geocoder.from(end)).results[0].geometry.location

      // Fetch route from Google Directions API
      const directionsResponse = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${startCoords.lat},${startCoords.lng}&destination=${endCoords.lat},${endCoords.lng}&key=${GOOGLE_API_KEY}`
      )

      const directionsData = await directionsResponse.json()

      if (directionsData.routes.length) {
        const points = decodePolyline(directionsData.routes[0].overview_polyline.points)
        setRouteCoordinates(points)

        // Set initial map region to show the entire route
        const region = {
          latitude: (startCoords.lat + endCoords.lat) / 2,
          longitude: (startCoords.lng + endCoords.lng) / 2,
          latitudeDelta: Math.abs(startCoords.lat - endCoords.lat) * 1.5,
          longitudeDelta: Math.abs(startCoords.lng - endCoords.lng) * 1.5,
        }
        mapRef.current?.animateToRegion(region)
      }
    } catch (error) {
      console.error('Error updating map route:', error)
    }
  }

  const decodePolyline = (t: string) => {
    let points = []
    let index = 0, len = t.length
    let lat = 0, lng = 0

    while (index < len) {
      let b, shift = 0, result = 0
      do {
        b = t.charCodeAt(index++) - 63
        result |= (b & 0x1f) << shift
        shift += 5
      } while (b >= 0x20)
      let dlat = result & 1 ? ~(result >> 1) : result >> 1
      lat += dlat

      shift = 0
      result = 0
      do {
        b = t.charCodeAt(index++) - 63
        result |= (b & 0x1f) << shift
        shift += 5
      } while (b >= 0x20)
      let dlng = result & 1 ? ~(result >> 1) : result >> 1
      lng += dlng

      points.push({ latitude: lat / 1e5, longitude: lng / 1e5 })
    }
    return points
  }

  const handleFinishRide = async () => {
    try {
      const response = await fetch(`${process.env.API_URL}/api/ride/rides/${rideID}/finish`, {
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

        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            style={styles.map}
            showsUserLocation={true}
            followsUserLocation={true}
          >
            {routeCoordinates.length > 0 && (
              <Polyline
                coordinates={routeCoordinates}
                strokeWidth={4}
                strokeColor="#39c9c2"
              />
            )}
            {rideDetails && (
              <>
                <Marker
                  coordinate={{
                    latitude: routeCoordinates[0]?.latitude || 0,
                    longitude: routeCoordinates[0]?.longitude || 0,
                  }}
                  title="Pickup"
                  description={rideDetails.start}
                />
                <Marker
                  coordinate={{
                    latitude: routeCoordinates[routeCoordinates.length - 1]?.latitude || 0,
                    longitude: routeCoordinates[routeCoordinates.length - 1]?.longitude || 0,
                  }}
                  title="Destination"
                  description={rideDetails.end}
                />
              </>
            )}
          </MapView>
        </View>

        {rideDetails && (
          <>
            <View style={styles.rideInfo}>
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
  mapContainer: {
    height: 300,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
})

export default RideInProgress

