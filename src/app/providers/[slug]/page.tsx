import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getServiceNameBySlug, providers } from '@/data/mock-data';

const mockReviews = [
  { customer: 'Mary A.', rating: 5, comment: 'Fast response, clear communication, and very neat work.' },
  { customer: 'James K.', rating: 5, comment: 'Showed up on time and solved the issue in one visit.' },
  { customer: 'Aisha N.', rating: 4, comment: 'Professional and respectful. Would hire again.' }
];

const portfolioImages = [
  'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1593069567131-53a0614dde1d?auto=format&fit=crop&w=900&q=80'
];

export default function ProviderDetailPage({ params }: { params: { slug: string } }) {
  const provider = providers.find((item) => item.slug === params.slug);

  if (!provider) notFound();

  const serviceName = getServiceNameBySlug(provider.serviceCategory).replace(/s$/, '');
  const hasPriceGuide = Boolean(provider.priceGuide?.trim());

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 pb-28 sm:px-6 sm:py-8 md:pb-10 lg:px-8">
      <Link href="/providers" className="text-sm font-semibold text-teal-700 hover:text-teal-800">
        ← Back to providers
      </Link>

      <section className="card overflow-hidden">
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-teal-800 p-5 text-white sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="relative h-28 w-28 overflow-hidden rounded-2xl border-4 border-white/20 shadow-lg sm:h-36 sm:w-36">
              <Image src={provider.photo} alt={provider.name} fill className="object-cover" />
            </div>

            <div className="flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{provider.name}</h1>
                {provider.verified ? (
                  <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-semibold text-emerald-100 ring-1 ring-emerald-200/40">
                    ✓ Verified professional
                  </span>
                ) : null}
              </div>

              <p className="text-sm font-medium text-teal-100 sm:text-base">
                {serviceName} · {provider.location}
              </p>

              <dl className="grid grid-cols-2 gap-3 pt-1 sm:grid-cols-4">
                <div className="rounded-xl bg-white/10 p-3">
                  <dt className="text-xs text-slate-200">Rating</dt>
                  <dd className="text-lg font-semibold">⭐ {provider.rating}</dd>
                </div>
                <div className="rounded-xl bg-white/10 p-3">
                  <dt className="text-xs text-slate-200">Completed jobs</dt>
                  <dd className="text-lg font-semibold">{provider.completedJobs}</dd>
                </div>
                <div className="rounded-xl bg-white/10 p-3">
                  <dt className="text-xs text-slate-200">Experience</dt>
                  <dd className="text-lg font-semibold">{provider.experienceYears} yrs</dd>
                </div>
                <div className="rounded-xl bg-white/10 p-3">
                  <dt className="text-xs text-slate-200">Reviews</dt>
                  <dd className="text-lg font-semibold">{provider.reviews}</dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="mt-5 hidden gap-3 sm:flex">
            <a
              href={`tel:${provider.phone}`}
              className="focus-ring inline-flex min-h-11 items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-100"
            >
              Call {provider.phone}
            </a>
            <a
              href={`https://wa.me/${provider.whatsapp}`}
              className="focus-ring inline-flex min-h-11 items-center justify-center rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600"
            >
              WhatsApp
            </a>
            <Link
              href="/request"
              className="focus-ring inline-flex min-h-11 items-center justify-center rounded-xl bg-teal-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-600"
            >
              Request Service
            </Link>
          </div>
        </div>
      </section>

      <section className="card p-5 sm:p-6">
        <h2 className="text-xl font-semibold text-slate-900">About</h2>
        <p className="mt-3 leading-relaxed text-slate-700">{provider.bio}</p>
        <p className="mt-3 leading-relaxed text-slate-600">
          {provider.name.split(' ')[0]} has {provider.experienceYears} years of hands-on {serviceName.toLowerCase()} experience and a
          track record of reliable, quality workmanship across residential and small business projects.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="card p-5 sm:p-6">
          <h2 className="text-xl font-semibold text-slate-900">Services offered</h2>
          <ul className="mt-4 grid gap-2">
            {provider.skills.map((skill) => (
              <li key={skill} className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700 ring-1 ring-slate-200">
                • {skill}
              </li>
            ))}
          </ul>
        </div>

        {hasPriceGuide ? (
          <div className="card p-5 sm:p-6">
            <h2 className="text-xl font-semibold text-slate-900">Price guide</h2>
            <ul className="mt-4 space-y-2 text-sm text-slate-700">
              <li className="rounded-lg bg-slate-50 px-3 py-2 ring-1 ring-slate-200">Basic inspection: KES 1,000</li>
              <li className="rounded-lg bg-slate-50 px-3 py-2 ring-1 ring-slate-200">Repairs: {provider.priceGuide}</li>
              <li className="rounded-lg bg-slate-50 px-3 py-2 ring-1 ring-slate-200">Final quote confirmed after assessment.</li>
            </ul>
          </div>
        ) : null}
      </section>

      <section className="card p-5 sm:p-6">
        <h2 className="text-xl font-semibold text-slate-900">Availability</h2>
        <p className="mt-3 text-slate-700">{provider.availability}. Typical working hours: Monday to Saturday, 8:00 AM to 6:00 PM.</p>
      </section>

      <section className="card p-5 sm:p-6">
        <h2 className="text-xl font-semibold text-slate-900">Trust indicators</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {provider.verified ? (
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-800">Verified professional</span>
          ) : null}
          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">Background checked</span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">Phone verified</span>
        </div>
      </section>

      <section className="card p-5 sm:p-6">
        <h2 className="text-xl font-semibold text-slate-900">Portfolio</h2>
        <p className="mt-1 text-sm text-slate-600">Recent project snapshots (sample images).</p>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {portfolioImages.map((image, index) => (
            <div key={image} className="relative h-44 overflow-hidden rounded-xl ring-1 ring-slate-200">
              <Image
                src={image}
                alt={`${provider.name} portfolio item ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 30vw"
              />
            </div>
          ))}
        </div>
      </section>

      <section className="card p-5 sm:p-6">
        <h2 className="text-xl font-semibold text-slate-900">Customer reviews</h2>
        <div className="mt-4 space-y-3">
          {mockReviews.map((review) => (
            <article key={review.customer} className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold text-slate-900">{review.customer}</p>
                <p className="text-sm font-medium text-amber-600">⭐ {review.rating}.0</p>
              </div>
              <p className="mt-2 text-sm text-slate-700">{review.comment}</p>
            </article>
          ))}
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 p-3 shadow-[0_-6px_20px_rgba(15,23,42,0.08)] backdrop-blur sm:hidden">
        <div className="mx-auto grid max-w-5xl grid-cols-3 gap-2">
          <a
            href={`tel:${provider.phone}`}
            className="focus-ring inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-2 text-xs font-semibold text-slate-900"
          >
            Call
          </a>
          <a
            href={`https://wa.me/${provider.whatsapp}`}
            className="focus-ring inline-flex min-h-11 items-center justify-center rounded-lg bg-emerald-500 px-2 text-xs font-semibold text-white"
          >
            WhatsApp
          </a>
          <Link
            href="/request"
            className="focus-ring inline-flex min-h-11 items-center justify-center rounded-lg bg-teal-600 px-2 text-xs font-semibold text-white"
          >
            Request
          </Link>
        </div>
      </div>
    </div>
  );
}
