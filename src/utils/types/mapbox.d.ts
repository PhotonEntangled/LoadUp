/**
 * Type definitions for mapbox-gl
 * 
 * This file provides type definitions for mapbox-gl to fix TypeScript errors 
 * in our components. These are simplified versions of the official types.
 */

declare module 'mapbox-gl' {
  export class Map {
    getCenter(): { lng: number; lat: number };
    getZoom(): number;
    getSource(id: string): any;
    getLayer(id: string): any;
    loaded(): boolean;
    on(event: string, listener: (...args: any[]) => void): this;
    off(event: string, listener: (...args: any[]) => void): this;
    addSource(id: string, source: any): this;
    removeSource(id: string): this;
    addLayer(layer: any): this;
    removeLayer(id: string): this;
    setPaintProperty(layerId: string, name: string, value: any): this;
    fitBounds(bounds: [[number, number], [number, number]], options?: any): this;
    remove(): void;
  }

  export class Marker {
    setLngLat(lngLat: [number, number]): this;
    addTo(map: Map): this;
    remove(): this;
    getElement(): HTMLElement;
    setPopup(popup: Popup): this;
    togglePopup(): this;
    on(event: string, listener: (e: any) => void): this;
    off(event: string, listener: (e: any) => void): this;
  }

  export class Popup {
    setLngLat(lngLat: [number, number]): this;
    setDOMContent(htmlNode: Node): this;
    addTo(map: Map): this;
    remove(): this;
    on(event: string, listener: (e: any) => void): this;
    off(event: string, listener: (e: any) => void): this;
  }

  export class LngLat {
    lng: number;
    lat: number;
    constructor(lng: number, lat: number);
    wrap(): LngLat;
    toArray(): [number, number];
    toString(): string;
    distanceTo(lngLat: LngLat): number;
  }

  export interface GeoJSONSource {
    setData(data: any): void;
  }

  export interface LinePaint {
    'line-color': string;
    'line-width': number;
    'line-opacity': number;
    'line-blur'?: number;
  }

  export interface CirclePaint {
    'circle-radius': number;
    'circle-color': string;
    'circle-stroke-width'?: number;
    'circle-stroke-color'?: string;
    'circle-opacity'?: number;
  }

  export interface FillPaint {
    'fill-color': string;
    'fill-opacity': number;
    'fill-outline-color'?: string;
  }

  export type MapMouseEvent = {
    target: Map;
    originalEvent: MouseEvent;
    point: { x: number; y: number };
    lngLat: LngLat;
  };
} 