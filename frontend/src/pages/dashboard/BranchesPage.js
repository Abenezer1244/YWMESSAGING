import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import useAuthStore from '../../stores/authStore';
import useBranchStore from '../../stores/branchStore';
import { getBranches, deleteBranch } from '../../api/branches';
import BranchFormModal from '../../components/branches/BranchFormModal';
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
        return (_jsx("div", { className: "p-6", children: _jsx("div", { className: "animate-pulse space-y-4", children: [1, 2, 3].map((i) => (_jsx("div", { className: "h-32 bg-gray-200 rounded-lg" }, i))) }) }));
    }
    return (_jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Branches" }), _jsx("button", { onClick: handleCreate, className: "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition", children: "+ Create Branch" })] }), branches.length === 0 ? (_jsxs("div", { className: "bg-white rounded-lg shadow p-12 text-center", children: [_jsx("p", { className: "text-gray-500 mb-4", children: "No branches yet. Create your first branch to get started." }), _jsx("button", { onClick: handleCreate, className: "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition", children: "Create Your First Branch" })] })) : (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: branches.map((branch) => (_jsxs("div", { className: "bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition", children: [_jsx("h3", { className: "text-lg font-bold text-gray-900 mb-2", children: branch.name }), branch.address && (_jsxs("p", { className: "text-sm text-gray-600 mb-1", children: ["\uD83D\uDCCD ", branch.address] })), branch.phone && (_jsxs("p", { className: "text-sm text-gray-600 mb-3", children: ["\uD83D\uDCDE ", branch.phone] })), branch.description && (_jsx("p", { className: "text-sm text-gray-500 mb-4", children: branch.description })), _jsxs("div", { className: "border-t pt-4 mb-4 flex gap-4", children: [_jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "text-2xl font-bold text-blue-600", children: branch.groupCount }), _jsx("p", { className: "text-xs text-gray-500", children: "Groups" })] }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "text-2xl font-bold text-green-600", children: branch.memberCount }), _jsx("p", { className: "text-xs text-gray-500", children: "Members" })] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: () => handleEdit(branch), className: "flex-1 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition", children: "Edit" }), _jsx("button", { onClick: () => handleDelete(branch.id), disabled: deleting === branch.id || branches.length === 1, className: "flex-1 px-3 py-2 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition", children: deleting === branch.id ? 'Deleting...' : 'Delete' })] })] }, branch.id))) })), _jsx(BranchFormModal, { isOpen: modalOpen, onClose: () => setModalOpen(false), onSuccess: handleModalSuccess, churchId: auth.church?.id || '', branch: editingBranch })] }));
}
export default BranchesPage;
//# sourceMappingURL=BranchesPage.js.map