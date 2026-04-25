'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ServiceCategory } from '@/lib/types';
import { extractSearchIntent, resolveServiceSlug } from '@/lib/search';

type GlobalSearchProps = {
  services: ServiceCategory[];
};

export function GlobalSearch({ services }: GlobalSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const routeSearch = (rawQuery: string) => {
    const trimmed = rawQuery.trim();

    if (!trimmed) {
      router.push('/providers');
      return;
    }

    const { serviceQuery, locationQuery, nearMe } = extractSearchIntent(trimmed);
    const serviceSlug = resolveServiceSlug(serviceQuery || trimmed, services);

    if (serviceSlug) {
      const params = new URLSearchParams();

      if (locationQuery) params.set('location', locationQuery);
      if (nearMe) params.set('nearMe', '1');

      const queryString = params.toString();

      router.push(`/services/${serviceSlug}${queryString ? `?${queryString}` : ''}`);
      return;
    }

    router.push(`/providers?q=${encodeURIComponent(trimmed)}`);
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    routeSearch(query);
  };

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto w-full max-w-4xl rounded-[1.4rem] border border-[#e8e8e8] bg-white p-2 shadow-[0_20px_60px_rgba(17,17,17,0.10)]"
    >
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="What service do you need today?"
          className="min-h-[4.2rem] flex-1 rounded-[1.1rem] border-none bg-[#f7f7f7] px-5 text-base font-medium text-[#111111] outline-none placeholder:text-[#888888] focus:bg-white focus:ring-4 focus:ring-[#e11d2e]/10"
        />

        <button
          type="submit"
          className="min-h-[4.2rem] rounded-[1.1rem] bg-[var(--red)] px-8 text-base font-semibold text-white transition hover:bg-[var(--red-dark)] sm:min-w-[150px]"
        >
          Search
        </button>
      </div>
    </form>
  );
}