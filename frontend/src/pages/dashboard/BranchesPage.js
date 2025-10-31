import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import useAuthStore from '../../stores/authStore';
import useBranchStore from '../../stores/branchStore';
import { getBranches, deleteBranch } from '../../api/branches';
import BranchFormModal from '../../components/branches/BranchFormModal';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { Spinner } from '../../components/ui';
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
            toast.success(`Branch deleted. ${result.groupsDeleted} group(s) and ${result.membersDeleted} member(s) were removed.`);
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
        return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-secondary-50 dark:from-secondary-900 to-secondary-100 dark:to-secondary-950 p-6 flex items-center justify-center", children: _jsx(Spinner, { size: "lg", text: "Loading branches..." }) }));
    }
    return (_jsxs("div", { className: "min-h-screen bg-gradient-to-br from-secondary-50 dark:from-secondary-900 to-secondary-100 dark:to-secondary-950 p-6 transition-colors duration-normal", children: [_jsxs("div", { className: "max-w-7xl mx-auto", children: [_jsxs("div", { className: "flex items-center justify-between mb-8", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-4xl font-bold text-secondary-900 dark:text-secondary-50 mb-2", children: "\uD83D\uDCCD Branches" }), _jsx("p", { className: "text-secondary-600 dark:text-secondary-400", children: "Manage your church locations" })] }), _jsx(Button, { variant: "primary", size: "lg", onClick: handleCreate, children: "+ New Branch" })] }), branches.length === 0 ? (_jsxs(Card, { variant: "highlight", className: "text-center py-16", children: [_jsx("div", { className: "mb-6", children: _jsx("span", { className: "text-6xl", children: "\uD83D\uDCCD" }) }), _jsx("h2", { className: "text-2xl font-bold text-secondary-900 dark:text-secondary-50 mb-3", children: "No Branches Yet" }), _jsx("p", { className: "text-secondary-600 dark:text-secondary-400 mb-6 max-w-md mx-auto", children: "Create your first branch to start managing your church locations and organizing your congregation." }), _jsx(Button, { variant: "primary", size: "md", onClick: handleCreate, children: "Create Your First Branch" })] })) : (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: branches.map((branch) => (_jsxs(Card, { variant: "default", className: "hover:shadow-lg transition-shadow", children: [_jsxs("div", { className: "mb-4", children: [_jsx("h3", { className: "text-xl font-bold text-secondary-900 dark:text-secondary-50 mb-2", children: branch.name }), branch.description && (_jsx("p", { className: "text-sm text-secondary-600 dark:text-secondary-400", children: branch.description }))] }), _jsxs("div", { className: "space-y-2 mb-6 pb-6 border-b border-secondary-200 dark:border-secondary-700", children: [branch.address && (_jsxs("p", { className: "text-sm text-secondary-600 dark:text-secondary-400", children: [_jsx("span", { className: "font-medium", children: "\uD83D\uDCCD" }), " ", branch.address] })), branch.phone && (_jsxs("p", { className: "text-sm text-secondary-600 dark:text-secondary-400", children: [_jsx("span", { className: "font-medium", children: "\uD83D\uDCDE" }), " ", branch.phone] }))] }), _jsxs("div", { className: "grid grid-cols-2 gap-4 mb-6", children: [_jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-2xl font-bold text-primary-600 dark:text-primary-400", children: branch.groupCount }), _jsx("p", { className: "text-xs text-secondary-600 dark:text-secondary-400 uppercase", children: "Groups" })] }), _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-2xl font-bold text-success-600 dark:text-success-400", children: branch.memberCount }), _jsx("p", { className: "text-xs text-secondary-600 dark:text-secondary-400 uppercase", children: "Members" })] })] }), _jsxs("div", { className: "flex gap-3", children: [_jsx(Button, { variant: "secondary", size: "sm", onClick: () => handleEdit(branch), fullWidth: true, children: "Edit" }), _jsx(Button, { variant: "danger", size: "sm", onClick: () => handleDelete(branch.id), disabled: deleting === branch.id || branches.length === 1, fullWidth: true, children: deleting === branch.id ? 'Deleting...' : 'Delete' })] })] }, branch.id))) }))] }), _jsx(BranchFormModal, { isOpen: modalOpen, onClose: () => setModalOpen(false), onSuccess: handleModalSuccess, churchId: auth.church?.id || '', branch: editingBranch })] }));
}
export default BranchesPage;
//# sourceMappingURL=BranchesPage.js.map