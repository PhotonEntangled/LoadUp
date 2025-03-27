'use client';

import React from 'react';
import BasicMapComponent from '../../../components/map/BasicMapComponent';

export default function BasicMapPage() {
  return (
    <div className="h-screen w-full flex flex-col">
      <div className="flex items-center justify-between p-4 bg-blue-600 text-white">
        <h1 className="text-xl font-bold">LoadUp Basic Map Test</h1>
      </div>
      <div className="flex-grow">
        <BasicMapComponent />
      </div>
    </div>
  );
} 