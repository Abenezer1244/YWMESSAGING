import { useState } from 'react';
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { StripeCardElementOptions } from '@stripe/stripe-js';
import toast from 'react-hot-toast';
import Button from './ui/Button';

interface StripePaymentFormProps {
  amount: number;
  phoneNumber: string;
  paymentIntentId: string;
  onSuccess: (paymentMethodId: string) => void;
  onError?: (error: string) => void;
  isLoading?: boolean;
  paymentStatus?: 'idle' | 'processing' | 'success' | 'declined' | 'failed';
  paymentMessage?: string;
}

const cardElementOptions: StripeCardElementOptions = {
  style: {
    base: {
      fontSize: '14px',
      color: 'var(--foreground)',
      '::placeholder': {
        color: 'var(--muted-foreground)',
      },
      fontFamily: 'system-ui, -apple-system, sans-serif',
    },
    invalid: {
      color: '#ff4444',
    },
  },
};

export default function StripePaymentForm({
  amount,
  phoneNumber,
  paymentIntentId,
  onSuccess,
  onError,
  isLoading = false,
  paymentStatus = 'idle',
  paymentMessage = '',
}: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [processingPayment, setProcessingPayment] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      toast.error('Payment system not initialized');
      return;
    }

    setProcessingPayment(true);

    try {
      const cardElement = elements.getElement(CardElement);

      if (!cardElement) {
        throw new Error('Card element not found');
      }

      // Create payment method from card element
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          // Could add name/email here if needed
        },
      });

      if (error) {
        console.error('Payment method creation failed:', error);
        toast.error(error.message || 'Failed to process card');
        onError?.(error.message || 'Failed to process card');
        setProcessingPayment(false);
        return;
      }

      if (!paymentMethod) {
        throw new Error('No payment method returned');
      }

      // Call success callback with payment method ID
      onSuccess(paymentMethod.id);
    } catch (error: any) {
      console.error('Payment form error:', error);
      const errorMessage = error.message || 'Payment processing failed';
      toast.error(errorMessage);
      onError?.(errorMessage);
    } finally {
      setProcessingPayment(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
        <h3 className="font-semibold text-foreground mb-2">Payment for {phoneNumber}</h3>
        <div className="text-2xl font-bold text-primary">${(amount / 100).toFixed(2)}</div>
        <div className="text-sm text-muted-foreground">One-time setup fee</div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Card Details
          </label>
          <div className="p-3 border border-border rounded-lg bg-muted">
            <CardElement options={cardElementOptions} />
          </div>
        </div>
      </div>

      {/* Payment Status Message */}
      {paymentStatus !== 'idle' && (
        <div
          className={`p-4 rounded-lg border text-center ${
            paymentStatus === 'success'
              ? 'bg-green-500/10 border-green-500/20 text-green-700'
              : paymentStatus === 'declined' || paymentStatus === 'failed'
              ? 'bg-red-500/10 border-red-500/20 text-red-700'
              : 'bg-blue-500/10 border-blue-500/20 text-blue-700'
          }`}
        >
          {paymentStatus === 'success' && '✓ Payment Successful'}
          {paymentStatus === 'declined' && '✗ Card Declined'}
          {paymentStatus === 'failed' && '✗ Payment Failed'}
          {paymentStatus === 'processing' && '⏳ Processing...'}
          {paymentMessage && <div className="text-sm mt-1">{paymentMessage}</div>}
        </div>
      )}

      <div className="text-xs text-muted-foreground bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
        🔒 Payment is processed securely by Stripe. Your card details are encrypted and never stored on our servers.
      </div>

      <div className="space-y-2">
        <Button
          type="submit"
          variant="primary"
          fullWidth
          size="lg"
          disabled={!stripe || processingPayment || isLoading}
          isLoading={processingPayment || isLoading}
          className="bg-primary hover:bg-primary/90 text-background font-medium"
        >
          {processingPayment ? 'Processing...' : 'Complete Purchase'}
        </Button>
      </div>
    </form>
  );
}
