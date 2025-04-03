import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ThemedText from './ThemedText';
import ThemedView from './ThemedView';

interface ReceiptProps {
  receipt: {
    _id: string;
    receiptNumber: string;
    timestamp: string;
    baseFare: number;
    distanceFare: number;
    tipAmount: number;
    totalAmount: number;
    distance: number;
    duration?: number;
    pickupLocation: string;
    dropoffLocation: string;
    paymentMethod: string;
    riderID?: {
      firstName?: string;
      lastName?: string;
      email?: string;
    };
    driverID?: {
      firstName?: string;
      lastName?: string;
      vehicleMake?: string;
      vehicleModel?: string;
    };
  };
  onClose?: () => void;
}

const Receipt: React.FC<ReceiptProps> = ({ receipt, onClose }) => {
  // Apply default values for any missing fields to prevent errors
  const safeReceipt = {
    ...receipt,
    receiptNumber: receipt.receiptNumber || 'Unknown',
    timestamp: receipt.timestamp || new Date().toISOString(),
    baseFare: receipt.baseFare || 0,
    distanceFare: receipt.distanceFare || 0,
    tipAmount: receipt.tipAmount || 0,
    totalAmount: receipt.totalAmount || 0,
    distance: receipt.distance || 0,
    pickupLocation: receipt.pickupLocation || 'Unknown',
    dropoffLocation: receipt.dropoffLocation || 'Unknown',
    paymentMethod: receipt.paymentMethod || 'Unknown',
    driverID: receipt.driverID || { firstName: 'Unknown', lastName: 'Driver' },
    riderID: receipt.riderID || { firstName: 'Unknown', lastName: 'Rider' }
  };

  const formattedDate = new Date(safeReceipt.timestamp).toLocaleDateString();
  const formattedTime = new Date(safeReceipt.timestamp).toLocaleTimeString();

  const shareReceipt = async () => {
    try {
      const driverInfo = safeReceipt.driverID && safeReceipt.driverID.firstName
        ? `Driver: ${safeReceipt.driverID.firstName} ${safeReceipt.driverID.lastName || ''}
${safeReceipt.driverID.vehicleMake ? `Vehicle: ${safeReceipt.driverID.vehicleMake} ${safeReceipt.driverID.vehicleModel || ''}` : ''}`
        : 'Driver information not available';

      const shareContent = `
Fleet Ride Receipt
Receipt #: ${safeReceipt.receiptNumber}
Date: ${formattedDate} ${formattedTime}
----------------------------------
Pickup: ${safeReceipt.pickupLocation}
Dropoff: ${safeReceipt.dropoffLocation}
Distance: ${safeReceipt.distance.toFixed(2)} km
${safeReceipt.duration ? `Duration: ${safeReceipt.duration} min` : ''}
----------------------------------
Base Fare: $${safeReceipt.baseFare.toFixed(2)}
Distance Fare: $${safeReceipt.distanceFare.toFixed(2)}
Tip: $${safeReceipt.tipAmount.toFixed(2)}
----------------------------------
Total: $${safeReceipt.totalAmount.toFixed(2)}
Payment Method: ${safeReceipt.paymentMethod}
----------------------------------
${driverInfo}
      `;

      await Share.share({
        message: shareContent,
        title: `Fleet Receipt #${safeReceipt.receiptNumber}`,
      });
    } catch (error) {
      console.error('Error sharing receipt:', error);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>Receipt</ThemedText>
          {onClose && (
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#173252" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.receiptCard}>
          <View style={styles.receiptHeader}>
            <ThemedText style={styles.receiptTitle}>Fleet</ThemedText>
            <ThemedText style={styles.receiptNumber}>#{safeReceipt.receiptNumber}</ThemedText>
          </View>

          <View style={styles.receiptDate}>
            <ThemedText style={styles.dateText}>{formattedDate}</ThemedText>
            <ThemedText style={styles.timeText}>{formattedTime}</ThemedText>
          </View>

          <View style={styles.divider} />

          <View style={styles.locationSection}>
            <View style={styles.locationItem}>
              <Ionicons name="location" size={18} color="#173252" />
              <ThemedText style={styles.locationLabel}>Pickup</ThemedText>
              <ThemedText style={styles.locationText}>{safeReceipt.pickupLocation}</ThemedText>
            </View>
            <View style={styles.locationItem}>
              <Ionicons name="location" size={18} color="#173252" />
              <ThemedText style={styles.locationLabel}>Dropoff</ThemedText>
              <ThemedText style={styles.locationText}>{safeReceipt.dropoffLocation}</ThemedText>
            </View>
          </View>

          <View style={styles.tripDetails}>
            <View style={styles.tripDetail}>
              <ThemedText style={styles.detailLabel}>Distance</ThemedText>
              <ThemedText style={styles.detailValue}>{safeReceipt.distance.toFixed(2)} km</ThemedText>
            </View>
            {safeReceipt.duration && (
              <View style={styles.tripDetail}>
                <ThemedText style={styles.detailLabel}>Duration</ThemedText>
                <ThemedText style={styles.detailValue}>{safeReceipt.duration} min</ThemedText>
              </View>
            )}
          </View>

          <View style={styles.divider} />

          <View style={styles.fareSection}>
            <View style={styles.fareItem}>
              <ThemedText style={styles.fareLabel}>Base Fare</ThemedText>
              <ThemedText style={styles.fareValue}>${safeReceipt.baseFare.toFixed(2)}</ThemedText>
            </View>
            <View style={styles.fareItem}>
              <ThemedText style={styles.fareLabel}>Distance Fare</ThemedText>
              <ThemedText style={styles.fareValue}>${safeReceipt.distanceFare.toFixed(2)}</ThemedText>
            </View>
            <View style={styles.fareItem}>
              <ThemedText style={styles.fareLabel}>Tip</ThemedText>
              <ThemedText style={styles.fareValue}>${safeReceipt.tipAmount.toFixed(2)}</ThemedText>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.totalSection}>
            <ThemedText style={styles.totalLabel}>Total</ThemedText>
            <ThemedText style={styles.totalValue}>${safeReceipt.totalAmount.toFixed(2)}</ThemedText>
          </View>

          <View style={styles.paymentMethod}>
            <ThemedText style={styles.paymentLabel}>Payment Method</ThemedText>
            <ThemedText style={styles.paymentValue}>{safeReceipt.paymentMethod}</ThemedText>
          </View>

          <View style={styles.divider} />

          <View style={styles.driverSection}>
            <ThemedText style={styles.driverLabel}>Driver</ThemedText>
            {safeReceipt.driverID && safeReceipt.driverID.firstName ? (
              <>
                <ThemedText style={styles.driverName}>
                  {safeReceipt.driverID.firstName} {safeReceipt.driverID.lastName || ''}
                </ThemedText>
                {safeReceipt.driverID.vehicleMake && (
                  <ThemedText style={styles.vehicleInfo}>
                    {safeReceipt.driverID.vehicleMake} {safeReceipt.driverID.vehicleModel || ''}
                  </ThemedText>
                )}
              </>
            ) : (
              <ThemedText style={styles.driverName}>
                Driver information not available
              </ThemedText>
            )}
          </View>
        </View>

        <TouchableOpacity style={styles.shareButton} onPress={shareReceipt}>
          <Ionicons name="share-outline" size={20} color="#fff" />
          <Text style={styles.shareButtonText}>Share Receipt</Text>
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f6f7f9',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#173252',
  },
  closeButton: {
    padding: 4,
  },
  receiptCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
  },
  receiptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  receiptTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#173252',
  },
  receiptNumber: {
    fontSize: 14,
    color: '#666',
  },
  receiptDate: {
    marginBottom: 12,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  timeText: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 12,
  },
  locationSection: {
    marginBottom: 12,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  locationLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    width: 60,
    marginLeft: 8,
  },
  locationText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  tripDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  tripDetail: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  fareSection: {
    marginBottom: 12,
  },
  fareItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  fareLabel: {
    fontSize: 14,
    color: '#666',
  },
  fareValue: {
    fontSize: 14,
    color: '#333',
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#173252',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#173252',
  },
  paymentMethod: {
    marginBottom: 12,
  },
  paymentLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  paymentValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  driverSection: {
    marginBottom: 8,
  },
  driverLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  driverName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  vehicleInfo: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  shareButton: {
    backgroundColor: '#173252',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
});

export default Receipt;
