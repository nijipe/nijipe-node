export interface InvoiceParams {
  total: number;
  orderId?: string;
  subtotal?: number;
  tax?: number;
  shipping?: number;
  items?: Array<{
    id: string;
    name: string;
    qty: number;
    price: number;
  }>;
}

export interface InvoiceResponse {
  id: string;
  storeId: string;
  orderId: string;
  items: any;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  btcAmount: number;
  platformFee: number;
  merchantSettlement: number;
  bitcoinAddress: string;
  lightningInvoice: string | null;
  paymentHash: string | null;
  networkFeeEstimate: number;
  status: 'pending' | 'confirmed' | 'paid' | 'expired' | 'cancelled';
  network: string;
  createdAt: string;
  expiresAt: string;
}

export type ListInvoicesResponse = InvoiceResponse[];
