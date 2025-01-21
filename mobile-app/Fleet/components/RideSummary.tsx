import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

interface RideSummaryProps {
  rideDetails: any;
  onReturnHome: () => void;
}

const RideSummary: React.FC<RideSummaryProps> = ({ rideDetails, onReturnHome }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Ride Summary</Text>
      {rideDetails ? (
        <>
          <Text style={styles.text}>Ride ID: {rideDetails._id}</Text>
          <Text style={styles.text}>Start: {rideDetails.start}</Text>
          <Text style={styles.text}>End: {rideDetails.end}</Text>
          <Text style={styles.text}>Distance: {rideDetails.distance} km</Text>
          <Text style={styles.text}>Fare: ${rideDetails.fare}</Text>
        </>
      ) : (
        <Text style={styles.text}>No ride details available</Text>
      )}
      <Button title="Return to Home" onPress={onReturnHome} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    marginBottom: 10,
  },
});

export default RideSummary;
