import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Trust & Safety | I Kali',
  description: 'Learn how I Kali approaches verification, review signals, and safer customer-provider interactions.'
};

export default function TrustPage() {
  return (
    <main className="section-shell max-w-4xl space-y-6 py-8">
      <header className="card-premium p-6 sm:p-8">
        <p className="eyebrow">Trust & Safety</p>
        <h1 className="page-title mt-2">Trust and safety at I Kali</h1>
        <p className="mt-3 muted-text">I Kali helps customers choose professionals with clearer quality and verification signals.</p>
      </header>

      <section className="card-premium p-6">
        <h2 className="text-xl font-semibold text-slate-900">How we verify professionals</h2>
        <ul className="mt-3 space-y-2 text-sm text-slate-700">
          <li>• Verified badge shows providers marked as verified by I Kali operations.</li>
          <li>• Phone verified reflects confirmed contact details.</li>
          <li>• Experience and work history can show pending while checks are in progress.</li>
        </ul>
      </section>

      <section className="card-premium p-6">
        <h2 className="text-xl font-semibold text-slate-900">Safety guidance</h2>
        <p className="mt-3 text-sm text-slate-700">Use trusted I Kali channels, avoid deposits before confirming scope, and report unsafe behavior immediately.</p>
      </section>
    </main>
  );
}
