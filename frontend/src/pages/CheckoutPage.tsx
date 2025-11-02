import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import toast from 'react-hot-toast';
import { createPaymentIntent } from '../api/billing';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';

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
        color: '#111827',
        '::placeholder': {
          color: '#9CA3AF',
        },
      },
      invalid: {
        color: '#EF4444',
      },
    },
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-6">
        Payment Details
      </h2>

      {/* Cardholder Name */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-neutral-900 dark:text-white mb-2">
          Cardholder Name
        </label>
        <input
          type="text"
          placeholder="John Doe"
          value={cardholderName}
          onChange={(e) => setCardholderName(e.target.value)}
          required
          className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
        />
      </div>

      {/* Stripe Card Element */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-neutral-900 dark:text-white mb-2">
          Card Details
        </label>
        <div className="p-4 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900">
          <CardElement options={cardElementOptions} />
        </div>
        <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-2">
          Your card information is processed securely by Stripe.
        </p>
      </div>

      {/* Error Message */}
      {cardError && (
        <Card
          variant="default"
          className="mb-6 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800"
        >
          <p className="text-sm text-red-700 dark:text-red-300">{cardError}</p>
        </Card>
      )}

      {/* Terms Checkbox */}
      <div className="mb-6">
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            className="mt-1 w-4 h-4 border-neutral-300 rounded text-primary-500 focus:ring-primary-500"
            defaultChecked
            required
          />
          <span className="text-sm text-neutral-600 dark:text-neutral-400">
            I agree to the{' '}
            <a href="/terms" className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 font-semibold">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 font-semibold">
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
        <a href="/subscribe" className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 font-semibold">
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
    <div className="min-h-screen bg-gradient-to-b from-white to-primary-50 dark:from-primary-950 dark:to-primary-900 p-6 transition-colors duration-normal">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-neutral-900 dark:text-white mb-2">
            💳 Complete Your Payment
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Secure checkout powered by Stripe
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="md:col-span-2">
            <Card variant="default">
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
          <Card variant="default" className="h-fit border border-neutral-200 dark:border-neutral-800">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-6">Order Summary</h3>

            <div className="border-b border-neutral-200 dark:border-neutral-800 pb-4 mb-4">
              <p className="text-neutral-600 dark:text-neutral-400">{plan.name}</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white mt-2">
                ${plan.price.toFixed(2)}
              </p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">/month</p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600 dark:text-neutral-400">Subtotal</span>
                <span className="text-neutral-900 dark:text-white">${plan.price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600 dark:text-neutral-400">Tax</span>
                <span className="text-neutral-900 dark:text-white">Calculated at checkout</span>
              </div>
              <div className="border-t border-neutral-200 dark:border-neutral-800 pt-3 flex justify-between font-semibold">
                <span className="text-neutral-900 dark:text-white">Total</span>
                <span className="text-neutral-900 dark:text-white">${plan.price.toFixed(2)}</span>
              </div>
            </div>

            {/* Features */}
            <Card variant="highlight" className="bg-accent-50 dark:bg-accent-900/30 border border-accent-200 dark:border-accent-800">
              <p className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">
                Plan Includes:
              </p>
              <ul className="text-xs text-neutral-700 dark:text-neutral-300 space-y-2">
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
        <Card variant="highlight" className="mt-8 bg-accent-50 dark:bg-accent-900/30 border border-accent-200 dark:border-accent-800">
          <p className="text-sm text-accent-700 dark:text-accent-300">
            🔒 Your payment information is encrypted and processed securely by Stripe.
            We never store your card details.
          </p>
        </Card>
      </div>
    </div>
  );
}

export default CheckoutPage;
