import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';
import Card from '../ui/Card';

interface Testimonial {
  name: string;
  role: string;
  church: string;
  content: string;
  avatar?: string;
}

const testimonials: Testimonial[] = [
  {
    name: 'Pastor Michael Thompson',
    role: 'Senior Pastor',
    church: 'Grace Community Church',
    content: 'Connect has transformed how we communicate with our congregation. Managing messages across our 5 locations is now seamless, and our members love the personal touch.',
  },
  {
    name: 'Sarah Johnson',
    role: 'Church Administrator',
    church: 'First Baptist Church',
    content: 'The analytics dashboard gives us incredible insights into engagement. We\'ve seen a 40% increase in member participation since using scheduled messages and templates.',
  },
  {
    name: 'Rev. David Martinez',
    role: 'Lead Pastor',
    church: 'Hope Chapel Ministries',
    content: 'The recurring message feature is a game-changer. Birthday messages, weekly reminders, and welcome messages all happen automatically. It\'s like having an extra staff member!',
  },
];

export default function Testimonials() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50, rotateX: -20 },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: { duration: 0.7 },
    },
  };

  return (
    <section id="testimonials" className="relative py-20 px-4 sm:px-6 lg:px-8 bg-slate-950 overflow-hidden transition-colors duration-normal">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/3 right-0 w-96 h-96 bg-accent-500 opacity-10 rounded-full blur-3xl"
          animate={{
            y: [0, 40, 0],
            x: [0, 30, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-0 left-1/4 w-80 h-80 bg-accent-400 opacity-15 rounded-full blur-3xl"
          animate={{
            y: [0, -35, 0],
            x: [0, -20, 0],
          }}
          transition={{
            duration: 13,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.7,
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
            Trusted by{' '}
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
              Church Leaders
            </motion.span>
          </h2>
          <motion.p
            className="text-lg text-slate-300 max-w-3xl mx-auto font-light leading-relaxed"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            See how churches across the country are using Connect to strengthen their communities.
          </motion.p>
        </motion.div>

        {/* Testimonials Grid */}
        <motion.div
          className="grid md:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
            >
              <Card
                variant="default"
                className="group relative p-8 bg-slate-900/50 border border-slate-700/50 hover:border-accent-400/50 backdrop-blur-xl rounded-lg transition-all duration-300 overflow-hidden h-full"
              >
              {/* Glow effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-accent-500/0 via-accent-400/0 to-accent-300/0 group-hover:from-accent-500/5 group-hover:via-accent-400/5 group-hover:to-accent-300/5 transition-all duration-300 pointer-events-none"></div>

              {/* Content */}
              <div className="relative z-10">
                {/* Quote Icon */}
                <motion.div
                  className="mb-6"
                  animate={{
                    y: [0, -5, 0],
                    rotate: [0, 5, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: index * 0.3,
                  }}
                >
                  <Quote className="w-10 h-10 text-accent-400 opacity-70" />
                </motion.div>

                {/* Testimonial Content */}
                <p className="text-slate-100 mb-6 leading-relaxed italic text-sm">
                  "{testimonial.content}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-accent-500 rounded-full flex items-center justify-center text-slate-950 font-semibold text-base flex-shrink-0">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-white text-sm">{testimonial.name}</div>
                    <div className="text-xs text-slate-400">
                      {testimonial.role}, {testimonial.church}
                    </div>
                  </div>
                </div>
              </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          className="mt-16 pt-12 border-t border-accent-500/30"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <motion.div
                className="text-4xl font-bold bg-gradient-to-r from-accent-400 to-accent-500 bg-clip-text text-transparent mb-2"
                animate={{
                  y: [0, -3, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              >
                100+
              </motion.div>
              <div className="text-slate-300 text-sm">Churches</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <motion.div
                className="text-4xl font-bold bg-gradient-to-r from-accent-400 to-accent-500 bg-clip-text text-transparent mb-2"
                animate={{
                  y: [0, -3, 0],
                }}
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                }}
              >
                25K+
              </motion.div>
              <div className="text-slate-300 text-sm">Members</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <motion.div
                className="text-4xl font-bold bg-gradient-to-r from-accent-400 to-accent-500 bg-clip-text text-transparent mb-2"
                animate={{
                  y: [0, -3, 0],
                }}
                transition={{
                  duration: 2.4,
                  repeat: Infinity,
                }}
              >
                500K+
              </motion.div>
              <div className="text-slate-300 text-sm">Messages Sent</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              viewport={{ once: true }}
            >
              <motion.div
                className="text-4xl font-bold bg-gradient-to-r from-accent-400 to-accent-500 bg-clip-text text-transparent mb-2"
                animate={{
                  y: [0, -3, 0],
                }}
                transition={{
                  duration: 2.6,
                  repeat: Infinity,
                }}
              >
                99.9%
              </motion.div>
              <div className="text-slate-300 text-sm">Uptime</div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

