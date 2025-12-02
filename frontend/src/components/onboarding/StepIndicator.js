import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
const StepIndicator = ({ totalSteps, currentStep, stepTitles, }) => {
    return (_jsxs("div", { className: "mb-8", children: [_jsx("div", { className: "flex items-center justify-between mb-4", children: Array.from({ length: totalSteps }).map((_, index) => {
                    const stepNumber = index + 1;
                    const isActive = stepNumber === currentStep;
                    const isCompleted = stepNumber < currentStep;
                    return (_jsxs(React.Fragment, { children: [_jsx("div", { className: `flex items-center justify-center w-10 h-10 rounded-full font-medium text-sm transition-all ${isActive
                                    ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2'
                                    : isCompleted
                                        ? 'bg-success text-white'
                                        : 'bg-muted text-muted-foreground'}`, children: isCompleted ? '✓' : stepNumber }), stepNumber < totalSteps && (_jsx("div", { className: `flex-1 h-1 mx-2 transition-all ${isCompleted ? 'bg-success' : 'bg-muted'}` }))] }, index));
                }) }), _jsx("div", { className: "flex justify-between text-xs text-muted-foreground", children: stepTitles.map((title, index) => (_jsx("div", { className: `text-center flex-1 ${index + 1 === currentStep ? 'text-primary font-medium' : ''}`, children: title }, index))) })] }));
};
StepIndicator.displayName = 'StepIndicator';
export default StepIndicator;
//# sourceMappingURL=StepIndicator.js.map