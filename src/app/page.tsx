import Link from 'next/link';
import type { Metadata } from 'next';
import { GlobalSearch } from '@/components/global-search';
import { ProviderCard } from '@/components/provider-card';
import { ServiceCard } from '@/components/service-card';
import { getProviders, getServiceCategories } from '@/lib/data';

export const metadata: Metadata = {
  title: 'I-Kali | Find trusted service providers near you',
  description:
    'Find trusted plumbers, electricians, cleaners, fundis, mechanics, barbers and local service providers near you in Kenya.'
};

const trustPoints = [
  {
    title: 'Search by service',
    text: 'Start with the job you need done and move straight to relevant providers.'
  },
  {
    title: 'Find nearby help',
    text: 'I-Kali is built around location, so users can discover providers around them.'
  },
  {
    title: 'Choose with context',
    text: 'Provider profiles show service area, ratings, completed jobs and trust signals.'
  }
];

export default async function HomePage() {
  const [services, providers] = await Promise.all([getServiceCategories(), getProviders()]);

  const serviceNamesBySlug = Object.fromEntries(
    services.map((service) => [service.slug, service.name])
  );

  const providerCountsByService = providers.reduce<Record<string, number>>((counts, provider) => {
    counts[provider.serviceCategory] = (counts[provider.serviceCategory] ?? 0) + 1;
    return counts;
  }, {});

  const popularServices = services.slice(0, 8);
  const featuredProviders = providers.slice(0, 3);

  return (
    <main className="bg-[#fbfaf8] text-[#111111]">
      {/* HERO */}
      <section className="bg-[#fbfaf8] py-16 sm:py-24 lg:py-28">
        <div className="section-shell">
          <div className="mx-auto max-w-5xl text-center">
            <h1 className="mx-auto max-w-4xl text-5xl font-semibold leading-[1.02] tracking-[-0.055em] text-[#111111] sm:text-6xl lg:text-7xl">
              Find a service provider near you.
            </h1>

            <div className="mx-auto mt-10 max-w-4xl text-left">
              <GlobalSearch services={services} />
            </div>
          </div>
        </div>
      </section>

      {/* QUICK SERVICE ROW */}
      <section className="border-y border-[#eeeeee] bg-white">
        <div className="section-shell flex gap-3 overflow-x-auto py-5">
          {popularServices.map((service) => (
            <Link
              key={service.slug}
              href={`/services/${service.slug}`}
              className="group flex min-w-[190px] items-center justify-between rounded-[1.25rem] border border-[#eeeeee] bg-white px-4 py-4 transition hover:border-[#f0b5bb] hover:shadow-md"
            >
              <span>
                <span className="block text-sm font-semibold text-[#111111]">{service.name}</span>
                <span className="mt-1 block text-xs text-[#777777]">
                  {providerCountsByService[service.slug] ?? 0} providers
                </span>
              </span>
              <span className="text-lg text-[var(--red)] transition group-hover:translate-x-0.5">
                →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* SERVICES */}
      <section className="bg-[#fbfaf8] py-16 sm:py-24">
        <div className="section-shell">
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--red)]">
                Services
              </p>
              <h2 className="mt-3 max-w-2xl text-4xl font-semibold tracking-[-0.045em] text-[#111111] md:text-5xl">
                Start with the job you need done.
              </h2>
            </div>
            <Link href="/services" className="btn-secondary w-fit">
              View all services
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {popularServices.map((service) => (
              <ServiceCard
                key={service.slug}
                service={service}
                providerCount={providerCountsByService[service.slug] ?? 0}
              />
            ))}
          </div>
        </div>
      </section>

      {/* PROVIDERS */}
      <section className="bg-white py-16 sm:py-24">
        <div className="section-shell">
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--red)]">
                Providers
              </p>
              <h2 className="mt-3 max-w-2xl text-4xl font-semibold tracking-[-0.045em] text-[#111111] md:text-5xl">
                See who you are contacting.
              </h2>
            </div>
            <Link href="/providers" className="btn-secondary w-fit">
              Find providers
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {featuredProviders.map((provider) => (
              <ProviderCard
                key={provider.id}
                provider={provider}
                serviceName={serviceNamesBySlug[provider.serviceCategory]}
              />
            ))}
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section className="bg-[#fbfaf8] py-16 sm:py-24">
        <div className="section-shell">
          <div className="mb-10 max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--red)]">
              Why I-Kali
            </p>
            <h2 className="mt-3 text-4xl font-semibold tracking-[-0.045em] text-[#111111] md:text-5xl">
              Built for faster local service decisions.
            </h2>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {trustPoints.map((point) => (
              <div
                key={point.title}
                className="rounded-[1.75rem] border border-[#eeeeee] bg-white p-7 shadow-sm"
              >
                <div className="mb-7 h-10 w-10 rounded-full bg-[#fff1f2]" />
                <h3 className="text-xl font-semibold tracking-[-0.025em] text-[#111111]">
                  {point.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[#666666]">{point.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white py-16 sm:py-24">
        <div className="section-shell">
          <div className="rounded-[2rem] border border-[#eeeeee] bg-[#111111] p-7 text-white sm:p-10 lg:p-12">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-red-200">
                  Get started
                </p>
                <h2 className="mt-4 max-w-3xl text-4xl font-semibold tracking-[-0.05em] text-white md:text-5xl">
                  Search once. Find the right person faster.
                </h2>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <Link href="/request" className="btn-primary">
                  Request service
                </Link>
                <Link href="/providers" className="btn-secondary">
                  Find providers
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}