import React from 'react';
import { NextPage } from 'next';
import dynamic from 'next/dynamic';

// Use dynamic import with no SSR to avoid mapbox-gl issues on server
const VehicleTrackingPage = dynamic(
  () => import('../src/pages/VehicleTrackingPage'),
  { ssr: false }
);

const VehicleTrackingRoute: NextPage = () => {
  return <VehicleTrackingPage />;
};

export default VehicleTrackingRoute; 