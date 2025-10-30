import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';

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
    <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Simple, Transparent <span className="text-primary-600">Pricing</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose the plan that fits your church. All plans include a 14-day free trial. No credit card required.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white rounded-2xl border-2 p-8 transition-all duration-300 animate-slide-up ${
                plan.highlight
                  ? 'border-primary-500 shadow-large scale-105 md:scale-110'
                  : 'border-gray-200 hover:border-primary-300 shadow-soft hover:shadow-medium'
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Popular Badge */}
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-primary-600 to-primary-800 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <p className="text-gray-600">{plan.description}</p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start">
                    <svg
                      className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={handleStartTrial}
                className={`w-full py-3 rounded-lg font-semibold transition-all ${
                  plan.highlight
                    ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-medium hover:shadow-large hover:scale-105'
                    : 'bg-gray-100 text-gray-900 hover:bg-primary-600 hover:text-white'
                }`}
              >
                {plan.ctaText}
              </button>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            All plans include: Secure messaging, message history, reply inbox, and mobile access
          </p>
          <p className="text-sm text-gray-500">
            Need a custom plan? <a href="mailto:support@connect-yw.com" className="text-primary-600 hover:underline">Contact us</a>
          </p>
        </div>
      </div>
    </section>
  );
}

