'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { LocationAutocomplete } from '@/components/location-autocomplete';
import { ProviderCard } from '@/components/provider-card';
import {
  calculateDistanceKm,
  getFallbackNearbyAreas,
  getNearestProviders,
  normalizeLocationName,
  sortProvidersByDistance,
  type Coordinates
} from '@/lib/location';
import { extractSearchIntent, matchesProviderSearch } from '@/lib/search';
import { Provider } from '@/lib/types';

type DirectoryMode = 'service-results' | 'general-directory';
type SortOption = 'recommended' | 'highest-rated' | 'most-completed-jobs' | 'nearest-first';

type ProviderDirectoryProps = {
  providers: Provider[];
  serviceNamesBySlug?: Record<string, string>;
  mode?: DirectoryMode;
  withSearch?: boolean;
  searchPlaceholder?: string;
  initialQuery?: string;
  initialLocation?: string;
  initialNearMe?: boolean;
};

export function ProviderDirectory({
  providers,
  serviceNamesBySlug,
  mode = 'general-directory',
  withSearch = true,
  searchPlaceholder = 'Search by name, service, or location',
  initialQuery = '',
  initialLocation = '',
  initialNearMe = false
}: ProviderDirectoryProps) {
  const intent = extractSearchIntent(initialQuery);
  const [query, setQuery] = useState(initialQuery);
  const [selectedLocation, setSelectedLocation] = useState(initialLocation || intent.locationQuery || '');
  const [minimumRating, setMinimumRating] = useState('all');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [availableOnly, setAvailableOnly] = useState(mode === 'service-results');
  const [sortOption, setSortOption] = useState<SortOption>('recommended');
  const [userCoords, setUserCoords] = useState<Coordinates | null>(null);
  const [geoDenied, setGeoDenied] = useState(false);
  const hasRequestedGeolocation = useRef(false);
  const isNearMeSearch = initialNearMe || extractSearchIntent(query).nearMe;
  const isServiceResults = mode === 'service-results';

  useEffect(() => {
    const storedCoordinates = sessionStorage.getItem('userLocationCoords');
    if (!storedCoordinates) return;

    try {
      const parsed = JSON.parse(storedCoordinates) as Coordinates;
      if (typeof parsed.latitude === 'number' && typeof parsed.longitude === 'number') {
        setUserCoords({ latitude: parsed.latitude, longitude: parsed.longitude });
      }
    } catch {
      sessionStorage.removeItem('userLocationCoords');
    }
  }, []);

  const requestBrowserLocation = () => {
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
        hasRequestedGeolocation.current = true;
      },
      () => {
        setGeoDenied(true);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => {
    if (!isNearMeSearch || userCoords || hasRequestedGeolocation.current) return;
    hasRequestedGeolocation.current = true;
    requestBrowserLocation();
  }, [isNearMeSearch, userCoords]);

  const { displayedProviders, notice, summary } = useMemo(() => {
    const parsedQuery = extractSearchIntent(query);
    const normalizedLocationSearch = normalizeLocationName(selectedLocation || parsedQuery.locationQuery);

    let scopedProviders = providers;

    if (!isServiceResults && withSearch && query.trim()) {
      scopedProviders = scopedProviders.filter((provider) => {
        const serviceName = serviceNamesBySlug?.[provider.serviceCategory] ?? provider.serviceCategory;
        return matchesProviderSearch(provider, serviceName, parsedQuery.serviceQuery || query);
      });
    }

    const filteredByMeta = scopedProviders.filter((provider) => {
      const matchesRating = minimumRating === 'all' || provider.rating >= Number(minimumRating);
      const matchesVerification = !verifiedOnly || provider.verified;
      const matchesAvailability = !availableOnly || provider.isAvailable !== false;
      return matchesRating && matchesVerification && matchesAvailability;
    });

    const recommendedSort = (items: Provider[]) => {
      return [...items].sort((a, b) => {
        const availableScoreA = a.isAvailable === false ? 0 : 1;
        const availableScoreB = b.isAvailable === false ? 0 : 1;
        if (availableScoreA !== availableScoreB) return availableScoreB - availableScoreA;

        const restrictedScoreA = a.providerStanding === 'restricted' ? 0 : 1;
        const restrictedScoreB = b.providerStanding === 'restricted' ? 0 : 1;
        if (restrictedScoreA !== restrictedScoreB) return restrictedScoreB - restrictedScoreA;

        if (a.verified !== b.verified) return Number(b.verified) - Number(a.verified);
        if (a.rating !== b.rating) return b.rating - a.rating;
        const unpaidA = a.unpaidBalance ?? 0;
        const unpaidB = b.unpaidBalance ?? 0;
        if (unpaidA !== unpaidB) return unpaidA - unpaidB;

        const paymentSpeedA = a.paymentSpeedScore ?? 0;
        const paymentSpeedB = b.paymentSpeedScore ?? 0;
        if (paymentSpeedA !== paymentSpeedB) return paymentSpeedB - paymentSpeedA;

        if (userCoords) {
          const distanceA =
            a.latitude !== undefined && a.longitude !== undefined
              ? calculateDistanceKm(userCoords.latitude, userCoords.longitude, a.latitude, a.longitude)
              : Number.POSITIVE_INFINITY;
          const distanceB =
            b.latitude !== undefined && b.longitude !== undefined
              ? calculateDistanceKm(userCoords.latitude, userCoords.longitude, b.latitude, b.longitude)
              : Number.POSITIVE_INFINITY;
          if (distanceA !== distanceB) return distanceA - distanceB;
        }

        return b.completedJobs - a.completedJobs;
      });
    };

    const applySort = (items: Provider[]) => {
      if (sortOption === 'highest-rated') return [...items].sort((a, b) => b.rating - a.rating || b.completedJobs - a.completedJobs);
      if (sortOption === 'most-completed-jobs') return [...items].sort((a, b) => b.completedJobs - a.completedJobs || b.rating - a.rating);
      if (sortOption === 'nearest-first' && userCoords) return sortProvidersByDistance(items, userCoords);
      return recommendedSort(items);
    };

    const sortedPool = applySort(filteredByMeta);

    if (sortedPool.length === 0) {
      return {
        displayedProviders: [] as Provider[],
        notice: providers.length === 0 ? null : undefined,
        summary: providers.length === 0 ? 'No providers available yet for this service.' : 'No providers match your filters yet.'
      };
    }

    if (!normalizedLocationSearch && !(sortOption === 'nearest-first' && userCoords)) {
      return {
        displayedProviders: sortedPool,
        notice: null,
        summary: `Showing ${isServiceResults ? 'available providers' : 'providers'}${sortOption === 'highest-rated' ? ' by highest rating' : ''}${sortOption === 'most-completed-jobs' ? ' by completed jobs' : ''}.`
      };
    }

    const exactMatches = normalizedLocationSearch
      ? sortedPool.filter((provider) => normalizeLocationName(provider.location).includes(normalizedLocationSearch))
      : [];

    if (normalizedLocationSearch && exactMatches.length > 0) {
      const otherProviders = sortedPool.filter((provider) => !exactMatches.includes(provider));
      return {
        displayedProviders: [...exactMatches, ...otherProviders],
        notice: null,
        summary: `Showing ${exactMatches.length} matching ${exactMatches.length === 1 ? 'provider' : 'providers'} near ${selectedLocation}.`
      };
    }

    const locationLabel = selectedLocation || 'your area';

    if (userCoords) {
      const nearestProviders = getNearestProviders(sortedPool, userCoords, sortedPool.length).filter((provider) => {
        if (provider.latitude === undefined || provider.longitude === undefined) return false;
        return calculateDistanceKm(userCoords.latitude, userCoords.longitude, provider.latitude, provider.longitude) <= 40;
      });

      if (nearestProviders.length > 0) {
        return {
          displayedProviders: nearestProviders,
          notice: `No matching professionals found in this area. Showing the nearest available providers.`,
          summary: `Showing nearest ${isServiceResults ? 'providers' : 'professionals'} near ${locationLabel}.`
        };
      }
    }

    if (normalizedLocationSearch) {
      const nearbyAreas = getFallbackNearbyAreas(normalizedLocationSearch);
      const nearbyProviders = sortedPool.filter((provider) => {
        const providerLocation = normalizeLocationName(provider.location);
        return nearbyAreas.some((area) => providerLocation.includes(area));
      });

      if (nearbyProviders.length > 0) {
        return {
          displayedProviders: applySort(nearbyProviders),
          notice: `No matching professionals found in this area. Showing the nearest available providers.`,
          summary: `Showing nearby ${isServiceResults ? 'providers' : 'professionals'} around ${locationLabel}.`
        };
      }
    }

    const topRated = [...sortedPool].sort((a, b) => b.rating - a.rating || b.completedJobs - a.completedJobs);

    if (topRated.length > 0) {
      return {
        displayedProviders: topRated,
        notice: 'No nearby providers found yet. Showing top-rated providers for this service.',
        summary: `Showing highest-rated ${isServiceResults ? 'providers' : 'professionals'}${normalizedLocationSearch ? ` near ${locationLabel}` : ''}.`
      };
    }

    return {
      displayedProviders: [] as Provider[],
      notice: undefined,
      summary: 'No providers match your filters yet.'
    };
  }, [availableOnly, isServiceResults, minimumRating, providers, query, selectedLocation, serviceNamesBySlug, sortOption, userCoords, verifiedOnly, withSearch]);

  const clearFilters = () => {
    setQuery('');
    setSelectedLocation('');
    setMinimumRating('all');
    setVerifiedOnly(false);
    setAvailableOnly(isServiceResults);
    setSortOption('recommended');
    setGeoDenied(false);
  };

  const noProvidersAvailable = providers.length === 0;

  return (
    <div className="mt-6 space-y-5">
      <section className="card p-4 sm:p-5">
        <div className={`grid gap-3 ${withSearch && !isServiceResults ? 'md:grid-cols-2 xl:grid-cols-5' : 'md:grid-cols-2 xl:grid-cols-4'}`}>
          {withSearch && !isServiceResults ? (
            <label className="md:col-span-2">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Search</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={searchPlaceholder}
                className="focus-ring min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900"
              />
            </label>
          ) : null}

          <label className={withSearch && !isServiceResults ? '' : 'md:col-span-1'}>
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Location</span>
            <LocationAutocomplete
              value={selectedLocation}
              onChange={setSelectedLocation}
              onPlaceSelect={(place) => {
                setSelectedLocation(place.name);
              }}
              placeholder="Enter your area"
              className="focus-ring min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900"
            />
          </label>

          <label>
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Rating</span>
            <select
              value={minimumRating}
              onChange={(event) => setMinimumRating(event.target.value)}
              className="focus-ring min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900"
            >
              <option value="all">Any rating</option>
              <option value="4">4.0+ stars</option>
              <option value="4.5">4.5+ stars</option>
            </select>
          </label>

          <label>
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Sort</span>
            <select
              value={sortOption}
              onChange={(event) => setSortOption(event.target.value as SortOption)}
              className="focus-ring min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900"
            >
              <option value="recommended">Recommended</option>
              <option value="highest-rated">Highest rated</option>
              <option value="most-completed-jobs">Most completed jobs</option>
              <option value="nearest-first">Nearest first</option>
            </select>
          </label>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <label className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(event) => setVerifiedOnly(event.target.checked)}
                className="focus-ring h-4 w-4 rounded border-slate-300"
              />
              Verified only
            </label>
            <label className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={availableOnly}
                onChange={(event) => setAvailableOnly(event.target.checked)}
                className="focus-ring h-4 w-4 rounded border-slate-300"
              />
              Availability only
            </label>
            <button
              type="button"
              onClick={requestBrowserLocation}
              className="focus-ring min-h-11 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Use my location
            </button>
          </div>

          <button
            type="button"
            onClick={clearFilters}
            className="focus-ring min-h-11 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 md:justify-self-end"
          >
            Clear filters
          </button>
        </div>

        {geoDenied ? <p className="mt-3 text-sm text-[#D71920]">Please type your area instead.</p> : null}
      </section>

      <p className="text-sm text-slate-600">{summary}</p>

      {notice ? <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{notice}</div> : null}

      {displayedProviders.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {displayedProviders.map((provider) => {
            const distanceKm =
              userCoords && provider.latitude !== undefined && provider.longitude !== undefined
                ? calculateDistanceKm(userCoords.latitude, userCoords.longitude, provider.latitude, provider.longitude)
                : undefined;

            return (
              <ProviderCard
                key={provider.id}
                provider={provider}
                serviceName={serviceNamesBySlug?.[provider.serviceCategory]}
                distanceKm={distanceKm}
              />
            );
          })}
        </div>
      ) : (
        <section className="card px-6 py-10 text-center">
          <h3 className="text-lg font-semibold text-slate-900">
            {noProvidersAvailable ? 'No providers are currently listed for this service.' : 'No matching professionals found yet.'}
          </h3>
          <p className="mt-2 text-sm text-slate-600">
            {noProvidersAvailable
              ? 'Request this service and we will notify you when local professionals become available.'
              : 'Try adjusting your filters or request this service and we will source one for you.'}
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
