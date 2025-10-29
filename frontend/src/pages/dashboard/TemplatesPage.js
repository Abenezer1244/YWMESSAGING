import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getTemplates, deleteTemplate } from '../../api/templates';
import TemplateFormModal from '../../components/templates/TemplateFormModal';
export function TemplatesPage() {
    const [templates, setTemplates] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);
    useEffect(() => {
        loadTemplates();
    }, []);
    const loadTemplates = async () => {
        try {
            setIsLoading(true);
            const data = await getTemplates();
            setTemplates(data);
        }
        catch (error) {
            toast.error(error.message || 'Failed to load templates');
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleCreate = () => {
        setEditingTemplate(null);
        setShowModal(true);
    };
    const handleEdit = (template) => {
        setEditingTemplate(template);
        setShowModal(true);
    };
    const handleDelete = async (templateId, isDefault) => {
        if (isDefault) {
            toast.error('Cannot delete default templates');
            return;
        }
        if (!window.confirm('Are you sure you want to delete this template?')) {
            return;
        }
        try {
            await deleteTemplate(templateId);
            setTemplates(templates.filter((t) => t.id !== templateId));
            toast.success('Template deleted');
        }
        catch (error) {
            toast.error(error.message || 'Failed to delete template');
        }
    };
    const handleModalClose = () => {
        setShowModal(false);
        setEditingTemplate(null);
        loadTemplates();
    };
    const getCategoryLabel = (category) => {
        const labels = {
            service_reminder: 'Service Reminder',
            event: 'Event',
            prayer: 'Prayer',
            thank_you: 'Thank You',
            welcome: 'Welcome',
            offering: 'Offering',
        };
        return labels[category] || category;
    };
    return (_jsxs("div", { className: "min-h-screen bg-gray-50", children: [_jsx("div", { className: "bg-white shadow", children: _jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4", children: _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Message Templates" }), _jsx("button", { onClick: handleCreate, className: "bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition", children: "Create Template" })] }) }) }), _jsx("main", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: isLoading ? (_jsx("div", { className: "text-center py-12", children: _jsx("p", { className: "text-gray-500", children: "Loading templates..." }) })) : templates.length === 0 ? (_jsx("div", { className: "text-center py-12", children: _jsx("p", { className: "text-gray-500 text-lg", children: "No templates found" }) })) : (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: templates.map((template) => (_jsxs("div", { className: "bg-white rounded-lg shadow p-6 flex flex-col", children: [_jsxs("div", { className: "flex items-start justify-between mb-3", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: template.name }), _jsx("p", { className: "text-sm text-gray-500 mt-1", children: getCategoryLabel(template.category) })] }), template.isDefault && (_jsx("span", { className: "inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded", children: "Default" }))] }), _jsx("p", { className: "text-gray-700 text-sm mb-4 flex-grow line-clamp-3", children: template.content }), _jsx("div", { className: "flex justify-between items-center mb-4 pt-4 border-t", children: _jsxs("p", { className: "text-xs text-gray-500", children: ["Used ", template.usageCount, " times"] }) }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: () => handleEdit(template), className: "flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition text-sm", children: "Edit" }), _jsx("button", { onClick: () => handleDelete(template.id, template.isDefault), disabled: template.isDefault, className: "flex-1 px-3 py-2 border border-red-300 rounded-lg text-red-700 font-medium hover:bg-red-50 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed", children: "Delete" })] })] }, template.id))) })) }), showModal && (_jsx(TemplateFormModal, { template: editingTemplate, onClose: handleModalClose }))] }));
}
export default TemplatesPage;
//# sourceMappingURL=TemplatesPage.js.map