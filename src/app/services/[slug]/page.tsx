import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ProviderDirectory } from '@/components/provider-directory';
import { getProvidersByServiceSlug, getServiceBySlug, getServiceCategories } from '@/lib/data';

type ServiceDetailsPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{
    location?: string;
    q?: string;
    nearMe?: string;
  }>;
};

export default async function ServiceDetailsPage({ params, searchParams }: ServiceDetailsPageProps) {
  const routeParams = await params;
  const queryParams = (await searchParams) ?? {};
  const [service, serviceProviders, services] = await Promise.all([
    getServiceBySlug(routeParams.slug),
    getProvidersByServiceSlug(routeParams.slug),
    getServiceCategories()
  ]);

  if (!service) notFound();

  const serviceNamesBySlug = Object.fromEntries(services.map((item) => [item.slug, item.name]));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <Link href="/services" className="text-sm font-semibold text-[#D71920]">
        ← Back to services
      </Link>

      <header className="mt-4">
        <h1 className="text-3xl font-bold text-slate-900">{service.name} near you</h1>
        <p className="mt-2 max-w-3xl text-slate-600">Compare available providers, ratings and service areas.</p>
      </header>

      <ProviderDirectory
        providers={serviceProviders}
        serviceNamesBySlug={serviceNamesBySlug}
        mode="service-results"
        withSearch={false}
        initialQuery={queryParams.q ?? ''}
        initialLocation={queryParams.location ?? ''}
        initialNearMe={queryParams.nearMe === '1'}
      />
    </div>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const routeParams = await params;
  const service = await getServiceBySlug(routeParams.slug);
  if (!service) {
    return {
      title: 'Service not found | I Kali',
      description: 'This service category is unavailable.'
    };
  }

  return {
    title: `${service.name} near you | I Kali`,
    description: `Find trusted ${service.name.toLowerCase()} professionals in your area, compare providers, and request service safely.`
  };
}
