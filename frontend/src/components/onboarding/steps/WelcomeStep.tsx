import React from 'react';
import Card from '../../ui/Card';

interface WelcomeStepProps {
  onNext: () => void;
}

const WelcomeStep: React.FC<WelcomeStepProps> = ({ onNext }) => {
  return (
    <Card variant="highlight" padding="lg">
      <div className="text-center space-y-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold">Welcome to Koinonia Connect</h2>
          <p className="text-muted-foreground text-lg">
            Your platform for enterprise communication
          </p>
        </div>

        <div className="space-y-4 text-left max-w-md mx-auto">
          <div className="flex gap-3">
            <span className="text-2xl">✉️</span>
            <div>
              <h3 className="font-medium">Seamless Messaging</h3>
              <p className="text-sm text-muted-foreground">
                Connect with your team instantly
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <span className="text-2xl">📊</span>
            <div>
              <h3 className="font-medium">Real-time Analytics</h3>
              <p className="text-sm text-muted-foreground">
                Track communication metrics
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <span className="text-2xl">🔒</span>
            <div>
              <h3 className="font-medium">Enterprise Security</h3>
              <p className="text-sm text-muted-foreground">
                Your data is always protected
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onNext}
          className="bg-primary text-primary-foreground px-8 py-3 rounded-sm font-medium hover:opacity-90 transition-all"
        >
          Let's Get Started
        </button>
      </div>
    </Card>
  );
};

WelcomeStep.displayName = 'WelcomeStep';

export default WelcomeStep;
