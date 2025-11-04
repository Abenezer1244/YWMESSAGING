import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

interface ComparisonFeature {
  name: string;
  connect: boolean;
  competitors: {
    name: string;
    value: boolean;
  }[];
  unique?: boolean;
}

const features: ComparisonFeature[] = [
  {
    name: 'SMS Messaging',
    connect: true,
    competitors: [
      { name: 'Twilio', value: true },
      { name: 'Pushpay', value: true },
      { name: 'Planning Center', value: false },
    ],
  },
  {
    name: 'Phone Encryption (E2E)',
    connect: true,
    competitors: [
      { name: 'Twilio', value: false },
      { name: 'Pushpay', value: false },
      { name: 'Planning Center', value: false },
    ],
    unique: true,
  },
  {
    name: 'Message Templates',
    connect: true,
    competitors: [
      { name: 'Twilio', value: false },
      { name: 'Pushpay', value: true },
      { name: 'Planning Center', value: true },
    ],
  },
  {
    name: 'Recurring Messages',
    connect: true,
    competitors: [
      { name: 'Twilio', value: false },
      { name: 'Pushpay', value: true },
      { name: 'Planning Center', value: true },
    ],
  },
  {
    name: 'Multi-Location Support',
    connect: true,
    competitors: [
      { name: 'Twilio', value: false },
      { name: 'Pushpay', value: true },
      { name: 'Planning Center', value: true },
    ],
  },
  {
    name: 'Security Logging',
    connect: true,
    competitors: [
      { name: 'Twilio', value: false },
      { name: 'Pushpay', value: false },
      { name: 'Planning Center', value: true },
    ],
    unique: true,
  },
  {
    name: 'CSRF Protection',
    connect: true,
    competitors: [
      { name: 'Twilio', value: false },
      { name: 'Pushpay', value: false },
      { name: 'Planning Center', value: false },
    ],
    unique: true,
  },
  {
    name: 'Church-Specific Design',
    connect: true,
    competitors: [
      { name: 'Twilio', value: false },
      { name: 'Pushpay', value: true },
      { name: 'Planning Center', value: true },
    ],
  },
  {
    name: 'Analytics Dashboard',
    connect: true,
    competitors: [
      { name: 'Twilio', value: true },
      { name: 'Pushpay', value: true },
      { name: 'Planning Center', value: true },
    ],
  },
  {
    name: 'Affordable Pricing',
    connect: true,
    competitors: [
      { name: 'Twilio', value: true },
      { name: 'Pushpay', value: false },
      { name: 'Planning Center', value: false },
    ],
    unique: true,
  },
];

