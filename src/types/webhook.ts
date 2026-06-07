export interface WebhookVerifyParams {
  payload: string | Buffer;
  signature: string | string[];
  secret: string;
}

export interface WebhookEvent {
  id: string;
  type: string;
  data: any;
}
