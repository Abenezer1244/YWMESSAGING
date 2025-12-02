import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import StepIndicator from './StepIndicator';
import WelcomeStep from './steps/WelcomeStep';
import ProfileStep from './steps/ProfileStep';
import TeamStep from './steps/TeamStep';
import PreferencesStep from './steps/PreferencesStep';
import GettingStartedStep from './steps/GettingStartedStep';
const STEP_TITLES = [
    'Welcome',
    'Profile',
    'Team',
    'Preferences',
    'Getting Started',
];
const OnboardingWizard = ({ onComplete }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const handleNext = () => {
        if (currentStep < 5) {
            setCurrentStep((prev) => (prev + 1));
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };
    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep((prev) => (prev - 1));
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };
    const handleComplete = () => {
        onComplete();
    };
    return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-primary/5 via-background to-background py-12 px-4", children: _jsxs("div", { className: "max-w-2xl mx-auto", children: [_jsxs("div", { className: "text-center mb-12", children: [_jsx("h1", { className: "text-4xl font-bold mb-2", children: "Koinonia Connect" }), _jsxs("p", { className: "text-muted-foreground", children: ["Step ", currentStep, " of ", STEP_TITLES.length] })] }), _jsx(StepIndicator, { totalSteps: 5, currentStep: currentStep, stepTitles: STEP_TITLES }), _jsxs("div", { className: "mb-8", children: [currentStep === 1 && _jsx(WelcomeStep, { onNext: handleNext }), currentStep === 2 && (_jsx(ProfileStep, { onNext: handleNext, onBack: handleBack })), currentStep === 3 && (_jsx(TeamStep, { onNext: handleNext, onBack: handleBack })), currentStep === 4 && (_jsx(PreferencesStep, { onNext: handleNext, onBack: handleBack })), currentStep === 5 && (_jsx(GettingStartedStep, { onComplete: handleComplete, onBack: handleBack }))] }), _jsx("div", { className: "text-center text-xs text-muted-foreground", children: _jsx("p", { children: "You can complete this wizard in just a few minutes. No commitment required." }) })] }) }));
};
OnboardingWizard.displayName = 'OnboardingWizard';
export default OnboardingWizard;
//# sourceMappingURL=OnboardingWizard.js.map