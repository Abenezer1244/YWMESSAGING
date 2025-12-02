import React from 'react';

interface StepIndicatorProps {
  totalSteps: number;
  currentStep: number;
  stepTitles: string[];
}

const StepIndicator: React.FC<StepIndicatorProps> = ({
  totalSteps,
  currentStep,
  stepTitles,
}) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        {Array.from({ length: totalSteps }).map((_, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;

          return (
            <React.Fragment key={index}>
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full font-medium text-sm transition-all ${
                  isActive
                    ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2'
                    : isCompleted
                    ? 'bg-success text-white'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {isCompleted ? '✓' : stepNumber}
              </div>

              {stepNumber < totalSteps && (
                <div
                  className={`flex-1 h-1 mx-2 transition-all ${
                    isCompleted ? 'bg-success' : 'bg-muted'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      <div className="flex justify-between text-xs text-muted-foreground">
        {stepTitles.map((title, index) => (
          <div
            key={index}
            className={`text-center flex-1 ${
              index + 1 === currentStep ? 'text-primary font-medium' : ''
            }`}
          >
            {title}
          </div>
        ))}
      </div>
    </div>
  );
};

StepIndicator.displayName = 'StepIndicator';

export default StepIndicator;
