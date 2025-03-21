import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  formData: any;
  errors: any;
  handleFileUpload: (documentType: string) => void;
  handlePreviousPage: () => void;
  handleRegister: () => void;
  isLoading: boolean;
  styles: any;
}

const DocumentsPage: React.FC<Props> = ({
  formData,
  errors,
  handleFileUpload,
  handlePreviousPage,
  handleRegister,
  isLoading,
  styles
}) => (
  <View style={styles.formContainer}>
    <Text style={styles.pageTitle}>Required Documents</Text>

    {['driversLicense', 'vehicleRegistration', 'insuranceDocument', 'backgroundCheckConsent'].map((doc) => (
      <TouchableOpacity
        key={doc}
        style={[styles.documentButton, formData[doc] && styles.documentUploaded, errors[doc] && styles.documentError]}
        onPress={() => handleFileUpload(doc)}
      >
        <Ionicons
          name={formData[doc] ? 'checkmark-circle' : 'cloud-upload-outline'}
          size={24}
          color={formData[doc] ? '#39C9C2' : errors[doc] ? '#FF3B30' : '#8E8E93'}
        />
        <Text>{formData[doc]?.name || `Upload ${doc}`}</Text>
      </TouchableOpacity>
    ))}

    <View style={styles.navigationButtons}>
      <TouchableOpacity style={styles.backButton} onPress={handlePreviousPage}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.registerButton} onPress={handleRegister} disabled={isLoading}>
        {isLoading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>Register</Text>}
      </TouchableOpacity>
    </View>
  </View>
);

export default DocumentsPage;
