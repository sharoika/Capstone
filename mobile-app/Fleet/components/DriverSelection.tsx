import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';

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
  baseFee: number;
  isOnline: boolean;
}

const DriverSelection: React.FC<DriverSelectionProps> = ({
  rideID,
  token,
  onDriverConfirmed,
}) => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [rideDetails, setRideDetails] = useState<{ distance: number }>({ distance: 0 });
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
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
        throw new Error('Failed to fetch ride details');
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
      
        const onlineDrivers = driverList.filter((driver: Driver) => driver.isOnline);
        setDrivers(onlineDrivers.map((driver: Driver) => ({
          ...driver,
          baseFee: driver.baseFee ?? 2,
          farePrice: driver.farePrice ?? 0,
        })));
      } else {
        throw new Error('Failed to fetch drivers');
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [token, rideID]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const calculateTotalFare = (farePrice: number, baseFee: number) => {
    const validDistance = rideDetails.distance || 0;
    const distanceFare = validDistance * farePrice;
    return (baseFee + distanceFare).toFixed(2);
  };

  const checkPaymentMethod = async (): Promise<boolean> => {
    try {
      const riderId = await SecureStore.getItemAsync('userObjectId');
  
      if (!riderId) throw new Error('No rider ID found');
  
      const response = await fetch(`${apiUrl}/api/payment/payment-method`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ riderId }),
      });
  
      if (!response.ok) throw new Error('Failed to retrieve payment method');
  
      const { paymentMethod } = await response.json();
      return paymentMethod !== null;
    } catch (error) {
      console.error('Error checking payment method:', error);
      return false;
    }
  };
  
  const navigateToPayment = () => {
    router.push('/paymentSettings'); 
  };
  const handleConfirm = async () => {
    if (!selectedDriver) {
      Alert.alert('Error', 'Please select a driver');
      return;
    }

    const hasPayment = await checkPaymentMethod();

    if (!hasPayment) {
      Alert.alert(
        'No Payment Method',
        'You need to add a payment method before confirming the ride.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Go to Payment', onPress: navigateToPayment }
        ]
      );
      return;
    }
    try {
      const driver = drivers.find((d) => d._id === selectedDriver);
      const totalFare = driver ? calculateTotalFare(driver.farePrice, driver.baseFee) : '0';

      const response = await fetch(`${apiUrl}/api/ride/rides/${rideID}/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          driverID: selectedDriver,
          estimatedFare: parseFloat(totalFare),
        }),
      });

      if (response.ok) {
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
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={fetchData} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const DriverCard = ({ driver }: { driver: Driver }) => {
    const totalFare = calculateTotalFare(driver.farePrice, driver.baseFee);

    return (
      <TouchableOpacity
        style={[
          styles.card,
          selectedDriver === driver._id && styles.selectedCard,
        ]}
        onPress={() => setSelectedDriver(driver._id)}
      >
        <View style={styles.profile}>
          <Text style={styles.profileInitial}>
            {driver.firstName.charAt(0)}
          </Text>
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.driverName}>
            {`${driver.firstName} ${driver.lastName}`}
          </Text>
          <Text style={styles.details}>Base Fee: ${driver.baseFee.toFixed(2)}</Text>
          <Text style={styles.details}>Rate per km: ${driver.farePrice.toFixed(2)}</Text>
          <Text style={styles.totalFare}>Total Fare: ${totalFare}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select a Driver</Text>
      <Text style={styles.distance}>Trip Distance: {rideDetails.distance.toFixed(2)} km</Text>

      <FlatList
        data={drivers}
        renderItem={({ item }) => <DriverCard driver={item} />}
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
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#E74C3C',
    fontSize: 16,
  },
  retryButton: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#4A90E2',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A2242',
    marginBottom: 16,
  },
  distance: {
    fontSize: 16,
    color: '#4A90E2',
    marginBottom: 12,
  },
  list: {
    flexGrow: 1,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 4,
  },
  selectedCard: {
    borderColor: '#4A90E2',
    borderWidth: 2,
  },
  profile: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#8EC3FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    fontSize: 24,
    color: '#1A2242',
  },
  cardContent: {
    marginLeft: 16,
  },
  driverName: {
    fontSize: 18,
    color: '#1A2242',
    fontWeight: '600',
  },
  details: {
    fontSize: 14,
    color: '#666',
  },
  totalFare: {
    fontSize: 16,
    color: '#4A90E2',
  },
  confirmButton: {
    backgroundColor: '#4A90E2',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 18,
  },
});

export default DriverSelection;
