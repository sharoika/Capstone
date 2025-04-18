import type React from "react";
import { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { Marker, Polyline } from "react-native-maps";
import Geocoder from "react-native-geocoding";
import Constants from "expo-constants";
import { MaterialIcons } from "react-native-vector-icons";
import { customMapStyle } from "../styles/customMapStyle";

const apiUrl = Constants.expoConfig?.extra?.API_URL;

interface StartRideProps {
  rideID: string;
  token: string;
  onRideStarted: () => void;
}

const { width } = Dimensions.get("window");
const customPin = <MaterialIcons name="location-pin" size={40} color="#8EC3FF" />;
const GOOGLE_API_KEY = Constants.expoConfig?.extra?.GOOGLE_API_KEY;

const StartRide: React.FC<StartRideProps> = ({ rideID, token, onRideStarted }) => {
  const [rideDetails, setRideDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [region, setRegion] = useState<any>(null);
  const mapRef = useRef<MapView | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<{ latitude: number; longitude: number }[]>([]);
  const [distance, setDistance] = useState<string>("");
  const [fare, setFare] = useState<number>(0);
  const [startAddress, setStartAddress] = useState<string>("Loading...");
  const [driverAddress, setDriverAddress] = useState<string>("Loading...");
  const [driverLocation, setDriverLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [startLocation, setStartLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [riderLocation, setRiderLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    Geocoder.init(GOOGLE_API_KEY);
  }, []);

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

  const reverseGeocode = async (latitude: number, longitude: number, setAddress: (address: string) => void) => {
    try {
      const response = await Geocoder.from(latitude, longitude);
      const address = response.results[0]?.formatted_address || "Unknown location";
      setAddress(address);
    } catch (error) {
      console.error("Reverse geocoding failed:", error);
      setAddress("Address not found");
    }
  };

  const updateRoute = async (driverLoc: { latitude: number; longitude: number }) => {
    try {
      if (!startLocation || !driverLoc) return;

      const origin = `${driverLoc.latitude},${driverLoc.longitude}`;
      const destination = `${startLocation.latitude},${startLocation.longitude}`;

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${GOOGLE_API_KEY}`
      );
      const data = await response.json();

      if (data.routes.length > 0) {
        const points = decodePolyline(data.routes[0].overview_polyline.points);
        const distance = data.routes[0].legs[0].distance.text;
        setRouteCoordinates(points);
        setDistance(distance);
      }
    } catch (error) {
      console.error("Error updating route:", error);
    }
  };

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

        if (!response.ok) throw new Error("Failed to fetch");

        const data = await response.json();

        if (data.start?.coordinates && data.end?.coordinates) {
          const startLoc = {
            latitude: data.start.coordinates[1],
            longitude: data.start.coordinates[0],
          };
          const driverLoc = {
            latitude: data.driver.currentLocation.coordinates[1],
            longitude: data.driver.currentLocation.coordinates[0],
          };

          setStartLocation(startLoc);
          setDriverLocation(driverLoc);
          setRiderLocation({
            latitude: data.rider.currentLocation.coordinates[1],
            longitude: data.rider.currentLocation.coordinates[0],
          });

          setRegion({
            latitude: driverLoc.latitude,
            longitude: driverLoc.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });

          if (data.driver?.farePrice && data.driver?.baseFee && typeof data.distance === "number") {
            const baseFee = !isNaN(data.driver.baseFee) ? data.driver.baseFee : 2;
            const farePrice = !isNaN(data.driver.farePrice) ? data.driver.farePrice : 0;
            const distanceFare = data.distance * farePrice;
            const totalFare = parseFloat((baseFee + distanceFare).toFixed(2));
            setFare(totalFare);
          }

          setRideDetails(data);
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

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`${apiUrl}/api/ride/rides/${rideID}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) throw new Error("Failed to fetch ride details");

        const data = await response.json();

        if (data.driver?.currentLocation?.coordinates) {
          const newDriverLoc = {
            latitude: data.driver.currentLocation.coordinates[1],
            longitude: data.driver.currentLocation.coordinates[0],
          };

          setDriverLocation(newDriverLoc);
          updateRoute(newDriverLoc);

          setRegion((prev) => ({
            ...prev,
            latitude: newDriverLoc.latitude,
            longitude: newDriverLoc.longitude,
          }));
        }
      } catch (error) {
        console.error("Error updating driver location:", error);
      }
    }, 2000); // Slight delay to avoid flooding API

    return () => clearInterval(interval);
  }, [rideID, token, startLocation]);

  useEffect(() => {
    if (rideDetails?.start?.coordinates && rideDetails?.driver?.currentLocation?.coordinates) {
      const [startLat, startLng] = rideDetails.start.coordinates;
      const [driverLat, driverLng] = rideDetails.driver.currentLocation.coordinates;
      reverseGeocode(startLng, startLat, setStartAddress);
      reverseGeocode(driverLng, driverLat, setDriverAddress);
    }
  }, [rideDetails]);

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

      if (!response.ok) throw new Error("Failed to start the ride");

      const data = await response.json();
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
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {region && (
        <MapView
          ref={mapRef}
          style={styles.map}
          region={region}
          customMapStyle={customMapStyle}
        >
          {routeCoordinates.length > 0 && (
            <Polyline coordinates={routeCoordinates} strokeWidth={4} strokeColor="#4A90E2" />
          )}
          {driverLocation && (
            <Marker coordinate={driverLocation} title="Driver Location">
               <MaterialIcons name="directions-car-filled" size={40} color="#4A90E2" />
            </Marker>
          )}
          {startLocation && (
            <Marker coordinate={startLocation} title="Start">
              {customPin}
            </Marker>
          )}
        </MapView>
      )}

      <View style={styles.cardContainer}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Ride Details</Text>
          <Text style={styles.label}>Start Location Address:</Text>
          <Text style={styles.value}>{startAddress}</Text>
          <Text style={styles.label}>Fare:</Text>
          <Text style={styles.value}>${fare.toFixed(2)}</Text>
          <Text style={styles.label}>Distance:</Text>
          <Text style={styles.value}>{distance}</Text>
          <TouchableOpacity style={styles.startButton} onPress={handleStartRide}>
            <Text style={styles.startButtonText}>Start Ride</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    ...StyleSheet.absoluteFillObject,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  cardContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    alignItems: "center",
    padding: 10,
  },
  card: {
    width: width * 0.9,
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: "#6d6d6d",
    marginTop: 8,
  },
  value: {
    fontSize: 16,
    fontWeight: "500",
    color: "#173252",
  },
  startButton: {
    backgroundColor: "#4A90E2",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    marginTop: 15,
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
});

export default StartRide;
