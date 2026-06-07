export interface InvoiceParams {
  amount: number; // Amount in minor units (e.g., cents for USD, sats for BTC)
  currency: string; // 'USD', 'EUR', 'BTC'
  description?: string;
  metadata?: Record<string, string>;
  returnUrl?: string;
  cancelUrl?: string;
}

export interface InvoiceResponse {
  id: string;
  amount: number;
  currency: string;
  checkoutUrl: string;
  status: 'open' | 'pending' | 'confirmed' | 'expired' | 'cancelled';
  createdAt: string;
  expiresAt: string;
  metadata?: Record<string, string>;
}

export interface ListInvoicesResponse {
  data: InvoiceResponse[];
  hasMore: boolean;
  nextCursor?: string;
}
