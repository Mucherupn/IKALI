import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { TrustPill } from '@/components/trust-pill';
import { getMockReviewsForProvider } from '@/data/mock-data';
import { getProviderBySlug, getServiceNameBySlug } from '@/lib/data';

const fallbackReview = {
  customerName: 'Verified customer',
  rating: 5,
  date: '2026-01-15',
  comment: 'Good communication and professional service delivery.'
};

const portfolioImages = [
  'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1593069567131-53a0614dde1d?auto=format&fit=crop&w=900&q=80'
];

export default async function ProviderDetailPage({ params }: { params: { slug: string } }) {
  const provider = await getProviderBySlug(params.slug);

  if (!provider) notFound();

  const reviews = getMockReviewsForProvider(provider.slug);
  const visibleReviews = reviews.length > 0 ? reviews : [{ ...fallbackReview, customerName: `${provider.name.split(' ')[0]} customer` }];

  const serviceName = (await getServiceNameBySlug(provider.serviceCategory)).replace(/s$/, '');
  const hasPriceGuide = Boolean(provider.priceGuide?.trim());
  const reviewCount = provider.reviewCount ?? provider.reviews;

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
                <TrustPill
                  label={provider.verified ? 'Marked as verified by I Kali' : 'Verification pending'}
                  tone={provider.verified ? 'verified' : 'pending'}
                />
              </div>

              <p className="text-sm font-medium text-teal-100 sm:text-base">
                {serviceName} · {provider.location}
              </p>

              <dl className="grid grid-cols-2 gap-3 pt-1 sm:grid-cols-4">
                <div className="rounded-xl bg-white/10 p-3">
                  <dt className="text-xs text-slate-200">Average rating</dt>
                  <dd className="text-lg font-semibold">⭐ {provider.rating.toFixed(1)}</dd>
                </div>
                <div className="rounded-xl bg-white/10 p-3">
                  <dt className="text-xs text-slate-200">Reviews</dt>
                  <dd className="text-lg font-semibold">{reviewCount}</dd>
                </div>
                <div className="rounded-xl bg-white/10 p-3">
                  <dt className="text-xs text-slate-200">Completed jobs</dt>
                  <dd className="text-lg font-semibold">{provider.completedJobs}</dd>
                </div>
                <div className="rounded-xl bg-white/10 p-3">
                  <dt className="text-xs text-slate-200">Experience</dt>
                  <dd className="text-lg font-semibold">{provider.experienceYears} yrs</dd>
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
              href={`/request?service=${provider.serviceCategory}&provider=${encodeURIComponent(provider.slug)}`}
              className="focus-ring inline-flex min-h-11 items-center justify-center rounded-xl bg-teal-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-600"
            >
              Request Service
            </Link>
          </div>
        </div>
      </section>

      <section className="card p-5 sm:p-6">
        <h2 className="text-xl font-semibold text-slate-900">Trust indicators</h2>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <TrustPill label={provider.verified ? 'Verified professional' : 'Verification pending'} tone={provider.verified ? 'verified' : 'pending'} />
          <TrustPill label={provider.phoneVerified ? 'Phone verified' : 'Phone verification pending'} tone={provider.phoneVerified ? 'neutral' : 'pending'} />
          <TrustPill label={provider.experienceChecked ? 'Experience checked' : 'Experience check pending'} tone={provider.experienceChecked ? 'neutral' : 'pending'} />
          <TrustPill
            label={provider.workHistoryReviewed ? 'Work history reviewed' : 'Work history review pending'}
            tone={provider.workHistoryReviewed ? 'neutral' : 'pending'}
          />
          <TrustPill label={reviewCount > 0 ? 'Customer rated' : 'Customer ratings pending'} tone={reviewCount > 0 ? 'neutral' : 'pending'} />
        </div>
        <p className="mt-4 rounded-xl bg-teal-50 px-4 py-3 text-sm text-teal-900 ring-1 ring-teal-100">
          Only share job details through trusted I Kali contact channels. Avoid sending deposits before confirming the job scope.
        </p>
      </section>

      <section className="card p-5 sm:p-6">
        <h2 className="text-xl font-semibold text-slate-900">About</h2>
        <p className="mt-3 leading-relaxed text-slate-700">{provider.bio}</p>
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
        <h2 className="text-xl font-semibold text-slate-900">Portfolio</h2>
        <p className="mt-1 text-sm text-slate-600">Recent project snapshots (sample images).</p>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {portfolioImages.map((image, index) => (
            <div key={image} className="relative h-44 overflow-hidden rounded-xl ring-1 ring-slate-200">
              <Image src={image} alt={`${provider.name} portfolio item ${index + 1}`} fill className="object-cover" sizes="(max-width: 768px) 100vw, 30vw" />
            </div>
          ))}
        </div>
      </section>

      <section className="card p-5 sm:p-6">
        <h2 className="text-xl font-semibold text-slate-900">Customer reviews</h2>
        <p className="mt-1 text-sm text-slate-600">Display-only reviews for trust and quality signals.</p>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
            <p className="text-xs uppercase tracking-wide text-slate-500">Average rating</p>
            <p className="mt-1 text-xl font-semibold text-slate-900">{provider.rating.toFixed(1)} / 5</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
            <p className="text-xs uppercase tracking-wide text-slate-500">Review count</p>
            <p className="mt-1 text-xl font-semibold text-slate-900">{reviewCount}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
            <p className="text-xs uppercase tracking-wide text-slate-500">Completed jobs</p>
            <p className="mt-1 text-xl font-semibold text-slate-900">{provider.completedJobs}</p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {visibleReviews.map((review) => (
            <article key={`${review.customerName}-${review.date}`} className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-slate-900">{review.customerName}</p>
                <p className="text-sm text-slate-500">{review.date}</p>
              </div>
              <p className="mt-1 text-sm font-medium text-amber-600">⭐ {review.rating.toFixed(1)}</p>
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
            href={`/request?service=${provider.serviceCategory}&provider=${encodeURIComponent(provider.slug)}`}
            className="focus-ring inline-flex min-h-11 items-center justify-center rounded-lg bg-teal-600 px-2 text-xs font-semibold text-white"
          >
            Request
          </Link>
        </div>
      </div>
    </div>
  );
}
