import Image from 'next/image';
import Link from 'next/link';
import { Provider } from '@/lib/types';

export function ProviderCard({ provider }: { provider: Provider }) {
  return (
    <article className="card overflow-hidden">
      <div className="relative h-44 w-full">
        <Image src={provider.photo} alt={provider.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{provider.name}</h3>
            <p className="text-sm capitalize text-slate-600">{provider.serviceCategory.replace('-', ' ')}</p>
          </div>
          {provider.verified ? (
            <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-800">Verified</span>
          ) : null}
        </div>
        <p className="mt-3 text-sm text-slate-600">{provider.location}</p>
        <p className="mt-2 text-sm text-slate-700">{provider.bio}</p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-700">
          <span className="rounded-full bg-slate-100 px-2 py-1">⭐ {provider.rating}</span>
          <span className="rounded-full bg-slate-100 px-2 py-1">{provider.completedJobs} jobs</span>
          <span className="rounded-full bg-slate-100 px-2 py-1">{provider.priceGuide}</span>
        </div>
        <div className="mt-5 flex gap-2">
          <Link
            href={`/providers/${provider.slug}`}
            className="focus-ring rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-50"
          >
            View Profile
          </Link>
          <a
            href={`https://wa.me/${provider.whatsapp}`}
            className="focus-ring rounded-lg bg-teal-700 px-3 py-2 text-sm font-medium text-white transition hover:bg-teal-800"
          >
            WhatsApp
          </a>
        </div>
      </div>
    </article>
  );
}
