/**
 * Stripe Payment Form Component
 * Wraps Stripe Elements and handles payment confirmation.
 * Shown in the Cart checkout flow after buyer info is filled.
 */
import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { useToast } from '../hooks/useToast';
import { useMarket } from '../hooks/useMarket';
import { paymentApi, PaymentIntentResponse } from '../api/payments';

interface PaymentFormProps {
  clientSecret: string;
  publishableKey: string;
  paymentInfo: PaymentIntentResponse;
  onSuccess: () => void;
  onCancel: () => void;
}

function ConfirmPaymentForm({
  paymentInfo,
  onSuccess,
  onCancel,
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { showToast } = useToast();
  const { market } = useMarket();
  const [processing, setProcessing] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/${market === 'UK' ? '' : `/${market.toLowerCase()}`}/orders`,
        },
        redirect: 'if_required',
      });

      if (error) {
        showToast(error.message || 'Payment failed', 'error');
      } else {
        showToast('Payment successful!', 'success');
        onSuccess();
      }
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="stripe-payment-form">
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <PaymentElement
            options={{
              layout: 'tabs',
            }}
          />
        </div>

        <div style={{
          display: 'flex',
          gap: '12px',
          marginTop: '16px',
        }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={processing}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!stripe || processing}
            style={{ flex: 1 }}
          >
            {processing ? 'Processing...' : `Pay ${paymentInfo.currency.toUpperCase()} ${(paymentInfo.amount / 100).toFixed(2)}`}
          </button>
        </div>
      </form>
    </div>
  );
}

interface StripeCheckoutProps {
  productId: string;
  amount: number;
  currency: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function StripeCheckout({
  productId,
  amount,
  currency,
  onSuccess,
  onCancel,
}: StripeCheckoutProps) {
  const [clientSecret, setClientSecret] = useState('');
  const [publishableKey, setPublishableKey] = useState('');
  const [paymentInfo, setPaymentInfo] = useState<PaymentIntentResponse | null>(null);
  const [stripePromise, setStripePromise] = useState<ReturnType<typeof loadStripe> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function init() {
      try {
        const config = await paymentApi.getConfig();
        if (!config.enabled || !config.publishableKey) {
          setError('Stripe is not configured. Please add your STRIPE_SECRET_KEY to the server environment.');
          setLoading(false);
          return;
        }

        setPublishableKey(config.publishableKey);
        setStripePromise(loadStripe(config.publishableKey));

        const intent = await paymentApi.createIntent(productId, currency, 1, amount);
        setClientSecret(intent.clientSecret);
        setPaymentInfo(intent);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Failed to initialize payment');
        }
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [productId, currency, amount]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '40px',
        color: '#666',
      }}>
        Loading payment form...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: '16px',
        background: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: '8px',
        color: '#dc2626',
        marginBottom: '16px',
      }}>
        <strong>Payment Error:</strong> {error}
        <div style={{ marginTop: '12px' }}>
          <button className="btn btn-secondary" onClick={onCancel}>
            Back to Checkout
          </button>
        </div>
      </div>
    );
  }

  if (!stripePromise || !clientSecret || !paymentInfo) {
    return null;
  }

  return (
    <div style={{
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      padding: '24px',
      background: '#fff',
    }}>
      <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: 600 }}>
        Secure Payment
      </h3>
      <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '16px' }}>
        Powered by Stripe — your card details are encrypted and secure.
      </p>

      <Elements
        stripe={stripePromise}
        options={{
          clientSecret,
          appearance: {
            theme: 'stripe',
            variables: {
              colorPrimary: '#1a1a1a',
              fontFamily: 'system-ui, sans-serif',
            },
          },
        }}
      >
        <ConfirmPaymentForm
          clientSecret={clientSecret}
          publishableKey={publishableKey}
          paymentInfo={paymentInfo}
          onSuccess={onSuccess}
          onCancel={onCancel}
        />
      </Elements>
    </div>
  );
}
