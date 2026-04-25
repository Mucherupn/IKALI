'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ProviderCard } from '@/components/provider-card';
import { POPULAR_LOCATIONS, SUGGESTED_SEARCHES, extractSearchIntent, matchesProviderSearch } from '@/lib/search';
import { Provider } from '@/lib/types';

type ProviderDirectoryProps = {
  providers: Provider[];
  serviceNamesBySlug?: Record<string, string>;
  withSearch?: boolean;
  searchPlaceholder?: string;
  initialQuery?: string;
  initialLocation?: string;
  initialNearMe?: boolean;
  showSuggestions?: boolean;
};

const LOCATION_SUGGESTIONS = ['Karen', 'Kilimani', 'Westlands', 'Kileleshwa', 'Langata', 'Rongai'] as const;

export function ProviderDirectory({
  providers,
  serviceNamesBySlug,
  withSearch = true,
  searchPlaceholder = 'Search by name, service, or location',
  initialQuery = '',
  initialLocation = '',
  initialNearMe = false,
  showSuggestions = false
}: ProviderDirectoryProps) {
  const intent = extractSearchIntent(initialQuery);
  const [query, setQuery] = useState(initialQuery);
  const [selectedLocation, setSelectedLocation] = useState(initialLocation || intent.locationQuery || '');
  const [minimumRating, setMinimumRating] = useState('all');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [geoDenied, setGeoDenied] = useState(false);
  const hasRequestedGeolocation = useRef(false);
  const isNearMeSearch = initialNearMe || extractSearchIntent(query).nearMe;

  useEffect(() => {
    const storedCoordinates = sessionStorage.getItem('userLocationCoords');

    if (storedCoordinates) {
      try {
        const parsed = JSON.parse(storedCoordinates) as { latitude?: number; longitude?: number };

        if (typeof parsed.latitude === 'number' && typeof parsed.longitude === 'number') {
          setUserCoords({ latitude: parsed.latitude, longitude: parsed.longitude });
        }
      } catch {
        sessionStorage.removeItem('userLocationCoords');
      }
    }
  }, []);

  useEffect(() => {
    if (!isNearMeSearch || userCoords || hasRequestedGeolocation.current) return;

    hasRequestedGeolocation.current = true;

    if (!navigator.geolocation) {
      setGeoDenied(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };

        setUserCoords(coordinates);
        sessionStorage.setItem('userLocationCoords', JSON.stringify(coordinates));
        setGeoDenied(false);
      },
      () => {
        setGeoDenied(true);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [isNearMeSearch, userCoords]);

  const matchingLocationSuggestions = useMemo(() => {
    const normalized = selectedLocation.trim().toLowerCase();

    if (!normalized) return [];

    return LOCATION_SUGGESTIONS.filter((location) => location.toLowerCase().includes(normalized)).slice(0, 6);
  }, [selectedLocation]);

  const filteredProviders = useMemo(() => {
    const parsedQuery = extractSearchIntent(query);
    const normalizedLocationSearch = (selectedLocation || parsedQuery.locationQuery).trim().toLowerCase();
    const filterByDistance = (parsedQuery.nearMe || initialNearMe) && userCoords;

    return providers.filter((provider) => {
      const serviceName = serviceNamesBySlug?.[provider.serviceCategory] ?? provider.serviceCategory;
      const matchesQuery = matchesProviderSearch(provider, serviceName, parsedQuery.serviceQuery || query);

      const matchesLocation = !normalizedLocationSearch || provider.location.toLowerCase().includes(normalizedLocationSearch);
      const matchesRating = minimumRating === 'all' || provider.rating >= Number(minimumRating);
      const matchesVerification = !verifiedOnly || provider.verified;
      const matchesDistance =
        !filterByDistance ||
        provider.latitude === undefined ||
        provider.longitude === undefined ||
        getDistanceInKm(userCoords.latitude, userCoords.longitude, provider.latitude, provider.longitude) <= 20;

      return matchesQuery && matchesLocation && matchesRating && matchesVerification && matchesDistance;
    });
  }, [initialNearMe, minimumRating, providers, query, selectedLocation, serviceNamesBySlug, userCoords, verifiedOnly]);

  const clearFilters = () => {
    setQuery('');
    setSelectedLocation('');
    setMinimumRating('all');
    setVerifiedOnly(false);
  };

  const noProvidersAvailable = providers.length === 0;

  return (
    <div className="mt-6 space-y-6">
      <section className="card p-4 sm:p-5">
        <div className="grid gap-3 md:grid-cols-4">
          {withSearch ? (
            <label className="md:col-span-2">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Search</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={searchPlaceholder}
                className="focus-ring w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900"
              />
            </label>
          ) : null}

          <div>
            <label htmlFor="location-filter" className="mb-1.5 block text-sm font-medium text-slate-700">
              Location
            </label>
            <input
              id="location-filter"
              type="text"
              value={selectedLocation}
              onChange={(event) => setSelectedLocation(event.target.value)}
              placeholder="Type location e.g. Karen"
              className="focus-ring w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900"
              autoComplete="off"
            />
            {matchingLocationSuggestions.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {matchingLocationSuggestions.map((location) => (
                  <button
                    key={location}
                    type="button"
                    onClick={() => setSelectedLocation(location)}
                    className="focus-ring rounded-full border border-slate-300 px-3 py-1 text-xs text-slate-700 hover:bg-slate-50"
                  >
                    {location}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <label>
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Rating</span>
            <select
              value={minimumRating}
              onChange={(event) => setMinimumRating(event.target.value)}
              className="focus-ring w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900"
            >
              <option value="all">Any rating</option>
              <option value="4">4.0+ stars</option>
              <option value="4.5">4.5+ stars</option>
            </select>
          </label>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <label className="inline-flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(event) => setVerifiedOnly(event.target.checked)}
              className="focus-ring h-4 w-4 rounded border-slate-300"
            />
            Verified providers only
          </label>

          <button
            type="button"
            onClick={clearFilters}
            className="focus-ring rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Clear filters
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Popular locations</span>
          {POPULAR_LOCATIONS.map((location) => (
            <button
              key={location}
              type="button"
              onClick={() => setSelectedLocation(location)}
              className="focus-ring rounded-full border border-slate-300 px-3 py-1 text-xs text-slate-700 hover:bg-slate-50"
            >
              {location}
            </button>
          ))}
        </div>

        {showSuggestions ? (
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Suggested searches</span>
            {SUGGESTED_SEARCHES.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => setQuery(suggestion)}
                className="focus-ring rounded-full border border-[#fecdd3] bg-[#fff1f2] px-3 py-1 text-xs text-[#7f1d1d] hover:bg-[#ffe4e6]"
              >
                {suggestion}
              </button>
            ))}
          </div>
        ) : null}
        {isNearMeSearch && geoDenied ? <p className="mt-3 text-sm text-[#D71920]">Please type your location manually</p> : null}
      </section>

      {filteredProviders.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filteredProviders.map((provider) => (
            <ProviderCard key={provider.id} provider={provider} serviceName={serviceNamesBySlug?.[provider.serviceCategory]} />
          ))}
        </div>
      ) : (
        <section className="card px-6 py-10 text-center">
          <h3 className="text-lg font-semibold text-slate-900">
            {noProvidersAvailable ? 'No providers listed yet.' : 'No matching professionals found yet.'}
          </h3>
          <p className="mt-2 text-sm text-slate-600">
            {noProvidersAvailable
              ? 'Provider data is currently unavailable. You can still submit a request and our team will follow up.'
              : 'Try adjusting your search or request this service and we will source one for you.'}
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={clearFilters}
              className="focus-ring inline-flex rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Clear filters
            </button>
            <Link
              href="/request"
              className="focus-ring inline-flex rounded-lg bg-[#D71920] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#A80F1A]"
            >
              Request this service
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}

function getDistanceInKm(fromLatitude: number, fromLongitude: number, toLatitude: number, toLongitude: number) {
  const earthRadiusKm = 6371;
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

  const latitudeDelta = toRadians(toLatitude - fromLatitude);
  const longitudeDelta = toRadians(toLongitude - fromLongitude);

  const a =
    Math.sin(latitudeDelta / 2) * Math.sin(latitudeDelta / 2) +
    Math.cos(toRadians(fromLatitude)) *
      Math.cos(toRadians(toLatitude)) *
      Math.sin(longitudeDelta / 2) *
      Math.sin(longitudeDelta / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
}
