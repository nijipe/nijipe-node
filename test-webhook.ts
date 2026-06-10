import { Nijipe } from './src/client';
// @ts-ignore
import * as crypto from 'crypto';

// Initialize the SDK client (the baseUrl is correctly defaulting to api.nijipe.com/v1)
const nijipe = new Nijipe({
  apiKey: 'test-api-key',
});

// A dummy webhook payload signed using your backend's new logic
const secretKey = 'whsec_test_secret123';
const payloadObj = { eventType: 'invoice.expired', data: { invoiceId: 'test-123' } };
const payloadString = JSON.stringify(payloadObj);
const timestamp = Math.floor(Date.now() / 1000).toString();

// Manually calculate signature exactly as your backend webhook-dispatcher does
const signedPayload = `${timestamp}.${payloadString}`;
const signatureHash = crypto.createHmac('sha256', secretKey).update(signedPayload).digest('hex');
const mockNijipeSignatureHeader = `t=${timestamp},v1=${signatureHash}`;

console.log("--- Testing Webhook Verification ---");
try {
  // Using the SDK's verification module
  const verifiedEvent = nijipe.webhooks.verify({
    payload: payloadString,
    signature: mockNijipeSignatureHeader,
    secret: secretKey
  });
  console.log("✅ SDK Successfully Verified Webhook Payload!");
  console.log("Event:", verifiedEvent);
} catch (error: any) {
  console.error("❌ SDK Verification Failed:", error.message);
}
