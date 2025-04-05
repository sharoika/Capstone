import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';

interface Props {
  formData: any;
  errors: any;
  handleInputChange: (name: string, value: string) => void;
  handleNextPage: () => void;
  handlePreviousPage: () => void;
  styles: any;
}

const VehicleInfoPage: React.FC<Props> = ({
  formData,
  errors,
  handleInputChange,
  handleNextPage,
  handlePreviousPage,
  styles
}) => (
  <View style={styles.formContainer}>
    <Text style={styles.pageTitle}>Vehicle Information</Text>

    <TextInput
      style={[styles.input, errors.vehicleMake && styles.inputError]}
      placeholder="Vehicle Make"
        placeholderTextColor="#888"
      value={formData.vehicleMake}
      onChangeText={(value) => handleInputChange('vehicleMake', value)}
    />

    <TextInput
      style={[styles.input, errors.vehicleModel && styles.inputError]}
      placeholder="Vehicle Model"
        placeholderTextColor="#888"
      value={formData.vehicleModel}
      onChangeText={(value) => handleInputChange('vehicleModel', value)}
    />

    <TextInput
      style={[styles.input, errors.vehicleYear && styles.inputError]}
      placeholder="Vehicle Year"
        placeholderTextColor="#888"
      value={formData.vehicleYear}
      onChangeText={(value) => handleInputChange('vehicleYear', value)}
    />

    <TextInput
      style={[styles.input, errors.vehicleColor && styles.inputError]}
      placeholder="Vehicle Color"
        placeholderTextColor="#888"
      value={formData.vehicleColor}
      onChangeText={(value) => handleInputChange('vehicleColor', value)}
    />

    <TextInput
      style={[styles.input, errors.licensePlate && styles.inputError]}
      placeholder="License Plate"
        placeholderTextColor="#888"
      value={formData.licensePlate}
      onChangeText={(value) => handleInputChange('licensePlate', value)}
    />

    <View style={styles.navigationButtons}>
      <TouchableOpacity style={styles.backButton} onPress={handlePreviousPage}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.nextButton} onPress={handleNextPage}>
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>
    </View>
  </View>
);

export default VehicleInfoPage;
