import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Loader, CheckCircle2, ExternalLink, Info, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { SoftCard, SoftButton } from '../SoftUI';
import Input from '../ui/Input';
import { getRCSStatus, registerRCSAgent } from '../../api/rcs';
export function RCSSettingsPanel() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [status, setStatus] = useState(null);
    const [agentId, setAgentId] = useState('');
    useEffect(() => {
        loadStatus();
    }, []);
    const loadStatus = async () => {
        try {
            setIsLoading(true);
            const data = await getRCSStatus();
            setStatus(data);
            if (data.agentId) {
                setAgentId(data.agentId);
            }
        }
        catch (error) {
            console.error('Failed to load RCS status:', error);
            // Don't show error toast - RCS might not be configured yet
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleRegister = async () => {
        if (!agentId.trim()) {
            toast.error('Please enter your RCS Agent ID');
            return;
        }
        try {
            setIsSaving(true);
            await registerRCSAgent(agentId.trim());
            toast.success('RCS Agent registered successfully!');
            loadStatus();
        }
        catch (error) {
            toast.error(error.message || 'Failed to register RCS Agent');
        }
        finally {
            setIsSaving(false);
        }
    };
    if (isLoading) {
        return (_jsx("div", { className: "flex justify-center py-12", children: _jsx(motion.div, { animate: { rotate: 360 }, transition: { duration: 2, repeat: Infinity }, children: _jsx(Loader, { className: "w-8 h-8 text-primary" }) }) }));
    }
    return (_jsxs("div", { className: "max-w-2xl space-y-6", children: [_jsx("h2", { className: "text-2xl font-bold text-foreground mb-6", children: "RCS Business Messaging" }), _jsx(SoftCard, { variant: "gradient", children: _jsxs("div", { className: "flex items-start gap-4", children: [_jsx("div", { className: `p-3 rounded-xl ${status?.ready ? 'bg-green-500/20' : 'bg-yellow-500/20'}`, children: status?.ready ? (_jsx(CheckCircle2, { className: "w-6 h-6 text-green-500" })) : (_jsx(Sparkles, { className: "w-6 h-6 text-yellow-500" })) }), _jsxs("div", { className: "flex-1", children: [_jsx("h3", { className: "font-semibold text-foreground mb-1", children: status?.ready ? 'RCS Enabled' : 'RCS Not Configured' }), _jsx("p", { className: "text-sm text-muted-foreground", children: status?.message || 'Configure RCS to send rich cards, carousels, and interactive buttons' }), status?.agentId && (_jsxs("p", { className: "text-sm text-foreground/80 mt-2", children: [_jsx("span", { className: "text-muted-foreground", children: "Agent ID:" }), ' ', _jsx("code", { className: "bg-muted px-2 py-0.5 rounded", children: status.agentId })] }))] })] }) }), _jsxs(SoftCard, { children: [_jsxs("div", { className: "flex items-start gap-3 mb-4", children: [_jsx(Info, { className: "w-5 h-5 text-primary flex-shrink-0 mt-0.5" }), _jsxs("div", { children: [_jsx("h4", { className: "font-medium text-foreground mb-2", children: "What is RCS Business Messaging?" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "RCS (Rich Communication Services) enables iMessage-like features for Android and iPhone users:" })] })] }), _jsxs("ul", { className: "space-y-2 text-sm text-muted-foreground ml-8", children: [_jsxs("li", { className: "flex items-center gap-2", children: [_jsx(CheckCircle2, { className: "w-4 h-4 text-green-500" }), "Rich cards with images, titles, and action buttons"] }), _jsxs("li", { className: "flex items-center gap-2", children: [_jsx(CheckCircle2, { className: "w-4 h-4 text-green-500" }), "Swipeable carousels for events and schedules"] }), _jsxs("li", { className: "flex items-center gap-2", children: [_jsx(CheckCircle2, { className: "w-4 h-4 text-green-500" }), "Quick reply buttons (Yes/No/Maybe)"] }), _jsxs("li", { className: "flex items-center gap-2", children: [_jsx(CheckCircle2, { className: "w-4 h-4 text-green-500" }), "Read receipts and typing indicators"] }), _jsxs("li", { className: "flex items-center gap-2", children: [_jsx(CheckCircle2, { className: "w-4 h-4 text-green-500" }), "HD images and videos (no compression)"] }), _jsxs("li", { className: "flex items-center gap-2", children: [_jsx(CheckCircle2, { className: "w-4 h-4 text-green-500" }), "Automatic SMS fallback for non-RCS devices"] })] })] }), _jsxs(SoftCard, { children: [_jsxs("h4", { className: "font-medium text-foreground mb-4 flex items-center gap-2", children: [_jsx(Shield, { className: "w-4 h-4" }), "RCS Agent Configuration"] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Input, { label: "Telnyx RCS Agent ID", value: agentId, onChange: (e) => setAgentId(e.target.value), placeholder: "Enter your RCS Agent ID from Telnyx" }), _jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "You can find this in your Telnyx Mission Control portal under RCS > Agents" })] }), _jsx(SoftButton, { variant: "primary", onClick: handleRegister, disabled: isSaving || !agentId.trim(), icon: isSaving ? (_jsx(motion.div, { animate: { rotate: 360 }, transition: { duration: 1, repeat: Infinity, ease: "linear" }, children: _jsx(Loader, { className: "w-4 h-4" }) })) : (_jsx(Sparkles, { className: "w-4 h-4" })), children: isSaving ? 'Saving...' : status?.configured ? 'Update RCS Agent' : 'Enable RCS' })] })] }), _jsxs(SoftCard, { variant: "default", children: [_jsx("h4", { className: "font-medium text-foreground mb-4", children: "How to Get an RCS Agent ID" }), _jsxs("ol", { className: "space-y-3 text-sm text-muted-foreground", children: [_jsxs("li", { className: "flex gap-3", children: [_jsx("span", { className: "flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold", children: "1" }), _jsxs("span", { children: ["Log in to", ' ', _jsxs("a", { href: "https://portal.telnyx.com", target: "_blank", rel: "noopener noreferrer", className: "text-primary hover:underline inline-flex items-center gap-1", children: ["Telnyx Mission Control ", _jsx(ExternalLink, { className: "w-3 h-3" })] })] })] }), _jsxs("li", { className: "flex gap-3", children: [_jsx("span", { className: "flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold", children: "2" }), _jsx("span", { children: "Navigate to Messaging > RCS > Agents" })] }), _jsxs("li", { className: "flex gap-3", children: [_jsx("span", { className: "flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold", children: "3" }), _jsx("span", { children: "Create a new RCS Agent with your church's branding (logo, name, description)" })] }), _jsxs("li", { className: "flex gap-3", children: [_jsx("span", { className: "flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold", children: "4" }), _jsx("span", { children: "Submit your agent for verification (typically takes 1-3 business days)" })] }), _jsxs("li", { className: "flex gap-3", children: [_jsx("span", { className: "flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold", children: "5" }), _jsx("span", { children: "Copy the Agent ID and paste it above" })] })] }), _jsx("div", { className: "mt-4 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20", children: _jsxs("p", { className: "text-sm text-yellow-600 dark:text-yellow-400", children: [_jsx("strong", { children: "Note:" }), " RCS agent verification requires business verification. Have your church's EIN, address, and website ready."] }) })] })] }));
}
export default RCSSettingsPanel;
//# sourceMappingURL=RCSSettingsPanel.js.map