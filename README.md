# @nijipe/node

**Official Node.js and TypeScript SDK for the Nijipe API.**

Nijipe is a non-custodial Bitcoin and Lightning payment infrastructure platform for developers and merchants.

## Installation

```bash
npm install @nijipe/node
```

## Quick Start

```ts
import { Nijipe } from "@nijipe/node";

const nijipe = new Nijipe({
  apiKey: process.env.NIJIPE_API_KEY!,
});

const invoice = await nijipe.invoices.create({
  amount: 1500,
  currency: "USD",
  description: "Order #123",
});

console.log(invoice.checkoutUrl);
```

## Verifying Webhooks

Verify incoming webhooks securely:

```ts
const event = nijipe.webhooks.verify({
  payload: rawBody,
  signature: req.headers["x-nijipe-signature"],
  secret: process.env.NIJIPE_WEBHOOK_SECRET!,
});
```

## Links

- [Website](https://nijipe.com)
- [Documentation](https://nijipe.com/docs)
- [GitHub Organization](https://github.com/nijipe)

## License
MIT
