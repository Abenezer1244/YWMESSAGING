import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import Button from './ui/Button';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WelcomeModal({ isOpen, onClose }: WelcomeModalProps) {
  const [selectedRole, setSelectedRole] = useState<string>('');

  const roles = [
    { id: 'pastor', label: 'Pastor / Lead Minister', icon: '🙏' },
    { id: 'admin', label: 'Church Administrator', icon: '📋' },
    { id: 'communications', label: 'Communications Lead', icon: '📢' },
    { id: 'volunteer', label: 'Volunteer Coordinator', icon: '👥' },
    { id: 'other', label: 'Other', icon: '⭐' },
  ];

  const handleNext = () => {
    // Store that user has seen welcome and their role
    if (selectedRole) {
      localStorage.setItem('welcomeCompleted', 'true');
      localStorage.setItem('userRole', selectedRole);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            className="bg-card border border-border/40 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
          >
            {/* Close Button */}
            <div className="absolute top-4 right-4 z-10">
              <button
                onClick={onClose}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Content */}
            <div className="p-8 pt-12">
              {/* Illustration */}
              <div className="mb-6 flex justify-center">
                <div className="relative w-48 h-40">
                  {/* Celebrating people illustration - using emoji/shapes */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-6xl">🎉</div>
                  </div>
                  {/* Decorative circles */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                    className="absolute w-32 h-32 border-2 border-primary/20 rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                  />
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                    className="absolute w-40 h-40 border border-primary/10 rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                  />
                </div>
              </div>

              {/* Heading */}
              <h2 className="text-3xl font-bold text-foreground text-center mb-3">
                Welcome to Koinonia!
              </h2>

              {/* Subtitle */}
              <p className="text-center text-muted-foreground mb-8">
                We're thrilled to have you on board. To give you the best experience, we'd love to learn a bit more about you.
              </p>

              {/* Question */}
              <label className="block text-sm font-semibold text-foreground mb-4">
                What's your role?
              </label>

              {/* Role Options */}
              <div className="space-y-3 mb-8">
                {roles.map((role) => (
                  <label
                    key={role.id}
                    className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedRole === role.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border/40 hover:border-primary/40 hover:bg-muted/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={role.id}
                      checked={selectedRole === role.id}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="w-5 h-5 accent-primary cursor-pointer"
                    />
                    <span className="text-lg">{role.icon}</span>
                    <span className="text-sm font-medium text-foreground">{role.label}</span>
                  </label>
                ))}
              </div>

              {/* Next Button */}
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={handleNext}
                disabled={!selectedRole}
                className="bg-primary hover:bg-primary/90 text-background disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Let's Get Started
              </Button>

              {/* Skip option */}
              <button
                onClick={onClose}
                className="w-full mt-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Skip for now
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
