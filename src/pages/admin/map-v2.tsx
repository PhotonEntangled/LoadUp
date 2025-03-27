import React from 'react';
import Head from 'next/head';
import SimulatedVehicleMap from '../../components/map/SimulatedVehicleMap';
import { VehicleTrackingProvider } from '../../components/VehicleTrackingProvider';
import { VehicleServiceType } from '../../services/VehicleServiceFactory';
import { TrackingControls } from '../../components/TrackingControls';

const MapV2TestPage: React.FC = () => {
  return (
    <div className="map-test-container">
      <Head>
        <title>LoadUp - Fleet Overview</title>
        <link href="https://api.mapbox.com/mapbox-gl-js/v2.14.1/mapbox-gl.css" rel="stylesheet" />
      </Head>
      
      <VehicleTrackingProvider>
        <div className="header">
          <h1>Fleet Overview Map</h1>
          <p>Real-time tracking of your entire fleet</p>
        </div>
        
        <div className="controls-container">
          <TrackingControls className="mb-4" />
        </div>
        
        <div className="map-container">
          <SimulatedVehicleMap 
            initialZoom={10}
            mapStyle="mapbox://styles/mapbox/streets-v11"
            className="h-[calc(100vh-200px)]"
            onMapLoad={(map) => console.log('Map is ready')}
          />
        </div>
      </VehicleTrackingProvider>
      
      <style jsx>{`
        .map-test-container {
          padding: 20px;
        }
        
        .header {
          margin-bottom: 20px;
        }
        
        .header h1 {
          margin: 0 0 10px 0;
          font-size: 24px;
        }
        
        .header p {
          margin: 0;
          color: #666;
        }
        
        .controls-container {
          margin-bottom: 20px;
        }
        
        .map-container {
          border: 1px solid #ddd;
          border-radius: 4px;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default MapV2TestPage; 