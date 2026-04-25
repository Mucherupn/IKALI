import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { getMpesaConfigFromEnv, normalizeKenyanPhone } from '@/lib/payments/mpesa';
import { Json } from '@/lib/database.types';

type CallbackItem = { Name?: string; Value?: string | number | null };

function asJson(value: unknown): Json {
  return JSON.parse(JSON.stringify(value ?? null)) as Json;
}

function extractMetadata(items: CallbackItem[] | undefined) {
  const map = new Map<string, string | number | null>();
  for (const item of items ?? []) {
    if (!item?.Name) continue;
    map.set(item.Name, item.Value ?? null);
  }

  return {
    amount: Number(map.get('Amount') ?? 0),
    receiptNumber: String(map.get('MpesaReceiptNumber') ?? '').trim() || null,
    phone: String(map.get('PhoneNumber') ?? '').trim() || null,
    transactionDate: String(map.get('TransactionDate') ?? '').trim() || null
  };
}

export async function POST(request: NextRequest) {
  let payload: unknown = null;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: 'Invalid callback payload.' }, { status: 400 });
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

  const callback = (payload as { Body?: { stkCallback?: Record<string, unknown> } })?.Body?.stkCallback;
  if (!callback) {
    return NextResponse.json({ ok: false, message: 'Missing Body.stkCallback in callback payload.' }, { status: 400 });
  }

  const merchantRequestId = String(callback.MerchantRequestID ?? '').trim();
  const checkoutRequestId = String(callback.CheckoutRequestID ?? '').trim();
  const resultCode = Number(callback.ResultCode ?? -1);
  const resultDescription = String(callback.ResultDesc ?? 'Unknown callback status').trim();

  if (!merchantRequestId || !checkoutRequestId || !Number.isFinite(resultCode)) {
    return NextResponse.json({ ok: false, message: 'Callback is missing required STK identifiers.' }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdminClient();
    const { data: payment, error: paymentError } = await supabase
      .from('mpesa_payments')
      .select('*')
      .eq('merchant_request_id', merchantRequestId)
      .eq('checkout_request_id', checkoutRequestId)
      .maybeSingle();

    if (paymentError) throw paymentError;

    if (!payment) {
      return NextResponse.json({ ok: false, message: 'Unknown checkout request.' }, { status: 404 });
    }

    if (payment.status === 'paid' || payment.status === 'failed') {
      return NextResponse.json({ ok: true, state: payment.status, message: 'Callback already processed.' }, { status: 200 });
    }

    const metadata = extractMetadata((callback.CallbackMetadata as { Item?: CallbackItem[] } | undefined)?.Item);
    const callbackPhone = metadata.phone ? normalizeKenyanPhone(String(metadata.phone)) : null;
    const expectedPhone = normalizeKenyanPhone(payment.phone);
    const amountMatches = metadata.amount > 0 && Number(payment.amount) === metadata.amount;
    const phoneMatches = !expectedPhone || !callbackPhone ? true : callbackPhone === expectedPhone;

    const baseUpdate = {
      result_code: resultCode,
      result_description: resultDescription,
      raw_callback: asJson(payload)
    };

    if (resultCode === 0 && amountMatches && phoneMatches && metadata.receiptNumber) {
      const { error: paidUpdateError } = await supabase
        .from('mpesa_payments')
        .update({
          ...baseUpdate,
          status: 'paid',
          mpesa_receipt_number: metadata.receiptNumber,
          paid_at: new Date().toISOString()
        })
        .eq('id', payment.id);

      if (paidUpdateError) throw paidUpdateError;

      const { error: ledgerError } = await supabase.rpc('add_provider_ledger_entry', {
        p_provider_id: payment.provider_id,
        p_type: 'payment_received',
        p_amount: Number(payment.amount),
        p_description: `M-Pesa STK payment (${metadata.receiptNumber})`,
        p_job_request_id: null
      });

      if (ledgerError) throw ledgerError;

      return NextResponse.json({ ok: true, state: 'paid' }, { status: 200 });
    }

    const failureReason =
      resultCode === 0 && !amountMatches
        ? 'Callback amount mismatch.'
        : resultCode === 0 && !phoneMatches
          ? 'Callback phone mismatch.'
          : resultDescription;

    const { error: failedUpdateError } = await supabase
      .from('mpesa_payments')
      .update({
        ...baseUpdate,
        status: 'failed',
        result_description: failureReason
      })
      .eq('id', payment.id);

    if (failedUpdateError) throw failedUpdateError;

    return NextResponse.json({ ok: true, state: 'failed' }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to process callback.';
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
