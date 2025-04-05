import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Dimensions } from "react-native";
import MapView, { Marker, Polyline } from 'react-native-maps';
import Geocoder from 'react-native-geocoding';
import Constants from 'expo-constants';
import { MaterialIcons } from 'react-native-vector-icons';
import { customMapStyle } from '../styles/customMapStyle';

const apiUrl = Constants.expoConfig?.extra?.API_URL;
const { width, height } = Dimensions.get('window');

const customPin = <MaterialIcons name="location-pin" size={40} color="#8EC3FF" />;

const RideInProgress = ({ rideID, token, onRideCompleted }) => {
  const [rideDetails, setRideDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [region, setRegion] = useState(null);
  const mapRef = useRef<MapView | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  const previousLocation = useRef(null);
  const GOOGLE_API_KEY = Constants.expoConfig?.extra?.GOOGLE_API_KEY;

  useEffect(() => {
    Geocoder.init(GOOGLE_API_KEY);
    fetchRideDetails();
    const interval = setInterval(fetchRideDetails, 1000); 
    return () => clearInterval(interval);
  }, [rideID, token]);


  useEffect(() => {
    if (
      currentLocation &&
      mapRef.current &&
      JSON.stringify(currentLocation) !== JSON.stringify(previousLocation.current)
    ) {
      previousLocation.current = currentLocation;
  
      mapRef.current.animateToRegion(
        {
          ...currentLocation,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        1000
      );
    }
  }, [currentLocation]);

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
      
      if (data.rider?.currentLocation?.coordinates) {
        const [longitude, latitude] = data.rider.currentLocation.coordinates;
        setCurrentLocation({ latitude, longitude });
      
        const start = {
          coordinates: [longitude, latitude]
        };
      
        updateMapRoute(start, data.end);
      }
    } catch (err) {
      setError("Failed to fetch ride details");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateMapRoute = async (start, end) => {
    try {
      if (!start || !end || !start.coordinates || !end.coordinates) {
        console.error('Invalid start or end coordinates', { start, end });
        return;
      }
  
      const [startLng, startLat] = start.coordinates;
      const [endLng, endLat] = end.coordinates;
  
      const directionsResponse = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${startLat},${startLng}&destination=${endLat},${endLng}&key=${GOOGLE_API_KEY}`
      );
  
      const directionsData = await directionsResponse.json();
  
      if (directionsData.routes.length) {
        const points = decodePolyline(directionsData.routes[0].overview_polyline.points);
        setRouteCoordinates(points);
  
        const region = {
          latitude: (startLat + endLat) / 2,
          longitude: (startLng + endLng) / 2,
          latitudeDelta: Math.abs(startLat - endLat) * 1.5,
          longitudeDelta: Math.abs(startLng - endLng) * 1.5,
        };
  
        setRegion(region);
      }
    } catch (error) {
      console.error('Error updating map route:', error);
    }
  };
  

  const decodePolyline = (encoded) => {
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

      points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
    }
    return points;
  };

  const handleFinishRide = async () => {
    if (!rideID || !token) {
      Alert.alert("Error", "Missing ride ID or token");
      return;
    }

    try {

      const response = await fetch(`${apiUrl}/api/ride/rides/${rideID}/status`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Error fetching ride status");
      }

      const data = await response.json();

      if (data.isCompleted) {
        onRideCompleted();
      } else {
        setTimeout(handleFinishRide, 1000); // Check again in 5 seconds
      }
    } catch (error) {
      console.error("Error checking ride status:", error);
      Alert.alert("Error", `Unable to check ride status: ${error.message}`);
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
          initialRegion={region}
          customMapStyle={customMapStyle}
        >
          {routeCoordinates.length > 0 && (
            <Polyline coordinates={routeCoordinates} strokeWidth={4} strokeColor="#4A90E2" />
          )}
          <Marker coordinate={routeCoordinates[0]} title="Start">
           <MaterialIcons name="directions-car-filled" size={40} color="#4A90E2" />
          </Marker>
          <Marker coordinate={routeCoordinates[routeCoordinates.length - 1]} title="End">
            {customPin}
          </Marker>
          <Marker coordinate={currentLocation} title="Current Location">
            <MaterialIcons name="directions-car-filled" size={40} color="#4A90E2" />
          </Marker>
        </MapView>
      )}

      <View style={styles.cardContainer}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Ride Details</Text>
          <Text style={styles.label}>Distance:</Text>
          <Text style={styles.value}>{rideDetails?.distance?.toFixed(2)} km</Text>
          <Text style={styles.label}>Total Fare:</Text>
          <Text style={styles.value}>${rideDetails?.fare?.toFixed(2)}</Text>
          <TouchableOpacity style={styles.endRideButton} onPress={handleFinishRide}>
            <Text style={styles.endRideButtonText}>Check Ride Status</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 18,
    color: "red",
  },
  cardContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    alignItems: 'center',
    padding: 10,
  },
  card: {
    width: width * 0.9,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    color: "#6d6d6d",
    marginTop: 8,
  },
  value: {
    fontSize: 16,
    fontWeight: "500",
  },
  endRideButton: {
    backgroundColor: "#4A90E2",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 15,
  },
  endRideButtonText: {
    color: "#ffffff",
    fontSize: 16,
  },
});


export default RideInProgress;
