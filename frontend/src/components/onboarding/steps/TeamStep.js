import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import Card from '../../ui/Card';
import Input from '../../ui/Input';
const TeamStep = ({ onNext, onBack }) => {
    const [teamMembers, setTeamMembers] = useState(['']);
    const handleEmailChange = (index, email) => {
        const newEmails = [...teamMembers];
        newEmails[index] = email;
        setTeamMembers(newEmails);
    };
    const handleAddField = () => {
        setTeamMembers([...teamMembers, '']);
    };
    const handleRemoveField = (index) => {
        setTeamMembers(teamMembers.filter((_, i) => i !== index));
    };
    const handleSkip = () => {
        localStorage.setItem('onboarding:team', JSON.stringify([]));
        onNext();
    };
    const handleContinue = () => {
        const validEmails = teamMembers.filter((email) => email.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
        localStorage.setItem('onboarding:team', JSON.stringify(validEmails));
        onNext();
    };
    return (_jsx(Card, { variant: "default", padding: "lg", children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold", children: "Invite Team Members" }), _jsx("p", { className: "text-muted-foreground mt-1", children: "Add your team members to get started together" })] }), _jsxs("div", { className: "space-y-4", children: [teamMembers.map((email, index) => (_jsxs("div", { className: "flex gap-2", children: [_jsx("div", { className: "flex-1", children: _jsx(Input, { type: "email", placeholder: "colleague@company.com", value: email, onChange: (e) => handleEmailChange(index, e.target.value) }) }), teamMembers.length > 1 && (_jsx("button", { type: "button", onClick: () => handleRemoveField(index), className: "px-3 py-2.5 text-destructive hover:bg-destructive/10 rounded-sm transition-all", children: "Remove" }))] }, index))), _jsx("button", { type: "button", onClick: handleAddField, className: "text-primary hover:underline text-sm font-medium", children: "+ Add another team member" })] }), _jsxs("div", { className: "flex gap-3 pt-4", children: [_jsx("button", { type: "button", onClick: onBack, className: "flex-1 px-4 py-2.5 border border-border rounded-sm font-medium hover:bg-muted/50 transition-all", children: "Back" }), _jsx("button", { type: "button", onClick: handleSkip, className: "flex-1 px-4 py-2.5 text-primary border border-primary rounded-sm font-medium hover:bg-primary/10 transition-all", children: "Skip for Now" }), _jsx("button", { type: "button", onClick: handleContinue, className: "flex-1 bg-primary text-primary-foreground px-4 py-2.5 rounded-sm font-medium hover:opacity-90 transition-all", children: "Continue" })] })] }) }));
};
TeamStep.displayName = 'TeamStep';
export default TeamStep;
//# sourceMappingURL=TeamStep.js.map