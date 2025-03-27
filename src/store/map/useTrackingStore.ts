import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// Tracking configuration types
export type TrackingMode = 'realtime' | 'polling' | 'manual';

interface TrackingState {
  // State
  isTrackingEnabled: boolean;
  trackingMode: TrackingMode;
  pollingInterval: number; // in milliseconds
  trackingHistory: boolean;
  maxHistoryPoints: number;
  locationBufferSize: number;
  
  // Actions
  setTrackingEnabled: (enabled: boolean) => void;
  setTrackingMode: (mode: TrackingMode) => void;
  setPollingInterval: (interval: number) => void;
  setRefreshInterval: (interval: number) => void; // Alias for setPollingInterval for backward compatibility
  setTrackingHistory: (enabled: boolean) => void;
  setMaxHistoryPoints: (points: number) => void;
  setLocationBufferSize: (size: number) => void;
  resetToDefaults: () => void;
}

const DEFAULT_TRACKING_STATE = {
  isTrackingEnabled: true,
  trackingMode: 'polling' as TrackingMode,
  pollingInterval: 5000, // 5 seconds
  trackingHistory: true,
  maxHistoryPoints: 50,
  locationBufferSize: 10
};

export const useTrackingStore = create<TrackingState>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        ...DEFAULT_TRACKING_STATE,
        
        // Actions
        setTrackingEnabled: (enabled) => {
          set({ isTrackingEnabled: enabled });
        },
        
        setTrackingMode: (mode) => {
          set({ trackingMode: mode });
        },
        
        setPollingInterval: (interval) => {
          set({ pollingInterval: interval });
        },
        
        setRefreshInterval: (interval) => {
          set({ pollingInterval: interval });
        },
        
        setTrackingHistory: (enabled) => {
          set({ trackingHistory: enabled });
        },
        
        setMaxHistoryPoints: (points) => {
          set({ maxHistoryPoints: points });
        },
        
        setLocationBufferSize: (size) => {
          set({ locationBufferSize: size });
        },
        
        resetToDefaults: () => {
          set(DEFAULT_TRACKING_STATE);
        }
      }),
      { name: 'tracking-store' }
    )
  )
);

// Selectors
export const useTrackingConfig = () => 
  useTrackingStore(state => ({
    isEnabled: state.isTrackingEnabled,
    mode: state.trackingMode,
    interval: state.pollingInterval,
    history: state.trackingHistory,
    maxHistory: state.maxHistoryPoints,
    bufferSize: state.locationBufferSize
  }));

export const useTrackingEnabled = () => 
  useTrackingStore(state => state.isTrackingEnabled);

export const useTrackingMode = () =>
  useTrackingStore(state => state.trackingMode); 