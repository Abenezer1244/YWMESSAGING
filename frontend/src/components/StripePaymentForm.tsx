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

          {/* Test Card Examples */}
          <div className="mt-3 space-y-2 text-xs">
            <p className="text-muted-foreground font-semibold">Test Cards:</p>
            <div className="space-y-1">
              <div className="flex items-center justify-between p-2 bg-green-500/10 border border-green-500/20 rounded">
                <span className="font-mono text-muted-foreground">4242 4242 4242 4242</span>
                <span className="text-green-600 font-medium">✓ Successful</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-red-500/10 border border-red-500/20 rounded">
                <span className="font-mono text-muted-foreground">4000 0000 0000 0002</span>
                <span className="text-red-600 font-medium">✗ Declined</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-amber-500/10 border border-amber-500/20 rounded">
                <span className="font-mono text-muted-foreground">4000 0000 0000 0069</span>
                <span className="text-amber-600 font-medium">✗ Invalid CVC</span>
              </div>
            </div>
            <p className="text-muted-foreground italic pt-1">Use any future date and any 3-digit CVC</p>
          </div>
        </div>
      </div>

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
