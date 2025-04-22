import { AddressInsertData } from '../../types/parser.types';
import { type InferInsertModel } from 'drizzle-orm';
import { addresses } from '../../lib/database/schema'; // Corrected path // Import the table definition
import { logger } from '../../utils/logger';
import type { LocationDetail } from '../../types/shipment';

// Represents a simplified address structure for our mock data
export interface MockAddressEntry extends Omit<AddressInsertData, 'id' | 'createdAt' | 'updatedAt' | 'rawInput'> {
    mockId: string; // Unique identifier for the mock entry itself
    keywords: string[]; // Keywords from raw input to match against
}

// Hardcoded list of mock Malaysian logistics/postal locations
// Coordinates are approximate or representative, not necessarily precise
// Keywords should match variations seen in raw input data (case-insensitive matching recommended)
export const MOCK_MALAYSIAN_ADDRESSES: MockAddressEntry[] = [
    {
        mockId: 'MOCK-PTP-01',
        keywords: ['ptp', 'pelabuhan tanjung pelepas', 'tanjung pelepas'],
        street1: 'Blok A, Wisma PTP',
        street2: 'Jalan Pelabuhan Tanjung Pelepas',
        city: 'Gelang Patah',
        state: 'Johor',
        postalCode: '81560',
        country: 'Malaysia',
        latitude: '1.3624',
        longitude: '103.5520',
    },
    {
        mockId: 'MOCK-KLIA-CARGO',
        keywords: ['klia', 'cargo village', 'klia cargo', 'sepang'],
        street1: 'KLIA Cargo Village',
        street2: 'Free Commercial Zone',
        city: 'Sepang',
        state: 'Selangor',
        postalCode: '64000',
        country: 'Malaysia',
        latitude: '2.7456',
        longitude: '101.7070', // Approx KLIA area
    },
    {
        mockId: 'MOCK-PENANG-PORT',
        keywords: ['penang port', 'butterworth', 'nbct'],
        street1: 'North Butterworth Container Terminal',
        street2: '',
        city: 'Butterworth',
        state: 'Penang',
        postalCode: '12100',
        country: 'Malaysia',
        latitude: '5.4085',
        longitude: '100.3607',
    },
    {
        mockId: 'MOCK-POS-KL',
        keywords: ['pos malaysia', 'kuala lumpur', 'kl mail centre'],
        street1: 'Pusat Mel Nasional',
        street2: 'Kompleks Dayabumi',
        city: 'Kuala Lumpur',
        state: 'W.P. Kuala Lumpur',
        postalCode: '50670',
        country: 'Malaysia',
        latitude: '3.1445',
        longitude: '101.6931',
    },
    {
        mockId: 'MOCK-SHAH-ALAM-HUB',
        keywords: [
            'shah alam',
            'logistics hub',
            'sek 23',
            'xinhwa',
            'xin hwa',
            'niro shah alam',
            'pick up at niro',
            'pick up at niro shah alam',
            'pick up at xin hwa',
            'pick up at xinhwa',
            'loadup direct delivery pickup at niro shah alam',
            'loadup direct delivery pickup at xin hwa',
            'loadup direct delivery pick up at niro shah alam',
            'loadup direct delivery pick up at xin hwa',
        ],
        street1: 'Jalan Jubli Perak 22/1, Seksyen 22', // Using existing Shah Alam Hub
        street2: 'Lot 10, Persiaran Perusahaan',
        city: 'Shah Alam',
        state: 'Selangor',
        postalCode: '40300',
        country: 'Malaysia',
        latitude: '3.0520',
        longitude: '101.5270',
    },
    {
        mockId: 'MOCK-LOADUP-JB',
        keywords: ['loadup jb', 'load up jb', 'jb hub'], // Keywords for JB Hub
        street1: '1 Jalan Kempas Utama 3/1', // Example Address
        street2: 'Taman Kempas Utama',
        city: 'Johor Bahru',
        state: 'Johor',
        postalCode: '81300',
        country: 'Malaysia',
        latitude: '1.5540', // Approx Kempas area
        longitude: '103.7180',
    },
    {
        mockId: 'MOCK-LOADUP-PN',
        keywords: ['loadup pn', 'load up pn', 'penang hub', 'prai hub'], // Keywords for Penang/Prai Hub
        street1: 'Lot 247, Lorong Perusahaan 10', // Example Address from TXT file header
        street2: 'Prai Industrial Estate',
        city: 'Perai',
        state: 'Penang',
        postalCode: '13600',
        country: 'Malaysia',
        latitude: '5.3580', // Approx Prai Industrial Estate
        longitude: '100.4100',
    },
    // Add a default 'Unknown' location
    {
        mockId: 'MOCK-UNKNOWN-MY',
        keywords: [], // Should not match anything specifically
        street1: 'Unknown Location',
        street2: '',
        city: 'Unknown',
        state: 'N/A',
        postalCode: '00000',
        country: 'Malaysia',
        latitude: '3.1390',
        longitude: '101.6869',
    },
];

