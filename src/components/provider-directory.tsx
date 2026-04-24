'use client';

import { useMemo, useState } from 'react';
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
  showSuggestions?: boolean;
};

export function ProviderDirectory({
  providers,
  serviceNamesBySlug,
  withSearch = true,
  searchPlaceholder = 'Search by name, service, or location',
  initialQuery = '',
  initialLocation = '',
  showSuggestions = false
}: ProviderDirectoryProps) {
  const intent = extractSearchIntent(initialQuery);
  const [query, setQuery] = useState(initialQuery);
  const [selectedLocation, setSelectedLocation] = useState(initialLocation || intent.locationQuery || 'all');
  const [minimumRating, setMinimumRating] = useState('all');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const areas = useMemo(() => {
    const unique = new Set<string>(POPULAR_LOCATIONS);
    for (const provider of providers) {
      const primaryArea = provider.location.split(',')[0]?.trim();
      if (primaryArea) unique.add(primaryArea);
    }
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [providers]);

  const filteredProviders = useMemo(() => {
    const parsedQuery = extractSearchIntent(query);
    const normalizedLocationSearch = (selectedLocation === 'all' ? parsedQuery.locationQuery : selectedLocation).trim().toLowerCase();

    return providers.filter((provider) => {
      const serviceName = serviceNamesBySlug?.[provider.serviceCategory] ?? provider.serviceCategory;
      const matchesQuery = matchesProviderSearch(provider, serviceName, parsedQuery.serviceQuery || query);

      const matchesLocation = !normalizedLocationSearch || provider.location.toLowerCase().includes(normalizedLocationSearch);
      const matchesRating = minimumRating === 'all' || provider.rating >= Number(minimumRating);
      const matchesVerification = !verifiedOnly || provider.verified;

      return matchesQuery && matchesLocation && matchesRating && matchesVerification;
    });
  }, [minimumRating, providers, query, selectedLocation, serviceNamesBySlug, verifiedOnly]);

  const clearFilters = () => {
    setQuery('');
    setSelectedLocation('all');
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

          <label>
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Location</span>
            <select
              value={selectedLocation}
              onChange={(event) => setSelectedLocation(event.target.value)}
              className="focus-ring w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900"
            >
              <option value="all">All Nairobi</option>
              {areas.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </label>

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
