import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import {
  getMpesaConfigFromEnv,
  initiateMpesaStkPush,
  normalizeKenyanPhone,
  requestMpesaAccessToken,
  validateMpesaStkPayload
} from '@/lib/payments/mpesa';

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

  if (validated.value.paymentType !== 'provider_commission_payment') {
    return NextResponse.json({ ok: false, message: 'This endpoint only accepts provider_commission_payment.' }, { status: 400 });
  }

  const normalizedPhone = normalizeKenyanPhone(validated.value.phone);
  if (!normalizedPhone) {
    return NextResponse.json({ ok: false, message: 'Phone must be a valid Kenyan M-Pesa number.' }, { status: 400 });
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

  try {
    const authHeader = request.headers.get('authorization') ?? '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';

    if (!token) {
      return NextResponse.json({ ok: false, message: 'Missing bearer token.' }, { status: 401 });
    }

    const supabase = getSupabaseAdminClient();
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json({ ok: false, message: 'Invalid session.' }, { status: 401 });
    }

    const [{ data: profile, error: profileError }, { data: provider, error: providerError }] = await Promise.all([
      supabase.from('profiles').select('id, role').eq('id', user.id).maybeSingle(),
      supabase.from('providers').select('id, phone').eq('id', user.id).maybeSingle()
    ]);

    if (profileError || providerError || profile?.role !== 'provider' || !provider) {
      return NextResponse.json({ ok: false, message: 'Provider access required.' }, { status: 403 });
    }

    const accessToken = await requestMpesaAccessToken(configState.config);
    const stkResponse = await initiateMpesaStkPush({
      config: configState.config,
      token: accessToken,
      phone: normalizedPhone,
      amount: validated.value.amount,
      accountReference: `PROVIDER-${provider.id.slice(0, 8)}`,
      transactionDesc: 'Provider commission payment'
    });

    const { data: inserted, error: insertError } = await supabase
      .from('mpesa_payments')
      .insert({
        provider_id: provider.id,
        amount: validated.value.amount,
        phone: normalizedPhone,
        checkout_request_id: stkResponse.checkoutRequestId,
        merchant_request_id: stkResponse.merchantRequestId,
        status: 'pending'
      })
      .select('*')
      .single();

    if (insertError || !inserted) {
      throw insertError ?? new Error('Unable to persist pending M-Pesa payment.');
    }

    return NextResponse.json({
      ok: true,
      state: 'pending',
      message: stkResponse.customerMessage,
      payment: {
        id: inserted.id,
        amount: inserted.amount,
        phone: inserted.phone,
        status: inserted.status,
        checkoutRequestId: inserted.checkout_request_id,
        createdAt: inserted.created_at
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to start M-Pesa payment.';
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
