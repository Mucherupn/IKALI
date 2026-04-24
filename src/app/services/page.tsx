import { ServiceCard } from '@/components/service-card';
import { serviceCategories } from '@/data/mock-data';

export default function ServicesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-slate-900">Service categories</h1>
      <p className="mt-2 max-w-2xl text-slate-600">Choose the help you need from verified local professionals in Nairobi.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {serviceCategories.map((service) => (
          <ServiceCard key={service.slug} service={service} />
        ))}
      </div>
    </div>
  );
}
