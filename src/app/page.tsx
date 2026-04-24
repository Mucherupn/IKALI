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
    <div className="section-shell py-8 sm:py-12">
      <section className="card-premium overflow-hidden bg-gradient-to-br from-[#080808] via-[#111827] to-[#D71920] p-7 text-white md:p-12">
        <p className="eyebrow text-red-100">Kenya&apos;s premium service marketplace</p>
        <h1 className="mt-3 max-w-3xl text-3xl font-extrabold leading-tight md:text-5xl">Book trusted local professionals with confidence.</h1>
        <p className="mt-4 max-w-2xl text-sm text-gray-100 md:text-base">From urgent home fixes to routine service work, I Kali helps Nairobi households and businesses find trusted experts quickly.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/request" className="focus-ring btn btn-primary">Request Service</Link>
          <Link href="/services" className="focus-ring btn btn-secondary">Browse Services</Link>
        </div>
        <GlobalSearch services={services} />
      </section>

      <section className="mt-12">
        <div className="mb-5 flex items-end justify-between gap-3">
          <h2 className="section-heading">Popular services</h2>
          <Link href="/services" className="text-sm font-semibold text-[#D71920]">View all →</Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {services.slice(0, 8).map((service) => (
            <ServiceCard key={service.slug} service={service} providerCount={providerCountsByService[service.slug] ?? 0} />
          ))}
        </div>
      </section>

      <section className="mt-14">
        <div className="mb-5 flex items-end justify-between gap-3">
          <h2 className="section-heading">Featured professionals</h2>
          <Link href="/providers" className="text-sm font-semibold text-[#D71920]">Browse providers →</Link>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {providers.map((provider) => (
            <ProviderCard key={provider.id} provider={provider} serviceName={serviceNamesBySlug[provider.serviceCategory]} />
          ))}
        </div>
      </section>

      <section className="mt-14 card-premium bg-[#111827] p-6 text-white sm:p-8">
        <p className="eyebrow text-red-200">Built on trust</p>
        <h3 className="mt-2 text-2xl font-bold">Ready to book your next service with I Kali?</h3>
        <p className="mt-2 max-w-2xl text-sm text-gray-300">Request once. Get matched with professionals who are easier to verify and safer to contact.</p>
        <Link href="/request" className="focus-ring mt-5 inline-flex btn btn-primary">Start request</Link>
      </section>
    </div>
  );
}
