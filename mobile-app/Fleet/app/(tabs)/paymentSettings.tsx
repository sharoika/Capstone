import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { Banknote } from 'lucide-react-native';

const apiUrl = Constants.expoConfig?.extra?.API_URL;

interface PaymentMethod {
  card: {
    brand: string;
    last4: string;
  };
}

export default function PaymentSettings() {
  const router = useRouter();
  const [id, setId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Function to get stored data from local storage
  const getItemAsync = async (key: string): Promise<string | null> => {
    return await SecureStore.getItemAsync(key);
  };

  useEffect(() => {
    const fetchPaymentMethod = async () => {
      try {
        const userId = await getItemAsync('userObjectId');
        const token = await getItemAsync('userToken');

        if (userId && token) {
          setId(userId);

          // Fetch the payment method for the user using their id
          const response = await fetch(`${apiUrl}/api/get-payment-method?customerId=${userId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const data = await response.json();
            setPaymentMethod(data.paymentMethod || null);
          } else {
            throw new Error('Failed to fetch payment method');
          }
        }
      } catch (error) {
        console.error('Error fetching payment method:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentMethod();
  }, []);

  const handleAddPaymentMethod = async () => {
    // Call backend route to add a new payment method
    try {
      const paymentMethodId = 'new-payment-method-id'; // Get this from the form or Stripe integration
      const token = await getItemAsync('userToken');
      const userId = await getItemAsync('userObjectId');

      if (paymentMethodId && token && userId) {
        const response = await fetch(`${apiUrl}/api/create-payment-method`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentMethodId,
            id: userId, // Use userId from local storage
          }),
        });

        if (response.ok) {
          Alert.alert('Success', 'Payment method added successfully');
          const data = await response.json();
          setPaymentMethod(data.paymentMethod || null); // Update payment method state
        } else {
          throw new Error('Failed to add payment method');
        }
      }
    } catch (error) {
      console.error('Error adding payment method:', error);
      Alert.alert('Error', 'Failed to add payment method');
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#39C9C2" style={styles.loader} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payment Settings</Text>

      {paymentMethod ? (
        <View style={styles.paymentInfo}>
          <Text style={styles.infoText}>
            Card: {paymentMethod.card.brand} ending in {paymentMethod.card.last4}
          </Text>
        </View>
      ) : (
        <Text style={styles.noPaymentMethodText}>No payment method on file. Add one below.</Text>
      )}

      <TouchableOpacity style={styles.addButton} onPress={handleAddPaymentMethod}>
        <Banknote color="#FFFFFF" size={24} />
        <Text style={styles.addButtonText}>Add Payment Method</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#173252',
    marginBottom: 20,
  },
  paymentInfo: {
    marginBottom: 20,
  },
  infoText: {
    fontSize: 16,
    color: '#6D6D6D',
  },
  noPaymentMethodText: {
    fontSize: 16,
    color: '#39C9C2',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#39C9C2',
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
