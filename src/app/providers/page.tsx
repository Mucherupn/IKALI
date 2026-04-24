import type { Metadata } from 'next';
import { ProviderDirectory } from '@/components/provider-directory';
import { getProviders, getServiceCategories } from '@/lib/data';

type ProvidersPageProps = {
  searchParams?: Promise<{
    q?: string;
    location?: string;
  }>;
};

export default async function ProvidersPage({ searchParams }: ProvidersPageProps) {
  const params = (await searchParams) ?? {};
  const [providers, services] = await Promise.all([getProviders(), getServiceCategories()]);
  const serviceNamesBySlug = Object.fromEntries(services.map((service) => [service.slug, service.name]));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Provider Directory</h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Explore our full network of service providers, filter by area and quality, then contact the best fit directly.
        </p>
      </header>

      <ProviderDirectory
        providers={providers}
        serviceNamesBySlug={serviceNamesBySlug}
        withSearch
        searchPlaceholder="Search providers by name, service, location, or bio"
        initialQuery={params.q ?? ''}
        initialLocation={params.location ?? ''}
        showSuggestions
      />
    </div>
  );
}

export const metadata: Metadata = {
  title: 'Providers | I Kali',
  description: 'Browse verified local professionals across Nairobi and filter by area, rating, and service.'
};
