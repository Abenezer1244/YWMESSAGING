import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { subscribe } from '../api/billing';

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 49,
    description: 'Perfect for small churches',
    features: [
      'Up to 1 branch',
      'Up to 500 members',
      '1,000 messages/month',
      '1 co-admin',
      'Basic analytics',
      'Email support',
    ],
    cta: 'Get Started',
    highlighted: false,
  },
  {
    id: 'growth',
    name: 'Growth',
    price: 79,
    description: 'For growing organizations',
    features: [
      'Up to 5 branches',
      'Up to 2,000 members',
      '5,000 messages/month',
      '3 co-admins',
      'Advanced analytics',
      'Priority support',
      'Message templates',
      'Recurring messages',
    ],
    cta: 'Get Started',
    highlighted: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 99,
    description: 'For large organizations',
    features: [
      'Up to 10 branches',
      'Unlimited members',
      'Unlimited messages',
      '3 co-admins',
      'Advanced analytics',
      'Premium support (24/7)',
      'Message templates',
      'Recurring messages',
      'Custom integrations',
      'API access',
    ],
    cta: 'Get Started',
    highlighted: false,
  },
];

export function SubscribePage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async (planId: string) => {
    try {
      setIsLoading(true);
      // Navigate to checkout page with plan parameter
      navigate(`/checkout?plan=${planId}`);
    } catch (error) {
      toast.error((error as Error).message || 'Failed to start checkout');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Choose Your Plan</h1>
          <p className="text-gray-600 mt-2">
            Start with a 14-day free trial. No credit card required.
          </p>
        </div>
      </header>

      {/* Pricing Cards */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-lg shadow-lg overflow-hidden transform transition hover:scale-105 ${
                plan.highlighted
                  ? 'ring-2 ring-blue-500 md:scale-105 bg-blue-50'
                  : 'bg-white'
              }`}
            >
              {/* Card Header */}
              <div className={`px-6 py-8 ${plan.highlighted ? 'bg-blue-500 text-white' : 'bg-gray-50'}`}>
                {plan.highlighted && (
                  <div className="text-sm font-semibold text-blue-100 mb-2">
                    Most Popular
                  </div>
                )}
                <h2 className="text-2xl font-bold">{plan.name}</h2>
                <p className={`text-sm mt-2 ${plan.highlighted ? 'text-blue-100' : 'text-gray-600'}`}>
                  {plan.description}
                </p>
              </div>

              {/* Pricing */}
              <div className="px-6 py-6 border-b">
                <div className="text-4xl font-bold text-gray-900">
                  ${plan.price}
                  <span className="text-lg font-normal text-gray-600">/month</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Billed monthly, cancel anytime
                </p>
              </div>

              {/* Features */}
              <div className="px-6 py-6">
                <ul className="space-y-4">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-green-500 mr-3 mt-0.5">✓</span>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA */}
              <div className="px-6 py-6 border-t">
                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={isLoading}
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition ${
                    plan.highlighted
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isLoading ? 'Processing...' : plan.cta}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ / Support */}
        <div className="mt-16 bg-white rounded-lg shadow p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            Frequently Asked Questions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Do you offer a free trial?
              </h4>
              <p className="text-gray-600">
                Yes! All plans include a 14-day free trial with full access to
                all features. No credit card required.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Can I cancel anytime?
              </h4>
              <p className="text-gray-600">
                Absolutely. You can cancel your subscription at any time from
                your billing settings. No questions asked.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Can I upgrade or downgrade?
              </h4>
              <p className="text-gray-600">
                Yes, you can change your plan at any time. Changes take effect
                on your next billing cycle.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                What payment methods do you accept?
              </h4>
              <p className="text-gray-600">
                We accept all major credit and debit cards through Stripe's
                secure payment processing.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default SubscribePage;
