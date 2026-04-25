import { Provider } from '@/lib/types';

export type Coordinates = {
  latitude: number;
  longitude: number;
};

const FALLBACK_NEARBY_AREAS: Record<string, string[]> = {
  karen: ['langata', 'rongai', 'hardy', 'lavington', 'kilimani'],
  kilimani: ['kileleshwa', 'lavington', 'westlands', 'nairobi cbd'],
  westlands: ['parklands', 'kileleshwa', 'lavington', 'nairobi cbd'],
  langata: ['karen', 'rongai', 'south b', 'nairobi west'],
  rongai: ['karen', 'langata', 'ngong'],
  'south b': ['nairobi west', 'langata', 'embakasi', 'nairobi cbd'],
  embakasi: ['south b', 'eastleigh', 'nairobi cbd']
};

export function normalizeLocationName(location: string) {
  return location.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function getFallbackNearbyAreas(location: string) {
  return FALLBACK_NEARBY_AREAS[normalizeLocationName(location)] ?? [];
}

export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const earthRadiusKm = 6371;
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

  const latitudeDelta = toRadians(lat2 - lat1);
  const longitudeDelta = toRadians(lon2 - lon1);

  const a =
    Math.sin(latitudeDelta / 2) * Math.sin(latitudeDelta / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(longitudeDelta / 2) * Math.sin(longitudeDelta / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
}

export function sortProvidersByDistance(providers: Provider[], userCoords: Coordinates) {
  return [...providers].sort((providerA, providerB) => {
    const distanceA =
      providerA.latitude !== undefined && providerA.longitude !== undefined
        ? calculateDistanceKm(userCoords.latitude, userCoords.longitude, providerA.latitude, providerA.longitude)
        : Number.POSITIVE_INFINITY;
    const distanceB =
      providerB.latitude !== undefined && providerB.longitude !== undefined
        ? calculateDistanceKm(userCoords.latitude, userCoords.longitude, providerB.latitude, providerB.longitude)
        : Number.POSITIVE_INFINITY;

    return distanceA - distanceB;
  });
}

export function getNearestProviders(providers: Provider[], userCoords: Coordinates, limit = 12) {
  return sortProvidersByDistance(providers, userCoords).slice(0, limit);
}
