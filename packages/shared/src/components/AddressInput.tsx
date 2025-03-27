import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, Platform, FlatList, ViewStyle } from 'react-native';
import { Text, TouchableOpacity } from 'react-native';

interface AddressInputProps {
  onAddressSelect: (address: {
    fullAddress: string;
    latitude: number;
    longitude: number;
    placeId?: string;
  }) => void;
  initialValue?: string;
  placeholder?: string;
  style?: ViewStyle;
}

interface Suggestion {
  id: string;
  place_name: string;
  center: [number, number];
}

// Local implementation of the token utility
const FALLBACK_PUBLIC_TOKEN = 'pk.eyJ1IjoibG9hZHVwIiwiYSI6ImNsbTUxcWVsajJnOXAzZG83cHo1bjB5dWYifQ.8Fh30KBunCj-FlP2E7hGUw';

const getMapboxPublicToken = (): string => {
  // Check all potential token environment variables
  const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  const publicToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const mappingToken = process.env.NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN;
  
  // Use the first available token with fallback
  return accessToken || publicToken || mappingToken || FALLBACK_PUBLIC_TOKEN;
};

export const AddressInput: React.FC<AddressInputProps> = ({
  onAddressSelect,
  initialValue = '',
  placeholder = 'Enter address',
  style,
}) => {
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const fetchSuggestions = async () => {
      // Use all possible Mapbox token environment variables with a fallback
      const mapboxToken = getMapboxPublicToken();
      
      if (!query.trim() || !mapboxToken) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
            query
          )}.json?access_token=${mapboxToken}&country=MY`
        );
        const data = await response.json();
        setSuggestions(data.features || []);
      } catch (error) {
        console.error('Error fetching address suggestions:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    timeoutId = setTimeout(fetchSuggestions, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSuggestionSelect = (suggestion: Suggestion) => {
    setQuery(suggestion.place_name);
    setSuggestions([]);
    onAddressSelect({
      fullAddress: suggestion.place_name,
      latitude: suggestion.center[1],
      longitude: suggestion.center[0],
      placeId: suggestion.id,
    });
  };

  return (
    <View style={[styles.container, style]}>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder={placeholder}
        style={styles.input}
        placeholderTextColor="#666"
      />
      {isLoading && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      )}
      {suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <FlatList<Suggestion>
            data={suggestions}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.suggestionItem}
                onPress={() => handleSuggestionSelect(item)}
              >
                <Text style={styles.suggestionText}>{item.place_name}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    fontSize: 16,
    ...(Platform.OS === 'web' && {
      outlineStyle: 'none',
    }),
  },
  loadingContainer: {
    position: 'absolute',
    top: 45,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  loadingText: {
    color: '#666666',
    fontSize: 14,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 45,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    maxHeight: 200,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  suggestionText: {
    fontSize: 14,
    color: '#333333',
  },
}); 