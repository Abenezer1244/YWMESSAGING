import { useState, useEffect } from 'react';
import { CheckCircle2, Circle, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  action: () => void;
  estimatedTime: '1 min' | '2 mins' | '5 mins';
}

export function OnboardingChecklist() {
  const navigate = useNavigate();

  // Define action handlers that don't depend on state
  const stepActions = {
    create_branch: () => navigate('/branches'),
    create_group: () => navigate('/groups'),
    add_members: () => navigate('/members'),
    send_message: () => navigate('/send-message'),
  };

  const [steps, setSteps] = useState<OnboardingStep[]>([
    {
      id: 'create_branch',
      title: 'Create Your First Branch',
      description: 'Set up a physical location or main campus to organize your members',
      completed: false,
      estimatedTime: '1 min',
      action: stepActions.create_branch,
    },
    {
      id: 'create_group',
      title: 'Add a Ministry Group',
      description: 'Organize members by ministry, department, or team (e.g., "Sunday School", "Worship Team")',
      completed: false,
      estimatedTime: '1 min',
      action: stepActions.create_group,
    },
    {
      id: 'add_members',
      title: 'Import Members',
      description: 'Upload your contact list via CSV or add members manually',
      completed: false,
      estimatedTime: '2 mins',
      action: stepActions.add_members,
    },
    {
      id: 'send_message',
      title: 'Send Your First Message',
      description: 'Try sending a test message to your first group and see instant delivery',
      completed: false,
      estimatedTime: '2 mins',
      action: stepActions.send_message,
    },
  ]);

  const [isVisible, setIsVisible] = useState(true);
  const completedCount = steps.filter((s) => s.completed).length;
  const progress = (completedCount / steps.length) * 100;

  // Load completion state from localStorage and restore action functions
  useEffect(() => {
    const saved = localStorage.getItem('onboarding_progress');
    if (saved) {
      try {
        const savedData = JSON.parse(saved);
        // Restore action functions since JSON.parse can't preserve them
        const stepsWithActions = savedData.map((step: any) => ({
          ...step,
          action: stepActions[step.id as keyof typeof stepActions] || (() => {}),
        }));
        setSteps(stepsWithActions);
      } catch (error) {
        console.error('Failed to parse onboarding progress:', error);
      }
    }
  }, []);

  // Save completion state
  useEffect(() => {
    localStorage.setItem('onboarding_progress', JSON.stringify(steps));
  }, [steps]);

  const handleStepComplete = (stepId: string) => {
    setSteps((prev) =>
      prev.map((step) =>
        step.id === stepId ? { ...step, completed: true } : step
      )
    );
  };

  // Hide checklist once all steps are completed or dismissed
  if (!isVisible || completedCount === steps.length) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-secondary-900 border border-gray-200 dark:border-secondary-700 rounded-2xl p-6 shadow-lg mb-6"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Get Started with YWMESSAGING
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Complete these steps to send your first message
          </p>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          aria-label="Dismiss onboarding checklist"
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-secondary-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium text-gray-700 dark:text-gray-300">
            {completedCount} of {steps.length} completed
          </span>
          <span className="text-gray-500 dark:text-gray-400">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-secondary-700 rounded-full h-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full"
          />
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        <AnimatePresence>
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              className={`
                flex items-start gap-3 p-4 rounded-lg border transition-colors
                ${
                  step.completed
                    ? 'bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/30'
                    : 'bg-gray-50 dark:bg-secondary-800 border-gray-200 dark:border-secondary-700 hover:border-blue-300 dark:hover:border-blue-500/50 hover:bg-blue-50 dark:hover:bg-secondary-700/50'
                }
              `}
            >
              {/* Icon */}
              <div className="flex-shrink-0 mt-1">
                {step.completed ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                  >
                    <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </motion.div>
                ) : (
                  <Circle className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3
                    className={`font-medium ${
                      step.completed
                        ? 'text-green-900 dark:text-green-300'
                        : 'text-gray-900 dark:text-white'
                    }`}
                  >
                    {step.title}
                  </h3>
                  <span className="text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-secondary-900 px-2 py-1 rounded-full">
                    {step.estimatedTime}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {step.description}
                </p>
              </div>

              {/* Action Button */}
              {!step.completed && (
                <button
                  onClick={() => {
                    step.action();
                    handleStepComplete(step.id);
                  }}
                  className="flex-shrink-0 flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm px-3 py-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors whitespace-nowrap"
                >
                  Start
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Completion Message */}
      <AnimatePresence>
        {completedCount === steps.length && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="mt-4 p-4 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30 rounded-lg"
          >
            <p className="text-green-900 dark:text-green-300 font-medium flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              Congratulations! You're all set up. Start messaging your church today!
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
