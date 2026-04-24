import { NextRequest, NextResponse } from 'next/server';
import { getMpesaConfigFromEnv, validateMpesaStkPayload } from '@/lib/payments/mpesa';

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: 'Invalid JSON body.' }, { status: 400 });
  }

  const validated = validateMpesaStkPayload((body ?? {}) as Record<string, unknown>);
  if (!validated.ok) {
    return NextResponse.json({ ok: false, message: validated.message }, { status: 400 });
  }

  const configState = getMpesaConfigFromEnv();
  if (!configState.configured) {
    return NextResponse.json(
      {
        ok: false,
        message: 'M Pesa is not configured yet.',
        missingEnvironmentVariables: configState.missing
      },
      { status: 503 }
    );
  }

  // Phase 10 safeguard: endpoint is intentionally readied but not executing live Daraja requests yet.
  // TODO(Phase 11+): perform OAuth token request + STK Push call and persist returned checkout identifiers.
  return NextResponse.json(
    {
      ok: false,
      message: 'M Pesa is configured but STK execution is not enabled in this phase.'
    },
    { status: 501 }
  );
}
