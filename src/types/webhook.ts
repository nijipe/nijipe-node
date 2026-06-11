export interface WebhookVerifyParams {
  payload: string | Buffer;
  signature: string | string[];
  secret: string;
}

export interface WebhookEvent {
  event: string;
  invoiceId: string;
  orderId: string;
  total: number;
  btcAmount: number;
  status: string;
  merchantSettlement: number;
  platformFee: number;
  timestamp: string | Date;
  [key: string]: any; // Allow for other fields that might be included
}
