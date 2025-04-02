import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import MapView, { Marker, Polyline, Region } from "react-native-maps";
import Constants from "expo-constants";
import { customMapStyle } from '../styles/customMapStyle'; 

const apiUrl = Constants.expoConfig?.extra?.API_URL;

interface TravelToRideStepProps {
  rideID: string;
  driverID: string;
  token: string;
  onRideStarted: () => void;
}

const GOOGLE_API_KEY =  'AIzaSyBkmAjYL9HmHSBtxxI0j3LB1tYEwoCnZXg'; 

const TravelToRideStep: React.FC<TravelToRideStepProps> = ({ rideID, driverID, token, onRideStarted }) => {
  const [rideInProgress, setRideInProgress] = useState(false);
  const [location, setLocation] = useState<{ lat: number; long: number } | null>(null);
  const [startLocation, setStartLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<{ latitude: number; longitude: number }[]>([]);
  const mapRef = useRef<MapView | null>(null);

  const region: Region | undefined = location
    ? {
        latitude: location.lat,
        longitude: location.long,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }
    : undefined;

  const decodePolyline = (encoded: string) => {
    let points = [];
    let index = 0,
      len = encoded.length;
    let lat = 0,
      lng = 0;

    while (index < len) {
      let b,
        shift = 0,
        result = 0;
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
        longitude: lng * 1e-5,
      });
    }
    return points;
  };

  const fetchLocation = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/location/getOne?userId=${driverID}&userType=driver`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.location) {
          setLocation(data.location);
        } else {
          Alert.alert("Error", "Location not found.");
        }
      } else {
        Alert.alert("Error", "Failed to fetch location.");
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred while fetching location.");
    }
  };

  const fetchRoute = async () => {
    if (!location || !startLocation) return;
    const origin = `${location.lat},${location.long}`;
    const destination = `${startLocation.latitude},${startLocation.longitude}`;

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${GOOGLE_API_KEY}`
      );
      const data = await response.json();

      if (data.routes.length > 0) {
        const points = decodePolyline(data.routes[0].overview_polyline.points);
        setRouteCoordinates(points);
      }
    } catch (error) {
      console.error("Error fetching route:", error);
    }
  };

  const checkRideStatus = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/ride/rides/${rideID}/status`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Error fetching ride status");
      }

      const data = await response.json();
      setStartLocation({ latitude: data.start.coordinates[1], longitude: data.start.coordinates[0] });
      if (data.isInProgress) {
        setRideInProgress(true);
        onRideStarted();
      }
    } catch (error) {
      console.error("Error checking ride status:", error);
    }
  };

  useEffect(() => {
    fetchLocation(); 
    checkRideStatus();
  
    const interval = setInterval(() => {
      fetchLocation(); 
    }, 5000);
  
    return () => clearInterval(interval); 
  }, []);

  useEffect(() => {
    if (location && startLocation) fetchRoute();
  }, [location, startLocation]);

  return (
    <View style={styles.container}>
      <MapView ref={mapRef} style={styles.map} region={region} customMapStyle={customMapStyle}>
        {location && <Marker coordinate={{ latitude: location.lat, longitude: location.long }} title="Driver" pinColor="#FF5733" />}
        {startLocation && <Marker coordinate={startLocation} title="Start Location" pinColor="#33C3FF" />}
        {routeCoordinates.length > 0 && <Polyline coordinates={routeCoordinates} strokeWidth={4} strokeColor="#4A90E2" />}
      </MapView>

      <View style={styles.overlay}>
        <Text style={styles.title}>Travel to Ride</Text>
        <TouchableOpacity style={styles.button} onPress={checkRideStatus}>
          <Text style={styles.buttonText}>Refresh Status</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: {
    ...StyleSheet.absoluteFillObject, 
  },
  overlay: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "rgba(255, 255, 255, 0.9)", 
    borderRadius: 10,
    padding: 20,
    elevation: 5, 
  },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  button: { marginTop: 20, backgroundColor: "#4A90E2", padding: 15, borderRadius: 5 },
  buttonText: { color: "#fff", fontSize: 18 },
});

export default TravelToRideStep;
