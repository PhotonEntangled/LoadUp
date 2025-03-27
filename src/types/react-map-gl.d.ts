declare module 'react-map-gl' {
  import React from 'react';
  import { Map as MapboxMap } from 'mapbox-gl';
  
  // Map component
  export interface MapProps {
    mapboxAccessToken?: string;
    mapStyle?: string;
    longitude?: number;
    latitude?: number;
    zoom?: number;
    bearing?: number;
    pitch?: number;
    padding?: {
      top: number;
      bottom: number;
      left: number;
      right: number;
    };
    onMove?: (evt: ViewStateChangeEvent) => void;
    onClick?: (evt: any) => void;
    onLoad?: () => void;
    children?: React.ReactNode;
    ref?: React.Ref<any>;
    [key: string]: any;
  }
  
  // Explicitly export Map as a React component that can be used with JSX
  const Map: React.ForwardRefExoticComponent<
    MapProps & React.RefAttributes<MapRef>
  >;
  export default Map;
  
  // Also export Map class for cases where the class is needed directly
  export { Map };

  export interface MapRef {
    getMap(): MapboxMap;
    flyTo(options: FlyToOptions): void;
    fitBounds(
      bounds: [[number, number], [number, number]],
      options?: { padding?: number; maxZoom?: number }
    ): void;
  }
  
  export interface ViewState {
    longitude: number;
    latitude: number;
    zoom: number;
    bearing: number;
    pitch: number;
    padding?: {
      top: number;
      bottom: number;
      left: number;
      right: number;
    };
  }
  
  export interface ViewStateChangeEvent {
    viewState: ViewState;
    interactionState: any;
    oldViewState: ViewState;
  }
  
  export interface FlyToOptions {
    center: [number, number];
    zoom?: number;
    bearing?: number;
    pitch?: number;
    duration?: number;
  }
  
  export interface MarkerProps {
    longitude: number;
    latitude: number;
    anchor?: 'center' | 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    offset?: [number, number];
    rotation?: number;
    rotationAlignment?: 'map' | 'viewport' | 'auto';
    pitchAlignment?: 'map' | 'viewport' | 'auto';
    draggable?: boolean;
    onClick?: (evt: any) => void;
    onMouseEnter?: (evt: any) => void;
    onMouseLeave?: (evt: any) => void;
    children?: React.ReactNode;
  }
  
  export class Marker extends React.Component<MarkerProps> {}
  
  export interface PopupProps {
    longitude: number;
    latitude: number;
    anchor?: 'center' | 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    offset?: number | [number, number];
    closeButton?: boolean;
    closeOnClick?: boolean;
    onClose?: () => void;
    className?: string;
    maxWidth?: string;
    tipSize?: number;
    children?: React.ReactNode;
  }
  
  export class Popup extends React.Component<PopupProps> {}
  
  // Navigation Control
  export interface NavigationControlProps {
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    showCompass?: boolean;
    showZoom?: boolean;
    visualizePitch?: boolean;
  }
  
  export class NavigationControl extends React.Component<NavigationControlProps> {}
  
  // Other controls
  export class GeolocateControl extends React.Component<any> {}
  export class FullscreenControl extends React.Component<any> {}
  export class ScaleControl extends React.Component<any> {}
  
  // Source component
  export interface SourceProps {
    id: string;
    type: 'geojson' | 'vector' | 'raster' | 'image' | 'video';
    data?: any;
    children?: React.ReactNode;
    [key: string]: any;
  }
  
  export const Source: React.FC<SourceProps>;
  
  // Layer component
  export interface LayerProps {
    id: string;
    type: 
      | 'fill' 
      | 'line' 
      | 'symbol' 
      | 'circle' 
      | 'heatmap' 
      | 'fill-extrusion' 
      | 'raster' 
      | 'hillshade' 
      | 'background';
    source?: string;
    layout?: any;
    paint?: any;
    [key: string]: any;
  }
  
  export const Layer: React.FC<LayerProps>;
  
  // Layer type definitions
  export interface LineLayer {
    id: string;
    type: 'line';
    source?: string;
    'source-layer'?: string;
    paint?: {
      'line-width'?: number | any[];
      'line-color'?: string | any[];
      'line-opacity'?: number | any[];
      [key: string]: any;
    };
    layout?: {
      'line-join'?: 'miter' | 'round' | 'bevel';
      'line-cap'?: 'butt' | 'round' | 'square';
      [key: string]: any;
    };
    filter?: any[];
    [key: string]: any;
  }
} 