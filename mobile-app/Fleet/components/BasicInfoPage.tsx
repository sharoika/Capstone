import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';

interface Props {
  formData: any;
  errors: any;
  handleInputChange: (name: string, value: string) => void;
  handleNextPage: () => void;
  styles: any;
}

const BasicInfoPage: React.FC<Props> = ({ formData, errors, handleInputChange, handleNextPage, styles }) => (
  <View style={styles.formContainer}>
    <Text style={styles.pageTitle}>Basic Information</Text>

    <TextInput
      style={[styles.input, errors.firstName && styles.inputError]}
      placeholder="First Name"
        placeholderTextColor="#888"
      value={formData.firstName}
      onChangeText={(value) => handleInputChange('firstName', value)}
    />
    {errors.firstName && <Text style={styles.errorText}>First name is required</Text>}

    <TextInput
      style={[styles.input, errors.lastName && styles.inputError]}
      placeholder="Last Name"
        placeholderTextColor="#888"
      value={formData.lastName}
      onChangeText={(value) => handleInputChange('lastName', value)}
    />
    {errors.lastName && <Text style={styles.errorText}>Last name is required</Text>}

    <TextInput
      style={[styles.input, errors.email && styles.inputError]}
      placeholder="Email"
        placeholderTextColor="#888"
      value={formData.email}
      onChangeText={(value) => handleInputChange('email', value)}
      keyboardType="email-address"
    />
    {errors.email && <Text style={styles.errorText}>Valid email is required</Text>}

    <TextInput
      style={[styles.input, errors.phone && styles.inputError]}
      placeholder="Phone"
        placeholderTextColor="#888"
      value={formData.phone}
      onChangeText={(value) => handleInputChange('phone', value)}
      keyboardType="phone-pad"
    />
    {errors.phone && <Text style={styles.errorText}>Phone number is required</Text>}

    <TextInput
      style={[styles.input, errors.password && styles.inputError]}
      placeholder="Password"
        placeholderTextColor="#888"
      value={formData.password}
      onChangeText={(value) => handleInputChange('password', value)}
      secureTextEntry
    />
    {errors.password && <Text style={styles.errorText}>Password is required</Text>}

    <TouchableOpacity style={styles.nextButton} onPress={handleNextPage}>
      <Text style={styles.buttonText}>Next</Text>
    </TouchableOpacity>
  </View>
);

export default BasicInfoPage;
