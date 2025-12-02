import React, { useState } from 'react';
import StepIndicator from './StepIndicator';
import WelcomeStep from './steps/WelcomeStep';
import ProfileStep from './steps/ProfileStep';
import TeamStep from './steps/TeamStep';
import PreferencesStep from './steps/PreferencesStep';
import GettingStartedStep from './steps/GettingStartedStep';

interface OnboardingWizardProps {
  onComplete: () => void;
}

type Step = 1 | 2 | 3 | 4 | 5;

const STEP_TITLES = [
  'Welcome',
  'Profile',
  'Team',
  'Preferences',
  'Getting Started',
];

const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState<Step>(1);

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep((prev) => (prev + 1) as Step);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as Step);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleComplete = () => {
    onComplete();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-background py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-2">Koinonia Connect</h1>
          <p className="text-muted-foreground">
            Step {currentStep} of {STEP_TITLES.length}
          </p>
        </div>

        {/* Step Indicator */}
        <StepIndicator
          totalSteps={5}
          currentStep={currentStep}
          stepTitles={STEP_TITLES}
        />

        {/* Steps */}
        <div className="mb-8">
          {currentStep === 1 && <WelcomeStep onNext={handleNext} />}
          {currentStep === 2 && (
            <ProfileStep onNext={handleNext} onBack={handleBack} />
          )}
          {currentStep === 3 && (
            <TeamStep onNext={handleNext} onBack={handleBack} />
          )}
          {currentStep === 4 && (
            <PreferencesStep onNext={handleNext} onBack={handleBack} />
          )}
          {currentStep === 5 && (
            <GettingStartedStep
              onComplete={handleComplete}
              onBack={handleBack}
            />
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground">
          <p>
            You can complete this wizard in just a few minutes. No commitment
            required.
          </p>
        </div>
      </div>
    </div>
  );
};

OnboardingWizard.displayName = 'OnboardingWizard';

export default OnboardingWizard;