export const findMockEntryByKeywords = (rawInput: string | null | undefined): MockAddressEntry => {
    if (!rawInput) {
        return MOCK_MALAYSIAN_ADDRESSES.find(addr => addr.mockId === 'MOCK-UNKNOWN-MY')!;
    }

    const lowerInput = rawInput.toLowerCase();

    for (const mockAddr of MOCK_MALAYSIAN_ADDRESSES) {
        if (mockAddr.keywords.some(keyword => lowerInput.includes(keyword))) {
            return mockAddr;
        }
    }

    return MOCK_MALAYSIAN_ADDRESSES.find(addr => addr.mockId === 'MOCK-UNKNOWN-MY')!;
};

// Infer the insertion type directly from the schema table
export type DatabaseAddressInsertData = InferInsertModel<typeof addresses>;

export const MOCK_ADDRESS_DATABASE: Omit<DatabaseAddressInsertData, "id" | "createdAt" | "updatedAt">[] = [
  // TODO: Add mock Malaysian logistics locations here
  // Example structure:
  // {
  //   street1: "123 Mockingbird Lane",
  //   street2: null,
  //   city: "Kuala Lumpur",
  //   state: "W.P. Kuala Lumpur",
  //   postalCode: "50450",
  //   country: "Malaysia",
  //   latitude: "3.1390", // Use strings for decimal consistency with schema
  //   longitude: "101.6869",
  //   rawInput: "KL Central Station Area", // The input string this mocks
  //   resolutionMethod: "mock_lookup",
  //   resolutionConfidence: "1.000"
  // },
];

// TODO: Expand with more realistic and diverse locations

export interface MockAddress {
  keyword: string; // Unique keyword/name for matching
  name?: string; // Optional name (e.g., warehouse name)
  street1: string | null;
  street2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  latitude: string; // Use string representation for consistency with decimal schema type
  longitude: string;
}

export const mockAddressDatabase: MockAddress[] = [
  {
    keyword: "PTP",
    name: "Port of Tanjung Pelepas (PTP)",
    street1: "Jalan Pelabuhan Tanjung Pelepas",
    street2: null,
    city: "Gelang Patah",
    state: "Johor",
    postalCode: "81560",
    country: "Malaysia",
    latitude: "1.3644",
    longitude: "103.5458",
  },
  {
    keyword: "Westports",
    name: "Westports Malaysia",
    street1: "Pulau Indah",
    street2: null,
    city: "Port Klang",
    state: "Selangor",
    postalCode: "42920",
    country: "Malaysia",
    latitude: "2.9691",
    longitude: "101.3335",
  },
  {
    keyword: "Northport",
    name: "Northport Malaysia",
    street1: "Jalan Pelabuhan Utara",
    street2: null,
    city: "Port Klang",
    state: "Selangor",
    postalCode: "42000",
    country: "Malaysia",
    latitude: "3.0045",
    longitude: "101.3851",
  },
  {
    keyword: "KLIA Kargo",
    name: "KLIA Kargo Village",
    street1: "Kuala Lumpur International Airport",
    street2: null,
    city: "Sepang",
    state: "Selangor",
    postalCode: "64000",
    country: "Malaysia",
    latitude: "2.7456",
    longitude: "101.7070", // Approximate cargo area
  },
  {
    keyword: "Shah Alam DC",
    name: "Example Shah Alam Distribution Center",
    street1: "Lot 123, Jalan Gudang", // Fictional
    street2: "Seksyen 15",
    city: "Shah Alam",
    state: "Selangor",
    postalCode: "40200",
    country: "Malaysia",
    latitude: "3.0592", // Approximate area
    longitude: "101.5349",
  },
  {
    keyword: "Bayan Lepas FTZ",
    name: "Bayan Lepas Free Trade Zone",
    street1: "Phase 4", // General area
    street2: null,
    city: "Bayan Lepas",
    state: "Penang",
    postalCode: "11900",
    country: "Malaysia",
    latitude: "5.2945", // Approximate area
    longitude: "100.2746",
  },
  // Add more locations as needed
];

export interface MockLocation {
  idKeyword: string; // Unique keyword/ID to find this mock entry
  name: string; // e.g., Warehouse Name, Port Name
  rawAddress: string; // The kind of raw input text expected
  resolved: {
    street1: string | null;
    street2?: string | null;
    city: string | null;
    state: string | null;
    postalCode: string | null;
    country: string | null; // Should likely be 'Malaysia'
    latitude: number | null;
    longitude: number | null;
  };
}

