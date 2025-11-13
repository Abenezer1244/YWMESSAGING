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
    description: 'Perfect for small churches and organizations',
    features: [
      '1 dedicated phone number',
      'Up to 1,000 SMS/month',
      'Up to 500 members',
      'Up to 1 branch',
      'Basic analytics',
      'Message templates',
      'Email support',
      '1 co-admin',
    ],
    cta: 'Get Started',
    highlighted: false,
  },
  {
    id: 'growth',
    name: 'Growth',
    price: 79,
    description: 'For growing organizations with more messaging needs',
    features: [
      '3 dedicated phone numbers',
      'Up to 10,000 SMS/month',
      'Up to 2,000 members',
      'Up to 5 branches',
      'Advanced analytics & insights',
      'Message templates & scheduling',
      'Recurring messages',
      'Priority support',
      '3 co-admins',
      'Bulk messaging',
    ],
    cta: 'Get Started',
    highlighted: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 129,
    description: 'For large organizations with unlimited reach',
    features: [
      'Unlimited dedicated phone numbers',
      'Unlimited SMS/month',
      'Unlimited members',
      'Up to 10 branches',
      'Real-time delivery tracking',
      'Advanced analytics & reporting',
      'Message templates & scheduling',
      'Recurring messages & auto-replies',
      'Premium 24/7 support',
      'Custom integrations & API access',
      '5 co-admins',
      'Bulk messaging & segmentation',
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
    <div className="min-h-screen bg-background p-6 transition-colors duration-normal">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-2">Choose Your Plan</h1>
          <p className="text-muted-foreground">
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
                  ? 'ring-2 ring-primary md:scale-105 border-primary bg-muted'
                  : 'border-border bg-muted'
              }`}
            >
              {/* Card Header */}
              <div className={`-m-6 mb-6 px-6 py-8 ${plan.highlighted ? 'bg-primary/10' : 'bg-muted'}`}>
                {plan.highlighted && (
                  <div className="text-sm font-semibold text-primary mb-2">
                    ⭐ Most Popular
                  </div>
                )}
                <h2 className={`text-2xl font-bold text-foreground`}>{plan.name}</h2>
                <p className={`text-sm mt-2 ${plan.highlighted ? 'text-primary' : 'text-foreground/80'}`}>
                  {plan.description}
                </p>
              </div>

              {/* Pricing */}
              <div className="pb-6 mb-6 border-b border-border">
                <div className="text-4xl font-bold text-foreground">
                  ${plan.price}
                  <span className="text-lg font-normal text-muted-foreground">/month</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Billed monthly, cancel anytime
                </p>
              </div>

              {/* Features */}
              <div className="mb-6 flex-grow">
                <ul className="space-y-4">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-green-400 mr-3 mt-0.5">✓</span>
                      <span className="text-foreground/80">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA */}
              <div className="pt-6 border-t border-border">
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
        <Card variant="default" className="mt-16 border border-border bg-muted">
          <h3 className="text-2xl font-bold text-foreground mb-6">
            ❓ Frequently Asked Questions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-foreground mb-2">
                Do you offer a free trial?
              </h4>
              <p className="text-muted-foreground">
                Yes! All plans include a 14-day free trial with full access to
                all features. No credit card required.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">
                Can I cancel anytime?
              </h4>
              <p className="text-muted-foreground">
                Absolutely. You can cancel your subscription at any time from
                your billing settings. No questions asked.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">
                Can I upgrade or downgrade?
              </h4>
              <p className="text-muted-foreground">
                Yes, you can change your plan at any time. Changes take effect
                on your next billing cycle.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">
                What payment methods do you accept?
              </h4>
              <p className="text-muted-foreground">
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
