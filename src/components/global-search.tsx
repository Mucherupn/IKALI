'use client';

import { FormEvent, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ServiceCategory } from '@/lib/types';
import { extractSearchIntent, POPULAR_LOCATIONS, resolveServiceSlug, SUGGESTED_SEARCHES } from '@/lib/search';

type GlobalSearchProps = {
  services: ServiceCategory[];
};

export function GlobalSearch({ services }: GlobalSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const sortedLocations = useMemo(() => [...POPULAR_LOCATIONS], []);

  const routeSearch = (rawQuery: string) => {
    const trimmed = rawQuery.trim();
    if (!trimmed) {
      router.push('/providers');
      return;
    }

    const { serviceQuery, locationQuery } = extractSearchIntent(trimmed);
    const serviceSlug = resolveServiceSlug(serviceQuery || trimmed, services);

    if (serviceSlug) {
      if (locationQuery) {
        router.push(`/services/${serviceSlug}?location=${encodeURIComponent(locationQuery)}`);
        return;
      }

      router.push(`/services/${serviceSlug}`);
      return;
    }

    router.push(`/providers?q=${encodeURIComponent(trimmed)}`);
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    routeSearch(query);
  };

  return (
    <div className="mt-8 rounded-2xl bg-white/10 p-4 backdrop-blur sm:p-5">
      <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Try: plumber in Karen"
          className="focus-ring min-h-11 w-full rounded-xl border border-white/30 bg-white/95 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-500"
        />
        <button
          type="submit"
          className="focus-ring min-h-11 rounded-xl bg-[#111827] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#080808]"
        >
          Search
        </button>
      </form>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs sm:text-sm">
        <span className="font-semibold text-red-100">Suggested:</span>
        {SUGGESTED_SEARCHES.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => routeSearch(suggestion)}
            className="focus-ring rounded-full border border-red-200/40 bg-[#D71920]/30 px-3 py-1 text-red-100 hover:bg-[#D71920]/50"
          >
            {suggestion}
          </button>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs sm:text-sm">
        <span className="font-semibold text-red-100">Popular locations:</span>
        {sortedLocations.map((location) => (
          <button
            key={location}
            type="button"
            onClick={() => routeSearch(`providers in ${location}`)}
            className="focus-ring rounded-full border border-red-200/40 px-3 py-1 text-red-100 hover:bg-[#D71920]/40"
          >
            {location}
          </button>
        ))}
      </div>
    </div>
  );
}
