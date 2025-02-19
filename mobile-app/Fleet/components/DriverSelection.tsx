import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  FlatList,
  Image,
} from 'react-native';
import Constants from 'expo-constants';

const apiUrl = Constants.expoConfig?.extra?.API_URL;
interface DriverSelectionProps {
  rideID: string;
  token: string;
  onDriverConfirmed: () => void;
}

const DriverSelection: React.FC<DriverSelectionProps> = ({
  rideID,
  token,
  onDriverConfirmed,
}) => {
  const [drivers, setDrivers] = useState<{ _id: string; firstName: string; lastName: string; profilePicture: string; fare: string }[]>([]);
  const [rideDetails, setRideDetails] = useState<{ distance: number }>({ distance: 0 });
  const [selectedDriver, setSelectedDriver] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching drivers for ride ID:', rideID);

        const rideResponse = await fetch(`${apiUrl}/api/ride/rides/${rideID}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (rideResponse.ok) {
          const rideData = await rideResponse.json();
          setRideDetails({ distance: parseFloat(rideData.distance) });
        } else {
          Alert.alert('Error', 'Failed to fetch ride details');
        }
        const driverResponse = await fetch(`${apiUrl}/api/user/drivers`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (driverResponse.ok) {
          const driverList = await driverResponse.json();
          setDrivers(driverList);
        } else {
          Alert.alert('Error', 'Failed to fetch drivers');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        Alert.alert('Error', 'An error occurred while fetching data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [token, rideID]);

  const handleConfirm = async () => {
    if (!selectedDriver) {
      Alert.alert('Error', 'Please select a driver');
      return;
    }

    try {
      console.log(`Confirming ride with ID: ${rideID} and Driver ID: ${selectedDriver}`);

      const response = await fetch(
        `${apiUrl}/api/ride/rides/${rideID}/confirm`,
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
      console.log('Error:', error);
      Alert.alert('Error', 'An error occurred while confirming the ride');
    }
  };

  return (
    <View style={styles.container}>
      {isLoading ? (
        <ActivityIndicator size="large" color="#39C9C2" />
      ) : (
        <FlatList
          data={drivers}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => {
            const totalFare = parseFloat(item.fare) * rideDetails.distance;
            return (
              <TouchableOpacity
                style={[styles.card, selectedDriver === item._id && styles.selectedCard]}
                onPress={() => setSelectedDriver(item._id)}
              >
                <Image source={{ uri: item.profilePicture }} style={styles.profileImage} />
                <Text style={styles.driverName}>{`${item.firstName} ${item.lastName}`}</Text>
                <Text style={styles.driverDetails}>{`Fare: ${item.fare}`}</Text>
                <Text style={styles.driverDetails}>{`Distance: ${rideDetails.distance}`}</Text>
                <Text style={styles.driverDetails}>{`Total Fare: ${totalFare.toFixed(2)}`}</Text>
              </TouchableOpacity>
            );
          }}
        />
      )}
      <TouchableOpacity style={styles.button} onPress={handleConfirm}>
        <Text style={styles.buttonText}>Confirm Trip</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginTop: 24, padding: 16 },
  card: {
    padding: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  selectedCard: {
    backgroundColor: '#39C9C2',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 8,
  },
  driverName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  driverDetails: {
    fontSize: 14,
    color: '#555',
  },
  button: {
    padding: 16,
    backgroundColor: '#39C9C2',
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default DriverSelection;
