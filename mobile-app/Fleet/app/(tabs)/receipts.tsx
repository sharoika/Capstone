import React, { useState, useEffect } from 'react';
import { StyleSheet, Modal, View, TouchableOpacity, Platform } from 'react-native';
import { useColorScheme } from 'react-native';
import ThemedText from '../../components/ThemedText';
import ThemedView from '../../components/ThemedView';
import ReceiptList from '../../components/ReceiptList';
import Receipt from '../../components/Receipt';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

const API_URL = Constants.expoConfig?.extra?.API_URL;

// Utility function to get item from SecureStore (mobile) or localStorage (web)
const getItemAsync = async (key: string): Promise<string | null> => {
  if (Platform.OS === 'web') {
    return localStorage.getItem(key);
  } else {
    return await SecureStore.getItemAsync(key);
  }
};

export default function ReceiptsScreen() {
  const colorScheme = useColorScheme();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadAuthData = async () => {
      try {
        const storedUserType = await getItemAsync('userType');
        console.log('User type:', storedUserType);
        
        let storedToken, storedUserId;
        
        if (storedUserType === 'rider') {
          storedToken = await getItemAsync('userToken');
          storedUserId = await getItemAsync('userObjectId');
          console.log('Rider ID from userObjectId:', storedUserId);
        } else if (storedUserType === 'driver') {
          storedToken = await getItemAsync('driverToken');
          storedUserId = await getItemAsync('driverID');
          console.log('Driver ID from driverID:', storedUserId);
        }
        
        console.log('Token exists:', !!storedToken);
        console.log('User ID:', storedUserId);
        
        if (storedToken && storedUserId) {
          setToken(storedToken);
          setUser({
            _id: storedUserId,
            type: storedUserType
          });
        }
      } catch (error) {
        console.error('Error loading auth data:', error);
      }
    };
    
    loadAuthData();
  }, []);

  useEffect(() => {
    if (token && user) {
      fetchReceipts();
    }
  }, [token, user]);

  const fetchReceipts = async () => {
    if (!token || !user) return;
    
    setLoading(true);
    setError('');
    
    try {
      let endpoint = '';
      const userType = user.type?.toLowerCase() || 'rider';
      
      if (userType === 'rider') {
        endpoint = `${API_URL}/api/receipt/receipts/rider/${user._id}`;
      } else if (userType === 'driver') {
        endpoint = `${API_URL}/api/receipt/receipts/driver/${user._id}`;
      }
      
      console.log('Fetching receipts from:', endpoint);
      console.log('Using token:', token.substring(0, 10) + '...');
      
      const response = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      console.log('Receipts response:', response.data);
      setReceipts(response.data);
    } catch (err) {
      console.error('Error fetching receipts:', err);
      setError('Failed to load receipts. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectReceipt = async (receiptId) => {
    try {
      console.log(`Fetching receipt details for ID: ${receiptId}`);
      
      const response = await axios.get(`${API_URL}/api/receipt/receipts/${receiptId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      console.log('Receipt details response:', response.data);
      
      // Ensure driverID is populated properly
      if (!response.data.driverID || typeof response.data.driverID !== 'object') {
        console.warn('Driver information is missing or not properly populated');
        // Create a placeholder if driverID is not populated
        response.data.driverID = { 
          firstName: 'Unknown',
          lastName: 'Driver'
        };
      }
      
      setSelectedReceipt(response.data);
      setModalVisible(true);
    } catch (err) {
      console.error('Error fetching receipt details:', err);
      setError('Failed to load receipt details. Please try again.');
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedReceipt(null);
  };

  const userType = user?.type?.toLowerCase() || 'rider';

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Receipts</ThemedText>
        <TouchableOpacity style={styles.refreshButton} onPress={fetchReceipts}>
          <Ionicons 
            name="refresh" 
            size={22} 
            color={colorScheme === 'dark' ? '#fff' : '#173252'} 
          />
        </TouchableOpacity>
      </View>
      
      {error ? (
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <TouchableOpacity style={styles.retryButton} onPress={fetchReceipts}>
            <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        <ReceiptList
          receipts={receipts}
          loading={loading}
          onSelectReceipt={handleSelectReceipt}
          userType={userType}
          emptyMessage={`No receipts found for your ${userType === 'rider' ? 'rides' : 'trips'}`}
        />
      )}
      
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        {selectedReceipt && (
          <Receipt receipt={selectedReceipt} onClose={closeModal} />
        )}
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f7f9',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
  },
  refreshButton: {
    padding: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#e53935',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#173252',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});
