import Link from 'next/link';
import { ServiceCategory } from '@/lib/types';

export function ServiceCard({ service, providerCount }: { service: ServiceCategory; providerCount?: number }) {
  return (
    <Link href={`/services/${service.slug}`} className="focus-ring card-premium block p-5 transition hover:-translate-y-0.5 hover:border-[#fecdd3]">
      <p className="text-3xl" aria-hidden>
        {service.icon}
      </p>
      <h3 className="mt-4 text-lg font-semibold text-[#080808]">{service.name}</h3>
      <p className="mt-2 text-sm leading-6 muted-text">{service.shortDescription}</p>
      <p className="mt-4 text-sm font-semibold text-[#D71920]">{providerCount ?? 0} providers available</p>
    </Link>
  );
}
