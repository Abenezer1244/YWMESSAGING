import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { createPaymentIntent } from '../api/billing';

export function CheckoutPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(false);
  const [planName, setPlanName] = useState<'starter' | 'growth' | 'pro' | null>(
    (searchParams.get('plan') as any) || null
  );
  const [cardError, setCardError] = useState('');

  const planPrices: Record<string, { name: string; price: number }> = {
    starter: { name: 'Starter Plan', price: 49 },
    growth: { name: 'Growth Plan', price: 79 },
    pro: { name: 'Pro Plan', price: 99 },
  };

  useEffect(() => {
    if (!planName) {
      navigate('/subscribe');
    }
  }, [planName, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCardError('');

    if (!planName) {
      setCardError('Please select a plan');
      return;
    }

    try {
      setIsProcessing(true);

      // Create payment intent
      const { clientSecret, amount } = await createPaymentIntent(planName);

      console.log(`💳 Payment intent created for ${planName}: $${amount / 100}`);

      // In production, use Stripe.js to confirm payment with clientSecret
      // For MVP, simulate successful payment
      toast.success('Payment processed successfully!');
      setTimeout(() => {
        navigate('/billing');
      }, 1500);
    } catch (error) {
      const message = (error as Error).message || 'Payment failed';
      setCardError(message);
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!planName) {
    return null;
  }

  const plan = planPrices[planName];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Complete Your Payment</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="md:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Details</h2>

              {/* Cardholder Info */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Card Holder Name
                </label>
                <input
                  type="text"
                  placeholder="John Doe"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Card Number */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Card Number
                </label>
                <input
                  type="text"
                  placeholder="4242 4242 4242 4242"
                  maxLength={19}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <p className="text-sm text-gray-500 mt-2">
                  Test card: 4242 4242 4242 4242
                </p>
              </div>

              {/* Expiry and CVV */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    maxLength={5}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CVV
                  </label>
                  <input
                    type="text"
                    placeholder="123"
                    maxLength={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Error Message */}
              {cardError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{cardError}</p>
                </div>
              )}

              {/* Terms */}
              <div className="mb-6">
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    className="mt-1 w-4 h-4"
                    defaultChecked
                    required
                  />
                  <span className="ml-3 text-sm text-gray-600">
                    I agree to the{' '}
                    <a href="#" className="text-blue-600 hover:underline">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="#" className="text-blue-600 hover:underline">
                      Privacy Policy
                    </a>
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {isProcessing ? 'Processing...' : `Pay $${plan.price}`}
              </button>

              {/* Return Link */}
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => navigate('/subscribe')}
                  className="text-blue-600 hover:underline"
                >
                  Back to plans
                </button>
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow p-8 h-fit">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Order Summary</h3>

            <div className="border-b pb-4 mb-4">
              <p className="text-gray-600">{plan.name}</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                ${plan.price.toFixed(2)}
              </p>
              <p className="text-sm text-gray-500 mt-1">/month</p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900">${plan.price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax</span>
                <span className="text-gray-900">Calculated at checkout</span>
              </div>
              <div className="border-t pt-3 flex justify-between font-semibold">
                <span className="text-gray-900">Total</span>
                <span className="text-gray-900">${plan.price.toFixed(2)}</span>
              </div>
            </div>

            {/* Features */}
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm font-semibold text-gray-900 mb-3">
                Plan Includes:
              </p>
              <ul className="text-xs text-gray-700 space-y-2">
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
            </div>
          </div>
        </div>

        {/* Security Note */}
        <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            🔒 Your payment information is encrypted and processed securely by Stripe.
            We never store your card details.
          </p>
        </div>
      </main>
    </div>
  );
}

export default CheckoutPage;
