import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import useGroupStore from '../../stores/groupStore';
import { getGroups, deleteGroup } from '../../api/groups';
import { GroupFormModal } from '../../components/groups/GroupFormModal';
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
        return (_jsx("div", { className: "flex items-center justify-center h-96", children: _jsx("div", { className: "text-gray-500", children: "Loading groups..." }) }));
    }
    return (_jsxs("div", { className: "min-h-screen bg-gray-50", children: [_jsx("div", { className: "bg-white shadow", children: _jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4", children: _jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Groups" }), _jsxs("p", { className: "text-gray-600 mt-1", children: [groups.length, " groups"] })] }), _jsx("button", { onClick: handleCreateClick, className: "bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition", children: "+ Create Group" })] }) }) }), _jsx("main", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: groups.length === 0 ? (_jsxs("div", { className: "text-center py-12", children: [_jsx("p", { className: "text-gray-500 text-lg mb-4", children: "No groups yet" }), _jsx("button", { onClick: handleCreateClick, className: "bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition", children: "Create First Group" })] })) : (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: groups.map((group) => (_jsxs("div", { className: "bg-white rounded-lg shadow p-6 hover:shadow-lg transition", children: [_jsxs("div", { className: "flex justify-between items-start mb-3", children: [_jsxs("div", { className: "flex-1", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: group.name }), group.description && (_jsx("p", { className: "text-gray-600 text-sm mt-1", children: group.description }))] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: () => handleEditClick(group), className: "text-blue-600 hover:text-blue-700 font-medium text-sm", children: "Edit" }), _jsx("button", { onClick: () => setDeleteConfirm(group.id), className: "text-red-600 hover:text-red-700 font-medium text-sm", children: "Delete" })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4 pt-4 border-t", children: [_jsxs("div", { children: [_jsx("p", { className: "text-gray-600 text-sm", children: "Members" }), _jsx("p", { className: "text-2xl font-bold text-blue-600", children: group.memberCount })] }), group.welcomeMessageEnabled && (_jsxs("div", { children: [_jsx("p", { className: "text-gray-600 text-sm", children: "Welcome Message" }), _jsx("p", { className: "text-sm text-green-600 font-medium", children: "\u2713 Enabled" })] }))] }), _jsx("div", { className: "mt-4", children: _jsx("a", { href: `/members?groupId=${group.id}`, className: "text-blue-600 hover:text-blue-700 font-medium text-sm", children: "Manage Members \u2192" }) })] }, group.id))) })) }), deleteConfirm && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50", children: _jsxs("div", { className: "bg-white rounded-lg shadow-lg max-w-sm w-full mx-4 p-6", children: [_jsx("h3", { className: "text-lg font-bold text-gray-900 mb-2", children: "Delete Group?" }), _jsx("p", { className: "text-gray-600 mb-6", children: "This will delete the group and remove all members. This action cannot be undone." }), _jsxs("div", { className: "flex gap-3", children: [_jsx("button", { onClick: () => setDeleteConfirm(null), className: "flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition", children: "Cancel" }), _jsx("button", { onClick: () => handleDeleteClick(deleteConfirm), className: "flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition", children: "Delete" })] })] }) })), _jsx(GroupFormModal, { isOpen: isModalOpen, group: editingGroup, branchId: branchId, onClose: () => {
                    setIsModalOpen(false);
                    setEditingGroup(undefined);
                }, onSuccess: handleModalSuccess })] }));
}
export default GroupsPage;
//# sourceMappingURL=GroupsPage.js.map