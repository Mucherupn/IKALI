export type PaymentStatus = 'unpaid' | 'pending' | 'paid' | 'failed' | 'refunded';

export type PaymentType = 'booking_fee' | 'deposit' | 'full_payment';

export type MpesaStkRequest = {
  amount: number;
  phone: string;
  paymentType: PaymentType;
  requestId?: string;
};

export type MpesaConfig = {
  consumerKey: string;
  consumerSecret: string;
  shortcode: string;
  passkey: string;
  callbackUrl: string;
  environment: 'sandbox' | 'production';
};
