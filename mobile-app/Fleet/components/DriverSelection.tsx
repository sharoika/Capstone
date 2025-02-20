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

interface Driver {
  _id: string;
  firstName: string;
  lastName: string;
  profilePicture: string;
  farePrice: number;
  initialPrice: number;
}

const DriverSelection: React.FC<DriverSelectionProps> = ({
  rideID,
  token,
  onDriverConfirmed,
}) => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
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

  const calculateTotalFare = (farePrice: number, initialPrice: number) => {
    const distanceInKm = rideDetails.distance;
    const totalFare = initialPrice + (farePrice * distanceInKm);
    return totalFare.toFixed(2);
  };

  const renderDriver = ({ item }: { item: Driver }) => {
    const totalFare = calculateTotalFare(item.farePrice, item.initialPrice || 2);
    return (
      <TouchableOpacity
        style={[styles.card, selectedDriver === item._id && styles.selectedCard]}
        onPress={() => setSelectedDriver(item._id)}
      >
        <View style={[styles.profileImage, { backgroundColor: '#E1E1E1', justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={{ fontSize: 24, color: '#666' }}>
            {item.firstName.charAt(0)}
          </Text>
        </View>
        <Text style={styles.driverName}>{`${item.firstName} ${item.lastName}`}</Text>
        
        <View style={styles.priceContainer}>
          <View style={styles.priceItem}>
            <Text style={styles.priceLabel}>Base Fee</Text>
            <Text style={styles.priceValue}>${(item.initialPrice || 2).toFixed(2)}</Text>
          </View>
          <View style={styles.priceDivider} />
          <View style={styles.priceItem}>
            <Text style={styles.priceLabel}>Rate per km</Text>
            <Text style={styles.priceValue}>${item.farePrice.toFixed(2)}</Text>
          </View>
        </View>

        <Text style={styles.driverDetails}>{`Distance: ${rideDetails.distance.toFixed(2)} km`}</Text>
        <Text style={[styles.driverDetails, styles.fareText]}>{`Total Fare: $${totalFare}`}</Text>
      </TouchableOpacity>
    );
  };

  const handleConfirm = async () => {
    if (!selectedDriver) {
      Alert.alert('Error', 'Please select a driver');
      return;
    }

    try {
      const selectedDriverData = drivers.find(d => d._id === selectedDriver);
      const totalFare = selectedDriverData ? calculateTotalFare(selectedDriverData.farePrice, selectedDriverData.initialPrice || 2) : '0';

      const response = await fetch(
        `${apiUrl}/api/ride/rides/${rideID}/confirm`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ 
            driverID: selectedDriver,
            estimatedFare: parseFloat(totalFare)
          }),
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
      console.error('Error confirming ride:', error);
      Alert.alert('Error', 'An error occurred while confirming the ride');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#39C9C2" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select a Driver</Text>
      <Text style={styles.distanceText}>Trip Distance: {rideDetails.distance.toFixed(2)} km</Text>
      <FlatList
        data={drivers}
        renderItem={renderDriver}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
      />
      <TouchableOpacity
        style={[styles.confirmButton, !selectedDriver && styles.disabledButton]}
        onPress={handleConfirm}
        disabled={!selectedDriver}
      >
        <Text style={styles.confirmButtonText}>Confirm Driver</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    marginTop: 24, 
    padding: 16 
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  distanceText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  list: {
    flexGrow: 1,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  selectedCard: {
    borderColor: '#39C9C2',
    borderWidth: 2,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  driverName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  driverDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  fareText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#39C9C2',
    marginTop: 4
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
    paddingHorizontal: 4,
  },
  priceItem: {
    flex: 1,
    alignItems: 'center',
  },
  priceDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#ddd',
    marginHorizontal: 10,
  },
  priceLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#39C9C2',
  },
  confirmButton: {
    backgroundColor: '#39C9C2',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default DriverSelection;
