import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import toast from 'react-hot-toast';
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
    className="w-full h-48"
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
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const roles = [
    {
      id: 'pastor',
      label: 'Pastor / Lead Minister',
      description: 'Lead your congregation spiritually',
      icon: '⛪',
    },
    {
      id: 'admin',
      label: 'Church Administrator',
      description: 'Manage operations and logistics',
      icon: '📋',
    },
    {
      id: 'communications',
      label: 'Communications Lead',
      description: 'Handle messaging and outreach',
      icon: '📢',
    },
    {
      id: 'volunteer',
      label: 'Volunteer Coordinator',
      description: 'Coordinate volunteer activities',
      icon: '👥',
    },
    {
      id: 'other',
      label: 'Other',
      description: 'Something else',
      icon: '⭐',
    },
  ];

  const handleNext = async () => {
    if (!selectedRole) return;

    setIsLoading(true);
    try {
      // Call backend to complete welcome
      const response = await client.post('/auth/complete-welcome', {
        userRole: selectedRole,
      });

      if (response.data.success) {
        toast.success('Welcome complete! Let\'s get started.');

        // Notify parent component to update auth state
        if (onWelcomeComplete) {
          onWelcomeComplete(selectedRole, true);
        }

        onClose();
      }
    } catch (error: any) {
      console.error('Failed to complete welcome:', error);
      toast.error('Failed to save your preferences. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 30 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="bg-background border border-border/50 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden"
          >
            {/* Close Button */}
            <div className="absolute top-6 right-6 z-10">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="p-2 hover:bg-muted rounded-lg transition-colors duration-200"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </motion.button>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              {/* Left Side - Illustration & Message */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="bg-gradient-to-br from-primary/5 to-primary/[0.02] p-8 md:p-12 flex flex-col justify-center"
              >
                {/* Illustration */}
                <motion.div variants={itemVariants} className="mb-8">
                  <WelcomeIllustration />
                </motion.div>

                {/* Welcome Text */}
                <motion.div variants={itemVariants}>
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3 leading-tight">
                    Welcome to
                    <br />
                    <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                      Koinonia
                    </span>
                  </h1>
                </motion.div>

                <motion.p
                  variants={itemVariants}
                  className="text-muted-foreground leading-relaxed"
                >
                  Connect with your congregation like never before. Send messages, manage groups, and build community all in one place.
                </motion.p>
              </motion.div>

              {/* Right Side - Role Selection */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="p-8 md:p-12 flex flex-col justify-between"
              >
                {/* Header */}
                <motion.div variants={itemVariants}>
                  <h2 className="text-xl font-semibold text-foreground mb-2">
                    How would you describe your role?
                  </h2>
                  <p className="text-sm text-muted-foreground mb-8">
                    We'll personalize your experience based on your position.
                  </p>
                </motion.div>

                {/* Role Options */}
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-3 mb-8"
                >
                  {roles.map((role) => (
                    <motion.label
                      key={role.id}
                      variants={itemVariants}
                      whileHover={{ scale: 1.02 }}
                      className={`relative flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 group ${
                        selectedRole === role.id
                          ? 'border-primary bg-primary/8 shadow-md'
                          : 'border-border/30 hover:border-primary/40 hover:bg-muted/40 bg-muted/20'
                      }`}
                    >
                      {/* Custom Radio */}
                      <div className="flex-shrink-0 mt-1">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                            selectedRole === role.id
                              ? 'border-primary bg-primary'
                              : 'border-border/50 group-hover:border-primary/50'
                          }`}
                        >
                          {selectedRole === role.id && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: 'spring', stiffness: 200 }}
                            >
                              <Check className="w-3 h-3 text-background" />
                            </motion.div>
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{role.icon}</span>
                          <span className="font-medium text-foreground text-sm">
                            {role.label}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {role.description}
                        </p>
                      </div>

                      {/* Hidden Radio Input */}
                      <input
                        type="radio"
                        name="role"
                        value={role.id}
                        checked={selectedRole === role.id}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="hidden"
                      />
                    </motion.label>
                  ))}
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                  variants={itemVariants}
                  className="space-y-3"
                >
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    onClick={handleNext}
                    disabled={!selectedRole || isLoading}
                    isLoading={isLoading}
                    className="bg-primary hover:bg-primary/90 text-background disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg hover:shadow-xl transition-all"
                  >
                    {isLoading ? 'Saving...' : selectedRole ? 'Continue' : 'Select a role to continue'}
                  </Button>

                  <button
                    onClick={onClose}
                    disabled={isLoading}
                    className="w-full py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Skip for now
                  </button>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
