import { Nijipe } from '../src';

// Example of verifying a webhook payload
function verifyExample() {
  const nijipe = new Nijipe({
    apiKey: 'test_key',
  });

  const rawBody = '{"type":"invoice.confirmed","data":{"id":"inv_123"}}';
  const signature = 't=123,v1=abc';

  try {
    const event = nijipe.webhooks.verify({
      payload: rawBody,
      signature: signature,
      secret: process.env.NIJIPE_WEBHOOK_SECRET || 'secret',
    });
    console.log('Valid webhook:', event.type);
  } catch (error) {
    console.error('Invalid signature');
  }
}
