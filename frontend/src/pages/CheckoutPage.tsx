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
        color: '#374151',
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
      <h2 className="text-2xl font-bold text-secondary-900 dark:text-secondary-50 mb-6">
        Payment Details
      </h2>

      {/* Cardholder Name */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-secondary-900 dark:text-secondary-50 mb-2">
          Cardholder Name
        </label>
        <input
          type="text"
          placeholder="John Doe"
          value={cardholderName}
          onChange={(e) => setCardholderName(e.target.value)}
          required
          className="w-full px-4 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
        />
      </div>

      {/* Stripe Card Element */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-secondary-900 dark:text-secondary-50 mb-2">
          Card Details
        </label>
        <div className="p-4 border border-secondary-300 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-800">
          <CardElement options={cardElementOptions} />
        </div>
        <p className="text-xs text-secondary-600 dark:text-secondary-400 mt-2">
          Your card information is processed securely by Stripe.
        </p>
      </div>

      {/* Error Message */}
      {cardError && (
        <Card
          variant="highlight"
          className="mb-6 bg-danger-50 dark:bg-danger-900/30 border border-danger-200 dark:border-danger-700"
        >
          <p className="text-sm text-danger-700 dark:text-danger-300">{cardError}</p>
        </Card>
      )}

      {/* Terms Checkbox */}
      <div className="mb-6">
        <label className="flex items-start">
          <input
            type="checkbox"
            className="mt-1 w-4 h-4 border-secondary-300 rounded text-primary-600 focus:ring-primary-500"
            defaultChecked
            required
          />
          <span className="ml-3 text-sm text-secondary-600 dark:text-secondary-400">
            I agree to the{' '}
            <a href="/terms" className="text-primary-600 dark:text-primary-400 hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-primary-600 dark:text-primary-400 hover:underline">
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
        <a href="/subscribe" className="text-primary-600 dark:text-primary-400 hover:underline">
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
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 dark:from-secondary-900 to-secondary-100 dark:to-secondary-950 p-6 transition-colors duration-normal">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-secondary-900 dark:text-secondary-50 mb-2">
            💳 Complete Your Payment
          </h1>
          <p className="text-secondary-600 dark:text-secondary-400">
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
          <Card variant="default" className="h-fit">
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-50 mb-6">Order Summary</h3>

            <div className="border-b border-secondary-200 dark:border-secondary-700 pb-4 mb-4">
              <p className="text-secondary-600 dark:text-secondary-400">{plan.name}</p>
              <p className="text-2xl font-bold text-secondary-900 dark:text-secondary-50 mt-2">
                ${plan.price.toFixed(2)}
              </p>
              <p className="text-sm text-secondary-600 dark:text-secondary-400 mt-1">/month</p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-secondary-600 dark:text-secondary-400">Subtotal</span>
                <span className="text-secondary-900 dark:text-secondary-50">${plan.price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-secondary-600 dark:text-secondary-400">Tax</span>
                <span className="text-secondary-900 dark:text-secondary-50">Calculated at checkout</span>
              </div>
              <div className="border-t border-secondary-200 dark:border-secondary-700 pt-3 flex justify-between font-semibold">
                <span className="text-secondary-900 dark:text-secondary-50">Total</span>
                <span className="text-secondary-900 dark:text-secondary-50">${plan.price.toFixed(2)}</span>
              </div>
            </div>

            {/* Features */}
            <Card variant="highlight" className="bg-primary-50 dark:bg-primary-900/30">
              <p className="text-sm font-semibold text-secondary-900 dark:text-secondary-50 mb-3">
                Plan Includes:
              </p>
              <ul className="text-xs text-secondary-700 dark:text-secondary-300 space-y-2">
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
        <Card variant="highlight" className="mt-8 bg-success-50 dark:bg-success-900/30 border border-success-200 dark:border-success-700">
          <p className="text-sm text-success-800 dark:text-success-200">
            🔒 Your payment information is encrypted and processed securely by Stripe.
            We never store your card details.
          </p>
        </Card>
      </div>
    </div>
  );
}

export default CheckoutPage;
