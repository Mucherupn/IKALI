import Image from 'next/image';
import Link from 'next/link';
import { TrustPill } from '@/components/trust-pill';
import { Provider } from '@/lib/types';

export function ProviderCard({ provider, serviceName, distanceKm }: { provider: Provider; serviceName?: string; distanceKm?: number }) {
  const reviewCount = provider.reviewCount ?? provider.reviews;
  const distanceLabel = typeof distanceKm === 'number' && Number.isFinite(distanceKm) ? `${distanceKm.toFixed(1)} km away` : null;

  return (
    <article className="card flex h-full flex-col overflow-hidden">
      <div className="relative h-48 w-full">
        <Image src={provider.photo} alt={provider.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{provider.name}</h3>
            <p className="text-sm text-slate-600">{serviceName ?? provider.serviceCategory}</p>
          </div>
          <TrustPill label={provider.verified ? 'Verified' : 'Verification pending'} tone={provider.verified ? 'verified' : 'pending'} />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-600">
          <span>{provider.location}</span>
          {distanceLabel ? <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">{distanceLabel}</span> : null}
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-700">
          <span className="rounded-lg bg-slate-100 px-2.5 py-2">⭐ {provider.rating.toFixed(1)}</span>
          <span className="rounded-lg bg-slate-100 px-2.5 py-2">{provider.completedJobs} jobs</span>
          <span className="rounded-lg bg-slate-100 px-2.5 py-2">{reviewCount} reviews</span>
          <span className="rounded-lg bg-slate-100 px-2.5 py-2">{provider.isAvailable === false ? 'Currently unavailable' : provider.availability}</span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <TrustPill
            label={provider.phoneVerified ? 'Phone verified' : 'Phone verification pending'}
            tone={provider.phoneVerified ? 'neutral' : 'pending'}
          />
          <TrustPill label={provider.responseTime ?? 'Response time being verified'} tone="neutral" />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-3">
          <a
            href={`tel:${provider.phone}`}
            className="focus-ring rounded-lg border border-slate-300 px-3 py-2 text-center text-sm font-medium text-slate-800 transition hover:bg-slate-50"
          >
            Call
          </a>
          <a
            href={`https://wa.me/${provider.whatsapp}`}
            className="focus-ring rounded-lg bg-[#D71920] px-3 py-2 text-center text-sm font-medium text-white transition hover:bg-[#A80F1A]"
          >
            WhatsApp
          </a>
          <Link
            href={`/providers/${provider.slug}`}
            className="focus-ring rounded-lg border border-[#fecdd3] bg-[#fff1f2] px-3 py-2 text-center text-sm font-medium text-[#7f1d1d] transition hover:bg-[#ffe4e6]"
          >
            View profile
          </Link>
        </div>
      </div>
    </article>
  );
}
