import { ProviderDirectory } from '@/components/provider-directory';
import { providers } from '@/data/mock-data';

export default function ProvidersPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Provider Directory</h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Explore our full network of service providers, filter by area and quality, then contact the best fit directly.
        </p>
      </header>

      <ProviderDirectory providers={providers} withSearch searchPlaceholder="Search providers by name, service, or location" />
    </div>
  );
}
