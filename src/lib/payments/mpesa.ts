import { MpesaConfig, MpesaStkRequest } from '@/lib/payments/types';
import { normalizeKenyanPhone as normalizeKenyanPhoneForValidation } from '@/lib/validation';

const E164_PHONE_REGEX = /^\+?[1-9]\d{8,14}$/;

export function validateMpesaStkPayload(payload: Partial<MpesaStkRequest>) {
  if (!payload) return { ok: false as const, message: 'Request body is required.' };

  const amount = Number(payload.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: false as const, message: 'Amount must be a positive number.' };
  }

  const phone = String(payload.phone ?? '').trim();
  if (!E164_PHONE_REGEX.test(phone)) {
    return { ok: false as const, message: 'Phone number format is invalid.' };
  }

  if (!payload.paymentType || !['booking_fee', 'deposit', 'full_payment', 'provider_commission_payment'].includes(payload.paymentType)) {
    return { ok: false as const, message: 'paymentType must be booking_fee, deposit, full_payment, or provider_commission_payment.' };
  }

  return {
    ok: true as const,
    value: {
      amount,
      phone,
      paymentType: payload.paymentType,
      requestId: payload.requestId?.trim() || undefined
    } satisfies MpesaStkRequest
  };
}

export function getMpesaConfigFromEnv(): { configured: true; config: MpesaConfig } | { configured: false; missing: string[] } {
  const env = {
    consumerKey: process.env.MPESA_CONSUMER_KEY,
    consumerSecret: process.env.MPESA_CONSUMER_SECRET,
    shortcode: process.env.MPESA_SHORTCODE,
    passkey: process.env.MPESA_PASSKEY,
    callbackUrl: process.env.MPESA_CALLBACK_URL,
    environment: process.env.MPESA_ENV
  };

  const missing: string[] = [];
  if (!env.consumerKey) missing.push('MPESA_CONSUMER_KEY');
  if (!env.consumerSecret) missing.push('MPESA_CONSUMER_SECRET');
  if (!env.shortcode) missing.push('MPESA_SHORTCODE');
  if (!env.passkey) missing.push('MPESA_PASSKEY');
  if (!env.callbackUrl) missing.push('MPESA_CALLBACK_URL');
  if (!env.environment) missing.push('MPESA_ENV');

  if (missing.length > 0) {
    return { configured: false, missing };
  }

  const environment = env.environment === 'production' ? 'production' : 'sandbox';

  return {
    configured: true,
    config: {
      consumerKey: env.consumerKey!,
      consumerSecret: env.consumerSecret!,
      shortcode: env.shortcode!,
      passkey: env.passkey!,
      callbackUrl: env.callbackUrl!,
      environment
    }
  };
}

export function normalizeKenyanPhone(phone: string): string | null {
  return normalizeKenyanPhoneForValidation(phone);
}

function timestampInNairobi() {
  const now = new Date();
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Nairobi',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).formatToParts(now);

  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? '';
  return `${get('year')}${get('month')}${get('day')}${get('hour')}${get('minute')}${get('second')}`;
}

export async function requestMpesaAccessToken(config: MpesaConfig) {
  const baseUrl = config.environment === 'production' ? 'https://api.safaricom.co.ke' : 'https://sandbox.safaricom.co.ke';
  const credentials = Buffer.from(`${config.consumerKey}:${config.consumerSecret}`).toString('base64');

  const response = await fetch(`${baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
    method: 'GET',
    headers: {
      Authorization: `Basic ${credentials}`
    }
  });

  if (!response.ok) {
    const bodyText = await response.text();
    throw new Error(`Failed to obtain M-Pesa access token (${response.status}): ${bodyText.slice(0, 180)}`);
  }

  const body = (await response.json()) as { access_token?: string };
  if (!body.access_token) {
    throw new Error('M-Pesa access token response did not include access_token.');
  }

  return body.access_token;
}

export async function initiateMpesaStkPush(input: {
  config: MpesaConfig;
  token: string;
  phone: string;
  amount: number;
  accountReference: string;
  transactionDesc: string;
}) {
  const timestamp = timestampInNairobi();
  const password = Buffer.from(`${input.config.shortcode}${input.config.passkey}${timestamp}`).toString('base64');
  const baseUrl = input.config.environment === 'production' ? 'https://api.safaricom.co.ke' : 'https://sandbox.safaricom.co.ke';

  const response = await fetch(`${baseUrl}/mpesa/stkpush/v1/processrequest`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${input.token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      BusinessShortCode: input.config.shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.round(input.amount),
      PartyA: input.phone,
      PartyB: input.config.shortcode,
      PhoneNumber: input.phone,
      CallBackURL: input.config.callbackUrl,
      AccountReference: input.accountReference,
      TransactionDesc: input.transactionDesc
    })
  });

  const body = (await response.json()) as {
    ResponseCode?: string;
    ResponseDescription?: string;
    MerchantRequestID?: string;
    CheckoutRequestID?: string;
    CustomerMessage?: string;
    errorMessage?: string;
  };

  if (!response.ok || body.ResponseCode !== '0' || !body.MerchantRequestID || !body.CheckoutRequestID) {
    const message = body.errorMessage ?? body.ResponseDescription ?? 'Unable to initiate M-Pesa STK push.';
    throw new Error(message);
  }

  return {
    merchantRequestId: body.MerchantRequestID,
    checkoutRequestId: body.CheckoutRequestID,
    customerMessage: body.CustomerMessage ?? body.ResponseDescription ?? 'STK push sent successfully.'
  };
}