export default function Comparison() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.2,
      },
    },
  };

  const rowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <section id="comparison" className="relative py-20 px-4 sm:px-6 lg:px-8 bg-background overflow-hidden transition-colors duration-normal">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/2 -left-32 w-96 h-96 bg-primary opacity-10 rounded-full blur-3xl"
          animate={{
            y: [0, 40, 0],
            x: [0, -20, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-1/4 -right-32 w-96 h-96 bg-primary opacity-15 rounded-full blur-3xl"
          animate={{
            y: [0, -40, 0],
            x: [0, 20, 0],
          }}
          transition={{
            duration: 10,
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
          <div className="inline-block mb-4">
            <motion.div
              className="px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-primary/20 border border-primary/30"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <span className="text-sm font-semibold text-primary">WHY CHOOSE CONNECT</span>
            </motion.div>
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight tracking-tight">
            See How We{' '}
            <motion.span
              className="bg-gradient-to-r from-primary via-primary to-primary bg-clip-text text-transparent inline-block"
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
              Compare
            </motion.span>
          </h2>

          <motion.p
            className="text-lg text-muted-foreground max-w-3xl mx-auto font-light leading-relaxed"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Purpose-built for churches with enterprise security features at affordable prices
          </motion.p>
        </motion.div>

        {/* Comparison Table */}
        <motion.div
          className="relative overflow-x-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true, margin: '-100px' }}
        >
          <div className="bg-gradient-to-br from-muted/50 to-muted/30 rounded-lg border border-border/50 overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-5 gap-4 p-6 border-b border-border/50 bg-gradient-to-r from-primary/5 via-transparent to-primary/5">
              <div className="text-left">
                <h3 className="font-semibold text-foreground text-sm">Feature</h3>
              </div>
              <div className="text-center">
                <div className="inline-block">
                  <motion.div
                    className="px-3 py-1 rounded-lg bg-gradient-to-r from-primary to-primary text-background text-xs font-bold"
                    animate={{
                      scale: [1, 1.05, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                  >
                    CONNECT
                  </motion.div>
                </div>
              </div>
              <div className="text-center">
                <h4 className="font-semibold text-foreground text-xs">Twilio</h4>
              </div>
              <div className="text-center">
                <h4 className="font-semibold text-foreground text-xs">Pushpay</h4>
              </div>
              <div className="text-center">
                <h4 className="font-semibold text-foreground text-xs">Planning Center</h4>
              </div>
            </div>

            {/* Table Rows */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
            >
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  variants={rowVariants}
                  className={`grid grid-cols-5 gap-4 p-6 border-b border-border/30 hover:bg-primary/5 transition-colors duration-300 ${
                    feature.unique ? 'bg-primary/5' : index % 2 === 0 ? 'bg-muted/20' : ''
                  }`}
                >
                  {/* Feature Name */}
                  <div className="flex items-center gap-2">
                    <span className="text-foreground font-medium text-sm">{feature.name}</span>
                    {feature.unique && (
                      <motion.span
                        className="px-2 py-0.5 rounded-full text-xs font-semibold bg-primary/20 text-primary"
                        animate={{
                          scale: [1, 1.05, 1],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: index * 0.1,
                        }}
                      >
                        Unique
                      </motion.span>
                    )}
                  </div>

                  {/* Connect */}
                  <motion.div
                    className="flex items-center justify-center"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.2 }}
                  >
                    {feature.connect ? (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        whileInView={{ scale: 1, rotate: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.05 }}
                        viewport={{ once: true }}
                      >
                        <Check className="w-5 h-5 text-primary font-bold" strokeWidth={3} />
                      </motion.div>
                    ) : (
                      <X className="w-5 h-5 text-muted-foreground/30" />
                    )}
                  </motion.div>

                  {/* Competitors */}
                  {feature.competitors.map((competitor, compIndex) => (
                    <motion.div
                      key={compIndex}
                      className="flex items-center justify-center"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.2 }}
                    >
                      {competitor.value ? (
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          whileInView={{ scale: 1, rotate: 0 }}
                          transition={{ duration: 0.4, delay: index * 0.05 }}
                          viewport={{ once: true }}
                        >
                          <Check className="w-5 h-5 text-muted-foreground/50 font-bold" strokeWidth={3} />
                        </motion.div>
                      ) : (
                        <X className="w-5 h-5 text-muted-foreground/20" />
                      )}
                    </motion.div>
                  ))}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Unique Features Highlight */}
        <motion.div
          className="mt-16 grid md:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
        >
          {[
            {
              title: 'End-to-End Encryption',
              description: 'Phone numbers encrypted with AES-256-GCM, searchable with HMAC-SHA256',
              icon: '🔐',
            },
            {
              title: 'Enterprise Security',
              description: 'CSRF protection, rate limiting, security event logging, and full audit trails',
              icon: '🛡️',
            },
            {
              title: 'Church-First Design',
              description: 'Built specifically for churches with affordable pricing and 14-day free trial',
              icon: '⛪',
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              className="group relative"
              whileHover={{ y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>

              <div className="p-6 rounded-lg border border-border/50 bg-gradient-to-br from-muted/50 to-muted/30 hover:border-primary/30 transition-all duration-300">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
