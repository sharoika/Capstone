import React from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

interface Props {
  formData: any;
  locationCoords: { latitude: number; longitude: number } | null;
  handleLocationSelect: (data: any, details: any | null) => void;
  handleNextPage: () => void;
  handlePreviousPage: () => void;
  styles: any;
  GOOGLE_API_KEY: string;
  mapRef: React.RefObject<MapView>; 
}

const LocationPage: React.FC<Props> = ({
  formData,
  locationCoords,
  handleLocationSelect,
  handleNextPage,
  handlePreviousPage,
  styles,
  GOOGLE_API_KEY,
  mapRef
}) => {
  return (
    <View style={styles.formContainer}>
      <Text style={styles.pageTitle}>Home Location</Text>

      <GooglePlacesAutocomplete
  placeholder="Search for home location"
  onPress={handleLocationSelect}
  query={{ key: GOOGLE_API_KEY, language: 'en' }}
  fetchDetails={true}
  keyboardShouldPersistTaps="handled"
  styles={{
    container: { flex: 0 }, 
    textInput: styles.input,
    listView: { zIndex: 2, position: "absolute", top: 50, left: 0, right: 0 },
  }}
/>

      {locationCoords && (
        <MapView
          ref={mapRef}  
          style={styles.map}
          initialRegion={{
            latitude: locationCoords.latitude,
            longitude: locationCoords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          <Marker coordinate={locationCoords} title="Home Location" />
        </MapView>
      )}

      <View style={styles.navigationButtons}>
        <TouchableOpacity style={styles.backButton} onPress={handlePreviousPage}>
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.nextButton} onPress={handleNextPage}>
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LocationPage;