// TODO: Populate with more realistic Malaysian logistics hubs, warehouses, ports etc.
export const MOCK_MALAYSIA_LOCATIONS: MockLocation[] = [
  {
    idKeyword: "PORT_KLANG_W",
    name: "Westports Malaysia",
    rawAddress: "Westports, Pulau Indah, 42009 Port Klang, Selangor",
    resolved: {
      street1: "Westports",
      city: "Port Klang",
      state: "Selangor",
      postalCode: "42009",
      country: "Malaysia",
      latitude: 2.9833, // Approximate
      longitude: 101.3167, // Approximate
    },
  },
  {
    idKeyword: "PORT_KLANG_N",
    name: "Northport Malaysia",
    rawAddress: "Northport, Jalan Pelabuhan Utara, 42000 Port Klang, Selangor",
    resolved: {
      street1: "Jalan Pelabuhan Utara",
      city: "Port Klang",
      state: "Selangor",
      postalCode: "42000",
      country: "Malaysia",
      latitude: 3.0167, // Approximate
      longitude: 101.3833, // Approximate
    },
  },
  {
    idKeyword: "PTP_JOHOR",
    name: "Port of Tanjung Pelepas (PTP)",
    rawAddress: "Blok A, Wisma PTP, Jalan Pelabuhan Tanjung Pelepas, 81560 Gelang Patah, Johor",
    resolved: {
      street1: "Jalan Pelabuhan Tanjung Pelepas",
      city: "Gelang Patah",
      state: "Johor",
      postalCode: "81560",
      country: "Malaysia",
      latitude: 1.3667, // Approximate
      longitude: 103.5500, // Approximate
    },
  },
    {
    idKeyword: "SHAH_ALAM_HUB",
    name: "Shah Alam Logistics Hub",
    rawAddress: "12 Jalan Gudang 16/9, Seksyen 16, 40200 Shah Alam, Selangor",
    resolved: {
      street1: "12 Jalan Gudang 16/9",
      city: "Shah Alam",
      state: "Selangor",
      postalCode: "40200",
      country: "Malaysia",
      latitude: 3.0642, // Approximate
      longitude: 101.5300, // Approximate
    },
  },
  {
    idKeyword: "PENANG_PORT",
    name: "Penang Port (North Butterworth Container Terminal)",
    rawAddress: "North Butterworth Container Terminal, 12100 Butterworth, Pulau Pinang",
    resolved: {
        street1: "North Butterworth Container Terminal",
        city: "Butterworth",
        state: "Pulau Pinang",
        postalCode: "12100",
        country: "Malaysia",
        latitude: 5.4158, // Approximate
        longitude: 100.3644, // Approximate
    }
  },
  // Add more locations...
  {
    idKeyword: "KUL_AIRPORT_CARGO",
    name: "KLIA Cargo Village",
    rawAddress: "KLIA Cargo Village, 64000 Sepang, Selangor",
     resolved: {
        street1: "KLIA Cargo Village",
        city: "Sepang",
        state: "Selangor",
        postalCode: "64000",
        country: "Malaysia",
        latitude: 2.7456, // Approximate
        longitude: 101.7030, // Approximate
    }
  }
];

export function findMockLocation(rawInput: string | null | undefined): MockLocation | null {
  if (!rawInput) return null;
  const normalizedInput = rawInput.trim().toLowerCase();

  // Simple search logic (can be improved with fuzzy matching)
  for (const location of MOCK_MALAYSIA_LOCATIONS) {
    if (normalizedInput.includes(location.name.toLowerCase()) || 
        normalizedInput.includes(location.rawAddress.toLowerCase()) ||
        normalizedInput.includes(location.idKeyword.toLowerCase())) {
      return location;
    }
  }

  return null; // No match found
}

/**
 * Returns a predefined default LocationDetail object for the origin.
 * Used when specific origin resolution fails.
 */
export function getDefaultMockOriginDetail(): Partial<LocationDetail> {
    logger.info('[getDefaultMockOriginDetail] Providing default mock origin details.');
    // Example: Using Loadup JB Hub as default origin
    return {
      rawInput: 'Default Origin (JB Hub)',
      resolvedAddress: "Loadup JB Hub (Default)",
      city: "Johor Bahru",
      state: "Johor",
      latitude: 1.4656,
      longitude: 103.7578,
      resolutionMethod: 'mock-default',
      resolutionConfidence: 0.9 // High confidence as it's explicitly defaulted
    };
}

/**
 * Returns a predefined default LocationDetail object for the destination.
 * Used when specific destination resolution fails.
 */
export function getDefaultMockDestinationDetail(): LocationDetail {
     logger.info('[getDefaultMockDestinationDetail] Providing default mock destination details.');
     // Example: Using a generic placeholder destination
     return {
      rawInput: 'Default Destination (Unknown)',
      resolvedAddress: "Default Destination Area",
      street: null,
      city: null, 
      state: null,
      postalCode: null,
      country: "Malaysia", // Assuming default country
      latitude: null, // No specific coordinates for generic default
      longitude: null,
      resolutionMethod: 'mock-default',
      resolutionConfidence: 0.9 // High confidence as it's explicitly defaulted
    };
} 