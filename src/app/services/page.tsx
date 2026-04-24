import { ServiceCard } from '@/components/service-card';
import { getProviders, getServiceCategories } from '@/lib/data';

export default async function ServicesPage() {
  const [services, providers] = await Promise.all([getServiceCategories(), getProviders()]);
  const providerCountsByService = providers.reduce<Record<string, number>>((counts, provider) => {
    counts[provider.serviceCategory] = (counts[provider.serviceCategory] ?? 0) + 1;
    return counts;
  }, {});

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Browse Services</h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Discover trusted professionals across Nairobi. Pick a service category to see available providers, compare options, and
          contact instantly.
        </p>
      </header>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {services.map((service) => (
          <ServiceCard key={service.slug} service={service} providerCount={providerCountsByService[service.slug] ?? 0} />
        ))}
      </section>
    </div>
  );
}
