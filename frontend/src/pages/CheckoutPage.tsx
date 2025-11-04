import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import toast from 'react-hot-toast';
import { createPaymentIntent } from '../api/billing';
import BackButton from '../components/BackButton';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import { themeColors } from '../utils/themeColors';

// Initialize Stripe - use environment variable for key
const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || ''
);

// Separate component for payment form
function PaymentForm({ planName, planPrice, onSubmit }: any) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardError, setCardError] = useState('');
  const [cardholderName, setCardholderName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCardError('');

    if (!stripe || !elements) {
      setCardError('Payment processing not available');
      return;
    }

    if (!cardholderName.trim()) {
      setCardError('Cardholder name is required');
      return;
    }

    try {
      setIsProcessing(true);

      // Create payment intent
      const { clientSecret } = await createPaymentIntent(planName);

      // Confirm card payment securely through Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
          billing_details: {
            name: cardholderName,
          },
        },
      });

      if (error) {
        // Show generic error message without exposing payment system details
        const userMessage = 'Payment failed. Please verify your card details and try again.';
        setCardError(userMessage);
        toast.error(userMessage);
        if (process.env.NODE_ENV === 'development') {
          console.debug('Stripe error:', error.message);
        }
      } else if (paymentIntent?.status === 'succeeded') {
        toast.success('Payment successful!');
        // Handle successful payment
        onSubmit();
      }
    } catch (err) {
      // Generic error message without exposing details
      const userMessage = 'Payment processing error. Please try again.';
      setCardError(userMessage);
      toast.error(userMessage);
      if (process.env.NODE_ENV === 'development') {
        console.debug('Payment error:', err);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: themeColors.text.white,
        '::placeholder': {
          color: themeColors.text.lightGray,
        },
      },
      invalid: {
        color: themeColors.danger.base,
      },
    },
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-2xl font-bold text-foreground mb-6">
        Payment Details
      </h2>

      {/* Cardholder Name */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-2">
          Cardholder Name
        </label>
        <input
          type="text"
          placeholder="John Doe"
          value={cardholderName}
          onChange={(e) => setCardholderName(e.target.value)}
          required
          className="w-full px-4 py-2 border border-input rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors placeholder-muted-foreground/50"
        />
      </div>

      {/* Stripe Card Element */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-2">
          Card Details
        </label>
        <div className="p-4 border border-border rounded-lg bg-muted">
          <CardElement options={cardElementOptions} />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Your card information is processed securely by Stripe.
        </p>
      </div>

      {/* Error Message */}
      {cardError && (
        <Card
          variant="default"
          className="mb-6 bg-red-950/30 border border-red-800"
        >
          <p className="text-sm text-red-400">{cardError}</p>
        </Card>
      )}

      {/* Terms Checkbox */}
      <div className="mb-6">
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            className="mt-1 w-4 h-4 border-border rounded text-primary focus:ring-primary bg-muted"
            defaultChecked
            required
          />
          <span className="text-sm text-foreground/80">
            I agree to the{' '}
            <a href="/terms" className="text-primary hover:text-primary/80 font-semibold">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-primary hover:text-primary/80 font-semibold">
              Privacy Policy
            </a>
          </span>
        </label>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        disabled={isProcessing || !stripe}
        className="w-full"
      >
        {isProcessing ? 'Processing...' : `Pay $${planPrice}`}
      </Button>

      {/* Return Link */}
      <div className="mt-4 text-center">
        <a href="/subscribe" className="text-primary hover:text-primary/80 font-semibold">
          Back to plans
        </a>
      </div>
    </form>
  );
}

// Validate plan name against allowed values
const getValidatedPlan = (
  plan: string | null
): 'starter' | 'growth' | 'pro' | null => {
  const validPlans = ['starter', 'growth', 'pro'] as const;
  return validPlans.includes(plan as any) ? (plan as any) : null;
};

export function CheckoutPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [planName, setPlanName] = useState<'starter' | 'growth' | 'pro' | null>(
    getValidatedPlan(searchParams.get('plan'))
  );

  const planPrices: Record<string, { name: string; price: number }> = {
    starter: { name: 'Starter Plan', price: 49 },
    growth: { name: 'Growth Plan', price: 79 },
    pro: { name: 'Pro Plan', price: 99 },
  };

  useEffect(() => {
    if (!planName) {
      // Use timer to prevent multiple redirects
      const redirectTimer = setTimeout(() => navigate('/subscribe'), 0);
      return () => clearTimeout(redirectTimer);
    }
  }, [planName, navigate]);

  const handlePaymentSuccess = () => {
    navigate('/billing');
  };

  if (!planName) {
    return null;
  }

  const plan = planPrices[planName];

  return (
    <div className="min-h-screen bg-background p-6 transition-colors duration-normal">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            💳 Complete Your Payment
          </h1>
          <p className="text-muted-foreground">
            Secure checkout powered by Stripe
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="md:col-span-2">
            <Card variant="default" className="bg-muted border-border">
              <Elements stripe={stripePromise}>
                <PaymentForm
                  planName={planName}
                  planPrice={plan.price}
                  onSubmit={handlePaymentSuccess}
                />
              </Elements>
            </Card>
          </div>

          {/* Order Summary */}
          <Card variant="default" className="h-fit border-border bg-muted">
            <h3 className="text-lg font-semibold text-foreground mb-6">Order Summary</h3>

            <div className="border-b border-border pb-4 mb-4">
              <p className="text-muted-foreground">{plan.name}</p>
              <p className="text-2xl font-bold text-foreground mt-2">
                ${plan.price.toFixed(2)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">/month</p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground">${plan.price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span className="text-foreground">Calculated at checkout</span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between font-semibold">
                <span className="text-foreground">Total</span>
                <span className="text-foreground">${plan.price.toFixed(2)}</span>
              </div>
            </div>

            {/* Features */}
            <Card variant="highlight" className="bg-primary/10 border border-primary/30">
              <p className="text-sm font-semibold text-foreground mb-3">
                Plan Includes:
              </p>
              <ul className="text-xs text-foreground/80 space-y-2">
                {planName === 'starter' && (
                  <>
                    <li>✓ 1 Branch</li>
                    <li>✓ 500 Members</li>
                    <li>✓ 1,000 msgs/month</li>
                    <li>✓ Basic analytics</li>
                  </>
                )}
                {planName === 'growth' && (
                  <>
                    <li>✓ 5 Branches</li>
                    <li>✓ 2,000 Members</li>
                    <li>✓ 5,000 msgs/month</li>
                    <li>✓ Advanced analytics</li>
                  </>
                )}
                {planName === 'pro' && (
                  <>
                    <li>✓ 10 Branches</li>
                    <li>✓ Unlimited Members</li>
                    <li>✓ Unlimited messages</li>
                    <li>✓ Premium support</li>
                  </>
                )}
              </ul>
            </Card>
          </Card>
        </div>

        {/* Security Note */}
        <Card variant="highlight" className="mt-8 bg-green-500/10 border border-green-500/30">
          <p className="text-sm text-green-300">
            🔒 Your payment information is encrypted and processed securely by Stripe.
            We never store your card details.
          </p>
        </Card>
      </div>
    </div>
  );
}

export default CheckoutPage;
