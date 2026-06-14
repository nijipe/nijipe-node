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
          
          if (errorData?.error && typeof errorData.error === 'string' && errorData.error.includes('STRICT_NON_CUSTODIAL_LAW_ENFORCED')) {
            throw new Error(`\n[Nijipe Strict Non-Custodial Law Enforced]: ⚖️\nYour Mainnet invoice generation was aggressively aborted.\nReason: The Nijipe platform could not establish a direct peer-to-peer route to your Lightning node or XPUB.\nAction Required: To protect user funds from custodial escrow, you must configure a valid Lightning Address or XPUB in your merchant dashboard to accept Mainnet payments.\n`);
          }

          throw new Error(`Nijipe API Error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
        } catch (parseError: any) {
          if (parseError.message.includes('Nijipe API Error') || parseError.message.includes('[Nijipe Strict Non-Custodial Law Enforced]')) throw parseError;
          throw new Error(`Nijipe API Error: ${response.status} ${response.statusText} - Raw Body: ${rawText.substring(0, 500)}`);
        }
      }

      return response.json() as Promise<T>;
    }

  /**
   * Subscribe to real-time status updates for a specific invoice via Server-Sent Events (SSE).
   * @param invoiceId The ID of the invoice to listen to.
   * @param onUpdate Callback function triggered when the invoice status changes (e.g. 'payment_detected', 'paid')
   */
  public subscribeToUpdates(invoiceId: string, onUpdate: (data: { status: string; txid?: string }) => void): any {
    const url = `${this.baseUrl}/invoices/${invoiceId}/stream`;
    
    // Polyfill or native EventSource depending on Node vs Browser environment
    const EventSourceClient = typeof window !== 'undefined' ? (window as any).EventSource : require('eventsource');
    const source = new EventSourceClient(url);

    source.addEventListener('status_update', (event: any) => {
      try {
        const data = JSON.parse(event.data);
        onUpdate(data);
        
        // Auto-close connection if a terminal state is reached
        if (['paid', 'confirmed', 'failed', 'canceled', 'expired'].includes(data.status)) {
          source.close();
        }
      } catch (err) {
        console.error("[Nijipe SDK] Failed to parse SSE stream data", err);
      }
    });

    return source;
  }
}
