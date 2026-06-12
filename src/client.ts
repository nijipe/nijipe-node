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
    
    // Validate baseUrl to prevent 308 redirect header dropping and internal RPC confusion
    if (options.baseUrl) {
      if (options.baseUrl.includes('api.nijipe.com')) {
        console.warn('⚠️ [Nijipe SDK Warning]: api.nijipe.com is reserved for internal Bitcoin nodes. Please use https://www.nijipe.com/api/v1');
      } else if (options.baseUrl.match(/^https?:\/\/nijipe\.com/)) {
        console.warn('⚠️ [Nijipe SDK Warning]: Requests to the root domain (nijipe.com) will trigger a 308 redirect which drops the Authorization header. Please use https://www.nijipe.com/api/v1');
      }
    }

    this.baseUrl = options.baseUrl || 'https://www.nijipe.com/api/v1';

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
      let rawText = '';
      try {
        rawText = await response.text();
        const errorData = JSON.parse(rawText);
        throw new Error(`Nijipe API Error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
      } catch (parseError: any) {
        if (parseError.message.includes('Nijipe API Error')) throw parseError;
        throw new Error(`Nijipe API Error: ${response.status} ${response.statusText} - Raw Body: ${rawText.substring(0, 500)}`);
      }
    }

    return response.json() as Promise<T>;
  }
}
