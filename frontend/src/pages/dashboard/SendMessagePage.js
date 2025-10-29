import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import useGroupStore from '../../stores/groupStore';
import useMessageStore from '../../stores/messageStore';
import { sendMessage } from '../../api/messages';
import { getTemplates } from '../../api/templates';
import TemplateFormModal from '../../components/templates/TemplateFormModal';
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
    return (_jsxs("div", { className: "min-h-screen bg-gray-50", children: [_jsx("div", { className: "bg-white shadow", children: _jsx("div", { className: "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4", children: _jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Send Message" }) }) }), _jsx("main", { className: "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: _jsxs("div", { className: "bg-white rounded-lg shadow p-8 space-y-6", children: [templates.length > 0 && (_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Use Template" }), _jsxs("div", { className: "flex gap-2 flex-wrap", children: [templates.slice(0, 6).map((template) => (_jsx("button", { onClick: () => handleUseTemplate(template), className: "px-3 py-1 bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 text-sm rounded-lg transition", title: template.content, children: template.name }, template.id))), templates.length > 6 && (_jsx("button", { onClick: () => window.location.href = '/templates', className: "px-3 py-1 bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 text-sm rounded-lg transition", children: "More Templates..." }))] })] })), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Message Content" }), _jsx("textarea", { value: content, onChange: (e) => setContent(e.target.value.slice(0, 1600)), className: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none", rows: 6, placeholder: "Type your message here...", maxLength: 1600 }), _jsxs("div", { className: "flex justify-between mt-2 text-sm text-gray-600", children: [_jsxs("span", { children: [content.length, " / 1600 characters"] }), _jsxs("span", { children: [segments, " SMS segment", segments !== 1 ? 's' : '', segments > 0 && ` ($${(segments * 0.0075).toFixed(4)} per recipient)`] })] }), content.trim() && (_jsx("button", { onClick: () => setShowSaveModal(true), className: "text-sm text-blue-600 hover:text-blue-700 font-medium mt-2", children: "\uD83D\uDCBE Save as Template" }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-3", children: "Send To" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("label", { className: "flex items-center gap-3 cursor-pointer", children: [_jsx("input", { type: "radio", name: "targetType", value: "groups", checked: targetType === 'groups', onChange: (e) => setTargetType(e.target.value), className: "w-4 h-4" }), _jsx("span", { className: "text-sm font-medium text-gray-700", children: "Select Groups" })] }), targetType === 'groups' && (_jsx("div", { className: "ml-7 space-y-2 bg-gray-50 p-4 rounded-lg", children: groups.length === 0 ? (_jsx("p", { className: "text-gray-500 text-sm", children: "No groups available" })) : (groups.map((group) => (_jsxs("label", { className: "flex items-center gap-3 cursor-pointer", children: [_jsx("input", { type: "checkbox", checked: selectedGroupIds.includes(group.id), onChange: () => handleGroupToggle(group.id), className: "w-4 h-4 rounded" }), _jsxs("span", { className: "text-sm text-gray-700", children: [group.name, " (", group.memberCount, " members)"] })] }, group.id)))) })), _jsxs("label", { className: "flex items-center gap-3 cursor-pointer", children: [_jsx("input", { type: "radio", name: "targetType", value: "all", checked: targetType === 'all', onChange: (e) => setTargetType(e.target.value), className: "w-4 h-4" }), _jsx("span", { className: "text-sm font-medium text-gray-700", children: "All Members" })] })] })] }), (targetType === 'all' || selectedGroupIds.length > 0) && segments > 0 && (_jsx("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-4", children: _jsxs("div", { className: "space-y-2 text-sm", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-700", children: "Recipients:" }), _jsx("span", { className: "font-medium", children: recipientCount })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-700", children: "Segments:" }), _jsx("span", { className: "font-medium", children: segments })] }), _jsxs("div", { className: "flex justify-between border-t pt-2", children: [_jsx("span", { className: "font-medium text-gray-900", children: "Estimated Cost:" }), _jsxs("span", { className: "font-bold text-blue-600", children: ["$", totalCost.toFixed(2)] })] })] }) })), _jsxs("div", { className: "flex gap-3", children: [_jsx("button", { onClick: () => {
                                        setContent('');
                                        setSelectedGroupIds([]);
                                    }, className: "px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition", disabled: isLoading, children: "Clear" }), _jsx("button", { onClick: handleSendMessage, disabled: isLoading ||
                                        !content.trim() ||
                                        (targetType === 'groups' && selectedGroupIds.length === 0), className: "flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:bg-gray-400", children: isLoading ? 'Sending...' : 'Send Message' })] })] }) }), showSaveModal && (_jsx(TemplateFormModal, { template: null, onClose: () => {
                    setShowSaveModal(false);
                    loadTemplates();
                } }))] }));
}
export default SendMessagePage;
//# sourceMappingURL=SendMessagePage.js.map