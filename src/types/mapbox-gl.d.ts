declare module 'mapbox-gl' {
  // This is a minimal declaration file for mapbox-gl CSS imports
  export {};

  export interface MapboxOptions {
    container: HTMLElement | string;
    style: string;
    center?: [number, number];
    zoom?: number;
    bearing?: number;
    pitch?: number;
    failIfMajorPerformanceCaveat?: boolean;
    preserveDrawingBuffer?: boolean;
    accessToken?: string;
  }

  export class Map {
    constructor(options: MapboxOptions);
    on(event: string, listener: (e?: any) => void): this;
    off(event: string, listener: (e?: any) => void): this;
    addControl(control: Control, position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'): this;
    removeControl(control: Control): this;
    getContainer(): HTMLElement;
    getCanvasContainer(): HTMLElement;
    getCanvas(): HTMLCanvasElement;
    getCenter(): { lng: number; lat: number };
    getZoom(): number;
    getBearing(): number;
    getPitch(): number;
    setCenter(center: [number, number]): this;
    setZoom(zoom: number): this;
    setBearing(bearing: number): this;
    setPitch(pitch: number): this;
    fitBounds(bounds: [[number, number], [number, number]], options?: any): this;
    remove(): void;
  }

  export class Marker {
    constructor(options?: { element?: HTMLElement, anchor?: string });
    setLngLat(lngLat: [number, number]): this;
    setPopup(popup: Popup): this;
    addTo(map: Map): this;
    remove(): this;
    getElement(): HTMLElement;
    getLngLat(): { lng: number; lat: number };
  }

  export class Popup {
    constructor(options?: { closeButton?: boolean, closeOnClick?: boolean, anchor?: string });
    setLngLat(lngLat: [number, number]): this;
    setHTML(html: string): this;
    setText(text: string): this;
    setDOMContent(htmlNode: Node): this;
    addTo(map: Map): this;
    remove(): this;
    isOpen(): boolean;
  }

  export class NavigationControl {
    constructor(options?: { showCompass?: boolean, showZoom?: boolean });
  }

  export class Control {
    constructor(options?: any);
  }

  // Global accessToken property
  export let accessToken: string;
} 