import { Invoices } from './resources/invoices';
import { Checkout } from './resources/checkout';
import { Webhooks } from './resources/webhooks';

export interface NijipeOptions {
  apiKey: string;
  baseUrl?: string;
}

export class Nijipe {
  invoices: Invoices;
  checkout: Checkout;
  webhooks: Webhooks;

  public apiKey: string;
  public baseUrl: string;

  constructor(options: NijipeOptions) {
    if (!options.apiKey) {
      throw new Error("Nijipe API key is required.");
    }
    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl || 'https://api.nijipe.com/v1';

    this.invoices = new Invoices(this);
    this.checkout = new Checkout(this);
    this.webhooks = new Webhooks();
  }

  async request<T>(method: string, path: string, payload?: any): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'User-Agent': 'Nijipe-Node/1.0.0'
    };

    const options: RequestInit = {
      method,
      headers,
    };

    if (payload && method !== 'GET') {
      options.body = JSON.stringify(payload);
    }

    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Nijipe API Error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
    }

    return response.json() as Promise<T>;
  }
}
