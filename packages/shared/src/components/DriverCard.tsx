import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Platform, ImageStyle } from 'react-native';

interface Driver {
  id: string;
  firstName: string;
  lastName: string;
  profileImage?: string;
  status: 'available' | 'on_delivery' | 'offline';
  truckType: string;
  phoneNumber: string;
}

interface DriverCardProps {
  driver: Driver;
  onPress?: () => void;
  showAssignButton?: boolean;
  onAssign?: () => void;
  isAssigned?: boolean;
}

export const DriverCard: React.FC<DriverCardProps> = ({
  driver,
  onPress,
  showAssignButton = false,
  onAssign,
  isAssigned = false,
}) => {
  const statusColors = {
    available: '#4CAF50',
    on_delivery: '#FFC107',
    offline: '#9E9E9E',
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.container,
        Platform.OS === 'web' && { transform: [{ scale: 1 }] },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: driver.profileImage || 'https://via.placeholder.com/50' }}
            style={styles.image as ImageStyle}
          />
          <View
            style={[
              styles.statusDot,
              { backgroundColor: statusColors[driver.status] },
            ]}
          />
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{`${driver.firstName} ${driver.lastName}`}</Text>
          <Text style={styles.detail}>{driver.truckType}</Text>
          <Text style={styles.detail}>{driver.phoneNumber}</Text>
        </View>
        {showAssignButton && (
          <TouchableOpacity
            onPress={onAssign}
            style={[
              styles.assignButton,
              isAssigned && styles.assignedButton,
            ]}
          >
            <Text style={styles.assignButtonText}>
              {isAssigned ? 'Assigned' : 'Assign'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  info: {
    marginLeft: 16,
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  detail: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  assignButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  assignedButton: {
    backgroundColor: '#4CAF50',
  },
  assignButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
}); 