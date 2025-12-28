import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Loader, Trash2, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../stores/authStore';
import { useBranchStore } from '../../stores/branchStore';
import { getBranches, deleteBranch } from '../../api/branches';
import BranchFormModal from '../../components/branches/BranchFormModal';
import { SoftLayout, SoftCard, SoftButton } from '../../components/SoftUI';
export function BranchesPage() {
    const auth = useAuthStore();
    const { branches, setBranches, addBranch, updateBranch, removeBranch, isLoading, setLoading } = useBranchStore();
    const [modalOpen, setModalOpen] = useState(false);
    const [editingBranch, setEditingBranch] = useState(undefined);
    const [deleting, setDeleting] = useState(null);
    // Load branches on component mount
    useEffect(() => {
        if (auth.church?.id) {
            loadBranches();
        }
    }, [auth.church?.id]);
    const loadBranches = async () => {
        if (!auth.church?.id)
            return;
        setLoading(true);
        try {
            const data = await getBranches(auth.church.id);
            setBranches(data);
        }
        catch (error) {
            console.error('Failed to load branches:', error);
            toast.error('Failed to load branches');
        }
        finally {
            setLoading(false);
        }
    };
    const handleCreate = () => {
        setEditingBranch(undefined);
        setModalOpen(true);
    };
    const handleEdit = (branch) => {
        setEditingBranch(branch);
        setModalOpen(true);
    };
    const handleModalSuccess = (branch) => {
        if (editingBranch) {
            updateBranch(branch.id, branch);
        }
        else {
            addBranch(branch);
        }
    };
    const handleDelete = async (branchId) => {
        if (!window.confirm('Are you sure you want to delete this branch? This action cannot be undone.')) {
            return;
        }
        setDeleting(branchId);
        try {
            const result = await deleteBranch(branchId);
            removeBranch(branchId);
            toast.success(`Branch deleted. ${result.membersDeleted} member(s) were removed.`);
        }
        catch (error) {
            const message = error.response?.data?.error || 'Failed to delete branch';
            toast.error(message);
        }
        finally {
            setDeleting(null);
        }
    };
    if (isLoading && branches.length === 0) {
        return (_jsx(SoftLayout, { children: _jsx("div", { className: "min-h-screen bg-background flex items-center justify-center", children: _jsx(motion.div, { animate: { rotate: 360 }, transition: { duration: 2, repeat: Infinity }, children: _jsx(Loader, { className: "w-8 h-8 text-primary" }) }) }) }));
    }
    return (_jsxs(SoftLayout, { children: [_jsxs("div", { className: "px-4 md:px-8 py-8 w-full", children: [_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 }, className: "flex items-center justify-between mb-8 flex-wrap gap-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-4xl font-bold text-foreground mb-2", children: _jsx("span", { className: "bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent", children: "Branches" }) }), _jsx("p", { className: "text-muted-foreground", children: "Manage your church locations" })] }), _jsx(SoftButton, { variant: "primary", size: "lg", onClick: handleCreate, children: "New Branch" })] }), branches.length === 0 ? (_jsxs(SoftCard, { className: "text-center py-16", children: [_jsx("div", { className: "mb-6", children: _jsx(MapPin, { className: "w-16 h-16 text-muted-foreground/50 mx-auto" }) }), _jsx("h2", { className: "text-2xl font-bold text-foreground mb-3", children: "No Branches Yet" }), _jsx("p", { className: "text-muted-foreground mb-6 max-w-md mx-auto", children: "Create your first branch to start managing your church locations and organizing your congregation." }), _jsx(SoftButton, { variant: "primary", onClick: handleCreate, children: "Create Your First Branch" })] })) : (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: branches.map((branch, idx) => (_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: idx * 0.05 }, children: _jsxs(SoftCard, { variant: "default", children: [_jsxs("div", { className: "mb-4", children: [_jsx("h3", { className: "text-xl font-bold text-foreground mb-2", children: branch.name }), branch.description && (_jsx("p", { className: "text-sm text-muted-foreground", children: branch.description }))] }), _jsxs("div", { className: "space-y-2 mb-6 pb-6 border-b border-border/40", children: [branch.address && (_jsxs("p", { className: "text-sm text-muted-foreground", children: [_jsx(MapPin, { className: "w-4 h-4 inline mr-2" }), branch.address] })), branch.phone && (_jsxs("p", { className: "text-sm text-muted-foreground", children: ["\uD83D\uDCDE ", branch.phone] }))] }), _jsx("div", { className: "mb-6", children: _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-2xl font-bold text-primary", children: branch.memberCount }), _jsx("p", { className: "text-xs text-muted-foreground uppercase", children: "Members" })] }) }), _jsxs("div", { className: "flex gap-3", children: [_jsxs(SoftButton, { variant: "secondary", onClick: () => handleEdit(branch), fullWidth: true, children: [_jsx(Edit2, { className: "w-4 h-4" }), "Edit"] }), _jsxs(SoftButton, { variant: "danger", onClick: () => handleDelete(branch.id), disabled: deleting === branch.id || branches.length === 1, fullWidth: true, children: [_jsx(Trash2, { className: "w-4 h-4" }), deleting === branch.id ? 'Deleting...' : 'Delete'] })] })] }) }, branch.id))) }))] }), _jsx(BranchFormModal, { isOpen: modalOpen, onClose: () => setModalOpen(false), onSuccess: handleModalSuccess, churchId: auth.church?.id || '', branch: editingBranch })] }));
}
export default BranchesPage;
//# sourceMappingURL=BranchesPage.js.map