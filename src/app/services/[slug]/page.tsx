import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ProviderCard } from '@/components/provider-card';
import { providers, serviceCategories } from '@/data/mock-data';

export default function ServiceDetailsPage({ params }: { params: { slug: string } }) {
  const service = serviceCategories.find((item) => item.slug === params.slug);
  if (!service) notFound();

  const serviceProviders = providers.filter((provider) => provider.serviceCategory === params.slug);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <Link href="/services" className="text-sm font-semibold text-teal-700">
        ← Back to services
      </Link>
      <h1 className="mt-3 text-3xl font-bold text-slate-900">{service.name}</h1>
      <p className="mt-2 text-slate-600">{service.shortDescription}</p>

      <h2 className="mt-10 text-xl font-semibold text-slate-900">Available professionals</h2>
      <div className="mt-4 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {serviceProviders.length > 0 ? (
          serviceProviders.map((provider) => <ProviderCard key={provider.id} provider={provider} />)
        ) : (
          <p className="text-slate-600">No providers listed yet. Check back soon.</p>
        )}
      </div>
    </div>
  );
}
