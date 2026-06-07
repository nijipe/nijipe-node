import { Nijipe } from '../client';

export class Checkout {
  constructor(private client: Nijipe) {}

  async createSession(params: any): Promise<any> {
    return this.client.request<any>('POST', '/checkout/sessions', params);
  }
}
