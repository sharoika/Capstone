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
  const [rideDetails, setRideDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [region, setRegion] = useState<any>(null);
  const mapRef = useRef<MapView | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<{ latitude: number; longitude: number }[]>([]);
  const [distance, setDistance] = useState<string>("");
  const [fare, setFare] = useState<number>(0);

  const GOOGLE_API_KEY = 'AIzaSyBkmAjYL9HmHSBtxxI0j3LB1tYEwoCnZXg'; 
  const decodePolyline = (encoded: string) => {
    let points = [];
    let index = 0, len = encoded.length;
    let lat = 0, lng = 0;
  
    while (index < len) {
      let b, shift = 0, result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlat = result & 1 ? ~(result >> 1) : result >> 1;
      lat += dlat;
  
      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlng = result & 1 ? ~(result >> 1) : result >> 1;
      lng += dlng;
  
      points.push({
        latitude: lat * 1e-5,
        longitude: lng * 1e-5
      });
    }
    return points;
  };

  useEffect(() => {
    const fetchCoordinates = async () => {
      try {
        if (!rideDetails?.start?.coordinates || !rideDetails?.driver?.currentLocation?.coordinates) {
          return;
        }
    
        const driverLocation = `${rideDetails.driver.currentLocation.coordinates[1]},${rideDetails.driver.currentLocation.coordinates[0]}`;
        const startLocation = `${rideDetails.start.coordinates[1]},${rideDetails.start.coordinates[0]}`;
        
        const directionsResponse = await fetch(
          `https://maps.googleapis.com/maps/api/directions/json?origin=${driverLocation}&destination=${startLocation}&key=${GOOGLE_API_KEY}`
        );
    
        const directionsData = await directionsResponse.json();
    
        if (directionsData.routes.length > 0) {
          const points = decodePolyline(directionsData.routes[0].overview_polyline.points);
          const distance = directionsData.routes[0].legs[0].distance.text;
          const distanceValue = directionsData.routes[0].legs[0].distance.value / 1000; // Convert to km
    
          setDistance(distance);
    
          const [driverLat, driverLng] = driverLocation.split(',').map(Number);
          const [startLat, startLng] = startLocation.split(',').map(Number);
    
          setRouteCoordinates(points);
          setRegion({
            latitude: driverLat, 
            longitude: driverLng, 
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          });
        }
      } catch (error) {
        console.error("Error getting route:", error);
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
        });

        if (!response.ok) {
          throw new Error("Failed to fetc");
        }

        const data = await response.json();
        console.log("Ride details:", data);

        if (data.start?.coordinates && data.end?.coordinates) {
          const startLocation = {
            latitude: data.start.coordinates[1],
            longitude: data.start.coordinates[0],
          };
          const driverLocation = {
            latitude: data.driver.currentLocation.coordinates[1],
            longitude: data.driver.currentLocation.coordinates[0],
          };
          setRouteCoordinates([driverLocation, startLocation]); 
          setRegion({
            latitude: driverLocation.latitude,
            longitude: driverLocation.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          });

          setDistance(`${data.distance} km`);
        }

        if (data.driver?.farePrice && data.driver?.baseFee && typeof data.distance === "number") {
          const baseFee = !isNaN(data.driver.baseFee) ? data.driver.baseFee : 2;
          const farePrice = !isNaN(data.driver.farePrice) ? data.driver.farePrice : 0;
          const distanceFare = data.distance * farePrice;
          const totalFare = parseFloat((baseFee + distanceFare).toFixed(2));
          console.log("Calculated fare:", totalFare);
          setFare(totalFare);
        }

        setRideDetails(data);
      } catch (err) {
        setError("Error fetching ride details");
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRideDetails();
  }, [rideID, token]);



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
        body: JSON.stringify({ fare }),
      });

      if (!response.ok) {
        throw new Error("Failed to start the ride");
      }

      const data = await response.json();
      console.log("Ride started:", data.ride);
      onRideStarted();
    } catch (err) {
      console.error("Error starting the ride:", err);
      Alert.alert("Error", "Unable to start the ride");
    }
  };

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
      <View style={styles.mapContainer}>
          {region && (
            <MapView ref={mapRef} style={styles.map} region={region}>
              {routeCoordinates.length > 0 && <Polyline coordinates={routeCoordinates} strokeWidth={4} strokeColor="#00f" />}
              <Marker coordinate={routeCoordinates[0]} title="Start" />
              <Marker coordinate={routeCoordinates[1]} title="End" />
            </MapView>
          )}
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.rideInfoCard}>
            <View style={styles.infoSection}>
              <Text style={styles.infoLabel}>Ride ID</Text>
              <Text style={styles.infoText}>{rideDetails.rideID}</Text>
            </View>

            <View style={styles.infoSection}>
              <Text style={styles.infoLabel}>Start Location</Text>
              <Text style={styles.infoText}>
  {rideDetails.start?.coordinates ? `${rideDetails.start.coordinates[1]}, ${rideDetails.start.coordinates[0]}` : "Unknown"}
</Text>
            </View>

            <View style={styles.infoSection}>
              <Text style={styles.infoLabel}>End Location</Text>
              
<Text style={styles.infoText}>
  {rideDetails.end?.coordinates ? `${rideDetails.end.coordinates[1]}, ${rideDetails.end.coordinates[0]}` : "Unknown"}
</Text>
            </View>

            <View style={styles.infoSection}>
              <Text style={styles.infoLabel}>Fare</Text>
              <Text style={styles.fareText}>${fare.toFixed(2)}</Text>
            </View>

            <View style={styles.infoSection}>
              <Text style={styles.infoLabel}>Distance</Text>
              <Text style={styles.infoText}>{distance}</Text>
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

            {rideDetails.rider && (
              <View style={styles.infoSection}>
                <Text style={styles.infoLabel}>Rider</Text>
                <Text style={styles.infoText}>{rideDetails.rider.firstName}</Text>
              </View>
            )}
          </View>

          <TouchableOpacity style={styles.startButton} onPress={handleStartRide} activeOpacity={0.8}>
            <Text style={styles.startButtonText}>Start Ride</Text>
          </TouchableOpacity>
        </View>
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
  mapContainer: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
    borderRadius: 10
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
