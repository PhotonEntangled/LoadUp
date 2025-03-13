import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { MapMarker, DeliveryStop, MapRegion } from '../types/index.js';
import { calculateRegion, calculateDeliveryTimes, optimizeRoute } from '../utils/map.js';

// Add type assertion for MapView
const MapViewComponent = MapView as unknown as React.ComponentType<any>;

interface MapProps {
  markers: MapMarker[];
  stops: DeliveryStop[];
  driverLocation?: { latitude: number; longitude: number };
  onMarkerPress?: (marker: MapMarker) => void;
  onRegionChange?: (region: MapRegion) => void;
}

export const Map: React.FC<MapProps> = ({
  markers,
  stops,
  driverLocation,
  onMarkerPress,
  onRegionChange,
}) => {
  const [region, setRegion] = useState<MapRegion>(calculateRegion(markers));
  const [optimizedStops, setOptimizedStops] = useState<DeliveryStop[]>(stops);
  const [routeCoordinates, setRouteCoordinates] = useState<{ latitude: number; longitude: number; }[]>([]);

  useEffect(() => {
    if (driverLocation && stops.length > 0) {
      // Optimize route when driver location or stops change
      const optimizeDeliveryRoute = async () => {
        const optimized = await optimizeRoute({ stops, driverLocation });
        setOptimizedStops(optimized);

        // Calculate delivery times for optimized route
        const withTimes = await calculateDeliveryTimes({
          stops: optimized,
          driverLocation,
        });

        // Create route coordinates including driver location
        const coordinates = [
          driverLocation,
          ...withTimes.map(stop => ({
            latitude: stop.latitude,
            longitude: stop.longitude,
          })),
        ];

        setRouteCoordinates(coordinates);
      };

      optimizeDeliveryRoute();
    }
  }, [driverLocation, stops]);

  const handleRegionChange = (newRegion: MapRegion) => {
    setRegion(newRegion);
    onRegionChange?.(newRegion);
  };

  const renderMarker = (marker: MapMarker) => {
    const markerColor = marker.markerType === 'driver' ? '#4CAF50' : '#2196F3';
    const markerSize = marker.markerType === 'driver' ? 40 : 30;

    return (
      <Marker
        key={`${marker.id}`}
        coordinate={{
          latitude: marker.latitude,
          longitude: marker.longitude,
        }}
        title={marker.title}
        description={marker.markerType === 'shipment' ? `ETA: ${marker.estimatedArrival?.toLocaleTimeString()}` : marker.description}
        pinColor={markerColor}
        onPress={() => onMarkerPress?.(marker)}
      >
        <View
          style={{
            width: markerSize,
            height: markerSize,
            backgroundColor: markerColor,
            borderRadius: markerSize / 2,
            borderWidth: 2,
            borderColor: '#FFFFFF',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        />
      </Marker>
    );
  };

  return (
    <MapViewComponent
      style={{ width: '100%', height: '100%' }}
      region={region}
      onRegionChange={handleRegionChange}
      showsUserLocation
      showsMyLocationButton
      showsCompass
      showsScale
    >
      {markers.map(renderMarker)}
      
      {routeCoordinates.length > 0 && (
        <Polyline
          coordinates={routeCoordinates}
          strokeWidth={3}
          strokeColor="#2196F3"
          lineDashPattern={[1]}
        />
      )}
    </MapViewComponent>
  );
}; 