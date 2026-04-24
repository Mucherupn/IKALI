import { NextRequest, NextResponse } from 'next/server';
import { getMpesaConfigFromEnv } from '@/lib/payments/mpesa';

export async function POST(request: NextRequest) {
  let payload: unknown = null;

  try {
    payload = await request.json();
  } catch {
    // Accept non-JSON callbacks gracefully in this placeholder.
  }

  const configState = getMpesaConfigFromEnv();
  if (!configState.configured) {
    return NextResponse.json(
      {
        ok: false,
        message: 'M Pesa callback endpoint is not active because credentials are missing.',
        missingEnvironmentVariables: configState.missing
      },
      { status: 503 }
    );
  }

  console.info('M-Pesa callback received (processing not enabled)', {
    receivedAt: new Date().toISOString(),
    hasPayload: payload !== null
  });

  // Callback acknowledgement only; this endpoint does not mark payments successful yet.
  // TODO(Phase 11+): verify callback source/signature and update payment_status fields in job_requests safely.
  return NextResponse.json(
    {
      ok: false,
      message: 'Callback received but automated payment reconciliation is not enabled in this phase.'
    },
    { status: 202 }
  );
}
