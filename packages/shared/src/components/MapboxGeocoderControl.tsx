import React, { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxGeocodingService, { GeocodingResult } from '../services/MapboxGeocodingService.js';

export interface MapboxGeocoderControlProps {
  map: mapboxgl.Map;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  placeholder?: string;
  limit?: number;
  countries?: string[];
  onResult?: (result: GeocodingResult) => void;
  onError?: (error: Error) => void;
  onClear?: () => void;
  markerColor?: string;
  showResultMarker?: boolean;
}

const MapboxGeocoderControl: React.FC<MapboxGeocoderControlProps> = ({
  map,
  position = 'top-right',
  placeholder = 'Search for an address',
  limit = 5,
  countries = [],
  onResult,
  onError,
  onClear,
  markerColor = '#3FB1CE',
  showResultMarker = true,
}) => {
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedResult, setSelectedResult] = useState<GeocodingResult | null>(null);
  
  const geocodingService = useRef(new MapboxGeocodingService());
  const controlRef = useRef<HTMLDivElement | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  
  // Initialize control container
  useEffect(() => {
    if (!map || controlRef.current) return;

    // Create control container
    const controlContainer = document.createElement('div');
    controlContainer.className = 'mapboxgl-ctrl mapboxgl-ctrl-group mapbox-geocoder-control';
    controlContainer.style.width = '300px';
    controlContainer.style.maxWidth = '100%';
    controlContainer.style.backgroundColor = '#fff';
    controlContainer.style.borderRadius = '4px';
    controlContainer.style.boxShadow = '0 0 10px 2px rgba(0,0,0,0.1)';
    
    // Add control to map
    const mapControlContainer = map.getContainer().querySelector(`.mapboxgl-ctrl-${position}`);
    
    if (mapControlContainer) {
      mapControlContainer.appendChild(controlContainer);
      controlRef.current = controlContainer;
    } else {
      // If control container doesn't exist, create it
      const ctrl = new mapboxgl.NavigationControl();
      map.addControl(ctrl, position);
      
      // Now try again
      const mapControlContainer = map.getContainer().querySelector(`.mapboxgl-ctrl-${position}`);
      if (mapControlContainer) {
        mapControlContainer.appendChild(controlContainer);
        controlRef.current = controlContainer;
      }
    }

    return () => {
      if (controlRef.current) {
        controlRef.current.remove();
        controlRef.current = null;
      }
      
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
    };
  }, [map, position]);

  // Handle search input changes
  const handleSearchChange = async (searchValue: string) => {
    setSearchText(searchValue);
    
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    
    if (!searchValue.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }
    
    // Debounce search requests to avoid too many API calls
    searchTimeout.current = setTimeout(async () => {
      try {
        setLoading(true);
        
        const options = {
          limit,
          country: countries.length > 0 ? countries.join(',') : undefined,
        };
        
        const searchResults = await geocodingService.current.geocode(searchValue, options);
        setResults(searchResults);
        setShowResults(searchResults.length > 0);
      } catch (error) {
        console.error('Geocoding failed:', error);
        if (onError && error instanceof Error) {
          onError(error);
        }
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  // Handle result selection
  const handleResultSelect = (result: GeocodingResult) => {
    setSelectedResult(result);
    setSearchText(result.placeName);
    setShowResults(false);
    
    // Fly to the selected location
    map.flyTo({
      center: [result.longitude, result.latitude],
      zoom: 14,
      essential: true,
    });
    
    // Add a marker for the selected location
    if (showResultMarker) {
      if (markerRef.current) {
        markerRef.current.remove();
      }
      
      const marker = new mapboxgl.Marker({
        color: markerColor,
      })
        .setLngLat([result.longitude, result.latitude])
        .addTo(map);
      
      markerRef.current = marker;
    }
    
    // Call onResult callback
    if (onResult) {
      onResult(result);
    }
  };

  // Handle clear button click
  const handleClear = () => {
    setSearchText('');
    setResults([]);
    setShowResults(false);
    setSelectedResult(null);
    
    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
    
    if (onClear) {
      onClear();
    }
  };

  // Render the control content
  useEffect(() => {
    if (!controlRef.current) return;
    
    // Clear existing content
    controlRef.current.innerHTML = '';
    
    // Create control UI
    const container = document.createElement('div');
    container.className = 'geocoder-container';
    container.style.position = 'relative';
    
    // Create search input
    const inputContainer = document.createElement('div');
    inputContainer.className = 'geocoder-input-container';
    inputContainer.style.display = 'flex';
    inputContainer.style.alignItems = 'center';
    inputContainer.style.padding = '8px';
    inputContainer.style.borderBottom = showResults ? '1px solid #e6e6e6' : 'none';
    
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'geocoder-input';
    input.placeholder = placeholder;
    input.value = searchText;
    input.style.flex = '1';
    input.style.border = 'none';
    input.style.padding = '8px';
    input.style.fontSize = '14px';
    input.style.outline = 'none';
    
    input.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement;
      handleSearchChange(target.value);
    });
    
    input.addEventListener('focus', () => {
      if (results.length > 0) {
        setShowResults(true);
      }
    });
    
    // Create clear button
    const clearButton = document.createElement('button');
    clearButton.className = 'geocoder-clear-button';
    clearButton.innerHTML = '✕';
    clearButton.style.border = 'none';
    clearButton.style.background = 'none';
    clearButton.style.cursor = 'pointer';
    clearButton.style.padding = '8px';
    clearButton.style.display = searchText ? 'block' : 'none';
    
    clearButton.addEventListener('click', handleClear);
    
    inputContainer.appendChild(input);
    inputContainer.appendChild(clearButton);
    container.appendChild(inputContainer);
    
    // Create results list
    if (showResults) {
      const resultsList = document.createElement('ul');
      resultsList.className = 'geocoder-results-list';
      resultsList.style.listStyle = 'none';
      resultsList.style.margin = '0';
      resultsList.style.padding = '0';
      resultsList.style.maxHeight = '300px';
      resultsList.style.overflowY = 'auto';
      
      if (loading) {
        const loadingItem = document.createElement('li');
        loadingItem.className = 'geocoder-loading';
        loadingItem.textContent = 'Loading...';
        loadingItem.style.padding = '10px';
        loadingItem.style.textAlign = 'center';
        resultsList.appendChild(loadingItem);
      } else if (results.length === 0) {
        const noResultsItem = document.createElement('li');
        noResultsItem.className = 'geocoder-no-results';
        noResultsItem.textContent = 'No results found';
        noResultsItem.style.padding = '10px';
        noResultsItem.style.textAlign = 'center';
        resultsList.appendChild(noResultsItem);
      } else {
        results.forEach((result) => {
          const resultItem = document.createElement('li');
          resultItem.className = 'geocoder-result-item';
          resultItem.style.padding = '10px';
          resultItem.style.cursor = 'pointer';
          resultItem.style.borderBottom = '1px solid #e6e6e6';
          
          resultItem.addEventListener('mouseenter', () => {
            resultItem.style.backgroundColor = '#f5f5f5';
          });
          
          resultItem.addEventListener('mouseleave', () => {
            resultItem.style.backgroundColor = '';
          });
          
          resultItem.addEventListener('click', () => {
            handleResultSelect(result);
          });
          
          // Primary text (place name)
          const primaryText = document.createElement('div');
          primaryText.className = 'geocoder-result-primary';
          primaryText.textContent = result.placeName.split(',')[0];
          primaryText.style.fontWeight = 'bold';
          primaryText.style.marginBottom = '4px';
          
          // Secondary text (address)
          const secondaryText = document.createElement('div');
          secondaryText.className = 'geocoder-result-secondary';
          secondaryText.textContent = result.address.formattedAddress;
          secondaryText.style.fontSize = '12px';
          secondaryText.style.color = '#666';
          
          resultItem.appendChild(primaryText);
          resultItem.appendChild(secondaryText);
          resultsList.appendChild(resultItem);
        });
      }
      
      container.appendChild(resultsList);
    }
    
    // Add constructed DOM to control
    controlRef.current.appendChild(container);
    
    // Add a click outside listener to close results
    const handleClickOutside = (e: MouseEvent) => {
      if (controlRef.current && !controlRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [
    controlRef.current,
    searchText,
    results,
    loading,
    showResults,
    placeholder,
  ]);

  // This component doesn't render any React elements
  return null;
};

export default MapboxGeocoderControl; 