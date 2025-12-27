import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import FocusTrap from 'focus-trap-react';
import Button from './ui/Button';
import client from '../api/client';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWelcomeComplete?: (userRole: string, welcomeCompleted: boolean) => void;
}

// Professional SVG Illustration
const WelcomeIllustration = () => (
  <svg
    viewBox="0 0 240 200"
    className="w-full h-32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Background circles - subtle gradient */}
    <circle cx="120" cy="100" r="80" fill="var(--color-primary)" opacity="0.08" />
    <circle cx="120" cy="100" r="60" fill="var(--color-primary)" opacity="0.05" />

    {/* People illustration - simplified geometric style */}
    {/* Person 1 - Left */}
    <ellipse cx="70" cy="80" rx="16" ry="18" fill="var(--color-primary)" />
    <path
      d="M 60 105 Q 70 115 75 130 M 60 105 L 50 125 M 75 105 L 85 125"
      stroke="var(--color-primary)"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* Person 2 - Center (prominent) */}
    <ellipse cx="120" cy="70" rx="18" ry="20" fill="var(--color-primary)" />
    <path
      d="M 108 95 Q 120 108 126 130 M 108 95 L 95 120 M 126 95 L 140 120"
      stroke="var(--color-primary)"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* Person 3 - Right */}
    <ellipse cx="170" cy="85" rx="16" ry="18" fill="var(--color-primary)" />
    <path
      d="M 160 110 Q 170 120 175 135 M 160 110 L 150 130 M 175 110 L 190 130"
      stroke="var(--color-primary)"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* Decorative elements - celebration */}
    <motion.circle
      cx="50"
      cy="50"
      r="4"
      fill="var(--color-primary)"
      opacity="0.6"
      animate={{ y: [-5, 5, -5], opacity: [0.3, 0.8, 0.3] }}
      transition={{ duration: 2, repeat: Infinity }}
    />
    <motion.circle
      cx="180"
      cy="45"
      r="4"
      fill="var(--color-primary)"
      opacity="0.6"
      animate={{ y: [5, -5, 5], opacity: [0.3, 0.8, 0.3] }}
      transition={{ duration: 2.5, repeat: Infinity }}
    />
    <motion.circle
      cx="120"
      cy="30"
      r="3"
      fill="var(--color-primary)"
      opacity="0.6"
      animate={{ y: [-8, 8, -8], opacity: [0.2, 0.7, 0.2] }}
      transition={{ duration: 3, repeat: Infinity }}
    />
  </svg>
);

export default function WelcomeModal({ isOpen, onClose, onWelcomeComplete }: WelcomeModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Complete welcome with default role
  const handleNext = async () => {
    setIsLoading(true);
    try {
      const response = await client.post('/auth/complete-welcome', {
        userRole: 'user',
      });

      if (response.data.success) {
        if (onWelcomeComplete) {
          onWelcomeComplete('user', true);
        }
        onClose();
      }
    } catch (error: any) {
      console.error('Failed to complete welcome:', error);
      // Close modal even if there's an error - don't block the user
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Escape key (WCAG 2.1.2 compliance)
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleNext();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, handleNext]);


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
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, type: 'tween' } as any,
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 backdrop-blur-md"
        >
          <FocusTrap
            focusTrapOptions={{
              escapeDeactivates: true,
              clickOutsideDeactivates: true,
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 30 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="bg-background border border-border/50 rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden"
              role="dialog"
              aria-modal="true"
              aria-labelledby="welcome-modal-title"
            >
            {/* Close Button */}
            <div className="absolute top-6 right-6 z-10">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNext}
                className="w-11 h-11 flex items-center justify-center hover:bg-muted rounded-lg transition-colors duration-200"
                aria-label="Close modal and proceed (Escape key also works)"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </motion.button>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 gap-0">
              {/* Welcome Section */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="bg-gradient-to-br from-primary/5 to-primary/[0.02] p-6 md:p-8 flex flex-col items-center text-center"
              >
                {/* Illustration */}
                <motion.div variants={itemVariants} className="mb-4">
                  <WelcomeIllustration />
                </motion.div>

                {/* Welcome Text */}
                <motion.div variants={itemVariants}>
                  <h1 id="welcome-modal-title" className="text-2xl md:text-3xl font-bold text-foreground mb-2 leading-tight">
                    Welcome to
                    <br />
                    <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                      Koinonia
                    </span>
                  </h1>
                </motion.div>

                <motion.p
                  variants={itemVariants}
                  className="text-sm text-muted-foreground leading-relaxed mb-6"
                >
                  Connect with your congregation. Send messages, manage groups, and build community.
                </motion.p>

                {/* Get Started Message */}
                <motion.div
                  variants={itemVariants}
                  className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6 max-w-sm"
                >
                  <p className="text-sm text-foreground">
                    You're all set! Let's get you started with Koinonia and connect with your congregation.
                  </p>
                </motion.div>

                {/* Next Button */}
                <motion.div variants={itemVariants}>
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleNext}
                    disabled={isLoading}
                    isLoading={isLoading}
                    className="bg-primary hover:bg-primary/90 text-background font-medium shadow-lg hover:shadow-xl transition-all px-8"
                  >
                    {isLoading ? 'Getting started...' : 'Next'}
                  </Button>
                </motion.div>
              </motion.div>
            </div>
            </motion.div>
          </FocusTrap>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
