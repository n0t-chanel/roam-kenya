/**
 * Unified Kenya location search using multiple providers.
 *
 * Providers (in priority order):
 * 1. Local Kenya aliases (searchLocationAliases) - instant confidence, curated data
 * 2. Mapbox Geocoding (searchMapboxGeocoding) - commercial geocoding, precise POIs
 * 3. OpenStreetMap Nominatim (searchNominatim) - community-driven data
 * 4. Mapbox via Paystack (searchKenyaLocations) - additional results and deduplication
 *
 * Results are merged into a single ranked list based on relevance, location type,
 * text match score, proximity, and provider quality.
 */

import { searchLocationAliases } from './kenyaLocations';
import { searchKenyaLocations } from './paystack';

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const NOMINATIM_REVERSE_URL = 'https://nominatim.openstreetmap.org/reverse';

const KENYA_BOUNDS = {
  north: 5.5,
  south: -4.9,
  east: 42.0,
  west: 33.5
};

const DEFAULT_PROXIMITY = { latitude: -1.2921, longitude: 36.8219 };
const PROVIDER_TIMEOUT_MS = 1800;
const CACHE_TTL = 5 * 60 * 1000;

const SOURCE_WEIGHT = {
  local: 620,
  mapbox: 410,
  openstreetmap: 340,
  nominatim: 340
};

const TYPE_WEIGHT = {
  airport: 90,
  hotel: 85,
  mall: 70,
  landmark: 60,
  address: 55,
  neighborhood: 50,
  city: 45,
  restaurant: 40,
  petrol: 35
};

const searchCache = new Map();
let activeSearchController = null;

function normalizeText(value = '') {
  return value
    .toString()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function normalizeProximity(proximity) {
  const latitude = Number(proximity?.latitude);
  const longitude = Number(proximity?.longitude);

  if (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= KENYA_BOUNDS.south &&
    latitude <= KENYA_BOUNDS.north &&
    longitude >= KENYA_BOUNDS.west &&
    longitude <= KENYA_BOUNDS.east
  ) {
    return { latitude, longitude };
  }

  return DEFAULT_PROXIMITY;
}

function getCacheKey(query, proximity) {
  const normalized = normalizeText(query);
  const proximityKey = proximity
    ? `${proximity.latitude.toFixed(2)},${proximity.longitude.toFixed(2)}`
    : 'global';

  return `${normalized}|${proximityKey}`;
}

function getCachedResults(query, proximity) {
  const entry = searchCache.get(getCacheKey(query, proximity));
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    return entry.results;
  }
  return null;
}

function setCachedResults(query, proximity, results) {
  searchCache.set(getCacheKey(query, proximity), {
    results,
    timestamp: Date.now()
  });

  if (searchCache.size > 120) {
    const firstKey = searchCache.keys().next().value;
    searchCache.delete(firstKey);
  }
}

async function fetchWithTimeout(url, options = {}, timeoutMs = PROVIDER_TIMEOUT_MS) {
  const { signal, ...customOptions } = options;

  if (signal?.aborted) {
    throw new DOMException('The user aborted a request.', 'AbortError');
  }

  const controller = new AbortController();
  const onAbort = () => controller.abort();

  if (signal) {
    signal.addEventListener('abort', onAbort);
  }

  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...customOptions,
      signal: controller.signal
    });
  } catch (error) {
    if (error.name === 'AbortError' && signal?.aborted) {
      throw error;
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
    if (signal) {
      signal.removeEventListener('abort', onAbort);
    }
  }
}

function isWithinKenya(result) {
  const latitude = Number(result?.latitude);
  const longitude = Number(result?.longitude);

  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= KENYA_BOUNDS.south &&
    latitude <= KENYA_BOUNDS.north &&
    longitude >= KENYA_BOUNDS.west &&
    longitude <= KENYA_BOUNDS.east
  );
}

function calculateDistanceKm(start, end) {
  const toRad = (value) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRad(end.latitude - start.latitude);
  const dLon = toRad(end.longitude - start.longitude);
  const lat1 = toRad(start.latitude);
  const lat2 = toRad(end.latitude);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
}

