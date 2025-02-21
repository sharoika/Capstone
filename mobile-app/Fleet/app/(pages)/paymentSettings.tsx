import React, { useState, useEffect } from 'react';
import { View, Button, Text, ActivityIndicator } from 'react-native';
import { useStripe } from '@stripe/stripe-react-native';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

const apiUrl = Constants.expoConfig?.extra?.API_URL;

function PaymentScreen() {
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState(null);
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

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
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
            <Text>No saved payment method</Text>
          )}
          <Button onPress={initializePaymentSheet} title="Add/Update Payment Method" />
        </>
      )}
    </View>
  );
}

const styles = {
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  paymentInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  cardText: {
    fontSize: 16,
    color: '#000',
    marginBottom: 5,
  },
};

export default PaymentScreen;
