import React from 'react';
import SimulationDemoPanel from '../components/demo/SimulationDemoPanel';

const MapTestPage: React.FC = () => {
  return (
    <div className="map-test-page" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '20px', fontSize: '24px', fontWeight: 'bold' }}>
        Vehicle Simulation Test
      </h1>
      
      <div style={{ marginBottom: '20px' }}>
        <p>
          This page tests the simulation of vehicles on the map with randomized routes.
          Use the controls to seed vehicles, start/stop animation, and adjust simulation speed.
        </p>
        <p style={{ marginTop: '10px', color: '#666' }}>
          <strong>Note:</strong> This is a development test page that demonstrates the fixed render loop 
          and simulation capabilities. Check console logs for detailed debugging information.
        </p>
      </div>
      
      <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', position: 'relative' }}>
        <SimulationDemoPanel />
      </div>
    </div>
  );
};

export default MapTestPage; 