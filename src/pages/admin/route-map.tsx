import React from 'react';
import { NextPage } from 'next';
import MapRouteLayer from '../../components/map/RouteMapComponent';
import { useBasicMapStore } from '../../store/map/useBasicMapStore';

const RouteMapPage: NextPage = () => {
  const availableMapStyles = useBasicMapStore(state => state.availableMapStyles);
  const activeMapStyle = useBasicMapStore(state => state.activeMapStyle);
  const setActiveMapStyle = useBasicMapStore(state => state.setActiveMapStyle);
  const resetView = useBasicMapStore(state => state.resetView);

  return (
    <div className="h-screen w-full">
      <div className="flex items-center justify-between p-4 bg-blue-600 text-white">
        <h1 className="text-xl font-bold">LoadUp Route Map</h1>
        <div className="flex space-x-2">
          <select 
            className="bg-white text-gray-800 px-4 py-1 rounded"
            value={activeMapStyle}
            onChange={(e) => setActiveMapStyle(e.target.value)}
          >
            {availableMapStyles.map(style => (
              <option key={style.id} value={style.id}>
                {style.label}
              </option>
            ))}
          </select>
          <button 
            className="bg-white text-gray-800 px-4 py-1 rounded"
            onClick={resetView}
          >
            Reset View
          </button>
        </div>
      </div>
      <div className="h-[calc(100vh-64px)]">
        <MapRouteLayer height="100%" />
      </div>
    </div>
  );
};

export default RouteMapPage; 