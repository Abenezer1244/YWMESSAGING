import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import useGroupStore from '../../stores/groupStore';
import useMessageStore from '../../stores/messageStore';
import { sendMessage } from '../../api/messages';
import { getTemplates } from '../../api/templates';
import TemplateFormModal from '../../components/templates/TemplateFormModal';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
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
    return (_jsxs("div", { className: "min-h-screen bg-gradient-to-br from-primary-50 dark:from-primary-900 to-primary-100 dark:to-primary-950 p-6 transition-colors duration-normal", children: [_jsxs("div", { className: "max-w-4xl mx-auto", children: [_jsx("div", { className: "flex items-center justify-between mb-8", children: _jsxs("div", { children: [_jsx("h1", { className: "text-4xl font-bold text-primary-900 dark:text-primary-50 mb-2", children: "\uD83D\uDCE8 Send Message" }), _jsx("p", { className: "text-primary-600 dark:text-primary-400", children: "Reach your congregation with direct SMS messages" })] }) }), _jsxs(Card, { variant: "default", className: "space-y-6", children: [templates.length > 0 && (_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold text-primary-900 dark:text-primary-50 mb-3", children: "\uD83D\uDCCB Use Template" }), _jsxs("div", { className: "flex gap-2 flex-wrap", children: [templates.slice(0, 6).map((template) => (_jsx(Button, { variant: "secondary", size: "sm", onClick: () => handleUseTemplate(template), title: template.content, children: template.name }, template.id))), templates.length > 6 && (_jsx(Button, { variant: "outline", size: "sm", onClick: () => window.location.href = '/templates', children: "More Templates..." }))] })] })), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold text-primary-900 dark:text-primary-50 mb-3", children: "\u270D\uFE0F Message Content" }), _jsx("textarea", { value: content, onChange: (e) => setContent(e.target.value.slice(0, 1600)), className: "w-full px-4 py-3 border border-primary-200 dark:border-primary-700 rounded-lg bg-white dark:bg-primary-800 text-primary-900 dark:text-primary-50 placeholder-primary-400 dark:placeholder-primary-500 focus:outline-none focus:ring-2 focus:ring-accent-500 resize-none transition-colors duration-normal", rows: 6, placeholder: "Type your message here...", maxLength: 1600 }), _jsxs("div", { className: "flex justify-between mt-3 text-sm text-primary-600 dark:text-primary-400", children: [_jsxs("span", { children: [content.length, " / 1600 characters"] }), _jsxs("span", { children: [segments, " SMS segment", segments !== 1 ? 's' : '', segments > 0 && ` ($${(segments * 0.0075).toFixed(4)} per recipient)`] })] }), content.trim() && (_jsx(Button, { variant: "ghost", size: "sm", onClick: () => setShowSaveModal(true), className: "mt-2", children: "\uD83D\uDCBE Save as Template" }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold text-primary-900 dark:text-primary-50 mb-3", children: "\uD83D\uDC65 Send To" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("label", { className: "flex items-center gap-3 cursor-pointer group", children: [_jsx("input", { type: "radio", name: "targetType", value: "groups", checked: targetType === 'groups', onChange: (e) => setTargetType(e.target.value), className: "w-4 h-4 accent-accent-500 dark:accent-accent-400 cursor-pointer" }), _jsx("span", { className: "text-sm font-medium text-primary-900 dark:text-primary-50", children: "Select Groups" })] }), targetType === 'groups' && (_jsx("div", { className: "ml-7 space-y-2 bg-primary-100 dark:bg-primary-800 p-4 rounded-lg border border-primary-200 dark:border-primary-700", children: groups.length === 0 ? (_jsx("p", { className: "text-primary-600 dark:text-primary-400 text-sm", children: "No groups available" })) : (groups.map((group) => (_jsxs("label", { className: "flex items-center gap-3 cursor-pointer group", children: [_jsx("input", { type: "checkbox", checked: selectedGroupIds.includes(group.id), onChange: () => handleGroupToggle(group.id), className: "w-4 h-4 rounded accent-accent-500 dark:accent-accent-400 cursor-pointer" }), _jsxs("span", { className: "text-sm text-primary-700 dark:text-primary-300", children: [group.name, " (", group.memberCount, " members)"] })] }, group.id)))) })), _jsxs("label", { className: "flex items-center gap-3 cursor-pointer group", children: [_jsx("input", { type: "radio", name: "targetType", value: "all", checked: targetType === 'all', onChange: (e) => setTargetType(e.target.value), className: "w-4 h-4 accent-accent-500 dark:accent-accent-400 cursor-pointer" }), _jsx("span", { className: "text-sm font-medium text-primary-900 dark:text-primary-50", children: "All Members" })] })] })] }), (targetType === 'all' || selectedGroupIds.length > 0) && segments > 0 && (_jsx(Card, { variant: "highlight", children: _jsxs("div", { className: "space-y-2 text-sm", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-primary-700 dark:text-primary-300", children: "Recipients:" }), _jsx("span", { className: "font-medium text-primary-900 dark:text-primary-50", children: recipientCount })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-primary-700 dark:text-primary-300", children: "Segments:" }), _jsx("span", { className: "font-medium text-primary-900 dark:text-primary-50", children: segments })] }), _jsxs("div", { className: "flex justify-between border-t border-primary-200 dark:border-primary-700 pt-2", children: [_jsx("span", { className: "font-medium text-primary-900 dark:text-primary-50", children: "Estimated Cost:" }), _jsxs("span", { className: "font-bold text-accent-600 dark:text-accent-400", children: ["$", totalCost.toFixed(2)] })] })] }) })), _jsxs("div", { className: "flex gap-3 pt-4", children: [_jsx(Button, { variant: "secondary", size: "md", onClick: () => {
                                            setContent('');
                                            setSelectedGroupIds([]);
                                        }, disabled: isLoading, children: "\uD83D\uDDD1\uFE0F Clear" }), _jsx(Button, { variant: "primary", size: "md", fullWidth: true, onClick: handleSendMessage, disabled: isLoading ||
                                            !content.trim() ||
                                            (targetType === 'groups' && selectedGroupIds.length === 0), isLoading: isLoading, children: isLoading ? 'Sending...' : '✉️ Send Message' })] })] })] }), showSaveModal && (_jsx(TemplateFormModal, { template: null, onClose: () => {
                    setShowSaveModal(false);
                    loadTemplates();
                } }))] }));
}
export default SendMessagePage;
//# sourceMappingURL=SendMessagePage.js.map