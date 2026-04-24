import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  let payload: unknown = null;

  try {
    payload = await request.json();
  } catch {
    // Accept non-JSON callbacks gracefully in this placeholder.
  }

  console.info('M-Pesa callback placeholder hit', {
    receivedAt: new Date().toISOString(),
    hasPayload: payload !== null
  });

  // TODO(Phase 11+): verify callback signature/source and update payment_status fields in job_requests safely.
  return NextResponse.json({ ok: true });
}
