'use client';

import { useMemo, useState } from 'react';
import { ProviderCard } from '@/components/provider-card';
import { Provider } from '@/lib/types';

type ProviderDirectoryProps = {
  providers: Provider[];
  serviceNamesBySlug?: Record<string, string>;
  withSearch?: boolean;
  searchPlaceholder?: string;
};

export function ProviderDirectory({
  providers,
  serviceNamesBySlug,
  withSearch = true,
  searchPlaceholder = 'Search by name, service, or location'
}: ProviderDirectoryProps) {
  const [query, setQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [minimumRating, setMinimumRating] = useState('all');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const areas = useMemo(() => {
    const unique = Array.from(new Set(providers.map((provider) => provider.location.split(',')[0]?.trim()).filter(Boolean)));
    return unique.sort((a, b) => a.localeCompare(b));
  }, [providers]);

  const filteredProviders = useMemo(() => {
    return providers.filter((provider) => {
      const serviceName = serviceNamesBySlug?.[provider.serviceCategory] ?? provider.serviceCategory;

      const matchesQuery =
        query.length === 0 ||
        provider.name.toLowerCase().includes(query.toLowerCase()) ||
        serviceName.toLowerCase().includes(query.toLowerCase()) ||
        provider.location.toLowerCase().includes(query.toLowerCase());

      const matchesLocation =
        selectedLocation === 'all' || provider.location.toLowerCase().includes(selectedLocation.toLowerCase());

      const matchesRating = minimumRating === 'all' || provider.rating >= Number(minimumRating);

      const matchesVerification = !verifiedOnly || provider.verified;

      return matchesQuery && matchesLocation && matchesRating && matchesVerification;
    });
  }, [minimumRating, providers, query, selectedLocation, serviceNamesBySlug, verifiedOnly]);

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

        <label className="mt-4 inline-flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={verifiedOnly}
            onChange={(event) => setVerifiedOnly(event.target.checked)}
            className="focus-ring h-4 w-4 rounded border-slate-300"
          />
          Verified providers only
        </label>
      </section>

      {filteredProviders.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filteredProviders.map((provider) => (
            <ProviderCard
              key={provider.id}
              provider={provider}
              serviceName={serviceNamesBySlug?.[provider.serviceCategory]}
            />
          ))}
        </div>
      ) : (
        <section className="card px-6 py-10 text-center">
          <h3 className="text-lg font-semibold text-slate-900">No providers found for this service in your area yet.</h3>
          <p className="mt-2 text-sm text-slate-600">Try adjusting your filters or request a provider and we will source one for you.</p>
          <a
            href="/request"
            className="focus-ring mt-5 inline-flex rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800"
          >
            Request this service instead
          </a>
        </section>
      )}
    </div>
  );
}
