import React, { useState, useEffect } from 'react';
import { View, Button, Text } from 'react-native';
import { CardField, useStripe } from '@stripe/stripe-react-native';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

const apiUrl = Constants.expoConfig?.extra?.API_URL;

function PaymentScreen() {
  const [loading, setLoading] = useState(true);
  const { confirmSetupIntent } = useStripe();
  const [paymentMethod, setPaymentMethod] = useState(null);

  const riderId = SecureStore.getItem('userObjectId');

  // Fetch Payment Method on initial render
  useEffect(() => {
    const fetchPaymentMethod = async () => {
      setLoading(true); 
      try {
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

  const handlePayPress = async () => {
    try {
      console.log("1");
      setLoading(true);
      console.log("2");
      console.log("3");
      const billingDetails = { email: 'jenny.rosen@example.com' };
      console.log("4");

      const response = await fetch(`${apiUrl}/api/payment/create-setup-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ riderId }),
      });
      console.log("5");

      if (!response.ok) {
        throw new Error('Failed to create SetupIntent');
      }

      const { clientSecret } = await response.json();
      const { setupIntent, error } = await confirmSetupIntent(clientSecret, {
        paymentMethodType: 'Card',
        paymentMethodData: { billingDetails },
      });

      if (error) {
        console.error('Error:', error);
        return;
      }

      if (setupIntent?.paymentMethodId) {
        await fetch(`${apiUrl}/api/payment/attach-payment-method`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ riderId, paymentMethodId: setupIntent.paymentMethodId }),
        });
      }

      setLoading(false);
      console.log('SetupIntent confirmed:', setupIntent);
    } catch (error) {
      console.error('Error in handlePayPress:', error);
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <>
          <View style={styles.paymentInfo}>
            <Text style={styles.cardText}>
              Card ending in {paymentMethod?.card?.last4}
            </Text>
            <Text style={styles.cardText}>
              Expires {paymentMethod?.card?.exp_month}/{paymentMethod?.card?.exp_year}
            </Text>
          </View>
          <CardField
            postalCodeEnabled={true}
            placeholders={{
              number: '4242 4242 4242 4242',
            }}
            cardStyle={styles.cardField}
            style={styles.cardFieldContainer}
            onCardChange={(cardDetails) => {
              console.log('Card details:', cardDetails);
            }}
            onFocus={(focusedField) => {
              console.log('Focused field:', focusedField);
            }}
          />
          <Button onPress={handlePayPress} title="Save Card" />
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
  },
  cardText: {
    fontSize: 16,
    color: '#000',
    marginBottom: 5,
  },
  cardField: {
    backgroundColor: '#FFFFFF',
    textColor: '#000000',
  },
  cardFieldContainer: {
    width: '100%',
    height: 50,
    marginVertical: 30,
  }
};

export default PaymentScreen;
