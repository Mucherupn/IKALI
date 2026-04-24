import { RequestForm } from '@/components/request-form';

export default async function RequestPage({
  searchParams
}: {
  searchParams?: Promise<{ service?: string; provider?: string }>;
}) {
  const params = (await searchParams) ?? {};

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Request a Service</h1>
      <p className="mt-2 text-slate-600">
        Tell us what you need in a few quick steps and we will connect you with the right I Kali professional.
      </p>

      <RequestForm initialService={params.service} initialProvider={params.provider} />
    </div>
  );
}
