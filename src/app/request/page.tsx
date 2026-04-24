import { RequestForm } from '@/components/request-form';

export default async function RequestPage({
  searchParams
}: {
  searchParams?: Promise<{ service?: string; provider?: string }>;
}) {
  const params = (await searchParams) ?? {};

  return (
    <div className="section-shell max-w-3xl py-8">
      <header className="card-premium p-6 sm:p-8">
        <p className="eyebrow">Secure booking</p>
        <h1 className="page-title mt-2">Request a Booking</h1>
        <p className="mt-3 muted-text">Share your needs in a few steps. We only use your contact details to connect you with the right I Kali professional.</p>
      </header>

      <RequestForm initialService={params.service} initialProvider={params.provider} />
    </div>
  );
}
