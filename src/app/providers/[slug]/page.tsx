import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { providers } from '@/data/mock-data';

export default function ProviderDetailPage({ params }: { params: { slug: string } }) {
  const provider = providers.find((item) => item.slug === params.slug);
  if (!provider) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <Link href="/providers" className="text-sm font-semibold text-teal-700">
        ← Back to providers
      </Link>
      <section className="card mt-4 overflow-hidden">
        <div className="relative h-60 w-full">
          <Image src={provider.photo} alt={provider.name} fill className="object-cover" />
        </div>
        <div className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h1 className="text-3xl font-bold text-slate-900">{provider.name}</h1>
            {provider.verified ? (
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">Verified Pro</span>
            ) : null}
          </div>
          <p className="mt-2 text-slate-600">{provider.location}</p>
          <p className="mt-4 text-slate-700">{provider.bio}</p>
          <dl className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-3">
              <dt className="text-xs text-slate-500">Experience</dt>
              <dd className="font-semibold text-slate-900">{provider.experienceYears} years</dd>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <dt className="text-xs text-slate-500">Rating</dt>
              <dd className="font-semibold text-slate-900">{provider.rating} ({provider.reviews} reviews)</dd>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <dt className="text-xs text-slate-500">Completed jobs</dt>
              <dd className="font-semibold text-slate-900">{provider.completedJobs}</dd>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <dt className="text-xs text-slate-500">Price guide</dt>
              <dd className="font-semibold text-slate-900">{provider.priceGuide}</dd>
            </div>
          </dl>
          <div className="mt-5 flex flex-wrap gap-2">
            {provider.skills.map((skill) => (
              <span key={skill} className="rounded-full border border-slate-300 px-3 py-1 text-sm text-slate-700">
                {skill}
              </span>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={`tel:${provider.phone}`} className="focus-ring rounded-lg border border-slate-300 px-4 py-2 font-medium">
              Call {provider.phone}
            </a>
            <a
              href={`https://wa.me/${provider.whatsapp}`}
              className="focus-ring rounded-lg bg-teal-700 px-4 py-2 font-medium text-white"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
