import * as crypto from 'crypto';
import { WebhookVerifyParams, WebhookEvent } from '../types/webhook';

export class Webhooks {
  verify(params: WebhookVerifyParams): WebhookEvent {
    const { payload, signature, secret } = params;

    const payloadString = Buffer.isBuffer(payload) ? payload.toString('utf8') : payload;
    
    if (typeof payloadString !== 'string') {
      throw new Error("Webhook payload must be a string or Buffer (the raw request body). If you are using Express, ensure you use express.raw({ type: 'application/json' }) to get the raw body. Passing a parsed JSON object will result in signature verification failure.");
    }

    const sigString = Array.isArray(signature) ? signature[0] : signature;

    // Expected format: t=timestamp,v1=signature
    const parts = sigString.split(',');
    let timestamp = '';
    let providedSig = '';

    for (const part of parts) {
      const [key, value] = part.split('=');
      if (key === 't') timestamp = value;
      if (key === 'v1') providedSig = value;
    }

    if (!timestamp || !providedSig) {
      throw new Error("Invalid signature format. Expected t=...,v1=...");
    }

    // Protect against replay attacks (e.g., 5 minutes tolerance)
    const timeDiff = Math.abs(Math.floor(Date.now() / 1000) - parseInt(timestamp, 10));
    if (timeDiff > 300) {
      throw new Error("Webhook timestamp is too old");
    }

    const signedPayload = `${timestamp}.${payloadString}`;
    
    const expectedSig = crypto
      .createHmac('sha256', secret)
      .update(signedPayload)
      .digest('hex');

    if (
      expectedSig.length !== providedSig.length ||
      !crypto.timingSafeEqual(Buffer.from(expectedSig), Buffer.from(providedSig))
    ) {
      throw new Error("Webhook signature verification failed");
    }

    return JSON.parse(payloadString) as WebhookEvent;
  }
}
