import React, { useState, useEffect } from 'react';
import { View, Button, Text, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { useStripe } from '@stripe/stripe-react-native';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';
import { ArrowLeft, CreditCard } from 'lucide-react-native';

const apiUrl = Constants.expoConfig?.extra?.API_URL;

// Define the payment method type
interface PaymentMethod {
  id: string;
  card: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
}

function PaymentScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [hasStripeId, setHasStripeId] = useState(false);

  const fetchPaymentMethod = async () => {
    try {
      const riderId = await SecureStore.getItemAsync('userObjectId');
      const response = await fetch(`${apiUrl}/api/payment/payment-method`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ riderId }),
      });

      if (!response.ok) {
        throw new Error('Failed to retrieve payment method');
      }

      const { paymentMethod } = await response.json();
      setPaymentMethod(paymentMethod);
    } catch (error) {
      console.error('Error fetching payment method:', error);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = await SecureStore.getItemAsync('userObjectId');
        const token = await SecureStore.getItemAsync('userToken');

        if (!userId || !token) {
          console.error('User ID or token missing.');
          setLoading(false);
          return;
        }

        const response = await fetch(`${apiUrl}/api/user/riders/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch rider data');
        }

        const userData = await response.json();
        setHasStripeId(!!userData.stripeCustomerId);
        if (!hasStripeId) {
          const riderId = await SecureStore.getItemAsync('userObjectId');
          if (!riderId) {
            console.error('No riderId found, cannot proceed.');
            setLoading(false);
            return;
          }

          console.log('Retrieved riderId:', riderId);

          const response = await fetch(`${apiUrl}/api/payment/create-setup-intent`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ riderId }),
          });

        }
      } catch (error) {
        console.error('Error fetching rider data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPaymentMethod();
    fetchUserData();
    fetchPaymentMethod();
  }, []);

  const initializePaymentSheet = async (retry = false) => {
    try {
      setLoading(true);
      const riderId = await SecureStore.getItemAsync('userObjectId');
      if (!riderId) {
        console.error('No riderId found, cannot proceed.');
        setLoading(false);
        return;
      }

      console.log('Retrieved riderId:', riderId);

      const response = await fetch(`${apiUrl}/api/payment/create-setup-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ riderId }),
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`Failed to create SetupIntent: ${errorMessage}`);
      }

      const { paymentIntent, customer, ephemeralKey } = await response.json();

      // If no customer ID is returned, retry once to ensure it's created
      if (!customer && !retry) {
        console.log("Retrying after Stripe customer ID creation...");
        return initializePaymentSheet(true);
      }

      if (!paymentIntent || !customer || !ephemeralKey) {
        throw new Error('Missing required fields from the API response.');
      }

      const { error } = await initPaymentSheet({
        merchantDisplayName: "Example, Inc.",
        customerId: customer,
        customerEphemeralKeySecret: ephemeralKey,
        setupIntentClientSecret: paymentIntent,
        allowsDelayedPaymentMethods: true,
        defaultBillingDetails: {
          name: 'Jane Doe',
        },
      });

      if (error) {
        console.error('Error initializing PaymentSheet:', error);
        return;
      }

      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        console.log('Error presenting PaymentSheet:', presentError);
      } else {
        console.log('PaymentSheet presented successfully');
      }

      try {
        const response =  await fetch(`${apiUrl}/api/payment/attach-payment-method`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ riderId }), // Send the riderId
        });

        if (!response.ok) {
          throw new Error('Failed to attach payment method');
        }

        console.log('Payment method attached successfully');
        fetchPaymentMethod();
      } catch (apiError) {
        console.error('Error calling /attach-payment-method:', apiError);
      }

    } catch (error) {
      console.log('Error in initializePaymentSheet:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
      <TouchableOpacity onPress={() => router.push('/(tabs)/settings')} style={styles.backButton}>
          <ArrowLeft color="#173252" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Settings</Text>
      </View>

      <View style={styles.content}>
        <CreditCard color="#4A90E2" size={80} style={styles.creditCardIcon} />
        <Text style={styles.preambleText}>
          All of Fleet’s payments are handled securely by Fleet to ensure your safety.
        </Text>

        {loading ? (
          <ActivityIndicator size="large" color="#4A90E2" />
        ) : (
          <>
            {paymentMethod ? (
              <View style={styles.paymentInfo}>
                <Text style={styles.cardText}>Card ending in {paymentMethod.card.last4}</Text>
                <Text style={styles.cardText}>Expires {paymentMethod.card.exp_month}/{paymentMethod.card.exp_year}</Text>
              </View>
            ) : (
              <Text style={styles.noCardText}>No saved payment method</Text>
            )}
            <TouchableOpacity style={styles.actionButton} onPress={initializePaymentSheet}>
              <Text style={styles.buttonText}>Add/Update Payment Method</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  backButton: { padding: 8, marginTop: 16, },
  headerTitle: { fontSize: 20, fontWeight: '600', color: '#173252', marginLeft: 16 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  creditCardIcon: { marginBottom: 16 },
  preambleText: { fontSize: 16, color: '#173252', textAlign: 'center', marginBottom: 20, paddingHorizontal: 20 },
  paymentInfo: { alignItems: 'center', padding: 16, backgroundColor: '#FFF', borderRadius: 8, width: '100%', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  cardText: { fontSize: 16, color: '#173252', marginBottom: 5 },
  noCardText: { fontSize: 16, color: '#6D6D6D', marginBottom: 20 },
  actionButton: { backgroundColor: "#4A90E2", width: '100%', padding: 16, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
export default PaymentScreen;
