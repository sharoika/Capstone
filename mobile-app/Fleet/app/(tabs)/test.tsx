import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { useRouter } from 'expo-router';
import { v4 as uuidv4 } from 'uuid';
import 'react-native-get-random-values';

const GOOGLE_API_KEY =  'AIzaSyBjVIyhPrpbB4CNHRI6UdGCBzeRyaWEAgM';

export default function AddressAutocomplete() {
  const router = useRouter();
  const [address, setAddress] = useState('');

  return (
    <View style={styles.container}>
      <GooglePlacesAutocomplete
        placeholder="Enter your address"
        onPress={(data, details = null) => {
          setAddress(data.description);
          console.log('Selected Address:', data.description);
        }}
        query={{
          key: GOOGLE_API_KEY,
          language: 'en',
        }}
        styles={{
          textInput: styles.input,
        }}
        fetchDetails={true}
        debounce={300}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 16,
  },
});
