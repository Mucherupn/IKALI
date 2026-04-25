import type { Metadata } from 'next';
import { ProviderDirectory } from '@/components/provider-directory';
import { getProviders, getServiceCategories } from '@/lib/data';

type ProvidersPageProps = {
  searchParams?: Promise<{ q?: string; location?: string; nearMe?: string }>;
};

export default async function ProvidersPage({ searchParams }: ProvidersPageProps) {
  const params = (await searchParams) ?? {};
  const [providers, services] = await Promise.all([getProviders(), getServiceCategories()]);
  const serviceNamesBySlug = Object.fromEntries(services.map((service) => [service.slug, service.name]));

  return (
    <div className="section-shell py-10">
      <header className="card-premium p-6 sm:p-8">
        <p className="eyebrow">Verified network</p>
        <h1 className="page-title mt-2">Provider Directory</h1>
        <p className="mt-3 max-w-2xl muted-text">Filter by location, rating, and verification signals to find the right professional faster.</p>
      </header>

      <ProviderDirectory
        providers={providers}
        serviceNamesBySlug={serviceNamesBySlug}
        withSearch
        searchPlaceholder="Search providers by name, service, location, or bio"
        initialQuery={params.q ?? ''}
        initialLocation={params.location ?? ''}
        initialNearMe={params.nearMe === '1'}
        showSuggestions
      />
    </div>
  );
}

export const metadata: Metadata = {
  title: 'Providers | I Kali',
  description: 'Browse verified local professionals across Nairobi and filter by area, rating, and service.'
};
