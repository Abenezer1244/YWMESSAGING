import { motion } from 'framer-motion';
import { Users, MessageSquare, Clock, FileText, BarChart3, UserPlus } from 'lucide-react';
import Card from '../ui/Card';

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: <Users className="w-8 h-8" />,
    title: 'Multi-Branch Management',
    description: 'Manage 3-10 church locations from one unified dashboard. Coordinate messaging across all branches seamlessly.',
  },
  {
    icon: <MessageSquare className="w-8 h-8" />,
    title: 'SMS Messaging',
    description: 'Send messages to individuals, groups, entire branches, or your whole congregation. Support for one-way and two-way communication.',
  },
  {
    icon: <Clock className="w-8 h-8" />,
    title: 'Message Scheduling',
    description: 'Schedule messages in advance or set up recurring messages (daily, weekly, monthly). Send welcome messages automatically.',
  },
  {
    icon: <FileText className="w-8 h-8" />,
    title: 'Message Templates',
    description: 'Save time with pre-built and custom message templates. Maintain consistent communication while personalizing your messages.',
  },
  {
    icon: <BarChart3 className="w-8 h-8" />,
    title: 'Analytics & Insights',
    description: 'Track delivery rates, reply rates, and engagement metrics. Understand your congregation\'s communication patterns with detailed analytics.',
  },
  {
    icon: <UserPlus className="w-8 h-8" />,
    title: 'Member Management',
    description: 'Import members via CSV, organize by groups and tags, and maintain detailed member profiles. Segment your congregation for targeted messaging.',
  },
];

export default function Features() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <section id="features" className="relative py-20 px-4 sm:px-6 lg:px-8 bg-slate-950 overflow-hidden transition-colors duration-normal">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-1/4 w-80 h-80 bg-accent-400 opacity-10 rounded-full blur-3xl"
          animate={{
            y: [0, -30, 0],
            x: [0, 15, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-20 right-1/4 w-96 h-96 bg-accent-500 opacity-15 rounded-full blur-3xl"
          animate={{
            y: [0, 20, 0],
            x: [0, -20, 0],
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
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight tracking-tight">
            Everything You Need to{' '}
            <motion.span
              className="bg-gradient-to-r from-accent-400 to-accent-500 bg-clip-text text-transparent inline-block"
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
              Stay Connected
            </motion.span>
          </h2>
          <motion.p
            className="text-lg text-slate-300 max-w-3xl mx-auto font-light leading-relaxed"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Powerful features designed specifically for churches managing multiple locations and hundreds of members.
          </motion.p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
            >
              <Card
                variant="default"
                className="group relative p-8 bg-slate-900/50 border border-slate-700/50 hover:border-accent-400/50 backdrop-blur-xl rounded-lg overflow-hidden h-full"
              >
                <motion.div
                  whileHover={{
                    scale: 1.02,
                    backgroundColor: 'rgba(15, 23, 42, 0.8)',
                    borderColor: 'rgba(234, 179, 8, 0.5)',
                  }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 rounded-lg"
                />

                {/* Animated Glow effect on hover */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-accent-500/0 via-accent-400/0 to-accent-300/0 group-hover:from-accent-500/5 group-hover:via-accent-400/5 group-hover:to-accent-300/5 rounded-lg pointer-events-none"
                  animate={{
                    opacity: [0, 0.3, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: index * 0.3,
                  }}
                />

                {/* Content */}
                <motion.div
                  className="relative z-10"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.1 + 0.2 }}
                  viewport={{ once: true }}
                >
                  <motion.div
                    className="w-12 h-12 bg-accent-500 text-slate-950 rounded-lg flex items-center justify-center mb-5 group-hover:shadow-lg group-hover:shadow-accent-500/50"
                    whileHover={{
                      scale: 1.15,
                      rotate: [0, -10, 10, -5, 5, 0],
                    }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    {feature.icon}
                  </motion.div>
                  <h3 className="text-lg font-semibold text-white mb-3">{feature.title}</h3>
                  <p className="text-slate-300 text-sm leading-relaxed">{feature.description}</p>
                </motion.div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

