import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader, Send, FileText, Users, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useGroupStore } from '../../stores/groupStore';
import { useMessageStore } from '../../stores/messageStore';
import { sendMessage } from '../../api/messages';
import { getTemplates } from '../../api/templates';
import TemplateFormModal from '../../components/templates/TemplateFormModal';
import { SoftLayout, SoftCard, SoftButton } from '../../components/SoftUI';
export function SendMessagePage() {
    const { groups } = useGroupStore();
    const { addMessage } = useMessageStore();
    const [content, setContent] = useState('');
    const [targetType, setTargetType] = useState('groups');
    const [selectedGroupIds, setSelectedGroupIds] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [templates, setTemplates] = useState([]);
    const [showSaveModal, setShowSaveModal] = useState(false);
    useEffect(() => {
        loadTemplates();
    }, []);
    const loadTemplates = async () => {
        try {
            const data = await getTemplates();
            setTemplates(data);
        }
        catch (error) {
            console.error('Failed to load templates:', error);
        }
    };
    // Calculate segments and cost
    const segments = Math.ceil(content.length / 160) || 0;
    const totalCost = (segments * selectedGroupIds.length) * 0.0075;
    const recipientCount = selectedGroupIds.reduce((sum, gId) => sum + (groups.find((g) => g.id === gId)?.memberCount || 0), 0);
    const handleGroupToggle = (groupId) => {
        setSelectedGroupIds((prev) => prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]);
    };
    const handleUseTemplate = (template) => {
        setContent(template.content);
        toast.success(`Using template: ${template.name}`);
    };
    const handleSendMessage = async () => {
        if (!content.trim()) {
            toast.error('Please enter a message');
            return;
        }
        if (targetType === 'groups' && selectedGroupIds.length === 0) {
            toast.error('Please select at least one group');
            return;
        }
        try {
            setIsLoading(true);
            const message = await sendMessage({
                content: content.trim(),
                targetType: targetType === 'all' ? 'all' : 'groups',
                targetIds: targetType === 'all' ? undefined : selectedGroupIds,
            });
            addMessage(message);
            toast.success(`Message queued for ${message.totalRecipients} recipients`);
            setContent('');
            setSelectedGroupIds([]);
        }
        catch (error) {
            toast.error(error.message || 'Failed to send message');
        }
        finally {
            setIsLoading(false);
        }
    };
    return (_jsxs(SoftLayout, { children: [_jsxs("div", { className: "px-4 md:px-8 py-8 w-full max-w-4xl mx-auto", children: [_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 }, className: "flex items-center justify-between mb-8", children: _jsxs("div", { children: [_jsx("h1", { className: "text-4xl font-bold text-foreground mb-2", children: _jsx("span", { className: "bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent", children: "Send Message" }) }), _jsx("p", { className: "text-muted-foreground", children: "Reach your congregation with direct SMS messages" })] }) }), _jsxs(SoftCard, { className: "space-y-6", children: [templates.length > 0 && (_jsxs(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.1 }, children: [_jsxs("label", { className: "block text-sm font-semibold text-foreground mb-3 flex items-center gap-2", children: [_jsx(FileText, { className: "w-4 h-4" }), "Use Template"] }), _jsxs("div", { className: "flex gap-2 flex-wrap", children: [templates.slice(0, 6).map((template) => (_jsx(SoftButton, { variant: "secondary", size: "sm", onClick: () => handleUseTemplate(template), children: template.name }, template.id))), templates.length > 6 && (_jsx(SoftButton, { variant: "ghost", size: "sm", onClick: () => window.location.href = '/templates', children: "More Templates..." }))] })] })), _jsxs(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.15 }, children: [_jsxs("label", { className: "block text-sm font-semibold text-foreground mb-3 flex items-center gap-2", children: [_jsx(Send, { className: "w-4 h-4" }), "Message Content"] }), _jsx("textarea", { value: content, onChange: (e) => setContent(e.target.value.slice(0, 1600)), className: "w-full px-4 py-3 border border-border/40 rounded-lg bg-card/50 text-foreground placeholder-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary resize-none transition-colors duration-normal backdrop-blur-sm", rows: 6, placeholder: "Type your message here...", maxLength: 1600 }), _jsxs("div", { className: "flex justify-between mt-3 text-sm text-muted-foreground", children: [_jsxs("span", { children: [content.length, " / 1600 characters"] }), _jsxs("span", { children: [segments, " SMS segment", segments !== 1 ? 's' : '', segments > 0 && ` ($${(segments * 0.0075).toFixed(4)} per recipient)`] })] }), content.trim() && (_jsx(SoftButton, { variant: "ghost", size: "sm", onClick: () => setShowSaveModal(true), className: "mt-2", children: "Save as Template" }))] }), _jsxs(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.2 }, children: [_jsxs("label", { className: "block text-sm font-semibold text-foreground mb-3 flex items-center gap-2", children: [_jsx(Users, { className: "w-4 h-4" }), "Send To"] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("label", { className: "flex items-center gap-3 cursor-pointer group", children: [_jsx("input", { type: "radio", name: "targetType", value: "groups", checked: targetType === 'groups', onChange: (e) => setTargetType(e.target.value), className: "w-4 h-4 accent-primary cursor-pointer" }), _jsx("span", { className: "text-sm font-medium text-foreground", children: "Select Groups" })] }), targetType === 'groups' && (_jsx("div", { className: "ml-7 space-y-2 bg-muted p-4 rounded-lg border border-border", children: groups.length === 0 ? (_jsx("p", { className: "text-muted-foreground text-sm", children: "No groups available" })) : (groups.map((group) => (_jsxs("label", { className: "flex items-center gap-3 cursor-pointer group", children: [_jsx("input", { type: "checkbox", checked: selectedGroupIds.includes(group.id), onChange: () => handleGroupToggle(group.id), className: "w-4 h-4 rounded accent-primary cursor-pointer" }), _jsxs("span", { className: "text-sm text-foreground/80", children: [group.name, " (", group.memberCount, " members)"] })] }, group.id)))) })), _jsxs("label", { className: "flex items-center gap-3 cursor-pointer group", children: [_jsx("input", { type: "radio", name: "targetType", value: "all", checked: targetType === 'all', onChange: (e) => setTargetType(e.target.value), className: "w-4 h-4 accent-primary cursor-pointer" }), _jsx("span", { className: "text-sm font-medium text-foreground", children: "All Members" })] })] })] }), (targetType === 'all' || selectedGroupIds.length > 0) && segments > 0 && (_jsx(motion.div, { initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 }, transition: { delay: 0.25 }, children: _jsx(SoftCard, { variant: "gradient", children: _jsxs("div", { className: "space-y-2 text-sm", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-foreground/80", children: "Recipients:" }), _jsx("span", { className: "font-medium text-foreground", children: recipientCount })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-foreground/80", children: "Segments:" }), _jsx("span", { className: "font-medium text-foreground", children: segments })] }), _jsxs("div", { className: "flex justify-between border-t border-border/40 pt-2", children: [_jsx("span", { className: "font-medium text-foreground", children: "Estimated Cost:" }), _jsxs("span", { className: "font-bold text-primary", children: ["$", totalCost.toFixed(2)] })] })] }) }) })), _jsxs(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.3 }, className: "flex gap-3 pt-4", children: [_jsx(SoftButton, { variant: "secondary", size: "md", onClick: () => {
                                            setContent('');
                                            setSelectedGroupIds([]);
                                        }, disabled: isLoading, icon: _jsx(Trash2, { className: "w-4 h-4" }), children: "Clear" }), _jsx(SoftButton, { variant: "primary", size: "md", fullWidth: true, onClick: handleSendMessage, disabled: isLoading ||
                                            !content.trim() ||
                                            (targetType === 'groups' && selectedGroupIds.length === 0), icon: isLoading ? (_jsx(motion.div, { animate: { rotate: 360 }, transition: { duration: 1, repeat: Infinity, ease: "linear" }, children: _jsx(Loader, { className: "w-4 h-4" }) })) : (_jsx(Send, { className: "w-4 h-4" })), children: isLoading ? 'Sending...' : 'Send Message' })] })] })] }), showSaveModal && (_jsx(TemplateFormModal, { template: null, onClose: () => {
                    setShowSaveModal(false);
                    loadTemplates();
                } }))] }));
}
export default SendMessagePage;
//# sourceMappingURL=SendMessagePage.js.map