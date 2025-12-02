import React from 'react';
import Card from '../../ui/Card';

interface GettingStartedStepProps {
  onComplete: () => void;
  onBack: () => void;
}

const GettingStartedStep: React.FC<GettingStartedStepProps> = ({
  onComplete,
  onBack,
}) => {
  const handleComplete = () => {
    localStorage.setItem('onboarding:completed', 'true');
    onComplete();
  };

  return (
    <Card variant="highlight" padding="lg">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold">You're All Set! 🎉</h2>
          <p className="text-muted-foreground">
            Your Koinonia Connect account is ready to use
          </p>
        </div>

        <div className="space-y-4 bg-muted/50 p-6 rounded-sm">
          <h3 className="font-medium text-lg">Next Steps:</h3>
          <ul className="space-y-3">
            <li className="flex gap-3">
              <span className="text-primary font-bold">1.</span>
              <div>
                <p className="font-medium">Explore the Dashboard</p>
                <p className="text-sm text-muted-foreground">
                  View your communication analytics and metrics
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="text-primary font-bold">2.</span>
              <div>
                <p className="font-medium">Start a Conversation</p>
                <p className="text-sm text-muted-foreground">
                  Send your first message to a team member
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="text-primary font-bold">3.</span>
              <div>
                <p className="font-medium">Customize Your Settings</p>
                <p className="text-sm text-muted-foreground">
                  Adjust notifications and preferences anytime
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="text-primary font-bold">4.</span>
              <div>
                <p className="font-medium">Read Documentation</p>
                <p className="text-sm text-muted-foreground">
                  Learn about all features and best practices
                </p>
              </div>
            </li>
          </ul>
        </div>

        <div className="bg-primary/10 border border-primary/20 p-4 rounded-sm">
          <p className="text-sm">
            <span className="font-medium">Need help?</span> Check out our{' '}
            <a href="#" className="text-primary underline">
              support center
            </a>{' '}
            or contact our team anytime.
          </p>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 px-4 py-2.5 border border-border rounded-sm font-medium hover:bg-muted/50 transition-all"
          >
            Back
          </button>
          <button
            type="button"
            onClick={handleComplete}
            className="flex-1 bg-primary text-primary-foreground px-4 py-2.5 rounded-sm font-medium hover:opacity-90 transition-all"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </Card>
  );
};

GettingStartedStep.displayName = 'GettingStartedStep';

export default GettingStartedStep;
