import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getTemplates, deleteTemplate } from '../../api/templates';
import TemplateFormModal from '../../components/templates/TemplateFormModal';
import BackButton from '../../components/BackButton';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { Spinner } from '../../components/ui';
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
    return (_jsxs("div", { className: "min-h-screen bg-gradient-to-br from-primary-50 dark:from-primary-900 to-primary-100 dark:to-primary-950 p-6 transition-colors duration-normal", children: [_jsxs("div", { className: "max-w-7xl mx-auto", children: [_jsx("div", { className: "mb-6", children: _jsx(BackButton, { variant: "ghost" }) }), _jsxs("div", { className: "flex items-center justify-between mb-8", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-4xl font-bold text-primary-900 dark:text-primary-50 mb-2", children: "\uD83D\uDCCB Message Templates" }), _jsx("p", { className: "text-primary-600 dark:text-primary-400", children: "Reuse message templates to save time" })] }), _jsx(Button, { variant: "primary", size: "lg", onClick: handleCreate, children: "+ Create Template" })] }), isLoading ? (_jsx("div", { className: "flex items-center justify-center py-20", children: _jsx(Spinner, { size: "lg", text: "Loading templates..." }) })) : templates.length === 0 ? (_jsxs(Card, { variant: "highlight", className: "text-center py-16", children: [_jsx("div", { className: "mb-6", children: _jsx("span", { className: "text-6xl", children: "\uD83D\uDCCB" }) }), _jsx("h2", { className: "text-2xl font-bold text-primary-900 dark:text-primary-50 mb-3", children: "No Templates Yet" }), _jsx("p", { className: "text-primary-600 dark:text-primary-400 mb-6 max-w-md mx-auto", children: "Create templates to quickly send frequently used messages." }), _jsx(Button, { variant: "primary", size: "md", onClick: handleCreate, children: "Create First Template" })] })) : (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: templates.map((template) => (_jsxs(Card, { variant: "default", className: "hover:shadow-lg transition-shadow flex flex-col", children: [_jsxs("div", { className: "flex items-start justify-between mb-3", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-primary-900 dark:text-primary-50", children: template.name }), _jsx("p", { className: "text-sm text-primary-600 dark:text-primary-400 mt-1", children: getCategoryLabel(template.category) })] }), template.isDefault && (_jsx("span", { className: "inline-block px-2 py-1 bg-accent-100 dark:bg-accent-900 text-accent-800 dark:text-accent-200 text-xs font-semibold rounded", children: "Default" }))] }), _jsx("p", { className: "text-primary-700 dark:text-primary-300 text-sm mb-4 flex-grow line-clamp-3", children: template.content }), _jsx("div", { className: "flex justify-between items-center mb-4 pt-4 border-t border-primary-200 dark:border-primary-700", children: _jsxs("p", { className: "text-xs text-primary-600 dark:text-primary-400", children: ["Used ", template.usageCount, " times"] }) }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { variant: "secondary", size: "sm", onClick: () => handleEdit(template), fullWidth: true, children: "Edit" }), _jsx(Button, { variant: "danger", size: "sm", onClick: () => handleDelete(template.id, template.isDefault), disabled: template.isDefault, fullWidth: true, children: "Delete" })] })] }, template.id))) }))] }), showModal && (_jsx(TemplateFormModal, { template: editingTemplate, onClose: handleModalClose }))] }));
}
export default TemplatesPage;
//# sourceMappingURL=TemplatesPage.js.map