import React, { useState, useEffect } from 'react';
import { View, Button, Text, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { useStripe } from '@stripe/stripe-react-native';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';

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

  useEffect(() => {
    const fetchPaymentMethod = async () => {
      try {
        setLoading(true);
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
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentMethod();
  }, []);

  const initializePaymentSheet = async () => {
    try {
      setLoading(true);
      const riderId = await SecureStore.getItemAsync('userObjectId');
      const response = await fetch(`${apiUrl}/api/payment/create-setup-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ riderId }),
      });

      if (!response.ok) {
        throw new Error('Failed to create SetupIntent');
      }

      const { paymentIntent, customer, ephemeralKey } = await response.json();

      console.log(response);
      console.log(response.json);

      console.log(ephemeralKey)

      console.log(customer);

      console.log(paymentIntent);

      const { error } = await initPaymentSheet({
        merchantDisplayName: "Example, Inc.",
        customerId: customer,
        customerEphemeralKeySecret: ephemeralKey,
        setupIntentClientSecret: paymentIntent,
        // Set `allowsDelayedPaymentMethods` to true if your business can handle payment
        //methods that complete payment after a delay, like SEPA Debit and Sofort.
        allowsDelayedPaymentMethods: true,
        defaultBillingDetails: {
          name: 'Jane Doe',
        }
      });


      // const { error } = await initPaymentSheet({
      //   setupIntentClientSecret: setupIntentClientSecret,
      //   // customerEphemeralKeySecret: ephemeralKeySecret,
      //   merchantDisplayName: 'Your Merchant Name',
      // });

      if (error) {
        console.error('Error initializing PaymentSheet:', error);
        setLoading(false);
        return;
      }

      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        console.error('Error presenting PaymentSheet:', presentError);
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
      } catch (apiError) {
        console.error('Error calling /attach-payment-method:', apiError);
      }

    } catch (error) {
      console.error('Error in initializePaymentSheet:', error);
    } finally {
      setLoading(false);
    }
  };

  const chargePayment = async () => {
    try {
      setLoading(true);
      const riderId = await SecureStore.getItemAsync('userObjectId');
      const response = await fetch(`${apiUrl}/api/payment/charge-payment-method`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          riderId: String(riderId), // Convert to string if necessary
          amount: 6969,
          currency: "usd"
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Payment failed');

    } catch (error) {
      console.error('Payment failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color="#173252" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Settings</Text>
      </View>

      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color="#39C9C2" />
        ) : (
          <>
            {paymentMethod ? (
              <View style={styles.paymentInfo}>
                <Text style={styles.cardText}>
                  Card ending in {paymentMethod.card.last4}
                </Text>
                <Text style={styles.cardText}>
                  Expires {paymentMethod.card.exp_month}/{paymentMethod.card.exp_year}
                </Text>
              </View>
            ) : (
              <Text style={styles.noCardText}>No saved payment method</Text>
            )}
            <TouchableOpacity style={styles.actionButton} onPress={initializePaymentSheet}>
              <Text style={styles.buttonText}>Add/Update Payment Method</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.chargeButton]} onPress={chargePayment}>
              <Text style={styles.buttonText}>Charge Payment Method</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#173252',
    marginLeft: 16,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  paymentInfo: {
    alignItems: 'center',
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    width: '100%',
  },
  cardText: {
    fontSize: 16,
    color: '#173252',
    marginBottom: 5,
  },
  noCardText: {
    fontSize: 16,
    color: '#6D6D6D',
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: '#39C9C2',
    width: '100%',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  chargeButton: {
    backgroundColor: '#173252',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PaymentScreen;
