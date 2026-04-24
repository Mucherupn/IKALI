import Link from 'next/link';
import type { Metadata } from 'next';
import { ProviderCard } from '@/components/provider-card';
import { ServiceCard } from '@/components/service-card';
import { getProviders, getServiceCategories } from '@/lib/data';
import { GlobalSearch } from '@/components/global-search';

export const metadata: Metadata = {
  title: 'I Kali | Trusted local services in Nairobi',
  description: 'Find verified local professionals in Nairobi for home and business services. Compare providers and request help quickly.'
};

export default async function HomePage() {
  const [services, providers] = await Promise.all([getServiceCategories(), getProviders()]);

  const serviceNamesBySlug = Object.fromEntries(services.map((service) => [service.slug, service.name]));
  const providerCountsByService = providers.reduce<Record<string, number>>((counts, provider) => {
    counts[provider.serviceCategory] = (counts[provider.serviceCategory] ?? 0) + 1;
    return counts;
  }, {});

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="card overflow-hidden bg-gradient-to-br from-teal-800 to-teal-600 p-8 text-white md:p-12">
        <p className="text-xs uppercase tracking-[0.2em] text-teal-100">Internet Jua Kali</p>
        <h1 className="mt-3 max-w-2xl text-3xl font-bold leading-tight md:text-5xl">
          Premium local services marketplace for Nairobi.
        </h1>
        <p className="mt-4 max-w-2xl text-sm text-teal-50 md:text-base">
          Find trusted plumbers, electricians, cleaners, mechanics, and more. Compare verified professionals and request
          a job in minutes.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/request" className="focus-ring rounded-lg bg-white px-4 py-2 font-semibold text-teal-800">
            Find a Service
          </Link>
          <Link
            href="/services"
            className="focus-ring rounded-lg border border-teal-200 px-4 py-2 font-semibold text-white hover:bg-teal-700"
          >
            Explore Services
          </Link>
        </div>

        <GlobalSearch services={services} />
      </section>

      <section className="mt-12">
        <div className="mb-5 flex items-end justify-between">
          <h2 className="text-2xl font-semibold text-slate-900">Popular services</h2>
          <Link href="/services" className="text-sm font-semibold text-teal-700">
            View all →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {services.slice(0, 8).map((service) => (
            <ServiceCard key={service.slug} service={service} providerCount={providerCountsByService[service.slug] ?? 0} />
          ))}
        </div>
      </section>

      <section className="mt-12">
        <div className="mb-5 flex items-end justify-between">
          <h2 className="text-2xl font-semibold text-slate-900">Top rated professionals in Nairobi</h2>
          <Link href="/providers" className="text-sm font-semibold text-teal-700">
            Browse providers →
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {providers.map((provider) => (
            <ProviderCard key={provider.id} provider={provider} serviceName={serviceNamesBySlug[provider.serviceCategory]} />
          ))}
        </div>
      </section>
    </div>
  );
}
