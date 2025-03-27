import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface BasicViewState {
  longitude: number;
  latitude: number;
  zoom: number;
  bearing?: number;
  pitch?: number;
}

interface MapStyle {
  id: string;
  label: string;
  uri: string;
}

interface BasicMapState {
  // State
  viewState: BasicViewState;
  activeMapStyle: string;
  availableMapStyles: MapStyle[];
  
  // Actions
  setViewState: (viewState: Partial<BasicViewState>) => void;
  setActiveMapStyle: (styleId: string) => void;
  resetView: () => void;
}

const DEFAULT_VIEW_STATE: BasicViewState = {
  longitude: -74.006, // Default center
  latitude: 40.7128,  // Default center (New York)
  zoom: 11,
  bearing: 0,
  pitch: 0
};

const DEFAULT_MAP_STYLES: MapStyle[] = [
  { id: 'streets-v12', label: 'Streets', uri: 'mapbox://styles/mapbox/streets-v12' },
  { id: 'satellite-v9', label: 'Satellite', uri: 'mapbox://styles/mapbox/satellite-v9' },
  { id: 'dark-v11', label: 'Dark', uri: 'mapbox://styles/mapbox/dark-v11' },
  { id: 'light-v11', label: 'Light', uri: 'mapbox://styles/mapbox/light-v11' }
];

export const useBasicMapStore = create<BasicMapState>()(
  devtools(
    (set) => ({
      // Initial state
      viewState: DEFAULT_VIEW_STATE,
      activeMapStyle: 'streets-v12',
      availableMapStyles: DEFAULT_MAP_STYLES,
      
      // Actions
      setViewState: (viewState) => {
        set((state) => ({
          viewState: {
            ...state.viewState,
            ...viewState
          }
        }));
      },
      
      setActiveMapStyle: (styleId) => {
        set({ activeMapStyle: styleId });
      },
      
      resetView: () => {
        set({ viewState: DEFAULT_VIEW_STATE });
      }
    })
  )
);

// Selector for the active map style
export const useActiveMapStyle = () => {
  const activeStyleId = useBasicMapStore((state) => state.activeMapStyle);
  const styles = useBasicMapStore((state) => state.availableMapStyles);
  return styles.find(style => style.id === activeStyleId) || styles[0];
}; 