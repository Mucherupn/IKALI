import { ProviderCard } from '@/components/provider-card';
import { providers } from '@/data/mock-data';

export default function ProvidersPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-slate-900">Service professionals</h1>
      <p className="mt-2 text-slate-600">Verified, reviewed, and ready to help across Nairobi.</p>
      <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {providers.map((provider) => (
          <ProviderCard key={provider.id} provider={provider} />
        ))}
      </div>
    </div>
  );
}
