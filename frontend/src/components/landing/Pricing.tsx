import { motion } from 'framer-motion';
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.6 },
    },
  };

  const handleStartTrial = () => {
    if (isAuthenticated) {
      navigate('/subscribe');
    } else {
      navigate('/register');
    }
  };

  return (
    <section id="pricing" className="relative py-20 px-4 sm:px-6 lg:px-8 bg-background overflow-hidden transition-colors duration-normal">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-0 right-1/3 w-96 h-96 bg-primary opacity-10 rounded-full blur-3xl"
          animate={{
            y: [0, -30, 0],
            x: [0, 20, 0],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-0 left-1/4 w-80 h-80 bg-primary opacity-15 rounded-full blur-3xl"
          animate={{
            y: [0, 25, 0],
            x: [0, -15, 0],
          }}
          transition={{
            duration: 11,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: '-100px' }}
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground dark:text-foreground mb-4 leading-tight tracking-tight">
            Simple, Transparent{' '}
            <motion.span
              className="bg-gradient-to-r from-primary to-primary bg-clip-text text-transparent inline-block"
              animate={{
                backgroundPosition: ['0%', '100%'],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
              style={{
                backgroundSize: '200% 200%',
              }}
            >
              Pricing
            </motion.span>
          </h2>
          <motion.p
            className="text-lg text-muted-foreground max-w-3xl mx-auto font-light leading-relaxed"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Choose the plan that fits your church. All plans include a 14-day free trial. No credit card required.
          </motion.p>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div
          className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className={`group relative transition-all duration-300 ${
                plan.highlight ? 'md:scale-105' : ''
              }`}
            >
              {/* Glow effect for highlighted card */}
              {plan.highlight && (
                <div className="absolute -inset-1 bg-gradient-to-r from-primary via-primary to-primary rounded-lg blur-2xl opacity-30 group-hover:opacity-50 transition duration-500 animate-pulse -z-10"></div>
              )}

              <div className={`relative bg-gradient-to-br rounded-lg p-8 border transition-all duration-300 overflow-hidden h-full ${
                plan.highlight
                  ? 'from-muted/60 to-muted/60 border-primary/50 shadow-2xl'
                  : 'from-muted/50 to-muted/50 border-border/50 hover:border-primary/50'
              }`}>
                {/* Background gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-muted/20 to-transparent pointer-events-none"></div>

                {/* Popular Badge */}
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-primary to-primary rounded-full text-background text-xs font-semibold">
                      <Zap className="w-3 h-3" />
                      Most Popular
                    </div>
                  </div>
                )}

                {/* Content */}
                <div className="relative z-10">
                  <div className="text-center mb-8 pt-4">
                    <h3 className="text-2xl font-semibold text-foreground dark:text-foreground mb-3">{plan.name}</h3>
                    <div className="mb-4">
                      <span className="text-5xl font-bold bg-gradient-to-r from-primary to-primary bg-clip-text text-transparent">{plan.price}</span>
                      <span className="text-muted-foreground text-sm">/month</span>
                    </div>
                    <p className="text-muted-foreground text-sm">{plan.description}</p>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    variant={plan.highlight ? 'primary' : 'outline'}
                    size="md"
                    onClick={handleStartTrial}
                    fullWidth
                    className={plan.highlight ? 'bg-gradient-to-r from-primary to-primary hover:from-primary hover:to-primary text-background' : ''}
                  >
                    {plan.ctaText}
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Additional Info */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <p className="text-muted-foreground mb-4 text-sm">
            All plans include: Secure messaging, message history, reply inbox, and mobile access
          </p>
          <p className="text-sm text-muted-foreground">
            Need a custom plan?{' '}
            <a href="mailto:support@koinoniasms.com" className="text-primary hover:text-primary/80 font-semibold transition-colors">
              Contact us
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
}


