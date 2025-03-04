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

  const updateMapRoute = async (start: { coordinates: [number, number] }, end: { coordinates: [number, number] }) => {
    try {
      // Convert addresses to coordinates
      const startCoords = start.coordinates; 
      const endCoords = end.coordinates;  
      // Fetch route from Google Directions API
      const directionsResponse = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${startCoords[1]},${startCoords[0]}&destination=${endCoords[1]},${endCoords[0]}&key=${GOOGLE_API_KEY}`
    );

      const directionsData = await directionsResponse.json()

      if (directionsData.routes.length) {
        const points = decodePolyline(directionsData.routes[0].overview_polyline.points)
        setRouteCoordinates(points)

        // Set initial map region to show the entire route
        const region = {
          latitude: (startCoords[1] + endCoords[1]) / 2,
          longitude: (startCoords[0] + endCoords[0]) / 2,
          latitudeDelta: Math.abs(startCoords[1] - endCoords[1]) * 1.5,
          longitudeDelta: Math.abs(startCoords[0] - endCoords[0]) * 1.5,
      };
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
      const response = await fetch(`${apiUrl}/api/ride/rides/${rideID}/finish`, {
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
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          showsUserLocation={true}
        >
          {routeCoordinates.length > 0 && (
            <Polyline
              coordinates={routeCoordinates}
              strokeColor="#39C9C2"
              strokeWidth={3}
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
               
              />
              <Marker
                coordinate={{
                  latitude: routeCoordinates[routeCoordinates.length - 1]?.latitude || 0,
                  longitude: routeCoordinates[routeCoordinates.length - 1]?.longitude || 0,
                }}
                title="Destination"
               
              />
            </>
          )}
        </MapView>
      </View>

      <View style={styles.detailsContainer}>
        <View style={styles.driverInfo}>
          <View style={styles.driverAvatar}>
            <Text style={styles.driverInitial}>
              {rideDetails?.driver?.firstName?.[0] || 'D'}
            </Text>
          </View>
          <View style={styles.driverDetails}>
            <Text style={styles.driverName}>
              {rideDetails?.driver?.firstName} {rideDetails?.driver?.lastName}
            </Text>
            <Text style={styles.vehicleInfo}>
              {rideDetails?.driver?.vehicleMake} {rideDetails?.driver?.vehicleModel}
            </Text>
          </View>
        </View>

        <View style={styles.locationContainer}>
          <View style={styles.locationItem}>
            <View style={[styles.dot, { backgroundColor: '#39C9C2' }]} />
            <Text style={styles.locationText} numberOfLines={1}></Text>
          </View>
          <View style={styles.locationItem}>
            <View style={[styles.dot, { backgroundColor: '#39C9C2' }]} />
            <Text style={styles.locationText} numberOfLines={1}></Text>
          </View>
        </View>

        <View style={styles.fareContainer}>
          <View style={styles.fareItem}>
            <Text style={styles.fareLabel}>Distance</Text>
            <Text style={styles.fareValue}>{rideDetails.distance?.toFixed(2)} km</Text>
          </View>
          <View style={styles.fareDivider} />
          <View style={styles.fareItem}>
            <Text style={styles.fareLabel}>Total Fare</Text>
            <Text style={styles.fareValue}>${rideDetails.fare?.toFixed(2)}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.endRideButton}
          onPress={handleFinishRide}
        >
          <Text style={styles.endRideButtonText}>End Ride</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  detailsContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  driverAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E8F7F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  driverInitial: {
    fontSize: 24,
    fontWeight: '600',
    color: '#39C9C2',
  },
  driverName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#173252',
    marginBottom: 4,
  },
  vehicleInfo: {
    fontSize: 14,
    color: '#666',
  },
  locationContainer: {
    marginBottom: 16,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  fareContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  fareItem: {
    flex: 1,
    alignItems: 'center',
  },
  fareDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E8F7F7',
    marginHorizontal: 10,
  },
  fareLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  fareValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#39C9C2',
  },
  endRideButton: {
    backgroundColor: '#39C9C2',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  endRideButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
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
