import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader, FileText, Plus, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { getTemplates, deleteTemplate } from '../../api/templates';
import TemplateFormModal from '../../components/templates/TemplateFormModal';
import { SoftLayout, SoftCard, SoftButton } from '../../components/SoftUI';
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
    return (_jsxs(SoftLayout, { children: [_jsxs("div", { className: "px-4 md:px-8 py-8 w-full", children: [_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 }, className: "flex items-center justify-between mb-8", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-4xl font-bold text-foreground mb-2", children: _jsx("span", { className: "bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent", children: "Message Templates" }) }), _jsx("p", { className: "text-muted-foreground", children: "Reuse message templates to save time" })] }), _jsx(SoftButton, { variant: "primary", size: "lg", onClick: handleCreate, icon: _jsx(Plus, { className: "w-5 h-5" }), children: "Create Template" })] }), isLoading ? (_jsx("div", { className: "flex items-center justify-center py-20", children: _jsx(motion.div, { animate: { rotate: 360 }, transition: { duration: 2, repeat: Infinity, ease: "linear" }, children: _jsx(Loader, { className: "w-8 h-8 text-primary" }) }) })) : templates.length === 0 ? (_jsx(motion.div, { initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 }, transition: { delay: 0.1 }, children: _jsxs(SoftCard, { variant: "gradient", className: "text-center py-16", children: [_jsx("div", { className: "mb-6", children: _jsx(FileText, { className: "w-16 h-16 mx-auto text-muted-foreground" }) }), _jsx("h2", { className: "text-2xl font-bold text-foreground mb-3", children: "No Templates Yet" }), _jsx("p", { className: "text-muted-foreground mb-6 max-w-md mx-auto", children: "Create templates to quickly send frequently used messages." }), _jsx(SoftButton, { variant: "primary", size: "md", onClick: handleCreate, icon: _jsx(Plus, { className: "w-4 h-4" }), children: "Create First Template" })] }) })) : (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: templates.map((template, index) => (_jsxs(SoftCard, { index: index, className: "flex flex-col", children: [_jsxs("div", { className: "flex items-start justify-between mb-3", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-foreground", children: template.name }), _jsx("p", { className: "text-sm text-foreground/80 mt-1", children: getCategoryLabel(template.category) })] }), template.isDefault && (_jsx("span", { className: "inline-block px-2 py-1 bg-primary/20 text-primary text-xs font-semibold rounded", children: "Default" }))] }), _jsx("p", { className: "text-muted-foreground text-sm mb-4 flex-grow line-clamp-3", children: template.content }), _jsx("div", { className: "flex justify-between items-center mb-4 pt-4 border-t border-border/40", children: _jsxs("p", { className: "text-xs text-muted-foreground", children: ["Used ", template.usageCount, " times"] }) }), _jsxs("div", { className: "flex gap-2", children: [_jsx(SoftButton, { variant: "secondary", size: "sm", onClick: () => handleEdit(template), fullWidth: true, icon: _jsx(Edit, { className: "w-3 h-3" }), children: "Edit" }), _jsx(SoftButton, { variant: "danger", size: "sm", onClick: () => handleDelete(template.id, template.isDefault), disabled: template.isDefault, fullWidth: true, icon: _jsx(Trash2, { className: "w-3 h-3" }), children: "Delete" })] })] }, template.id))) }))] }), showModal && (_jsx(TemplateFormModal, { template: editingTemplate, onClose: handleModalClose }))] }));
}
export default TemplatesPage;
//# sourceMappingURL=TemplatesPage.js.map