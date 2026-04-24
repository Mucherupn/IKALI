import Link from 'next/link';
import { ServiceCategory } from '@/lib/types';

export function ServiceCard({ service, providerCount }: { service: ServiceCategory; providerCount?: number }) {
  return (
    <Link
      href={`/services/${service.slug}`}
      className="focus-ring card block p-5 transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md"
    >
      <p className="text-3xl" aria-hidden>
        {service.icon}
      </p>
      <h3 className="mt-4 text-lg font-semibold text-slate-900">{service.name}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{service.shortDescription}</p>
      <p className="mt-4 text-sm font-medium text-teal-700">{providerCount ?? 0} providers available</p>
    </Link>
  );
}
