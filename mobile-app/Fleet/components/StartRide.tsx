import type React from "react"
import { useState, useEffect, useRef } from "react"
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import MapView, { Marker, Polyline } from 'react-native-maps';
import Geocoder from 'react-native-geocoding';
import Constants from 'expo-constants';

const apiUrl = Constants.expoConfig?.extra?.API_URL;
interface StartRideProps {
  rideID: string
  token: string
  onRideStarted: () => void
}

const StartRide: React.FC<StartRideProps> = ({ rideID, token, onRideStarted }) => {
  const [rideDetails, setRideDetails] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [region, setRegion] = useState<any>(null);
  const mapRef = useRef<MapView | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<{ latitude: number; longitude: number }[]>([]);

  useEffect(() => {
    const fetchCoordinates = async () => {
      if (!rideDetails?.start || !rideDetails?.end) return;
  
      try {
        const startResponse = await Geocoder.from(rideDetails.start);
        const endResponse = await Geocoder.from(rideDetails.end);
  
        const startLocation = startResponse.results[0].geometry.location;
        const endLocation = endResponse.results[0].geometry.location;
  
        const newCoordinates = [
          { latitude: startLocation.lat, longitude: startLocation.lng },
          { latitude: endLocation.lat, longitude: endLocation.lng },
        ];
  
        setRouteCoordinates(newCoordinates);
        setRegion({
          latitude: startLocation.lat,
          longitude: startLocation.lng,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
  
      } catch (error) {
        console.error("Error geocoding addresses:", error);
        Alert.alert("Error", "Failed to retrieve route coordinates.");
      }
    };
  
    fetchCoordinates();
  }, [rideDetails]);

  useEffect(() => {
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
      } catch (err) {
        setError("Error fetching ride details")
        console.error("Error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchRideDetails()
  }, [rideID, token])

  const GOOGLE_API_KEY = 'AIzaSyBkmAjYL9HmHSBtxxI0j3LB1tYEwoCnZXg'; 
  useEffect(() => {
    (async () => {
      try {
        const response = await fetch(
          `https://www.googleapis.com/geolocation/v1/geolocate?key=${GOOGLE_API_KEY}`,
          { method: 'POST' }
        );
        
        if (response.ok) {
          const data = await response.json();
          const { location } = data;
          
          if (location && location.lat != null && location.lng != null) {
            setLocation({ latitude: location.lat, longitude: location.lng });
          } else {
            Alert.alert('Error', 'Location data is invalid or missing.');
          }
        } else {
          Alert.alert('Error', 'Failed to fetch location.');
        }
      } catch (error) {
        console.error('Error fetching location:', error);
        Alert.alert('Error', 'An error occurred while fetching location.');
      }
    })();
  }, []);

  useEffect(() => {
    if (routeCoordinates.length > 0) {
      setRegion({
        latitude: routeCoordinates[0].latitude,
        longitude: routeCoordinates[0].longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  }, [routeCoordinates]);

  const handleStartRide = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/ride/rides/${rideID}/start`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to start the ride")
      }

      const data = await response.json()
      console.log("Ride started:", data.ride)
      onRideStarted()
      Alert.alert("Success", "Ride started successfully")
    } catch (err) {
      console.error("Error starting the ride:", err)
      Alert.alert("Error", "Unable to start the ride")
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
        <Text style={styles.headerText}>Driver is Enroute</Text>
        <Text style={styles.infoText}>When driver arrives press start ride</Text>
        {rideDetails && (
          <View style={styles.rideInfoCard}>
            <View style={styles.infoSection}>
              <Text style={styles.infoLabel}>Ride ID</Text>
              <Text style={styles.infoText}>{rideDetails.rideID}</Text>
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
              <Text style={styles.infoLabel}>Fare</Text>
              <Text style={styles.fareText}>${rideDetails.fare}</Text>
            </View>

            <View style={styles.statusSection}>
              <Text style={styles.infoLabel}>Ride Status</Text>
              <View style={styles.statusRow}>
                <Text style={styles.statusText}>Booked</Text>
                <View style={[styles.statusIndicator, rideDetails.rideBooked && styles.statusActive]} />
              </View>
              <View style={styles.statusRow}>
                <Text style={styles.statusText}>In Progress</Text>
                <View style={[styles.statusIndicator, rideDetails.rideInProgress && styles.statusActive]} />
              </View>
              <View style={styles.statusRow}>
                <Text style={styles.statusText}>Finished</Text>
                <View style={[styles.statusIndicator, rideDetails.rideFinished && styles.statusActive]} />
              </View>
            </View>

            {location ? (
        <MapView
          ref={mapRef}
          style={styles.map}
          region={region}
          onRegionChangeComplete={setRegion}
        >
          {routeCoordinates.length > 0 && (
            <Polyline
              coordinates={routeCoordinates}
              strokeWidth={4}
              strokeColor="#00f"
            />
          )}
<Marker
  coordinate={{
    latitude: location.latitude,
    longitude: location.longitude,
  }}
  title="Your Location"
  description="This is your current location"
>
  <View
    style={{
      width: 40,
      height: 40,
      backgroundColor: 'blue',
      borderRadius: 20,
      borderWidth: 2,
      borderColor: 'white',
    }}
  />
</Marker>
        </MapView>
      ) : (
        <Text>Loading map...</Text>
      )}
            {rideDetails.rider && (
              <View style={styles.infoSection}>
                <Text style={styles.infoLabel}>Rider</Text>
                <Text style={styles.infoText}>{rideDetails.rider.firstName}</Text>
              </View>
            )}
          </View>
        )}
        <TouchableOpacity style={styles.startButton} onPress={handleStartRide} activeOpacity={0.8}>
          <Text style={styles.startButtonText}>Start Ride</Text>
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
  map: {
    width: "100%",
    height: 200,
    borderRadius: 10
  },
  rideInfoCard: {
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
  statusSection: {
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  statusText: {
    fontSize: 14,
    color: "#173252",
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#d9d9d9",
  },
  statusActive: {
    backgroundColor: "#39c9c2",
  },
  startButton: {
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
  startButtonText: {
    color: "#ffffff",
    fontSize: 16,
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
    padding: 12,
    backgroundColor: "#f6f7f9",
  },
  errorText: {
    fontSize: 14,
    color: "#ff4444",
    textAlign: "center",
  },
})

export default StartRide

