import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <section className="card p-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">404</p>
        <h1 className="mt-3 text-2xl font-bold text-slate-900">Page not found</h1>
        <p className="mt-3 text-sm text-slate-600">
          The page you requested may have moved or does not exist yet. You can continue exploring services or submit a request.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/services" className="focus-ring btn btn-primary">
            Browse Services
          </Link>
          <Link href="/request" className="focus-ring btn btn-secondary">
            Request Help
          </Link>
        </div>
      </section>
    </div>
  );
}
