import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Zap, Smartphone, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import useAuthStore from '../../stores/authStore';
import Button from '../ui/Button';

export default function Hero() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const handleStartTrial = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };

  const handleLearnMore = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 },
    },
  };

  const floatingVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.6 },
    },
  };

  return (
    <section className="relative min-h-screen flex items-center px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 overflow-hidden pt-24">
      {/* Animated background elements with floating motion */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 right-10 w-96 h-96 bg-accent-500 opacity-15 rounded-full blur-3xl"
          animate={{
            y: [0, 20, 0],
            x: [0, 10, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-80 h-80 bg-accent-400 opacity-10 rounded-full blur-3xl"
          animate={{
            y: [0, -15, 0],
            x: [0, -10, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute top-1/2 right-1/4 w-64 h-64 bg-primary-700 opacity-10 rounded-full blur-3xl"
          animate={{
            y: [0, 25, 0],
            x: [0, 15, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      <div className="relative max-w-4xl mx-auto w-full">
        <div className="w-full">
          {/* Content */}
          <motion.div
            className="text-center space-y-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Modern Badge */}
            <motion.div variants={floatingVariants} className="flex justify-center">
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-2 bg-accent-500/15 border border-accent-400/50 rounded-full text-sm font-medium text-accent-100 backdrop-blur-sm hover:bg-accent-500/25 transition-colors duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className="w-2 h-2 bg-gradient-to-r from-accent-400 to-accent-500 rounded-full"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [1, 0.6, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                />
                <span>Trusted by 100+ churches nationwide</span>
              </motion.div>
            </motion.div>

            {/* Main Headline - Gradient Text Effect */}
            <motion.div variants={itemVariants} className="space-y-4">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight tracking-tight">
                <motion.span
                  className="text-white inline-block"
                  animate={{
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                  }}
                >
                  Connect Your
                </motion.span>
                <br />
                <motion.span
                  className="bg-gradient-to-r from-accent-300 via-accent-500 to-primary-400 bg-clip-text text-transparent inline-block"
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
                  Church Community
                </motion.span>
              </h1>
            </motion.div>

            {/* Subheading - Modern typography */}
            <motion.p
              variants={itemVariants}
              className="text-xl sm:text-2xl text-primary-100/90 max-w-sm leading-relaxed font-light mx-auto"
            >
              Enterprise SMS communication platform built for churches. Strengthen community engagement, manage multiple locations, and communicate with confidence.
            </motion.p>

            {/* Modern CTA Buttons */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-3 pt-4 justify-center"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="md"
                  onClick={handleStartTrial}
                  className="bg-gradient-to-r from-accent-400 to-accent-500 hover:from-accent-300 hover:to-accent-400 text-primary-900 font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 group"
                >
                  <span>Start Free Trial</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  size="md"
                  onClick={handleLearnMore}
                  className="border-2 border-accent-400/50 text-primary-100 hover:bg-primary-700/30 hover:border-accent-400 font-semibold rounded-lg backdrop-blur-sm transition-all duration-300"
                >
                  Learn More
                </Button>
              </motion.div>
            </motion.div>

            {/* Trust Indicators - Modern Grid */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6"
            >
              {[
                { icon: CheckCircle2, text: 'No credit card needed' },
                { icon: Zap, text: 'Setup in 5 minutes' },
                { icon: Smartphone, text: 'Mobile access included' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  className="flex items-center gap-3 p-3 bg-primary-700/20 rounded-lg border border-accent-400/30 backdrop-blur-sm hover:bg-primary-700/40 transition-colors duration-300"
                  whileHover={{
                    scale: 1.05,
                    backgroundColor: 'rgba(55, 65, 81, 0.5)',
                  }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <motion.div
                    animate={{
                      rotate: [0, 10, -10, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.3,
                    }}
                  >
                    <item.icon className="w-5 h-5 text-accent-400 flex-shrink-0" />
                  </motion.div>
                  <span className="text-sm text-primary-100">{item.text}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom Scrolling Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center"
          animate={{
            y: [0, 10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        >
          <div className="flex flex-col items-center gap-2 text-blue-300">
            <span className="text-sm font-medium">Scroll to explore</span>
            <svg className="w-6 h-6 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

