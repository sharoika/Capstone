import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useStripe } from '@stripe/stripe-react-native';
import * as SecureStore from 'expo-secure-store';

import Constants from 'expo-constants';

const apiUrl = Constants.expoConfig?.extra?.API_URL;

export default function PaymentSettings() {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [processing, setProcessing] = useState(false);

  const handleAddPaymentMethod = async () => {
    setProcessing(true);
    try {
      const riderId = await SecureStore.getItemAsync('userObjectId');
      if (!riderId) {
        throw new Error('User ID not found');
      }

      console.log(riderId);

      console.log("here69");
      // Step 1: Create a SetupIntent on your backend
      console.log(`${apiUrl}/api/payment/create-setup-intent`);
      const response = await fetch(`${apiUrl}/api/payment/create-setup-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ riderId }),
      });
      if (!response.ok) {
        throw new Error('Failed to create SetupIntent');
      }

      console.log("here6969");
      console.log(clientSecret);
      console.log(response);
      const { clientSecret } = await response.json();
      console.log(clientSecret);

      // Step 2: Initialize the Payment Sheet with the SetupIntent client secret
      const { error } = await initPaymentSheet({
        setupIntentClientSecret: clientSecret
      });

      if (error) {
        throw new Error(error.message);
      }

      // Step 3: Present the Payment Sheet
      const { error: sheetError, paymentMethod } = await presentPaymentSheet();
      if (sheetError) {
        throw new Error(sheetError.message);
      }

      // Step 4: Get the paymentMethodId from the Payment Sheet
      const paymentMethodId = paymentMethod.id;

      // Step 5: Send the paymentMethodId to your backend to attach it to the customer
      const backendResponse = await fetch(`${apiUrl}/api/payment/attach-payment-method`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          riderId,
          paymentMethodId: paymentMethodId,
        }),
      });

      if (!backendResponse.ok) {
        throw new Error('Failed to attach payment method');
      }

      Alert.alert('Success', 'Payment method added successfully!');
    } catch (error) {
      console.error('Error processing payment:', error);
      Alert.alert('Error', error.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Payment Method</Text>
      <TouchableOpacity
        style={[styles.submitButton, processing && styles.disabledButton]}
        onPress={handleAddPaymentMethod}
        disabled={processing}
      >
        {processing ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>Add Payment Method</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '600', color: '#173252', marginBottom: 20 },
  submitButton: {
    backgroundColor: '#39C9C2',
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  disabledButton: { backgroundColor: '#6D6D6D' },
});
