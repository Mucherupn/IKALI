import type { Metadata } from 'next';
import Link from 'next/link';
import { ServiceCard } from '@/components/service-card';
import { getProviders, getServiceCategories } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Services | I Kali',
  description: 'Browse trusted local service categories in Nairobi and request help in minutes.'
};

export default async function ServicesPage() {
  const [services, providers] = await Promise.all([getServiceCategories(), getProviders()]);
  const providerCountsByService = providers.reduce<Record<string, number>>((counts, provider) => {
    counts[provider.serviceCategory] = (counts[provider.serviceCategory] ?? 0) + 1;
    return counts;
  }, {});

  return (
    <div className="section-shell py-10">
      <header className="card-premium p-6 sm:p-8">
        <p className="eyebrow">Service discovery</p>
        <h1 className="page-title mt-2">Browse Services</h1>
        <p className="mt-3 max-w-2xl muted-text">Discover trusted professionals across Nairobi. Pick a category, compare providers, and request help in minutes.</p>
      </header>

      {services.length > 0 ? (
        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <ServiceCard key={service.slug} service={service} providerCount={providerCountsByService[service.slug] ?? 0} />
          ))}
        </section>
      ) : (
        <section className="empty-state mt-8">
          <h2 className="text-lg font-semibold text-slate-900">No services listed yet</h2>
          <p className="mt-2 text-sm muted-text">Please check back shortly or submit your request directly.</p>
          <Link href="/request" className="focus-ring mt-4 inline-flex btn btn-primary">Request service</Link>
        </section>
      )}
    </div>
  );
}
