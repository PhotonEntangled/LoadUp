import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import MapView, { Marker } from 'react-native-maps';
import { BarCodeScanner } from 'expo-barcode-scanner';
import * as Location from 'expo-location';
import { useAuth } from '@loadup/shared/src/hooks/useAuth';
import { MaterialIcons } from '@expo/vector-icons';
import { useToast } from 'react-native-toast-notifications';

type Shipment = {
  id: string;
  pickupAddress: string;
  deliveryAddress: string;
  status: 'PENDING' | 'ASSIGNED' | 'IN_TRANSIT' | 'DELIVERED';
  pickupCoordinates: {
    latitude: number;
    longitude: number;
  };
  deliveryCoordinates: {
    latitude: number;
    longitude: number;
  };
};

export function ShipmentTrackingScreen() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [isScannerVisible, setScannerVisible] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const { user } = useAuth();
  const toast = useToast();

  useEffect(() => {
    (async () => {
      // Request location permissions
      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
      if (locationStatus !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required for tracking.');
        return;
      }

      // Request camera permissions
      const { status: cameraStatus } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(cameraStatus === 'granted');

      // Start location updates
      Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        (newLocation) => {
          setLocation(newLocation);
          updateDriverLocation(newLocation);
        }
      );

      // Fetch assigned shipments
      fetchShipments();
    })();
  }, []);

  const fetchShipments = async () => {
    try {
      const response = await fetch('/api/shipments');
      const data = await response.json();
      setShipments(data);
      if (data.length > 0) {
        setSelectedShipment(data[0]);
      }
    } catch (error) {
      console.error('Error fetching shipments:', error);
      Alert.alert('Error', 'Failed to fetch shipments');
    }
  };

  const updateDriverLocation = async (location: Location.LocationObject) => {
    try {
      await fetch('/api/drivers/location', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        }),
      });
    } catch (error) {
      console.error('Error updating location:', error);
    }
  };

  const updateShipmentStatus = async (shipmentId: string, status: Shipment['status']) => {
    try {
      const response = await fetch(`/api/shipments?id=${shipmentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        fetchShipments();
        toast.show('Shipment status updated', {
          type: 'success',
        });
      }
    } catch (error) {
      console.error('Error updating shipment:', error);
      toast.show('Failed to update shipment status', {
        type: 'error',
      });
    }
  };

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    setScannerVisible(false);
    
    if (!selectedShipment) {
      Alert.alert('Error', 'No shipment selected');
      return;
    }

    try {
      // Verify the scanned barcode matches the shipment
      if (data === selectedShipment.id) {
        await updateShipmentStatus(selectedShipment.id, 'DELIVERED');
      } else {
        Alert.alert('Error', 'Invalid barcode for this shipment');
      }
    } catch (error) {
      console.error('Error processing barcode:', error);
      Alert.alert('Error', 'Failed to process barcode');
    }
  };

  if (!selectedShipment || !location) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isScannerVisible ? (
        <BarCodeScanner
          onBarCodeScanned={handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
      ) : (
        <>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
          >
            {/* Driver's current location */}
            <Marker
              coordinate={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              }}
              title="Your Location"
              pinColor="blue"
            />

            {/* Pickup location */}
            <Marker
              coordinate={selectedShipment.pickupCoordinates}
              title="Pickup"
              description={selectedShipment.pickupAddress}
              pinColor="green"
            />

            {/* Delivery location */}
            <Marker
              coordinate={selectedShipment.deliveryCoordinates}
              title="Delivery"
              description={selectedShipment.deliveryAddress}
              pinColor="red"
            />
          </MapView>

          <View style={styles.bottomPanel}>
            <View style={styles.shipmentInfo}>
              <Text style={styles.heading}>Current Shipment</Text>
              <Text>Status: {selectedShipment.status}</Text>
              <Text numberOfLines={1}>Pickup: {selectedShipment.pickupAddress}</Text>
              <Text numberOfLines={1}>Delivery: {selectedShipment.deliveryAddress}</Text>
            </View>

            <View style={styles.actions}>
              {selectedShipment.status === 'ASSIGNED' && (
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => updateShipmentStatus(selectedShipment.id, 'IN_TRANSIT')}
                >
                  <Text style={styles.buttonText}>Start Delivery</Text>
                </TouchableOpacity>
              )}

              {selectedShipment.status === 'IN_TRANSIT' && (
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => setScannerVisible(true)}
                >
                  <Text style={styles.buttonText}>Scan to Complete</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  bottomPanel: {
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
  shipmentInfo: {
    marginBottom: 16,
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
}); 