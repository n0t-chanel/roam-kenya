/**
 * Unified location search using multiple sources
 * Priority: Local DB → Nominatim (OpenStreetMap) → Mapbox API
 */

import { searchLocationAliases } from './kenyaLocations';
import { searchKenyaLocations } from './paystack';

// Nominatim (OpenStreetMap) API endpoint
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const NOMINATIM_REVERSE_URL = 'https://nominatim.openstreetmap.org/reverse';

// Kenya bounds for filtering
const KENYA_BOUNDS = {
  north: 5.5,
  south: -4.9,
  east: 42.0,
  west: 33.5
};

/**
 * Search Nominatim (OpenStreetMap) for locations
 * Best for finding any place name in Kenya with high accuracy
 */
export async function searchNominatim(query) {
  if (!query?.trim() || query.trim().length < 2) return [];

  try {
    const params = new URLSearchParams({
      q: query,
      countrycodes: 'ke',
      format: 'json',
      limit: 8,
      viewbox: `${KENYA_BOUNDS.west},${KENYA_BOUNDS.south},${KENYA_BOUNDS.east},${KENYA_BOUNDS.north}`,
      bounded: 1
    });

    const url = `${NOMINATIM_URL}?${params.toString()}`;
    
    // Add User-Agent header (required by Nominatim)
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'RoamKenya/1.0 (booking-app)'
      }
    });

    if (!response.ok) {
      console.warn('Nominatim API error:', response.status);
      return [];
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      return [];
    }

    // Normalize results to match our format
    return data.map(result => ({
      label: result.display_name,
      shortLabel: result.name || result.display_name.split(',')[0],
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      type: getResultType(result),
      source: 'nominatim'
    }));
  } catch (error) {
    console.error('Nominatim search error:', error);
    return [];
  }
}

/**
 * Reverse geocode coordinates using Nominatim
 */
export async function reverseGeocodeNominatim({ latitude, longitude }) {
  if (!latitude || !longitude) {
    throw new Error('Invalid coordinates provided.');
  }

  try {
    const params = new URLSearchParams({
      lat: latitude,
      lon: longitude,
      format: 'json'
    });

    const url = `${NOMINATIM_REVERSE_URL}?${params.toString()}`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'RoamKenya/1.0 (booking-app)'
      }
    });

    if (!response.ok) {
      throw new Error('Reverse geocoding failed.');
    }

    const data = await response.json();

    return {
      label: data.display_name,
      shortLabel: data.name || data.address?.city || data.address?.town || 'Location',
      latitude: parseFloat(data.lat),
      longitude: parseFloat(data.lon)
    };
  } catch (error) {
    console.error('Nominatim reverse geocoding error:', error);
    throw error;
  }
}

/**
 * Determine location type from Nominatim result
 */
function getResultType(result) {
  const type = result.type?.toLowerCase() || '';
  const category = result.category?.toLowerCase() || '';

  if (category === 'aeroway' || type === 'airport') return 'airport';
  if (category === 'tourism') return 'landmark';
  if (category === 'natural' || type === 'water') return 'beach';
  if (category === 'amenity' && (type === 'hotel' || type === 'restaurant')) return 'hotel';
  if (category === 'admin_level') return 'city';
  return 'landmark';
}

/**
 * Unified location search with fallback chain
 * 1. Local Kenya database (instant, high precision)
 * 2. Nominatim/OpenStreetMap (comprehensive, reliable)
 * 3. Mapbox API (fallback, comprehensive)
 */
export async function searchLocationsUnified(query) {
  if (!query?.trim() || query.trim().length < 2) return [];

  const results = new Map(); // Use Map to avoid duplicates

  // Step 1: Try local Kenya database first (instant results)
  console.log('🔍 Searching local Kenya database for:', query);
  const localResults = searchLocationAliases(query);
  localResults.forEach(result => {
    const key = `${result.latitude.toFixed(4)}_${result.longitude.toFixed(4)}`;
    results.set(key, { ...result, source: 'local', priority: 3 });
  });

  // If we found exact matches locally, return them
  if (localResults.length > 0 && localResults[0].matchScore > 900) {
    console.log('✅ Found local matches:', localResults.length);
    return Array.from(results.values()).sort((a, b) => b.priority - a.priority);
  }

  // Step 2: Try Nominatim (OpenStreetMap) for comprehensive search
  console.log('🗺️  Searching OpenStreetMap (Nominatim) for:', query);
  try {
    const nominatimResults = await searchNominatim(query);
    nominatimResults.forEach(result => {
      const key = `${result.latitude.toFixed(4)}_${result.longitude.toFixed(4)}`;
      if (!results.has(key)) {
        results.set(key, { ...result, priority: 2 });
      }
    });
    console.log('✅ Nominatim results:', nominatimResults.length);
  } catch (error) {
    console.warn('Nominatim search failed:', error);
  }

  // If we have enough results from Nominatim, return them
  if (results.size >= 5) {
    return Array.from(results.values())
      .sort((a, b) => (b.priority || 0) - (a.priority || 0))
      .slice(0, 8);
  }

  // Step 3: Fallback to Mapbox API for additional coverage
  console.log('🔵 Searching Mapbox API for:', query);
  try {
    const mapboxResults = await searchKenyaLocations(query);
    mapboxResults.forEach(result => {
      const key = `${result.latitude.toFixed(4)}_${result.longitude.toFixed(4)}`;
      if (!results.has(key)) {
        results.set(key, { ...result, source: 'mapbox', priority: 1 });
      }
    });
    console.log('✅ Mapbox results:', mapboxResults.length);
  } catch (error) {
    console.warn('Mapbox search failed:', error);
  }

  // Return combined results sorted by priority and deduped
  const combinedResults = Array.from(results.values())
    .sort((a, b) => {
      // Sort by priority (local > nominatim > mapbox)
      if (b.priority !== a.priority) {
        return (b.priority || 0) - (a.priority || 0);
      }
      // Then by match score if available
      if (b.matchScore && a.matchScore) {
        return b.matchScore - a.matchScore;
      }
      return 0;
    })
    .slice(0, 8);

  console.log('📍 Final results:', combinedResults.length, combinedResults.map(r => r.shortLabel).join(', '));
  return combinedResults;
}

/**
 * Autocomplete for efficient searching (debounced)
 */
export async function autocompleteLocation(query) {
  try {
    return await searchLocationsUnified(query);
  } catch (error) {
    console.error('Autocomplete error:', error);
    return [];
  }
}
