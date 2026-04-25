import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="section-shell max-w-4xl space-y-6 py-10">
      <header className="card-premium p-6 sm:p-8">
        <p className="eyebrow">About I Kali</p>
        <h1 className="page-title mt-2">Kenya&apos;s premium marketplace for trusted local services.</h1>
        <p className="mt-3 muted-text">I Kali (Internet Jua Kali) connects households and businesses with vetted professionals across Kenya through a modern, trust-first platform.</p>
      </header>
      <section className="card-premium p-6 text-sm leading-7 text-gray-700 sm:text-base">
        <p>Our focus is quality discovery, clear trust indicators, and reliable request workflows that make service booking feel simple and safe.</p>
        <p className="mt-4">As we scale, we are building stronger operations, payments, and service accountability while keeping a premium customer experience.</p>
        <Link href="/services" className="focus-ring mt-5 inline-flex btn btn-primary">Explore services</Link>
      </section>
    </div>
  );
}
