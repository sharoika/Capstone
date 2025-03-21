import React, { useState } from 'react';
import { ScrollView, View, Image, Text, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import * as DocumentPicker from 'expo-document-picker';
import BasicInfoPage from '../../components/BasicInfoPage';
import VehicleInfoPage from '../../components/VehicleInfoPage';
import DocumentsPage from '../../components/DocumentsPage';
import PageIndicator from '../../components/PageIndicator';
import styles from '../../styles/styles';

const apiUrl = Constants.expoConfig?.extra?.API_URL;

interface DocumentFile {
  uri: string;
  name: string;
  mimeType: string;
  size: number;
}

const DriverRegisterScreen = () => {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: '',
    vehicleColor: '',
    licensePlate: '',
    driversLicense: null as DocumentFile | null,
    vehicleRegistration: null as DocumentFile | null,
    insuranceDocument: null as DocumentFile | null,
    backgroundCheckConsent: null as DocumentFile | null,
  });

  const handleInputChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });

    if (errors[name]) {
      setErrors({ ...errors, [name]: false });
    }
  };

  const handleFileUpload = async (documentType: string) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets[0] as unknown as DocumentFile;
      setFormData({ ...formData, [documentType]: file });

      if (errors[documentType]) {
        setErrors({ ...errors, [documentType]: false });
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const validatePage = (page: number) => {
    const newErrors: Record<string, boolean> = {};
    let isValid = true;

    switch (page) {
      case 1:
        ['firstName', 'lastName', 'email', 'phone', 'password'].forEach((field) => {
          if (!formData[field]) {
            newErrors[field] = true;
            isValid = false;
          }
        });
        break;

      case 2:
        ['vehicleMake', 'vehicleModel', 'vehicleYear', 'vehicleColor', 'licensePlate'].forEach((field) => {
          if (!formData[field]) {
            newErrors[field] = true;
            isValid = false;
          }
        });
        break;

      case 3:
        ['driversLicense', 'vehicleRegistration', 'insuranceDocument', 'backgroundCheckConsent'].forEach((field) => {
          if (!formData[field]) {
            newErrors[field] = true;
            isValid = false;
          }
        });
        break;

      default:
        return true;
    }

    if (!isValid) {
      setErrors(newErrors);
      Alert.alert('Error', 'Please fill out all required fields.');
    }

    return isValid;
  };

  const handleNextPage = () => {
    if (validatePage(currentPage)) {
      setCurrentPage(currentPage + 1);
      setErrors({});
    }
  };

  const handlePreviousPage = () => {
    setCurrentPage(currentPage - 1);
    setErrors({});
  };

  const handleRegister = async () => {
    if (!validatePage(3)) return;

    setIsLoading(true);

    try {
      const formDataToSend = new FormData();

      // Append basic info
      ['firstName', 'lastName', 'email', 'phone', 'password', 
       'vehicleMake', 'vehicleModel', 'vehicleYear', 
       'vehicleColor', 'licensePlate'].forEach((field) => {
        formDataToSend.append(field, formData[field]);
      });

      // Append documents
      ['driversLicense', 'vehicleRegistration', 'insuranceDocument', 'backgroundCheckConsent'].forEach((doc) => {
        const file = formData[doc];
        if (file) {
          formDataToSend.append(doc, {
            uri: file.uri,
            name: file.name,
            type: file.mimeType
          } as any);
        }
      });

      const response = await fetch(`${apiUrl}/api/auth/driver/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'multipart/form-data' },
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'An error occurred during registration.');
      }

      router.push('/(auth)/driverLogin');
    } catch (error: any) {
      console.error('Error during registration:', error.message);
      Alert.alert('Error', error.message || 'Failed to register. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 1:
        return (
          <BasicInfoPage
            formData={formData}
            errors={errors}
            handleInputChange={handleInputChange}
            handleNextPage={handleNextPage}
            styles={styles}
          />
        );
      case 2:
        return (
          <VehicleInfoPage
            formData={formData}
            errors={errors}
            handleInputChange={handleInputChange}
            handleNextPage={handleNextPage}
            handlePreviousPage={handlePreviousPage}
            styles={styles}
          />
        );
      case 3:
        return (
          <DocumentsPage
            formData={formData}
            errors={errors}
            handleFileUpload={handleFileUpload}
            handlePreviousPage={handlePreviousPage}
            handleRegister={handleRegister}
            isLoading={isLoading}
            styles={styles}
          />
        );
      default:
        return <BasicInfoPage formData={formData} errors={errors} handleInputChange={handleInputChange} handleNextPage={handleNextPage} styles={styles} />;
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Image source={require('../../assets/images/logo.png')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.title}>Driver Registration</Text>
          <PageIndicator currentPage={currentPage} styles={styles} />
        </View>

        {renderCurrentPage()}

        <View style={styles.footer}>
          <Text style={styles.loginText}>Already have an account?</Text>
          <Text style={styles.loginLink} onPress={() => router.push('/(auth)/driverLogin')}>Login</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default DriverRegisterScreen;