function compactUnique(parts) {
  const seen = new Set();
  return parts
    .filter(Boolean)
    .map((part) => part.toString().trim())
    .filter(Boolean)
    .filter((part) => {
      const key = normalizeText(part);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function pickFirst(...values) {
  return values.find((value) => value && value.toString().trim());
}

function getResultType(result) {
  const type = result.type?.toLowerCase() || '';
  const category = (result.category || result.class || '').toLowerCase();
  const address = result.address || {};
  const amenity = address.amenity?.toLowerCase?.() || '';

  const lodgingTerms = ['hotel', 'guest_house', 'hostel', 'motel', 'apartment', 'resort', 'lodge'];

  if (category === 'aeroway' || type === 'airport') return 'airport';
  if (lodgingTerms.some((term) => type.includes(term) || amenity.includes(term))) return 'hotel';
  if (category === 'tourism') return 'landmark';
  if (type.includes('restaurant') || amenity.includes('restaurant')) return 'restaurant';
  if (type.includes('mall') || category === 'shop') return 'mall';
  if (category === 'highway' || type === 'house' || type === 'residential') return 'address';
  if (type === 'city' || type === 'town' || type === 'village' || category === 'place') return 'city';
  if (type === 'suburb' || type === 'neighbourhood' || type === 'quarter') return 'neighborhood';
  if (category === 'natural' || type === 'water') return 'beach';
  return 'landmark';
}

function normalizeNominatimResult(result) {
  const address = result.address || {};
  const shortLabel = pickFirst(
    result.name,
    result.namedetails?.name,
    address.amenity,
    address.hotel,
    address.shop,
    address.road,
    result.display_name?.split(',')[0]
  );

  const area = pickFirst(
    address.neighbourhood,
    address.suburb,
    address.quarter,
    address.city_district,
    address.village
  );
  const town = pickFirst(address.city, address.town, address.municipality, address.county);
  const labelParts = compactUnique([shortLabel, area, town, 'Kenya']);
  const label = labelParts.length >= 2 ? labelParts.join(', ') : result.display_name;

  return {
    label,
    shortLabel: shortLabel || label,
    latitude: Number.parseFloat(result.lat),
    longitude: Number.parseFloat(result.lon),
    type: getResultType(result),
    source: 'openstreetmap',
    providerScore: Math.round((Number(result.importance) || 0) * 100)
  };
}

function normalizeLocalResult(result) {
  return {
    ...result,
    label: result.fullLabel || result.label || result.name || result.shortLabel,
    shortLabel: result.shortLabel || result.name || result.label || result.fullLabel,
    latitude: Number(result.latitude),
    longitude: Number(result.longitude),
    source: 'local',
    providerScore: 100
  };
}

function getTextScore(query, result) {
  const cleanQuery = normalizeText(query);
  const title = normalizeText(result.shortLabel || result.name || '');
  const label = normalizeText(result.label || result.fullLabel || '');

  if (!cleanQuery) return 0;
  if (title === cleanQuery || label === cleanQuery) return 480;
  if (title.startsWith(cleanQuery)) return 390;
  if (label.startsWith(cleanQuery)) return 340;
  if (title.split(' ').some((word) => word.startsWith(cleanQuery))) return 280;
  if (label.split(' ').some((word) => word.startsWith(cleanQuery))) return 240;
  if (title.includes(cleanQuery)) return 190;
  if (label.includes(cleanQuery)) return 150;
  return 0;
}

function getProximityScore(result, proximity) {
  if (!proximity || !isWithinKenya(result)) return 0;

  const distanceKm = calculateDistanceKm(proximity, result);
  result.proximityKm = Number(distanceKm.toFixed(1));

  if (distanceKm < 1) return 320;
  if (distanceKm < 5) return 270;
  if (distanceKm < 15) return 220;
  if (distanceKm < 35) return 170;
  if (distanceKm < 80) return 95;
  if (distanceKm < 160) return 45;
  return -Math.min(160, Math.round(distanceKm / 4));
}

function scoreResult(query, result, proximity) {
  return (
    (result.matchScore || 0) +
    (SOURCE_WEIGHT[result.source] || 260) +
    (TYPE_WEIGHT[result.type] || 25) +
    (result.providerScore || 0) +
    getTextScore(query, result) +
    getProximityScore(result, proximity) +
    (isWithinKenya(result) ? 220 : -800)
  );
}

function hasNameOverlap(a, b) {
  const aName = normalizeText(a.shortLabel || a.name || a.label);
  const bName = normalizeText(b.shortLabel || b.name || b.label);

  if (!aName || !bName) return false;
  return aName === bName || aName.includes(bName) || bName.includes(aName);
}

function findDuplicateIndex(results, candidate) {
  return results.findIndex((result) => {
    if (!isWithinKenya(result) || !isWithinKenya(candidate)) return false;
    const distanceKm = calculateDistanceKm(result, candidate);
    return distanceKm < 0.08 || (distanceKm < 0.45 && hasNameOverlap(result, candidate));
  });
}

function mergeResults(current, incoming) {
  const sources = compactUnique([
    ...(current.sources || [current.source]),
    ...(incoming.sources || [incoming.source])
  ]);
  const preferred =
    current.source === 'local' || incoming.source !== 'local'
      ? current
      : incoming;

  return {
    ...preferred,
    matchScore: Math.max(current.matchScore || 0, incoming.matchScore || 0),
    providerScore: Math.max(current.providerScore || 0, incoming.providerScore || 0),
    sources
  };
}

function addResult(results, result) {
  if (!isWithinKenya(result)) return;

  const duplicateIndex = findDuplicateIndex(results, result);
  if (duplicateIndex >= 0) {
    results[duplicateIndex] = mergeResults(results[duplicateIndex], result);
    return;
  }

  results.push(result);
}

function rankResults(query, results, proximity, limit) {
  return results
    .map((result) => ({
      ...result,
      rankScore: scoreResult(query, result, proximity)
    }))
    .sort((a, b) => b.rankScore - a.rankScore)
    .slice(0, limit);
}

export async function searchNominatim(query, options = {}) {
  if (!query?.trim() || query.trim().length < 2) return [];

  const { signal, limit = 10 } = options;
  const cleanQuery = query.trim();
  const localizedQuery = /\bkenya\b/i.test(cleanQuery) ? cleanQuery : `${cleanQuery}, Kenya`;

  try {
    const params = new URLSearchParams({
      q: localizedQuery,
      countrycodes: 'ke',
      format: 'json',
      addressdetails: '1',
      namedetails: '1',
      extratags: '1',
      dedupe: '1',
      limit: String(limit),
      viewbox: `${KENYA_BOUNDS.west},${KENYA_BOUNDS.south},${KENYA_BOUNDS.east},${KENYA_BOUNDS.north}`,
      bounded: '1'
    });

    const response = await fetchWithTimeout(`${NOMINATIM_URL}?${params.toString()}`, {
      headers: {
        'Accept-Language': 'en',
        'User-Agent': 'RoamKenya/1.0 (booking-app)'
      },
      signal
    });

    if (!response.ok) {
      console.warn('OpenStreetMap search error:', response.status);
      return [];
    }

    const data = await response.json();
    if (!Array.isArray(data)) return [];

    return data.map(normalizeNominatimResult).filter(isWithinKenya);
  } catch (error) {
    if (error.name === 'AbortError' || signal?.aborted) {
      throw error;
    }
    console.error('OpenStreetMap search error:', error);
    return [];
  }
}

export async function searchMapboxGeocoding(query, options = {}) {
  if (!query?.trim() || query.trim().length < 2) return [];

  const { signal, limit = 10, proximity } = options;
  const cleanQuery = query.trim();
  const mapboxToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

  if (!mapboxToken) {
    console.warn('Mapbox token not configured');
    return [];
  }

  try {
    const proximityStr = proximity
      ? `${proximity.longitude},${proximity.latitude}`
      : `${DEFAULT_PROXIMITY.longitude},${DEFAULT_PROXIMITY.latitude}`;

    const params = new URLSearchParams({
      access_token: mapboxToken,
      autocomplete: 'true',
      bbox: `${KENYA_BOUNDS.west},${KENYA_BOUNDS.south},${KENYA_BOUNDS.east},${KENYA_BOUNDS.north}`,
      country: 'ke',
      language: 'en',
      limit: String(limit),
      proximity: proximityStr,
      types: 'poi,address,place,locality,neighborhood,region',
      fuzzyMatch: 'true'
    });

    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(cleanQuery)}.json?${params.toString()}`;

    const response = await fetchWithTimeout(url, {
      headers: {
        'Accept-Language': 'en',
        'User-Agent': 'RoamKenya/1.0 (booking-app)'
      },
      signal
    });

    if (!response.ok) {
      console.warn('Mapbox search error:', response.status);
      return [];
    }

    const data = await response.json();

    if (!Array.isArray(data?.features)) {
      return [];
    }

    // Normalize Mapbox results
    return data.features
      .filter(feature => {
        if (!feature.center || feature.center.length < 2) return false;
        const [lng, lat] = feature.center;
        return isWithinKenya({ latitude: lat, longitude: lng });
      })
      .map(feature => {
        const [longitude, latitude] = feature.center;
        const placeType = Array.isArray(feature.place_type) ? feature.place_type[0] : '';

        // Determine result type
        let type = 'landmark';
        if (placeType === 'poi' && feature.properties?.category) {
          const category = feature.properties.category.toLowerCase();
          if (category.includes('airport')) type = 'airport';
          else if (category.includes('hotel') || category.includes('lodging')) type = 'hotel';
          else if (category.includes('restaurant') || category.includes('food')) type = 'restaurant';
          else if (category.includes('shopping') || category.includes('mall')) type = 'mall';
          else if (category.includes('petrol') || category.includes('gas')) type = 'petrol';
        } else if (placeType === 'address') {
          type = 'address';
        } else if (placeType === 'neighborhood' || placeType === 'quarter') {
          type = 'neighborhood';
        } else if (placeType === 'locality' || placeType === 'place' || placeType === 'region') {
          type = 'city';
        }

        // Build display label
        const relevantContext = [
          feature.text,
          feature.properties?.address,
          feature.context?.find(ctx => ctx.id.startsWith('place.'))?.text,
          'Kenya'
        ].filter(Boolean);

        return {
          label: relevantContext.join(', '),
          shortLabel: feature.text || feature.place_name,
          latitude: Number.parseFloat(latitude),
          longitude: Number.parseFloat(longitude),
          type,
          source: 'mapbox',
          providerScore: Math.round((feature.relevance || 0.5) * 100)
        };
      });
  } catch (error) {
    if (error.name === 'AbortError' || signal?.aborted) {
      throw error;
    }
    console.error('Mapbox search error:', error);
    return [];
  }
}

export async function reverseGeocodeNominatim({ latitude, longitude }, options = {}) {
  if (!latitude || !longitude) {
    throw new Error('Invalid coordinates provided.');
  }

  const { signal } = options;

  try {
    const params = new URLSearchParams({
      lat: latitude,
      lon: longitude,
      format: 'json',
      addressdetails: '1'
    });

    const response = await fetchWithTimeout(`${NOMINATIM_REVERSE_URL}?${params.toString()}`, {
      headers: {
        'Accept-Language': 'en',
        'User-Agent': 'RoamKenya/1.0 (booking-app)'
      },
      signal
    });

    if (!response.ok) {
      throw new Error('Reverse geocoding failed.');
    }

    const data = await response.json();
    const normalized = normalizeNominatimResult(data);

    return {
      label: normalized.label,
      shortLabel: normalized.shortLabel,
      latitude: normalized.latitude,
      longitude: normalized.longitude
    };
  } catch (error) {
    if (error.name === 'AbortError' || signal?.aborted) {
      throw error;
    }
    console.error('OpenStreetMap reverse geocoding error:', error);
    throw error;
  }
}

export async function searchLocationsUnified(query, options = {}) {
  if (!query?.trim() || query.trim().length < 2) return [];

  if (activeSearchController) {
    activeSearchController.abort();
  }

  activeSearchController = new AbortController();
  const signal = activeSearchController.signal;
  const proximity = normalizeProximity(options.proximity);
  const limit = options.limit || 8;
  const cleanQuery = query.trim();

  const cached = getCachedResults(cleanQuery, proximity);
  if (cached) return cached;

  const results = [];

  searchLocationAliases(cleanQuery, 12)
    .map(normalizeLocalResult)
    .forEach((result) => addResult(results, result));

  if (signal.aborted) throw new DOMException('Aborted', 'AbortError');

  const providerResults = await Promise.allSettled([
    searchMapboxGeocoding(cleanQuery, { signal, limit: 10, proximity }),
    searchNominatim(cleanQuery, { signal, limit: 10 }),
    searchKenyaLocations(cleanQuery, { signal, proximity, limit: 10 })
  ]);

  if (signal.aborted) throw new DOMException('Aborted', 'AbortError');

  providerResults.forEach((providerResult) => {
    if (providerResult.status !== 'fulfilled') {
      const error = providerResult.reason;
      if (error?.name !== 'AbortError') {
        console.warn('Location provider failed:', error);
      }
      return;
    }

    providerResult.value.forEach((result) => addResult(results, result));
  });

  const finalResults = rankResults(cleanQuery, results, proximity, limit);
  setCachedResults(cleanQuery, proximity, finalResults);

  return finalResults;
}

export async function autocompleteLocation(query, options = {}) {
  try {
    return await searchLocationsUnified(query, options);
  } catch (error) {
    if (error.name === 'AbortError') {
      throw error;
    }
    console.error('Autocomplete error:', error);
    return [];
  }
}
