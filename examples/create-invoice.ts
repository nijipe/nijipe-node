import { Nijipe } from '../src';

async function main() {
  const nijipe = new Nijipe({
    apiKey: process.env.NIJIPE_API_KEY || 'test_key',
  });

  const invoice = await nijipe.invoices.create({
    amount: 1500,
    currency: "USD",
    description: "Order #123",
  });

  console.log('Invoice created:', invoice.checkoutUrl);
}

main().catch(console.error);
