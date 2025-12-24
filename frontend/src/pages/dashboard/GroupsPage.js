import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Loader, Trash2, Edit2, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useGroupStore } from '../../stores/groupStore';
import { useBranchStore } from '../../stores/branchStore';
import { getGroups, deleteGroup } from '../../api/groups';
import { GroupFormModal } from '../../components/groups/GroupFormModal';
import { SoftLayout, SoftCard, SoftButton } from '../../components/SoftUI';
export function GroupsPage() {
    const { branchId: paramBranchId } = useParams();
    const { currentBranchId } = useBranchStore();
    // Use branchId from params if available, otherwise from store
    const branchId = paramBranchId || currentBranchId || '';
    const { groups, setGroups, isLoading, setLoading } = useGroupStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingGroup, setEditingGroup] = useState();
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    useEffect(() => {
        loadGroups();
    }, [branchId]);
    const loadGroups = async () => {
        try {
            setLoading(true);
            const data = await getGroups(branchId);
            setGroups(data);
        }
        catch (error) {
            toast.error(error.message || 'Failed to load groups');
        }
        finally {
            setLoading(false);
        }
    };
    const handleCreateClick = () => {
        setEditingGroup(undefined);
        setIsModalOpen(true);
    };
    const handleEditClick = (group) => {
        setEditingGroup(group);
        setIsModalOpen(true);
    };
    const handleDeleteClick = async (groupId) => {
        try {
            await deleteGroup(groupId);
            toast.success('Group deleted successfully');
            setDeleteConfirm(null);
            await loadGroups();
        }
        catch (error) {
            toast.error(error.message || 'Failed to delete group');
        }
    };
    const handleModalSuccess = (group) => {
        if (editingGroup) {
            // Update existing
            setGroups(groups.map((g) => (g.id === group.id ? group : g)));
        }
        else {
            // Add new
            setGroups([group, ...groups]);
        }
    };
    if (isLoading) {
        return (_jsx(SoftLayout, { children: _jsx("div", { className: "min-h-screen bg-background flex items-center justify-center p-6", children: _jsx(motion.div, { animate: { rotate: 360 }, transition: { duration: 2, repeat: Infinity }, children: _jsx(Loader, { className: "w-8 h-8 text-primary" }) }) }) }));
    }
    return (_jsxs(SoftLayout, { children: [_jsxs("div", { className: "px-4 md:px-8 py-8 w-full", children: [_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 }, className: "flex items-center justify-between mb-8 flex-wrap gap-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-4xl font-bold text-foreground mb-2", children: _jsx("span", { className: "bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent", children: "Groups" }) }), _jsxs("p", { className: "text-muted-foreground", children: [groups.length, " groups in this branch"] })] }), _jsx(SoftButton, { variant: "primary", size: "lg", onClick: handleCreateClick, children: "New Group" })] }), groups.length === 0 ? (_jsxs(SoftCard, { className: "text-center py-16", children: [_jsx("div", { className: "mb-6", children: _jsx(Users, { className: "w-16 h-16 text-muted-foreground/50 mx-auto" }) }), _jsx("h2", { className: "text-2xl font-bold text-foreground mb-3", children: "No Groups Yet" }), _jsx("p", { className: "text-muted-foreground mb-6 max-w-md mx-auto", children: "Create your first group to start organizing your congregation." }), _jsx(SoftButton, { variant: "primary", onClick: handleCreateClick, children: "Create First Group" })] })) : (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: groups.map((group, idx) => (_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: idx * 0.05 }, children: _jsxs(SoftCard, { variant: "default", children: [_jsxs("div", { className: "flex justify-between items-start mb-4 flex-wrap gap-3", children: [_jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("h3", { className: "text-lg font-semibold text-foreground", children: group.name }), group.description && (_jsx("p", { className: "text-muted-foreground text-sm mt-1", children: group.description }))] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(SoftButton, { variant: "secondary", onClick: () => handleEditClick(group), children: _jsx(Edit2, { className: "w-4 h-4" }) }), _jsx(SoftButton, { variant: "danger", onClick: () => setDeleteConfirm(group.id), children: _jsx(Trash2, { className: "w-4 h-4" }) })] })] }), _jsxs("div", { className: "space-y-2 mb-6 pb-6 border-b border-border/40", children: [_jsxs("div", { children: [_jsx("p", { className: "text-muted-foreground text-sm", children: "Members" }), _jsx("p", { className: "text-2xl font-bold text-primary", children: group.memberCount })] }), group.welcomeMessageEnabled && (_jsxs("div", { children: [_jsx("p", { className: "text-muted-foreground text-sm", children: "Welcome Message" }), _jsx("p", { className: "text-sm text-green-400 font-medium", children: "Enabled" })] }))] }), _jsx(SoftButton, { variant: "secondary", onClick: () => window.location.href = `/members?groupId=${group.id}`, fullWidth: true, children: "Manage Members" })] }) }, group.id))) }))] }), deleteConfirm && (_jsx("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm", children: _jsx(motion.div, { initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 0.2 }, children: _jsxs(SoftCard, { className: "max-w-sm w-full", children: [_jsxs("div", { className: "flex gap-3 items-start mb-4", children: [_jsx(AlertTriangle, { className: "w-6 h-6 text-red-400 flex-shrink-0" }), _jsx("div", { children: _jsx("h3", { className: "text-lg font-bold text-foreground", children: "Delete Group?" }) })] }), _jsx("p", { className: "text-muted-foreground mb-6", children: "This will delete the group and remove all members. This action cannot be undone." }), _jsxs("div", { className: "flex gap-3", children: [_jsx(SoftButton, { variant: "secondary", onClick: () => setDeleteConfirm(null), fullWidth: true, children: "Cancel" }), _jsx(SoftButton, { variant: "danger", onClick: () => handleDeleteClick(deleteConfirm), fullWidth: true, children: "Delete" })] })] }) }) })), _jsx(GroupFormModal, { isOpen: isModalOpen, group: editingGroup, branchId: branchId, onClose: () => {
                    setIsModalOpen(false);
                    setEditingGroup(undefined);
                }, onSuccess: handleModalSuccess })] }));
}
export default GroupsPage;
//# sourceMappingURL=GroupsPage.js.map