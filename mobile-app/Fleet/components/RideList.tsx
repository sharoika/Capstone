import React from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ThemedText from './ThemedText';
import ThemedView from './ThemedView';

interface Ride {
  _id: string;
  timestamp: string;
  pickupLocation: string;
  dropoffLocation: string;
  status: string;
  distance: number;
  vehicleDetails?: string;
  driverID?: {
    firstName: string;
    lastName: string;
  };
  riderID?: {
    firstName: string;
    lastName: string;
  };
}

interface RideListProps {
  rides: Ride[];
  loading: boolean;
  onSelectRide: (rideId: string) => void;
  userType: 'rider' | 'driver';
  emptyMessage?: string;
}

const RideList: React.FC<RideListProps> = ({
  rides,
  loading,
  onSelectRide,
  userType,
  emptyMessage = 'No rides found'
}) => {
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#173252" />
      </View>
    );
  }

  if (rides.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="car-outline" size={64} color="#ccc" />
        <ThemedText style={styles.emptyText}>{emptyMessage}</ThemedText>
      </View>
    );
  }

  const renderItem = ({ item }: { item: Ride }) => {
    const date = new Date(item.timestamp).toLocaleDateString();
    const time = new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Determine the other party's name
    const otherPartyName = userType === 'rider' && item.driverID
      ? `${item.driverID.firstName} ${item.driverID.lastName}`
      : userType === 'driver' && item.riderID
        ? `${item.riderID.firstName} ${item.riderID.lastName}`
        : '';

    return (
      <TouchableOpacity 
        style={styles.rideItem} 
        onPress={() => onSelectRide(item._id)}
      >
        <View style={styles.rideHeader}>
          <ThemedText style={styles.rideDate}>{date}</ThemedText>
          <ThemedText style={styles.rideTime}>{time}</ThemedText>
        </View>
        
        <View style={styles.rideDetails}>
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

          <ThemedText style={styles.rideStatus}>Status: {item.status}</ThemedText>
        </View>
        
        <View style={styles.rideFooter}>
          <ThemedText style={styles.rideDistance}>{item.distance.toFixed(1)} km</ThemedText>
          {item.vehicleDetails && <ThemedText style={styles.vehicleDetails}>{item.vehicleDetails}</ThemedText>}
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
        data={rides}
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
  rideItem: {
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
  rideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  rideDate: {
    fontSize: 14,
    fontWeight: '500',
    color: '#173252',
  },
  rideTime: {
    fontSize: 14,
    color: '#666',
  },
  rideDetails: {
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
  rideStatus: {
    fontSize: 14,
    fontWeight: '500',
    color: '#173252',
  },
  rideFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  rideDistance: {
    fontSize: 14,
    color: '#666',
  },
  vehicleDetails: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  chevron: {
    position: 'absolute',
    right: 16,
    top: '50%',
    marginTop: -10,
  },
});

export default RideList;
