import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useAuth } from '@loadup/shared/hooks/useAuth';
import { Shipment, ShipmentStatus } from '@loadup/shared/types';
import { MaterialIcons } from '@expo/vector-icons';
import { useToast } from 'react-native-toast-notifications';

interface ShipmentTrackingScreenProps {
  route: {
    params: {
      shipmentId: string;
    };
  };
  navigation: any;
}

const STATUS_COLORS = {
  PENDING: '#FFA500',
  ASSIGNED: '#3498DB',
  PICKED_UP: '#2ECC71',
  IN_TRANSIT: '#9B59B6',
  DELIVERED: '#27AE60',
  CANCELLED: '#E74C3C',
};

export const ShipmentTrackingScreen: React.FC<ShipmentTrackingScreenProps> = ({
  route,
  navigation,
}) => {
  const { shipmentId } = route.params;
  const { user } = useAuth();
  const toast = useToast();

  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShipmentDetails();
    startLocationTracking();
  }, [shipmentId]);

  const fetchShipmentDetails = async () => {
    try {
      const response = await fetch(`/api/shipments/${shipmentId}`);
      const data = await response.json();
      setShipment(data);
    } catch (error) {
      toast.show('Failed to fetch shipment details', {
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const startLocationTracking = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      toast.show('Location permission denied', {
        type: 'error',
      });
      return;
    }

    Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
        distanceInterval: 10,
      },
      (location) => {
        setCurrentLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        updateDriverLocation(location.coords);
      }
    );
  };

  const updateDriverLocation = async (coords: {
    latitude: number;
    longitude: number;
  }) => {
    try {
      await fetch('/api/drivers/location', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          driverId: user?.id,
          latitude: coords.latitude,
          longitude: coords.longitude,
        }),
      });
    } catch (error) {
      console.error('Failed to update location:', error);
    }
  };

  const updateShipmentStatus = async (status: ShipmentStatus) => {
    try {
      const response = await fetch(`/api/shipments/${shipmentId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        setShipment((prev) => prev ? { ...prev, status } : null);
        toast.show(`Shipment status updated to ${status}`, {
          type: 'success',
        });
      } else {
        throw new Error('Failed to update status');
      }
    } catch (error) {
      toast.show('Failed to update shipment status', {
        type: 'error',
      });
    }
  };

  if (loading || !shipment) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: shipment.pickupAddress.latitude || 0,
          longitude: shipment.pickupAddress.longitude || 0,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {currentLocation && (
          <Marker
            coordinate={currentLocation}
            title="Your Location"
            description="Current position"
          >
            <MaterialIcons name="local-shipping" size={24} color="#2196F3" />
          </Marker>
        )}
        <Marker
          coordinate={{
            latitude: shipment.pickupAddress.latitude || 0,
            longitude: shipment.pickupAddress.longitude || 0,
          }}
          title="Pickup Location"
          pinColor={STATUS_COLORS.PENDING}
        />
        <Marker
          coordinate={{
            latitude: shipment.deliveryAddress.latitude || 0,
            longitude: shipment.deliveryAddress.longitude || 0,
          }}
          title="Delivery Location"
          pinColor={STATUS_COLORS.DELIVERED}
        />
      </MapView>

      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          Status: {shipment.status}
        </Text>
        <View style={styles.buttonContainer}>
          {shipment.status === 'ASSIGNED' && (
            <TouchableOpacity
              style={[styles.button, { backgroundColor: STATUS_COLORS.PICKED_UP }]}
              onPress={() => updateShipmentStatus('PICKED_UP')}
            >
              <Text style={styles.buttonText}>Mark as Picked Up</Text>
            </TouchableOpacity>
          )}
          {shipment.status === 'PICKED_UP' && (
            <TouchableOpacity
              style={[styles.button, { backgroundColor: STATUS_COLORS.IN_TRANSIT }]}
              onPress={() => updateShipmentStatus('IN_TRANSIT')}
            >
              <Text style={styles.buttonText}>Start Transit</Text>
            </TouchableOpacity>
          )}
          {shipment.status === 'IN_TRANSIT' && (
            <TouchableOpacity
              style={[styles.button, { backgroundColor: STATUS_COLORS.DELIVERED }]}
              onPress={() => updateShipmentStatus('DELIVERED')}
            >
              <Text style={styles.buttonText}>Mark as Delivered</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  statusContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 150,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
}); 