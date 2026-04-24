export default function TrustPage() {
  return (
    <main className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <header className="card p-6 sm:p-8">
        <h1 className="text-3xl font-bold text-slate-900">Trust & Safety at I Kali</h1>
        <p className="mt-3 text-slate-600">
          I Kali is designed to help you choose professionals with clearer quality and verification signals than random directory listings.
        </p>
      </header>

      <section className="card p-6">
        <h2 className="text-xl font-semibold text-slate-900">How we verify professionals</h2>
        <ul className="mt-3 space-y-2 text-sm text-slate-700">
          <li>• Verified badge indicates a provider marked as verified by I Kali operations.</li>
          <li>• Phone verified reflects whether contact details have been checked.</li>
          <li>• Experience and work history signals may show as pending while checks are in progress.</li>
        </ul>
      </section>

      <section className="card p-6">
        <h2 className="text-xl font-semibold text-slate-900">How reviews work</h2>
        <p className="mt-3 text-sm text-slate-700">
          Reviews are currently display-only trust signals. A dedicated moderation workflow is planned so admins can review and flag content.
        </p>
      </section>

      <section className="card p-6">
        <h2 className="text-xl font-semibold text-slate-900">Report poor service</h2>
        <p className="mt-3 text-sm text-slate-700">
          If a provider delivers poor service or unsafe behavior, contact I Kali support with details so we can investigate and act.
        </p>
      </section>

      <section className="card p-6">
        <h2 className="text-xl font-semibold text-slate-900">Safety guidance</h2>
        <p className="mt-3 text-sm text-slate-700">
          Use trusted I Kali channels when sharing job details. Avoid sending deposits before confirming job scope and provider identity.
        </p>
      </section>
    </main>
  );
}
