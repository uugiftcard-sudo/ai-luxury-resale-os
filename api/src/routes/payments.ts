/**
 * Stripe Payments Router
 * Handles PaymentIntent creation and Stripe webhook events.
 * Supports GBP (UK) and HKD (HK) currencies.
 */
import express, { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import { ok, fail, serverError, validateRequired } from '../middleware/response';
import { requireAuth } from '../middleware/auth';
import { findProductById } from '../models/store';

const router = Router();

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

const VALID_CURRENCIES: Record<string, string> = {
  UK: 'gbp',
  HK: 'hkd',
  CN: 'cny',
};

function getStripe() {
  if (!stripeSecretKey) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  return new Stripe(stripeSecretKey);
}

/**
 * POST /api/payments/create-intent
 * Creates a Stripe PaymentIntent for the given order.
 * Body: { productId, currency (UK|HK|CN), quantity?, amount? }
 * If amount is provided, use it directly (for multi-item carts).
 * Otherwise, calculate from product price * quantity.
 */
router.post('/create-intent', requireAuth, async (req: Request, res: Response) => {
  try {
    if (!validateRequired(req, res, ['productId', 'currency'])) return;

    const { productId, currency, quantity = 1, amount: explicitAmount } = req.body as {
      productId: string;
      currency: string;
      quantity?: number;
      amount?: number;
    };

    const currencyCode = VALID_CURRENCIES[currency];
    if (!currencyCode) {
      fail(res, 400, 'currency 必须是 UK / HK / CN');
      return;
    }

    const amountCents = explicitAmount !== undefined
      ? Math.round(explicitAmount * 100)
      : (() => {
          const product = findProductById(productId);
          if (!product) {
            res.status(404).json({ success: false, error: '商品不存在' });
            return null;
          }
          return Math.round(product.price * (Number(quantity) || 1) * 100);
        })();

    if (amountCents === null) return;

    const stripe = getStripe();
    const intent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: currencyCode,
      automatic_payment_methods: { enabled: true },
      metadata: {
        productId,
        buyerId: req.userId || '',
        quantity: String(quantity || 1),
        ...(explicitAmount !== undefined ? { totalAmount: String(explicitAmount) } : {}),
      },
    });

    ok(res, {
      clientSecret: intent.client_secret,
      paymentIntentId: intent.id,
      amount: intent.amount,
      currency: intent.currency,
    });
  } catch (err) {
    if (err instanceof Error && err.message.includes('STRIPE_SECRET_KEY')) {
      fail(res, 503, 'Stripe 未配置');
      return;
    }
    serverError(res, err);
  }
});

/**
 * POST /api/payments/webhook
 * Stripe webhook handler. Verifies signature and handles events.
 * Uses express.raw middleware inline to capture the raw body for signature verification.
 */
router.post('/webhook', express.raw({ type: 'application/json' }), (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;

  if (!sig || !webhookSecret) {
    fail(res, 400, 'Missing stripe-signature header or webhook secret');
    return;
  }

  try {
    const stripe = getStripe();
    const rawBody = (req as Request & { body: Buffer }).body;
    const bodyBuffer = Buffer.isBuffer(rawBody) ? rawBody : Buffer.from(JSON.stringify(req.body));
    const event = stripe.webhooks.constructEvent(bodyBuffer, sig, webhookSecret);

    switch (event.type) {
      case 'payment_intent.succeeded':
        console.log(`[Stripe] PaymentIntent succeeded: ${event.data.object.id}`);
        break;
      case 'payment_intent.payment_failed':
        console.log(`[Stripe] PaymentIntent failed: ${event.data.object.id}`);
        break;
      case 'payment_intent.canceled':
        console.log(`[Stripe] PaymentIntent canceled: ${event.data.object.id}`);
        break;
      default:
        console.log(`[Stripe] Unhandled event type: ${event.type}`);
    }

    ok(res, { received: true });
  } catch (err) {
    if (err instanceof Error) {
      fail(res, 400, `Webhook Error: ${err.message}`);
    } else {
      fail(res, 400, 'Webhook signature verification failed');
    }
  }
});

/**
 * GET /api/payments/config
 * Returns the publishable key for the frontend.
 */
router.get('/config', (_req: Request, res: Response) => {
  ok(res, {
    publishableKey: process.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
    enabled: Boolean(stripeSecretKey),
  });
});

export default router;
