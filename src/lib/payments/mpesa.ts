import { MpesaConfig, MpesaStkRequest } from '@/lib/payments/types';

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

  if (!payload.paymentType || !['booking_fee', 'deposit', 'full_payment'].includes(payload.paymentType)) {
    return { ok: false as const, message: 'paymentType must be booking_fee, deposit, or full_payment.' };
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
