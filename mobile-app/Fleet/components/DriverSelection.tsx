import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
interface DriverSelectionProps {
  rideID: string;  // Ensure this is correctly passed from parent component
  token: string;
  onDriverConfirmed: () => void;
}

const DriverSelection: React.FC<DriverSelectionProps> = ({
  rideID,
  token,
  onDriverConfirmed,
}) => {
  const [drivers, setDrivers] = useState<{ _id: string; firstName: string; lastName: string }[]>([]);
  const [selectedDriver, setSelectedDriver] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        // Log rideID to ensure it's being passed correctly
        console.log('Fetching drivers for rideID:', rideID);

        const response = await fetch('http://10.0.2.2:5000/api/auth/drivers/list', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const driverList = await response.json();
          setDrivers(driverList);
        } else {
          Alert.alert('Error', 'Failed to fetch drivers');
        }
      } catch (error) {
        console.error('Error fetching drivers:', error);
        Alert.alert('Error', 'An error occurred while fetching drivers');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDrivers();
  }, [token, rideID]);

  const handleConfirm = async () => {
    if (!selectedDriver) {
      Alert.alert('Error', 'Please select a driver');
      return;
    }

    try {
      // Log the rideID and selectedDriver to ensure they are correct
      console.log(`Confirming ride with ID: ${rideID} and Driver ID: ${selectedDriver}`);

      // Ensure the rideID is being used correctly in the URL
      const response = await fetch(
        `http://10.0.2.2:5000/api/rides/rides/${rideID}/confirm`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ driverID: selectedDriver }),
        }
      );

      if (response.ok) {
        Alert.alert('Success', 'Ride confirmed successfully');
        onDriverConfirmed();
      } else {
        const errorText = await response.text();
        console.error('Failed to confirm ride:', errorText);
        Alert.alert('Error', 'Failed to confirm ride');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'An error occurred while confirming the ride');
    }
  };

  return (
    <View style={styles.container}>
      {isLoading ? (
        <ActivityIndicator size="large" color="#39C9C2" />
      ) : (
        <>
          <Picker
            selectedValue={selectedDriver}
            onValueChange={(value: React.SetStateAction<string>) => setSelectedDriver(value)}
            style={styles.picker}
          >
            <Picker.Item label="Select a driver" value="" />
            {drivers.map((driver) => (
              <Picker.Item
                key={driver._id}
                label={`${driver.firstName} ${driver.lastName}`}
                value={driver._id}
              />
            ))}
          </Picker>
          <TouchableOpacity style={styles.button} onPress={handleConfirm}>
            <Text style={styles.buttonText}>Confirm Trip</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginTop: 24 },
  picker: { marginBottom: 16, height: 50 },
  button: { padding: 16, backgroundColor: '#39C9C2', borderRadius: 8 },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: '600' },
});

export default DriverSelection;
