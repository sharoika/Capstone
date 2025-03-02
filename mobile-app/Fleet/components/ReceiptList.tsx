import React from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ThemedText from './ThemedText';
import ThemedView from './ThemedView';

interface Receipt {
  _id: string;
  receiptNumber: string;
  timestamp: string;
  totalAmount: number;
  pickupLocation: string;
  dropoffLocation: string;
  driverID?: {
    firstName: string;
    lastName: string;
  };
  riderID?: {
    firstName: string;
    lastName: string;
  };
}

interface ReceiptListProps {
  receipts: Receipt[];
  loading: boolean;
  onSelectReceipt: (receiptId: string) => void;
  userType: 'rider' | 'driver';
  emptyMessage?: string;
}

const ReceiptList: React.FC<ReceiptListProps> = ({
  receipts,
  loading,
  onSelectReceipt,
  userType,
  emptyMessage = 'No receipts found'
}) => {
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#173252" />
      </View>
    );
  }

  if (receipts.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="receipt-outline" size={64} color="#ccc" />
        <ThemedText style={styles.emptyText}>{emptyMessage}</ThemedText>
      </View>
    );
  }

  const renderItem = ({ item }: { item: Receipt }) => {
    const date = new Date(item.timestamp).toLocaleDateString();
    const time = new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Display the name of the other party (driver for rider, rider for driver)
    const otherPartyName = userType === 'rider' && item.driverID 
      ? `${item.driverID.firstName} ${item.driverID.lastName}`
      : userType === 'driver' && item.riderID
        ? `${item.riderID.firstName} ${item.riderID.lastName}`
        : '';

    return (
      <TouchableOpacity 
        style={styles.receiptItem} 
        onPress={() => onSelectReceipt(item._id)}
      >
        <View style={styles.receiptHeader}>
          <ThemedText style={styles.receiptDate}>{date}</ThemedText>
          <ThemedText style={styles.receiptTime}>{time}</ThemedText>
        </View>
        
        <View style={styles.receiptDetails}>
          <View style={styles.locationContainer}>
            <ThemedText numberOfLines={1} style={styles.locationText}>
              {item.pickupLocation} → {item.dropoffLocation}
            </ThemedText>
          </View>
          
          {otherPartyName && (
            <ThemedText style={styles.personName}>
              {userType === 'rider' ? 'Driver' : 'Rider'}: {otherPartyName}
            </ThemedText>
          )}
        </View>
        
        <View style={styles.receiptFooter}>
          <ThemedText style={styles.receiptNumber}>#{item.receiptNumber}</ThemedText>
          <ThemedText style={styles.receiptAmount}>${item.totalAmount.toFixed(2)}</ThemedText>
        </View>
        
        <Ionicons 
          name="chevron-forward" 
          size={20} 
          color="#173252" 
          style={styles.chevron} 
        />
      </TouchableOpacity>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={receipts}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f7f9',
  },
  listContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
  },
  receiptItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  receiptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  receiptDate: {
    fontSize: 14,
    fontWeight: '500',
    color: '#173252',
  },
  receiptTime: {
    fontSize: 14,
    color: '#666',
  },
  receiptDetails: {
    marginBottom: 12,
  },
  locationContainer: {
    marginBottom: 4,
  },
  locationText: {
    fontSize: 14,
    color: '#333',
  },
  personName: {
    fontSize: 14,
    color: '#666',
  },
  receiptFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  receiptNumber: {
    fontSize: 12,
    color: '#666',
  },
  receiptAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#173252',
  },
  chevron: {
    position: 'absolute',
    right: 16,
    top: '50%',
    marginTop: -10,
  },
});

export default ReceiptList;
