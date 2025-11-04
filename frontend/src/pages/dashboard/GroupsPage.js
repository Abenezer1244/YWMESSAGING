import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import useGroupStore from '../../stores/groupStore';
import { getGroups, deleteGroup } from '../../api/groups';
import { GroupFormModal } from '../../components/groups/GroupFormModal';
import BackButton from '../../components/BackButton';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { Spinner } from '../../components/ui';
export function GroupsPage() {
    const { branchId = '' } = useParams();
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
        return (_jsx("div", { className: "min-h-screen bg-background flex items-center justify-center p-6", children: _jsx(Spinner, { size: "lg", text: "Loading groups..." }) }));
    }
    return (_jsxs("div", { className: "min-h-screen bg-background p-6 transition-colors duration-normal", children: [_jsxs("div", { className: "max-w-7xl mx-auto", children: [_jsx("div", { className: "mb-6", children: _jsx(BackButton, { variant: "ghost" }) }), _jsxs("div", { className: "flex items-center justify-between mb-8", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-4xl font-bold text-foreground mb-2", children: "\uD83D\uDC65 Groups" }), _jsxs("p", { className: "text-foreground/80", children: [groups.length, " groups in this branch"] })] }), _jsx(Button, { variant: "primary", size: "lg", onClick: handleCreateClick, children: "+ New Group" })] }), groups.length === 0 ? (_jsxs(Card, { variant: "highlight", className: "text-center py-16 bg-muted border-border", children: [_jsx("div", { className: "mb-6", children: _jsx("span", { className: "text-6xl", children: "\uD83D\uDC65" }) }), _jsx("h2", { className: "text-2xl font-bold text-foreground mb-3", children: "No Groups Yet" }), _jsx("p", { className: "text-foreground/80 mb-6 max-w-md mx-auto", children: "Create your first group to start organizing your congregation." }), _jsx(Button, { variant: "primary", size: "md", onClick: handleCreateClick, children: "Create First Group" })] })) : (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: groups.map((group) => (_jsxs(Card, { variant: "default", className: "hover:shadow-lg transition-shadow bg-muted border-border", children: [_jsxs("div", { className: "flex justify-between items-start mb-4", children: [_jsxs("div", { className: "flex-1", children: [_jsx("h3", { className: "text-lg font-semibold text-foreground", children: group.name }), group.description && (_jsx("p", { className: "text-foreground/80 text-sm mt-1", children: group.description }))] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { variant: "secondary", size: "sm", onClick: () => handleEditClick(group), children: "Edit" }), _jsx(Button, { variant: "danger", size: "sm", onClick: () => setDeleteConfirm(group.id), children: "Delete" })] })] }), _jsxs("div", { className: "space-y-2 mb-6 pb-6 border-b border-border", children: [_jsxs("div", { children: [_jsx("p", { className: "text-muted-foreground text-sm", children: "\uD83D\uDC64 Members" }), _jsx("p", { className: "text-2xl font-bold text-primary", children: group.memberCount })] }), group.welcomeMessageEnabled && (_jsxs("div", { children: [_jsx("p", { className: "text-muted-foreground text-sm", children: "Welcome Message" }), _jsx("p", { className: "text-sm text-green-400 font-medium", children: "\u2705 Enabled" })] }))] }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => window.location.href = `/members?groupId=${group.id}`, fullWidth: true, children: "\uD83D\uDC65 Manage Members" })] }, group.id))) }))] }), deleteConfirm && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4", children: _jsxs(Card, { variant: "default", className: "max-w-sm w-full bg-muted border-border", children: [_jsx("h3", { className: "text-lg font-bold text-foreground mb-2", children: "\u26A0\uFE0F Delete Group?" }), _jsx("p", { className: "text-foreground/80 mb-6", children: "This will delete the group and remove all members. This action cannot be undone." }), _jsxs("div", { className: "flex gap-3", children: [_jsx(Button, { variant: "secondary", size: "md", onClick: () => setDeleteConfirm(null), fullWidth: true, children: "Cancel" }), _jsx(Button, { variant: "danger", size: "md", onClick: () => handleDeleteClick(deleteConfirm), fullWidth: true, children: "Delete" })] })] }) })), _jsx(GroupFormModal, { isOpen: isModalOpen, group: editingGroup, branchId: branchId, onClose: () => {
                    setIsModalOpen(false);
                    setEditingGroup(undefined);
                }, onSuccess: handleModalSuccess })] }));
}
export default GroupsPage;
//# sourceMappingURL=GroupsPage.js.map