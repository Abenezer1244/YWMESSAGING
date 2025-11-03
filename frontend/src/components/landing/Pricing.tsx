import { useNavigate } from 'react-router-dom';
import { Check, Zap } from 'lucide-react';
import useAuthStore from '../../stores/authStore';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

interface PricingPlan {
  name: string;
  price: string;
  description: string;
  features: string[];
  highlight?: boolean;
  ctaText: string;
}

const plans: PricingPlan[] = [
  {
    name: 'Starter',
    price: '$49',
    description: 'Perfect for smaller churches getting started',
    features: [
      'Up to 3 branches',
      'Up to 150 members',
      '1,000 messages/month',
      'Basic templates',
      'Email support',
      '14-day free trial',
    ],
    ctaText: 'Start Free Trial',
  },
  {
    name: 'Growth',
    price: '$79',
    description: 'Best for growing multi-location churches',
    features: [
      'Up to 6 branches',
      'Up to 250 members',
      '5,000 messages/month',
      'All templates & scheduling',
      'Recurring messages',
      'Priority support',
      '14-day free trial',
    ],
    highlight: true,
    ctaText: 'Start Free Trial',
  },
  {
    name: 'Pro',
    price: '$99',
    description: 'For established churches with advanced needs',
    features: [
      'Up to 10 branches',
      'Unlimited members',
      '15,000 messages/month',
      'Advanced analytics',
      'Co-admin support (3 admins)',
      'Custom integrations',
      '24/7 priority support',
      '14-day free trial',
    ],
    ctaText: 'Start Free Trial',
  },
];

export default function Pricing() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const handleStartTrial = () => {
    if (isAuthenticated) {
      navigate('/subscribe');
    } else {
      navigate('/register');
    }
  };

  return (
    <section id="pricing" className="relative py-20 px-4 sm:px-6 lg:px-8 bg-slate-950 overflow-hidden transition-colors duration-normal">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/3 w-96 h-96 bg-accent-500 opacity-10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-accent-400 opacity-15 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fadeIn">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight tracking-tight">
            Simple, Transparent{' '}
            <span className="bg-gradient-to-r from-accent-400 to-accent-500 bg-clip-text text-transparent">Pricing</span>
          </h2>
          <p className="text-lg text-slate-300 max-w-3xl mx-auto font-light leading-relaxed">
            Choose the plan that fits your church. All plans include a 14-day free trial. No credit card required.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`group relative animate-slideUp transition-all duration-300 ${
                plan.highlight ? 'md:scale-105' : ''
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Glow effect for highlighted card */}
              {plan.highlight && (
                <div className="absolute -inset-1 bg-gradient-to-r from-accent-500 via-accent-400 to-accent-300 rounded-lg blur-2xl opacity-30 group-hover:opacity-50 transition duration-500 animate-pulse -z-10"></div>
              )}

              <div className={`relative bg-gradient-to-br rounded-lg p-8 border transition-all duration-300 overflow-hidden h-full ${
                plan.highlight
                  ? 'from-slate-800/60 to-slate-900/60 border-accent-400/50 shadow-2xl'
                  : 'from-slate-900/50 to-slate-950/50 border-slate-700/50 hover:border-accent-400/50'
              }`}>
                {/* Background gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent pointer-events-none"></div>

                {/* Popular Badge */}
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-accent-500 to-accent-400 rounded-full text-slate-950 text-xs font-semibold">
                      <Zap className="w-3 h-3" />
                      Most Popular
                    </div>
                  </div>
                )}

                {/* Content */}
                <div className="relative z-10">
                  <div className="text-center mb-8 pt-4">
                    <h3 className="text-2xl font-semibold text-white mb-3">{plan.name}</h3>
                    <div className="mb-4">
                      <span className="text-5xl font-bold bg-gradient-to-r from-accent-400 to-accent-500 bg-clip-text text-transparent">{plan.price}</span>
                      <span className="text-slate-300 text-sm">/month</span>
                    </div>
                    <p className="text-slate-300 text-sm">{plan.description}</p>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-accent-500 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-300 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    variant={plan.highlight ? 'primary' : 'outline'}
                    size="md"
                    onClick={handleStartTrial}
                    fullWidth
                    className={plan.highlight ? 'bg-gradient-to-r from-accent-500 to-accent-400 hover:from-accent-400 hover:to-accent-300 text-slate-950' : ''}
                  >
                    {plan.ctaText}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center">
          <p className="text-slate-300 mb-4 text-sm">
            All plans include: Secure messaging, message history, reply inbox, and mobile access
          </p>
          <p className="text-sm text-slate-300">
            Need a custom plan?{' '}
            <a href="mailto:support@connect.com" className="text-accent-400 hover:text-accent-300 font-semibold transition-colors">
              Contact us
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}

