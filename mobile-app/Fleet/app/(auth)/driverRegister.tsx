import React, { useRef, useState } from 'react';
import { ScrollView, View, Image, Text, Alert, KeyboardAvoidingView } from 'react-native';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import * as DocumentPicker from 'expo-document-picker';
import BasicInfoPage from '../../components/BasicInfoPage';
import VehicleInfoPage from '../../components/VehicleInfoPage';
import DocumentsPage from '../../components/DocumentsPage';
import LocationPage from '../../components/LocationPage';
import PageIndicator from '../../components/PageIndicator';
import styles from '../../styles/styles';
import MapView from 'react-native-maps';

const GOOGLE_API_KEY = 'AIzaSyBkmAjYL9HmHSBtxxI0j3LB1tYEwoCnZXg'; 
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
  const mapRef = useRef<MapView | null>(null);
  
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

  const [locationCoords, setLocationCoords] = useState<{ latitude: number; longitude: number } | null>(null);

  const handleLocationSelect = (data: any, details: any) => {
    if (!details) {
      console.error('No details returned');
      return;
    }
  
    const location = {
      latitude: details.geometry.location.lat,
      longitude: details.geometry.location.lng,
    };
  
    setLocationCoords(location);
  
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        ...location,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };
  
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

    const fieldsByPage = {
      1: ['firstName', 'lastName', 'email', 'phone', 'password'],
      2: ['vehicleMake', 'vehicleModel', 'vehicleYear', 'vehicleColor', 'licensePlate'],
      3: [],
      4: ['driversLicense', 'vehicleRegistration', 'insuranceDocument', 'backgroundCheckConsent'],
     };

    (fieldsByPage[page] || []).forEach((field) => {
      if (!formData[field]) {
        newErrors[field] = true;
        isValid = false;
      }
    });

    if (!isValid) {
      setErrors(newErrors);
      Alert.alert('Error', 'Please fill out all required fields.');
    }

    return isValid;
  };

  const handleNextPage = () => {
    if (validatePage(currentPage)) {
      setCurrentPage((prev) => prev + 1);
      setErrors({});
    }
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => prev - 1);
    setErrors({});
  };

  const handleRegister = async () => {
    if (!validatePage(4)) return;

    setIsLoading(true);

    try {    const formDataToSend = new FormData();
      if (locationCoords) {
        formDataToSend.append("currentLocation[type]", "Point");
        formDataToSend.append("currentLocation[coordinates][]", locationCoords.longitude.toString());
        formDataToSend.append("currentLocation[coordinates][]", locationCoords.latitude.toString());
      } else {
        Alert.alert("Error", "Please select your location.");
        setIsLoading(false);
        return;
      }
      
      Object.keys(formData).forEach((field) => {
        const value = formData[field];
        if (value && typeof value === 'string') {
          formDataToSend.append(field, value);
        }
      });
  
      const documentFieldsMap = {
        driversLicense: "licenseDoc",
        vehicleRegistration: "vehicleRegistrationDoc",
        insuranceDocument: "safetyInspectionDoc",
        backgroundCheckConsent: "criminalRecordCheckDoc",
      };
  
      Object.keys(documentFieldsMap).forEach((key) => {
        const file = formData[key];
        if (file) {
          formDataToSend.append(documentFieldsMap[key], {
            uri: file.uri,
            name: file.name,
            type: file.mimeType,
          } as any);
        }
      });
   

      const response = await fetch(`${apiUrl}/api/auth/driver/register`, {
        method: 'POST',
        body: formDataToSend,
      });

      const responseText = await response.text(); // Log response
      console.log('Raw Response:', responseText);
      
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error('Invalid JSON response from server');
      }
      console.log(response);
      if (!response.ok) {
        throw new Error(errorData.message || 'An error occurred during registration.');
      }

      router.push('/(auth)/driverLogin');
    } catch (error: any) {
      console.error('Error during registration:', error.message);
      console.log('Error during registration:', error.message);
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
          <LocationPage
          formData={formData}
          locationCoords={locationCoords}
          handleLocationSelect={handleLocationSelect}
          handleNextPage={handleNextPage}
          handlePreviousPage={handlePreviousPage}
          styles={styles}
          GOOGLE_API_KEY={GOOGLE_API_KEY}
          mapRef={mapRef}  
        />
        ); 
      case 4:
       
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
        return null;
    }
  };
  
  return (

    <KeyboardAvoidingView
    style={{ flex: 1 }}
  >
    <View style={styles.scrollContainer}>
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
    </View>
    </KeyboardAvoidingView>
  );
};

export default DriverRegisterScreen;
