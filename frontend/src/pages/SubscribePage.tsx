import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { subscribe } from '../api/billing';
import BackButton from '../components/BackButton';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { Phone, MessageSquare, BarChart3, Zap, Shield, Users } from 'lucide-react';

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
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');

  const ANNUAL_DISCOUNT = 0.15; // 15% discount for annual billing

  const getPrice = (monthlyPrice: number) => {
    if (billingPeriod === 'annual') {
      return Math.round(monthlyPrice * 12 * (1 - ANNUAL_DISCOUNT));
    }
    return monthlyPrice;
  };

  const handleSubscribe = async (planId: string) => {
    try {
      setIsLoading(true);
      // Navigate to checkout page with plan parameter
      navigate(`/checkout?plan=${planId}&billing=${billingPeriod}`);
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

        {/* Billing Period Toggle */}
        <div className="mb-12 flex items-center justify-center gap-6">
          <button
            onClick={() => setBillingPeriod('monthly')}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
              billingPeriod === 'monthly'
                ? 'bg-primary text-background'
                : 'bg-muted text-foreground border border-border hover:border-primary/50'
            }`}
          >
            Monthly Billing
          </button>
          <div className="relative">
            <button
              onClick={() => setBillingPeriod('annual')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                billingPeriod === 'annual'
                  ? 'bg-primary text-background'
                  : 'bg-muted text-foreground border border-border hover:border-primary/50'
              }`}
            >
              Annual Billing
            </button>
            {billingPeriod === 'annual' && (
              <div className="absolute -top-3 -right-3 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                Save 15%
              </div>
            )}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {PLANS.map((plan, idx) => (
            <div
              key={plan.id}
              className={`relative group transition-all duration-300 ${
                plan.highlighted ? 'md:scale-105' : ''
              }`}
            >
              {/* Glow effect for highlighted card */}
              {plan.highlighted && (
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-primary/50 rounded-2xl blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
              )}

              <Card
                variant="default"
                className={`relative overflow-hidden transform transition-all duration-300 hover:shadow-xl border h-full ${
                  plan.highlighted
                    ? 'ring-2 ring-primary border-primary bg-gradient-to-br from-muted to-muted/50'
                    : 'border-border bg-muted/30 hover:border-primary/50'
                }`}
              >
                {/* Most Popular Badge */}
                {plan.highlighted && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-primary to-primary/80 text-white px-4 py-1 text-sm font-semibold rounded-bl-lg">
                    ⭐ Most Popular
                  </div>
                )}

                {/* Card Header */}
                <div className={`px-6 py-8 ${plan.highlighted ? 'bg-gradient-to-br from-primary/10 to-primary/5' : 'bg-gradient-to-br from-muted/50 to-transparent'}`}>
                  <h2 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h2>
                  <p className={`text-sm ${plan.highlighted ? 'text-primary/90' : 'text-foreground/70'}`}>
                    {plan.description}
                  </p>
                </div>

                {/* Pricing */}
                <div className="px-6 pt-6 pb-6 border-b border-border/40">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/70">
                      ${getPrice(plan.price)}
                    </span>
                    <span className="text-muted-foreground font-medium">
                      {billingPeriod === 'annual' ? '/year' : '/month'}
                    </span>
                  </div>
                  {billingPeriod === 'annual' && (
                    <p className="text-xs text-green-500 mt-2 font-medium">
                      Save ${(plan.price * 12 * ANNUAL_DISCOUNT).toFixed(0)}/year
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-3">
                    {billingPeriod === 'annual' ? 'Billed annually' : 'Billed monthly'} • Cancel anytime
                  </p>
                </div>

                {/* Features */}
                <div className="px-6 py-6 flex-grow">
                  <ul className="space-y-3.5">
                    {plan.features.map((feature, featureIdx) => (
                      <li key={featureIdx} className="flex items-start gap-3 group/item">
                        <div className="flex-shrink-0 mt-0.5">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                            plan.highlighted
                              ? 'bg-primary/20 text-primary'
                              : 'bg-primary/10 text-primary/70'
                          }`}>
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                        <span className="text-sm text-foreground/85 leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA Button */}
                <div className="px-6 py-6 border-t border-border/40 mt-auto">
                  <Button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={isLoading}
                    variant={plan.highlighted ? 'primary' : 'secondary'}
                    size="md"
                    fullWidth
                    className={`transition-all duration-300 ${
                      plan.highlighted
                        ? 'hover:shadow-lg hover:shadow-primary/30'
                        : 'hover:border-primary/50'
                    }`}
                  >
                    {isLoading ? 'Processing...' : plan.cta}
                  </Button>
                </div>
              </Card>
            </div>
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
