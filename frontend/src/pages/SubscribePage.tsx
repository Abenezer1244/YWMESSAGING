import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { subscribe } from '../api/billing';
import BackButton from '../components/BackButton';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

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
    <div className="min-h-screen bg-white dark:bg-slate-950 p-6 transition-colors duration-normal">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">Choose Your Plan</h1>
          <p className="text-slate-700 dark:text-slate-300">
            Start with a 14-day free trial. No credit card required.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PLANS.map((plan) => (
            <Card
              key={plan.id}
              variant="default"
              className={`overflow-hidden transform transition hover:shadow-lg border ${
                plan.highlighted
                  ? 'ring-2 ring-accent-500 md:scale-105 border-accent-500 bg-slate-50 dark:bg-slate-900 border-accent-500'
                  : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50'
              }`}
            >
              {/* Card Header */}
              <div className={`-m-6 mb-6 px-6 py-8 ${plan.highlighted ? 'bg-accent-500/20' : 'bg-slate-100 dark:bg-slate-800/50'}`}>
                {plan.highlighted && (
                  <div className="text-sm font-semibold text-accent-400 mb-2">
                    ⭐ Most Popular
                  </div>
                )}
                <h2 className={`text-2xl font-bold text-slate-900 dark:text-white`}>{plan.name}</h2>
                <p className={`text-sm mt-2 ${plan.highlighted ? 'text-accent-300' : 'text-slate-700 dark:text-slate-300'}`}>
                  {plan.description}
                </p>
              </div>

              {/* Pricing */}
              <div className="pb-6 mb-6 border-b border-slate-300 dark:border-slate-700">
                <div className="text-4xl font-bold text-slate-900 dark:text-white">
                  ${plan.price}
                  <span className="text-lg font-normal text-slate-600 dark:text-slate-400">/month</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                  Billed monthly, cancel anytime
                </p>
              </div>

              {/* Features */}
              <div className="mb-6 flex-grow">
                <ul className="space-y-4">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-green-400 mr-3 mt-0.5">✓</span>
                      <span className="text-slate-700 dark:text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA */}
              <div className="pt-6 border-t border-slate-300 dark:border-slate-700">
                <Button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={isLoading}
                  variant={plan.highlighted ? 'primary' : 'secondary'}
                  size="md"
                  fullWidth
                >
                  {isLoading ? 'Processing...' : plan.cta}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* FAQ / Support */}
        <Card variant="default" className="mt-16 border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
            ❓ Frequently Asked Questions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                Do you offer a free trial?
              </h4>
              <p className="text-slate-700 dark:text-slate-300">
                Yes! All plans include a 14-day free trial with full access to
                all features. No credit card required.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                Can I cancel anytime?
              </h4>
              <p className="text-slate-700 dark:text-slate-300">
                Absolutely. You can cancel your subscription at any time from
                your billing settings. No questions asked.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                Can I upgrade or downgrade?
              </h4>
              <p className="text-slate-700 dark:text-slate-300">
                Yes, you can change your plan at any time. Changes take effect
                on your next billing cycle.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                What payment methods do you accept?
              </h4>
              <p className="text-slate-700 dark:text-slate-300">
                We accept all major credit and debit cards through Stripe's
                secure payment processing.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default SubscribePage;
