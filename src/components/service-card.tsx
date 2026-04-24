import Link from 'next/link';
import { ServiceCategory } from '@/lib/types';

export function ServiceCard({ service }: { service: ServiceCategory }) {
  return (
    <Link href={`/services/${service.slug}`} className="focus-ring card block p-5 transition hover:-translate-y-0.5 hover:shadow-md">
      <p className="text-2xl" aria-hidden>
        {service.icon}
      </p>
      <h3 className="mt-3 text-lg font-semibold text-slate-900">{service.name}</h3>
      <p className="mt-1 text-sm text-slate-600">{service.shortDescription}</p>
    </Link>
  );
}
