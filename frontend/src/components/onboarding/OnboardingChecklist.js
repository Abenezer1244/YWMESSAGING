import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { CheckCircle2, Circle, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
export function OnboardingChecklist() {
    const navigate = useNavigate();
    const [steps, setSteps] = useState([
        {
            id: 'create_branch',
            title: 'Create Your First Branch',
            description: 'Set up a physical location or main campus to organize your members',
            completed: false,
            estimatedTime: '1 min',
            action: () => navigate('/branches'),
        },
        {
            id: 'create_group',
            title: 'Add a Ministry Group',
            description: 'Organize members by ministry, department, or team (e.g., "Sunday School", "Worship Team")',
            completed: false,
            estimatedTime: '1 min',
            action: () => navigate('/groups'),
        },
        {
            id: 'add_members',
            title: 'Import Members',
            description: 'Upload your contact list via CSV or add members manually',
            completed: false,
            estimatedTime: '2 mins',
            action: () => navigate('/members'),
        },
        {
            id: 'send_message',
            title: 'Send Your First Message',
            description: 'Try sending a test message to your first group and see instant delivery',
            completed: false,
            estimatedTime: '2 mins',
            action: () => navigate('/send-message'),
        },
    ]);
    const [isVisible, setIsVisible] = useState(true);
    const completedCount = steps.filter((s) => s.completed).length;
    const progress = (completedCount / steps.length) * 100;
    // Load completion state from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('onboarding_progress');
        if (saved) {
            try {
                setSteps(JSON.parse(saved));
            }
            catch (error) {
                console.error('Failed to parse onboarding progress:', error);
            }
        }
    }, []);
    // Save completion state
    useEffect(() => {
        localStorage.setItem('onboarding_progress', JSON.stringify(steps));
    }, [steps]);
    const handleStepComplete = (stepId) => {
        setSteps((prev) => prev.map((step) => step.id === stepId ? { ...step, completed: true } : step));
    };
    // Hide checklist once all steps are completed or dismissed
    if (!isVisible || completedCount === steps.length) {
        return null;
    }
    return (_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -20 }, transition: { duration: 0.3 }, className: "bg-white dark:bg-secondary-900 border border-gray-200 dark:border-secondary-700 rounded-2xl p-6 shadow-lg mb-6", children: [_jsxs("div", { className: "flex justify-between items-start mb-4", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-xl font-bold text-gray-900 dark:text-white", children: "Get Started with YWMESSAGING" }), _jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400 mt-1", children: "Complete these steps to send your first message" })] }), _jsx("button", { onClick: () => setIsVisible(false), "aria-label": "Dismiss onboarding checklist", className: "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-secondary-700 transition-colors", children: _jsx(X, { className: "w-5 h-5" }) })] }), _jsxs("div", { className: "mb-6", children: [_jsxs("div", { className: "flex justify-between text-sm mb-2", children: [_jsxs("span", { className: "font-medium text-gray-700 dark:text-gray-300", children: [completedCount, " of ", steps.length, " completed"] }), _jsxs("span", { className: "text-gray-500 dark:text-gray-400", children: [Math.round(progress), "%"] })] }), _jsx("div", { className: "w-full bg-gray-200 dark:bg-secondary-700 rounded-full h-2", children: _jsx(motion.div, { initial: { width: 0 }, animate: { width: `${progress}%` }, transition: { duration: 0.5, ease: 'easeOut' }, className: "bg-blue-600 dark:bg-blue-500 h-2 rounded-full" }) })] }), _jsx("div", { className: "space-y-3", children: _jsx(AnimatePresence, { children: steps.map((step, index) => (_jsxs(motion.div, { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -20 }, transition: { delay: index * 0.1, duration: 0.3 }, className: `
                flex items-start gap-3 p-4 rounded-lg border transition-colors
                ${step.completed
                            ? 'bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/30'
                            : 'bg-gray-50 dark:bg-secondary-800 border-gray-200 dark:border-secondary-700 hover:border-blue-300 dark:hover:border-blue-500/50 hover:bg-blue-50 dark:hover:bg-secondary-700/50'}
              `, children: [_jsx("div", { className: "flex-shrink-0 mt-1", children: step.completed ? (_jsx(motion.div, { initial: { scale: 0 }, animate: { scale: 1 }, transition: { type: 'spring', stiffness: 200 }, children: _jsx(CheckCircle2, { className: "w-6 h-6 text-green-600 dark:text-green-400" }) })) : (_jsx(Circle, { className: "w-6 h-6 text-gray-400 dark:text-gray-500" })) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center gap-2 mb-1 flex-wrap", children: [_jsx("h3", { className: `font-medium ${step.completed
                                                    ? 'text-green-900 dark:text-green-300'
                                                    : 'text-gray-900 dark:text-white'}`, children: step.title }), _jsx("span", { className: "text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-secondary-900 px-2 py-1 rounded-full", children: step.estimatedTime })] }), _jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: step.description })] }), !step.completed && (_jsxs("button", { onClick: () => {
                                    step.action();
                                    handleStepComplete(step.id);
                                }, className: "flex-shrink-0 flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm px-3 py-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors whitespace-nowrap", children: ["Start", _jsx(ChevronRight, { className: "w-4 h-4" })] }))] }, step.id))) }) }), _jsx(AnimatePresence, { children: completedCount === steps.length && (_jsx(motion.div, { initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.9 }, transition: { duration: 0.3 }, className: "mt-4 p-4 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30 rounded-lg", children: _jsxs("p", { className: "text-green-900 dark:text-green-300 font-medium flex items-center gap-2", children: [_jsx(CheckCircle2, { className: "w-5 h-5" }), "Congratulations! You're all set up. Start messaging your church today!"] }) })) })] }));
}
//# sourceMappingURL=OnboardingChecklist.js.map