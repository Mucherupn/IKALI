import Image from 'next/image';
import Link from 'next/link';
import { Provider } from '@/lib/types';

export function ProviderCard({ provider, serviceName }: { provider: Provider; serviceName?: string }) {
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
          {provider.verified ? (
            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">Verified</span>
          ) : null}
        </div>

        <p className="mt-3 text-sm text-slate-600">{provider.location}</p>
        <p className="mt-3 text-sm leading-6 text-slate-700">{provider.bio}</p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-700">
          <span className="rounded-full bg-slate-100 px-2.5 py-1">⭐ {provider.rating} ({provider.reviews})</span>
          <span className="rounded-full bg-slate-100 px-2.5 py-1">{provider.completedJobs} jobs</span>
          {provider.priceGuide ? <span className="rounded-full bg-slate-100 px-2.5 py-1">{provider.priceGuide}</span> : null}
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
            className="focus-ring rounded-lg bg-teal-700 px-3 py-2 text-center text-sm font-medium text-white transition hover:bg-teal-800"
          >
            WhatsApp
          </a>
          <Link
            href={`/providers/${provider.slug}`}
            className="focus-ring rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-center text-sm font-medium text-teal-900 transition hover:bg-teal-100"
          >
            View profile
          </Link>
        </div>
      </div>
    </article>
  );
}
