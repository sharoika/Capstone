import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ScrollView, Platform, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronRight, Edit2, Bell, Lock, LogOut, Banknote } from 'lucide-react-native';
import * as SecureStore from 'expo-secure-store';
import Modal from "react-native-modal";
import Constants from 'expo-constants';

const getApiUrl = () => {
  const url = Constants.expoConfig?.extra?.API_URL;
  console.log('API URL:', url);
  return url;
};

interface Driver {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear?: string;
  vehiclePlate: string;
  farePrice?: number;
  baseFee?: number;
  ledger?: {
    totalEarnings: number;
    availableBalance: number;
    transactions: Array<{
      rideID: string;
      amount: number;
      type: 'EARNING' | 'PAYOUT';
      status: string;
      timestamp: string;
    }>;
  };
}

const getItemAsync = async (key: string): Promise<string | null> => {
  return Platform.OS === 'web' ? localStorage.getItem(key) : await SecureStore.getItemAsync(key);
};

export default function Settings() {
  const router = useRouter();
  const [driver, setDriver] = useState<Driver | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [updating, setUpdating] = useState<boolean>(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [farePrice, setFarePrice] = useState('');
  const [baseFee, setBaseFee] = useState('');

  useEffect(() => {
    const fetchDriverData = async () => {
      try {
        const driverId = await getItemAsync('driverID');
        const token = await getItemAsync('driverToken');
        
        console.log('Fetching driver data:', {
          driverId,
          hasToken: !!token,
          apiUrl: getApiUrl()
        });

        if (!driverId || !token) {
          throw new Error('Missing authentication credentials');
        }

        const response = await fetch(`${getApiUrl()}/api/user/drivers/${driverId}`, {
          method: 'GET',
          headers: { 
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}` 
          },
        });

        console.log('Driver data response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error response:', errorText);
          throw new Error(`Failed to fetch driver details: ${response.status}`);
        }

        const data: Driver = await response.json();
        console.log('Driver data received:', data);
        setDriver(data);
      } catch (error) {
        console.error('Error fetching driver data:', error);
        Alert.alert('Error', 'Failed to load driver profile. Please try logging in again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDriverData();
  }, []);

  useEffect(() => {
    const fetchLedger = async () => {
      try {
        const token = await getItemAsync('driverToken');
        const response = await fetch(`${getApiUrl()}/api/driver/earnings`, {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch earnings');
        }

        const ledgerData = await response.json();
        setDriver(prev => prev ? { ...prev, ledger: ledgerData } : prev);
      } catch (error) {
        console.error('Error fetching ledger:', error);
      }
    };

    fetchLedger();
  }, []);

  useEffect(() => {
    if (driver) {
      setFarePrice(driver.farePrice?.toString() || '0');
      setBaseFee(driver.baseFee?.toString() || '2');
    }
  }, [driver]);

  const handleUpdateProfile = async () => {
    if (!driver) return;
    setUpdating(true);
    const driverId = await getItemAsync('driverID');
    const token = await getItemAsync('driverToken');

    try {
      const response = await fetch(`${getApiUrl()}/api/user/drivers/${driverId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(driver),
      });

      if (!response.ok) throw new Error('Update failed');

      Alert.alert('Success', 'Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      Alert.alert('Error', 'Could not update profile');
      console.error('Error updating profile:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handlePayoutRequest = async () => {
    if (!payoutAmount || parseFloat(payoutAmount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    const token = await getItemAsync('driverToken');
    
    try {
      const response = await fetch(`${getApiUrl()}/api/driver/payout-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: parseFloat(payoutAmount) }),
      });

      if (!response.ok) throw new Error('Payout request failed');

      const data = await response.json();
      Alert.alert('Success', 'Payout request submitted successfully');
      setShowPayoutModal(false);
      setPayoutAmount('');
      
      setDriver(prev => prev ? { ...prev, ledger: data.ledger } : prev);
    } catch (error) {
      Alert.alert('Error', 'Failed to submit payout request');
    }
  };

  const addTestEarnings = async () => {
    try {
      const token = await getItemAsync('driverToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const url = `${getApiUrl()}/api/driver/test/add-earnings`;
      console.log('Making test earnings request to:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        }
      });

      console.log('Test earnings response status:', response.status);
      
      const responseText = await response.text();
      console.log('Test earnings response:', responseText);

      try {
        const data = JSON.parse(responseText);
        
        if (!response.ok) {
          throw new Error(data.message || `HTTP error! status: ${response.status}`);
        }

        setDriver(prev => prev ? {
          ...prev,
          ledger: data.ledger
        } : prev);

        Alert.alert('Success', 'Test earnings added successfully');
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
        throw new Error('Invalid server response');
      }
    } catch (error) {
      console.error('Error adding test earnings:', error);
      Alert.alert(
        'Error', 
        `Failed to add test earnings: ${error.message}`
      );
    }
  };

  const handleUpdatePrice = async () => {
    try {
      const token = await getItemAsync('driverToken');
      const response = await fetch(`${getApiUrl()}/api/driver/fare`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          farePrice: parseFloat(farePrice),
          baseFee: parseFloat(baseFee)
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update price');
      }

      const data = await response.json();
      console.log('Price update response:', data);
      
      // Update the driver state with new prices
      setDriver(prev => prev ? {
        ...prev,
        farePrice: data.driver.farePrice,
        baseFee: data.driver.baseFee
      } : prev);
      
      setShowPriceModal(false);
      Alert.alert('Success', 'Price updated successfully');
    } catch (error) {
      console.error('Error updating price:', error);
      Alert.alert('Error', 'Failed to update price');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        {loading ? (
          <Text style={styles.loadingText}>Loading driver data...</Text>
        ) : (
          driver && (
            <View style={styles.driverInfo}>
              <Text style={styles.driverName}>{driver.firstName} {driver.lastName}</Text>
              <Text style={styles.driverEmail}>{driver.email}</Text>
              <Text style={styles.driverVehicle}>{driver.vehicleMake} {driver.vehicleModel}</Text>
              <Text style={styles.driverPlate}>Plate: {driver.vehiclePlate}</Text>
            </View>
          )
        )}
      </View>

      <View style={styles.settingsContainer}>
        <TouchableOpacity style={styles.settingOption} onPress={() => setIsEditing(true)}>
          <View style={styles.settingOptionContent}>
            <Edit2 color="#39C9C2" size={24} />
            <Text style={styles.settingOptionText}>Edit Profile</Text>
          </View>
          <ChevronRight color="#6D6D6D" size={24} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingOption}>
          <View style={styles.settingOptionContent}>
            <Bell color="#39C9C2" size={24} />
            <Text style={styles.settingOptionText}>Notifications</Text>
          </View>
          <ChevronRight color="#6D6D6D" size={24} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingOption}>
          <View style={styles.settingOptionContent}>
            <Lock color="#39C9C2" size={24} />
            <Text style={styles.settingOptionText}>Privacy Settings</Text>
          </View>
          <ChevronRight color="#6D6D6D" size={24} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.settingOption} 
          onPress={() => setShowPayoutModal(true)}
        >
          <View style={styles.settingOptionContent}>
            <Banknote color="#39C9C2" size={24} />
            <View style={styles.earningsContainer}>
              <Text style={styles.settingOptionText}>Earnings & Payouts</Text>
              {driver?.ledger && (
                <Text style={styles.balanceText}>
                  Balance: ${driver.ledger.availableBalance.toFixed(2)}
                </Text>
              )}
            </View>
          </View>
          <ChevronRight color="#6D6D6D" size={24} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingOption}
          onPress={() => setShowPriceModal(true)}
        >
          <View style={styles.settingOptionContent}>
            <Banknote color="#39C9C2" size={24} />
            <Text style={styles.settingOptionText}>Set Prices</Text>
          </View>
          <View style={styles.rowRight}>
            <Text style={styles.valueText}>
              ${driver?.farePrice?.toFixed(2) || '0.00'} / ${driver?.baseFee?.toFixed(2) || '0.00'}
            </Text>
            <ChevronRight color="#666" size={24} />
          </View>
        </TouchableOpacity>

        {__DEV__ && (
          <TouchableOpacity 
            style={styles.settingOption} 
            onPress={addTestEarnings}
          >
            <View style={styles.settingOptionContent}>
              <Banknote color="#39C9C2" size={24} />
              <Text style={styles.settingOptionText}>Add Test $10</Text>
            </View>
            <ChevronRight color="#6D6D6D" size={24} />
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={() => router.push('/(auth)/login')}>
        <LogOut color="#FFFFFF" size={24} />
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>

      <Modal isVisible={isEditing} onBackdropPress={() => setIsEditing(false)}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Edit Profile</Text>
          <TextInput style={styles.input} placeholder="First Name" value={driver?.firstName} onChangeText={(text) => setDriver((prev) => (prev ? { ...prev, firstName: text } : prev))} />
          <TextInput style={styles.input} placeholder="Last Name" value={driver?.lastName} onChangeText={(text) => setDriver((prev) => (prev ? { ...prev, lastName: text } : prev))} />
          <TextInput style={styles.input} placeholder="Email" keyboardType="email-address" value={driver?.email} onChangeText={(text) => setDriver((prev) => (prev ? { ...prev, email: text } : prev))} />
          <TextInput style={styles.input} placeholder="Vehicle Make" value={driver?.vehicleMake} onChangeText={(text) => setDriver((prev) => (prev ? { ...prev, vehicleMake: text } : prev))} />
          <TextInput style={styles.input} placeholder="Vehicle Model" value={driver?.vehicleModel} onChangeText={(text) => setDriver((prev) => (prev ? { ...prev, vehicleModel: text } : prev))} />

          <TouchableOpacity style={styles.button} onPress={handleUpdateProfile} disabled={updating}>
            <Text style={styles.buttonText}>{updating ? 'Updating...' : 'Update Profile'}</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <Modal isVisible={showPayoutModal} onBackdropPress={() => setShowPayoutModal(false)}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Request Payout</Text>
          <Text style={styles.balanceInfo}>
            Available Balance: ${driver?.ledger?.availableBalance.toFixed(2) || '0.00'}
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Enter amount"
            keyboardType="decimal-pad"
            value={payoutAmount}
            onChangeText={setPayoutAmount}
          />
          <TouchableOpacity 
            style={styles.button}
            onPress={handlePayoutRequest}
          >
            <Text style={styles.buttonText}>Submit Request</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={showPriceModal}
        onRequestClose={() => setShowPriceModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Set Your Prices</Text>
            
            <Text style={styles.label}>Base Fee ($)</Text>
            <TextInput
              style={styles.input}
              value={baseFee}
              onChangeText={setBaseFee}
              placeholder="Enter base fee"
              keyboardType="decimal-pad"
            />

            <Text style={styles.label}>Rate per Kilometer ($)</Text>
            <TextInput
              style={styles.input}
              value={farePrice}
              onChangeText={setFarePrice}
              placeholder="Enter rate per kilometer"
              keyboardType="decimal-pad"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowPriceModal(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleUpdatePrice}
              >
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#173252',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#6D6D6D',
  },
  driverInfo: {
    marginTop: 16,
    alignItems: 'center',
  },
  driverName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#173252',
  },
  driverEmail: {
    fontSize: 16,
    color: '#6D6D6D',
  },
  driverVehicle: {
    fontSize: 16,
    color: '#39C9C2',
    marginTop: 4,
  },
  driverPlate: {
    fontSize: 14,
    color: '#6D6D6D',
    marginTop: 4,
  },
  loadingText: {
    fontSize: 16,
    color: '#6D6D6D',
    marginTop: 16,
  },
  settingsContainer: {
    padding: 24,
  },
  
  settingOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  settingOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingOptionText: {
    fontSize: 16,
    marginLeft: 12,
    color: '#333333',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#39C9C2',
    marginHorizontal: 24,
    marginTop: 24,
    marginBottom: 40,
    padding: 16,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  input: { width: '100%', borderBottomWidth: 1, padding: 10, marginBottom: 10 },
  button: { backgroundColor: '#39C9C2', padding: 15, borderRadius: 8, width: '100%', alignItems: 'center' },
  buttonText: { color: 'white', fontSize: 16 },
  balanceInfo: {
    fontSize: 14,
    color: '#39C9C2',
    marginLeft: 8,
  },
  earningsContainer: {
    flex: 1,
    marginLeft: 12,
  },
  balanceText: {
    fontSize: 14,
    color: '#39C9C2',
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowText: {
    fontSize: 16,
    marginLeft: 12,
    color: '#333333',
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  valueText: {
    fontSize: 16,
    color: '#666',
    marginRight: 8,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginVertical: 16,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    padding: 15,
    borderRadius: 8,
    width: '45%',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#ccc',
  },
  saveButton: {
    backgroundColor: '#39C9C2',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    color: '#173252',
  },
  label: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    width: '100%',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 10,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#ccc',
  },
  saveButton: {
    backgroundColor: '#39C9C2',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
