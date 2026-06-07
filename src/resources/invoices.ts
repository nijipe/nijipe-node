import { Nijipe } from '../client';
import { InvoiceParams, InvoiceResponse, ListInvoicesResponse } from '../types/invoice';

export class Invoices {
  constructor(private client: Nijipe) {}

  async create(params: InvoiceParams): Promise<InvoiceResponse> {
    return this.client.request<InvoiceResponse>('POST', '/invoices', params);
  }

  async retrieve(id: string): Promise<InvoiceResponse> {
    return this.client.request<InvoiceResponse>('GET', `/invoices/${id}`);
  }

  async list(limit = 10, cursor?: string): Promise<ListInvoicesResponse> {
    const query = new URLSearchParams();
    query.append('limit', limit.toString());
    if (cursor) query.append('cursor', cursor);

    return this.client.request<ListInvoicesResponse>('GET', `/invoices?${query.toString()}`);
  }
}
