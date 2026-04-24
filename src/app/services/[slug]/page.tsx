import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ProviderDirectory } from '@/components/provider-directory';
import { getProvidersByServiceSlug, getServiceBySlug, getServiceCategories } from '@/lib/data';

export default async function ServiceDetailsPage({ params }: { params: { slug: string } }) {
  const [service, serviceProviders, services] = await Promise.all([
    getServiceBySlug(params.slug),
    getProvidersByServiceSlug(params.slug),
    getServiceCategories()
  ]);

  if (!service) notFound();

  const serviceNamesBySlug = Object.fromEntries(services.map((item) => [item.slug, item.name]));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <Link href="/services" className="text-sm font-semibold text-teal-700">
        ← Back to services
      </Link>

      <header className="mt-4">
        <h1 className="text-3xl font-bold text-slate-900">{service.name} Services in Nairobi</h1>
        <p className="mt-2 max-w-3xl text-slate-600">
          Browse available {service.name.toLowerCase()} professionals, compare ratings, and contact the right provider for your
          project in minutes.
        </p>
        <div className="mt-5">
          <Link
            href={`/request?service=${service.slug}`}
            className="focus-ring inline-flex min-h-11 items-center justify-center rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-800"
          >
            Request {service.name}
          </Link>
        </div>
      </header>

      <ProviderDirectory
        providers={serviceProviders}
        serviceNamesBySlug={serviceNamesBySlug}
        withSearch
        searchPlaceholder={`Search ${service.name.toLowerCase()} providers by name or area`}
      />
    </div>
  );
}
