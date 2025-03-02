import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';

const apiUrl = Constants.expoConfig?.extra?.API_URL;

// Define the document type for TypeScript
interface DocumentFile {
  uri: string;
  name: string;
  mimeType: string;
  size: number;
}

export default function DriverRegisterScreen() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  
  const [formData, setFormData] = useState({
    // Basic Information (Page 1)
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    
    // Vehicle Information (Page 2)
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: '',
    vehicleColor: '',
    licensePlate: '',
    
    // Documents (Page 3)
    driversLicense: null as DocumentFile | null,
    vehicleRegistration: null as DocumentFile | null,
    insuranceDocument: null as DocumentFile | null,
    backgroundCheckConsent: null as DocumentFile | null,
  });

  const handleInputChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
    // Clear error for this field when user starts typing
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
      
      if (result.canceled) {
        return;
      }
      
      const file = result.assets[0] as unknown as DocumentFile;
      setFormData({ ...formData, [documentType]: file });
      
      // Clear error for this document when uploaded
      if (errors[documentType]) {
        setErrors({ ...errors, [documentType]: false });
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const validatePage = (page: number) => {
    let isValid = true;
    const newErrors: Record<string, boolean> = {};
    
    switch (page) {
      case 1:
        // Check each field and mark errors
        if (!formData.firstName) {
          newErrors.firstName = true;
          isValid = false;
        }
        if (!formData.lastName) {
          newErrors.lastName = true;
          isValid = false;
        }
        if (!formData.email) {
          newErrors.email = true;
          isValid = false;
        } else {
          // Basic email validation
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(formData.email)) {
            newErrors.email = true;
            isValid = false;
            Alert.alert('Error', 'Please enter a valid email address.');
          }
        }
        if (!formData.phone) {
          newErrors.phone = true;
          isValid = false;
        }
        if (!formData.password) {
          newErrors.password = true;
          isValid = false;
        }
        
        if (!isValid) {
          setErrors(newErrors);
          Alert.alert('Error', 'Please fill out all required fields.');
        }
        return isValid;
      
      case 2:
        if (!formData.vehicleMake) {
          newErrors.vehicleMake = true;
          isValid = false;
        }
        if (!formData.vehicleModel) {
          newErrors.vehicleModel = true;
          isValid = false;
        }
        if (!formData.vehicleYear) {
          newErrors.vehicleYear = true;
          isValid = false;
        }
        if (!formData.vehicleColor) {
          newErrors.vehicleColor = true;
          isValid = false;
        }
        if (!formData.licensePlate) {
          newErrors.licensePlate = true;
          isValid = false;
        }
        
        if (!isValid) {
          setErrors(newErrors);
          Alert.alert('Error', 'Please fill out all vehicle information.');
        }
        return isValid;
      
      case 3:
        if (!formData.driversLicense) {
          newErrors.driversLicense = true;
          isValid = false;
        }
        if (!formData.vehicleRegistration) {
          newErrors.vehicleRegistration = true;
          isValid = false;
        }
        if (!formData.insuranceDocument) {
          newErrors.insuranceDocument = true;
          isValid = false;
        }
        if (!formData.backgroundCheckConsent) {
          newErrors.backgroundCheckConsent = true;
          isValid = false;
        }
        
        if (!isValid) {
          setErrors(newErrors);
          Alert.alert('Error', 'Please upload all required documents.');
        }
        return isValid;
      
      default:
        return true;
    }
  };

  const handleNextPage = () => {
    if (validatePage(currentPage)) {
      setCurrentPage(currentPage + 1);
      // Clear errors when moving to next page
      setErrors({});
    }
  };

  const handlePreviousPage = () => {
    setCurrentPage(currentPage - 1);
    // Clear errors when moving to previous page
    setErrors({});
  };

  const handleRegister = async () => {
    if (!validatePage(3)) {
      return;
    }

    setIsLoading(true);

    try {
      // Create FormData for file uploads
      const formDataToSend = new FormData();
      
      // Add basic information
      formDataToSend.append('firstName', formData.firstName);
      formDataToSend.append('lastName', formData.lastName);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('password', formData.password);
      
      // Add vehicle information
      formDataToSend.append('vehicleMake', formData.vehicleMake);
      formDataToSend.append('vehicleModel', formData.vehicleModel);
      formDataToSend.append('vehicleYear', formData.vehicleYear);
      formDataToSend.append('vehicleColor', formData.vehicleColor);
      formDataToSend.append('licensePlate', formData.licensePlate);
      
      // Add documents
      if (formData.driversLicense) {
        const file = formData.driversLicense;
        formDataToSend.append('driversLicense', {
          uri: file.uri,
          name: file.name,
          type: file.mimeType
        } as any);
      }
      
      if (formData.vehicleRegistration) {
        const file = formData.vehicleRegistration;
        formDataToSend.append('vehicleRegistration', {
          uri: file.uri,
          name: file.name,
          type: file.mimeType
        } as any);
      }
      
      if (formData.insuranceDocument) {
        const file = formData.insuranceDocument;
        formDataToSend.append('insuranceDocument', {
          uri: file.uri,
          name: file.name,
          type: file.mimeType
        } as any);
      }
      
      if (formData.backgroundCheckConsent) {
        const file = formData.backgroundCheckConsent;
        formDataToSend.append('backgroundCheckConsent', {
          uri: file.uri,
          name: file.name,
          type: file.mimeType
        } as any);
      }

      const response = await fetch(`${apiUrl}/api/auth/driver/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'An error occurred during registration.');
      }

      const responseData = await response.json();
      Alert.alert('Success', responseData.message || 'Registration successful!');
      router.push('/(auth)/driverLogin');
    } catch (error: any) {
      console.error('Error during registration:', error.message);
      Alert.alert('Error', error.message || 'Failed to register. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderPageIndicator = () => {
    return (
      <View style={styles.pageIndicator}>
        <View style={[styles.indicatorDot, currentPage >= 1 ? styles.activeDot : {}]} />
        <View style={styles.indicatorLine} />
        <View style={[styles.indicatorDot, currentPage >= 2 ? styles.activeDot : {}]} />
        <View style={styles.indicatorLine} />
        <View style={[styles.indicatorDot, currentPage >= 3 ? styles.activeDot : {}]} />
      </View>
    );
  };

  const renderBasicInfoPage = () => {
    return (
      <View style={styles.formContainer}>
        <Text style={styles.pageTitle}>Basic Information</Text>
        
        <TextInput
          style={[styles.input, errors.firstName ? styles.inputError : {}]}
          placeholder="First Name"
          placeholderTextColor="#8E8E93"
          value={formData.firstName}
          onChangeText={(value) => handleInputChange('firstName', value)}
        />
        {errors.firstName && <Text style={styles.errorText}>First name is required</Text>}
        
        <TextInput
          style={[styles.input, errors.lastName ? styles.inputError : {}]}
          placeholder="Last Name"
          placeholderTextColor="#8E8E93"
          value={formData.lastName}
          onChangeText={(value) => handleInputChange('lastName', value)}
        />
        {errors.lastName && <Text style={styles.errorText}>Last name is required</Text>}
        
        <TextInput
          style={[styles.input, errors.email ? styles.inputError : {}]}
          placeholder="Email"
          placeholderTextColor="#8E8E93"
          value={formData.email}
          onChangeText={(value) => handleInputChange('email', value)}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {errors.email && <Text style={styles.errorText}>Valid email is required</Text>}
        
        <TextInput
          style={[styles.input, errors.phone ? styles.inputError : {}]}
          placeholder="Phone"
          placeholderTextColor="#8E8E93"
          value={formData.phone}
          onChangeText={(value) => handleInputChange('phone', value)}
          keyboardType="phone-pad"
        />
        {errors.phone && <Text style={styles.errorText}>Phone number is required</Text>}
        
        <TextInput
          style={[styles.input, errors.password ? styles.inputError : {}]}
          placeholder="Password"
          placeholderTextColor="#8E8E93"
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
  };

  const renderVehicleInfoPage = () => {
    return (
      <View style={styles.formContainer}>
        <Text style={styles.pageTitle}>Vehicle Information</Text>
        
        <TextInput
          style={[styles.input, errors.vehicleMake ? styles.inputError : {}]}
          placeholder="Vehicle Make"
          placeholderTextColor="#8E8E93"
          value={formData.vehicleMake}
          onChangeText={(value) => handleInputChange('vehicleMake', value)}
        />
        {errors.vehicleMake && <Text style={styles.errorText}>Vehicle make is required</Text>}
        
        <TextInput
          style={[styles.input, errors.vehicleModel ? styles.inputError : {}]}
          placeholder="Vehicle Model"
          placeholderTextColor="#8E8E93"
          value={formData.vehicleModel}
          onChangeText={(value) => handleInputChange('vehicleModel', value)}
        />
        {errors.vehicleModel && <Text style={styles.errorText}>Vehicle model is required</Text>}
        
        <TextInput
          style={[styles.input, errors.vehicleYear ? styles.inputError : {}]}
          placeholder="Vehicle Year"
          placeholderTextColor="#8E8E93"
          value={formData.vehicleYear}
          onChangeText={(value) => handleInputChange('vehicleYear', value)}
          keyboardType="number-pad"
        />
        {errors.vehicleYear && <Text style={styles.errorText}>Vehicle year is required</Text>}
        
        <TextInput
          style={[styles.input, errors.vehicleColor ? styles.inputError : {}]}
          placeholder="Vehicle Color"
          placeholderTextColor="#8E8E93"
          value={formData.vehicleColor}
          onChangeText={(value) => handleInputChange('vehicleColor', value)}
        />
        {errors.vehicleColor && <Text style={styles.errorText}>Vehicle color is required</Text>}
        
        <TextInput
          style={[styles.input, errors.licensePlate ? styles.inputError : {}]}
          placeholder="License Plate"
          placeholderTextColor="#8E8E93"
          value={formData.licensePlate}
          onChangeText={(value) => handleInputChange('licensePlate', value)}
        />
        {errors.licensePlate && <Text style={styles.errorText}>License plate is required</Text>}

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
  };

  const renderDocumentsPage = () => {
    return (
      <View style={styles.formContainer}>
        <Text style={styles.pageTitle}>Required Documents</Text>
        <Text style={styles.pageSubtitle}>Please upload the following documents:</Text>
        
        <TouchableOpacity 
          style={[
            styles.documentButton, 
            formData.driversLicense ? styles.documentUploaded : {},
            errors.driversLicense ? styles.documentError : {}
          ]} 
          onPress={() => handleFileUpload('driversLicense')}
        >
          <Ionicons 
            name={formData.driversLicense ? "checkmark-circle" : "cloud-upload-outline"} 
            size={24} 
            color={formData.driversLicense ? "#39C9C2" : errors.driversLicense ? "#FF3B30" : "#8E8E93"} 
          />
          <View style={styles.documentTextContainer}>
            <Text style={styles.documentTitle}>Driver's License</Text>
            <Text style={styles.documentDescription}>
              {formData.driversLicense ? formData.driversLicense.name : "Upload a clear photo of your driver's license"}
            </Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.documentButton, 
            formData.vehicleRegistration ? styles.documentUploaded : {},
            errors.vehicleRegistration ? styles.documentError : {}
          ]} 
          onPress={() => handleFileUpload('vehicleRegistration')}
        >
          <Ionicons 
            name={formData.vehicleRegistration ? "checkmark-circle" : "cloud-upload-outline"} 
            size={24} 
            color={formData.vehicleRegistration ? "#39C9C2" : errors.vehicleRegistration ? "#FF3B30" : "#8E8E93"} 
          />
          <View style={styles.documentTextContainer}>
            <Text style={styles.documentTitle}>Vehicle Registration</Text>
            <Text style={styles.documentDescription}>
              {formData.vehicleRegistration ? formData.vehicleRegistration.name : "Upload your vehicle registration document"}
            </Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.documentButton, 
            formData.insuranceDocument ? styles.documentUploaded : {},
            errors.insuranceDocument ? styles.documentError : {}
          ]} 
          onPress={() => handleFileUpload('insuranceDocument')}
        >
          <Ionicons 
            name={formData.insuranceDocument ? "checkmark-circle" : "cloud-upload-outline"} 
            size={24} 
            color={formData.insuranceDocument ? "#39C9C2" : errors.insuranceDocument ? "#FF3B30" : "#8E8E93"} 
          />
          <View style={styles.documentTextContainer}>
            <Text style={styles.documentTitle}>Insurance Document</Text>
            <Text style={styles.documentDescription}>
              {formData.insuranceDocument ? formData.insuranceDocument.name : "Upload proof of insurance"}
            </Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.documentButton, 
            formData.backgroundCheckConsent ? styles.documentUploaded : {},
            errors.backgroundCheckConsent ? styles.documentError : {}
          ]} 
          onPress={() => handleFileUpload('backgroundCheckConsent')}
        >
          <Ionicons 
            name={formData.backgroundCheckConsent ? "checkmark-circle" : "cloud-upload-outline"} 
            size={24} 
            color={formData.backgroundCheckConsent ? "#39C9C2" : errors.backgroundCheckConsent ? "#FF3B30" : "#8E8E93"} 
          />
          <View style={styles.documentTextContainer}>
            <Text style={styles.documentTitle}>Background Check Consent</Text>
            <Text style={styles.documentDescription}>
              {formData.backgroundCheckConsent ? formData.backgroundCheckConsent.name : "Upload signed background check consent form"}
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.navigationButtons}>
          <TouchableOpacity style={styles.backButton} onPress={handlePreviousPage}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.registerButton} 
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Register</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 1:
        return renderBasicInfoPage();
      case 2:
        return renderVehicleInfoPage();
      case 3:
        return renderDocumentsPage();
      default:
        return renderBasicInfoPage();
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Driver Registration</Text>
          {renderPageIndicator()}
        </View>

        {renderCurrentPage()}

        <View style={styles.footer}>
          <Text style={styles.loginText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/driverLogin')}>
            <Text style={styles.loginLink}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 30,
  },
  logo: {
    width: 48,
    height: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#173252',
    marginBottom: 16,
  },
  pageIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  indicatorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E0E0E0',
  },
  activeDot: {
    backgroundColor: '#39C9C2',
  },
  indicatorLine: {
    width: 30,
    height: 2,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 4,
  },
  formContainer: {
    width: '100%',
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#173252',
    marginBottom: 16,
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#6D6D6D',
    marginBottom: 16,
  },
  input: {
    height: 48,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 4,
    color: '#000000',
  },
  inputError: {
    borderWidth: 1,
    borderColor: '#FF3B30',
    backgroundColor: '#FFF5F5',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginBottom: 12,
    marginLeft: 4,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  nextButton: {
    backgroundColor: '#39C9C2',
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    flex: 1,
  },
  backButton: {
    backgroundColor: '#FFFFFF',
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    flex: 1,
  },
  registerButton: {
    backgroundColor: '#39C9C2',
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    flex: 1,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  backButtonText: {
    color: '#6D6D6D',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    color: '#6D6D6D',
    marginBottom: 8,
  },
  loginLink: {
    fontSize: 16,
    color: '#39C9C2',
    fontWeight: '600',
  },
  documentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  documentUploaded: {
    borderWidth: 1,
    borderColor: '#39C9C2',
  },
  documentError: {
    borderWidth: 1,
    borderColor: '#FF3B30',
    backgroundColor: '#FFF5F5',
  },
  documentTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#173252',
    marginBottom: 4,
  },
  documentDescription: {
    fontSize: 12,
    color: '#6D6D6D',
  },
});
