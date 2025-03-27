import React from 'react';
// Removed: BasicMapComponent - use MapboxMap from packages/shared instead '../../components/map/BasicMapComponent';
import { NextPage } from 'next';

const BasicMapPage: NextPage = () => {
  return (
    <div className="h-screen w-full">
      <div className="flex items-center justify-between p-4 bg-blue-600 text-white">
        <h1 className="text-xl font-bold">LoadUp Basic Map Test</h1>
      </div>
      <div className="h-[calc(100vh-64px)]">
        {/* Removed BasicMapComponent - use MapboxMap */} />
      </div>
    </div>
  );
};

export default BasicMapPage; 