import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Trash2, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../../stores/authStore';
import useBranchStore from '../../stores/branchStore';
import useGroupStore from '../../stores/groupStore';
import { getMembers, removeMember } from '../../api/members';
import { getGroups } from '../../api/groups';
import { AddMemberModal } from '../../components/members/AddMemberModal';
import { ImportCSVModal } from '../../components/members/ImportCSVModal';
import { SoftLayout, SoftCard, SoftButton } from '../../components/SoftUI';
import Input from '../../components/ui/Input';
export function MembersPage() {
    const auth = useAuthStore();
    const { branches } = useBranchStore();
    const { groups, setGroups } = useGroupStore();
    const [searchParams] = useSearchParams();
    const [isInitialLoading, setIsInitialLoading] = useState(!groups.length);
    const groupId = searchParams.get('groupId') || groups[0]?.id || '';
    const [members, setMembers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [deletingMemberId, setDeletingMemberId] = useState(null);
    const limit = 50;
    const pages = Math.ceil(total / limit);
    const currentGroup = groups.find((g) => g.id === groupId);
    // Load branches and groups on mount if not already loaded
    useEffect(() => {
        if (!groups.length && auth.church?.id && branches.length > 0) {
            const loadGroupsForFirstBranch = async () => {
                try {
                    const firstBranch = branches[0];
                    const branchGroups = await getGroups(firstBranch.id);
                    setGroups(branchGroups);
                }
                catch (error) {
                    console.error('Failed to load groups:', error);
                }
                finally {
                    setIsInitialLoading(false);
                }
            };
            loadGroupsForFirstBranch();
        }
        else {
            setIsInitialLoading(false);
        }
    }, [auth.church?.id, branches, groups.length, setGroups]);
    // Debounce search - wait 500ms after user stops typing before searching
    useEffect(() => {
        const searchTimer = setTimeout(() => {
            loadMembers();
        }, 500);
        return () => clearTimeout(searchTimer);
    }, [groupId, page, search]);
    const loadMembers = async () => {
        if (!groupId)
            return;
        try {
            setIsLoading(true);
            const data = await getMembers(groupId, {
                page,
                limit,
                search: search || undefined,
            });
            setMembers(data.data);
            setTotal(data.pagination.total);
        }
        catch (error) {
            toast.error(error.message || 'Failed to load members');
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleAddSuccess = (newMember) => {
        setMembers([newMember, ...members]);
        setTotal(total + 1);
        setIsAddModalOpen(false);
    };
    const handleImportSuccess = () => {
        setPage(1);
        loadMembers();
        setIsImportModalOpen(false);
    };
    const handleDeleteMember = async (memberId, memberName) => {
        if (!window.confirm(`Are you sure you want to remove ${memberName} from this group?`)) {
            return;
        }
        try {
            setDeletingMemberId(memberId);
            await removeMember(groupId, memberId);
            setMembers(members.filter((m) => m.id !== memberId));
            setTotal(total - 1);
            toast.success('Member removed successfully');
        }
        catch (error) {
            toast.error(error.message || 'Failed to remove member');
        }
        finally {
            setDeletingMemberId(null);
        }
    };
    // Show loading spinner while initially loading groups
    if (isInitialLoading || !currentGroup) {
        return (_jsx(SoftLayout, { children: _jsx("div", { className: "min-h-screen bg-background flex items-center justify-center p-6", children: isInitialLoading ? (_jsx(motion.div, { animate: { rotate: 360 }, transition: { duration: 2, repeat: Infinity }, children: _jsx(Loader, { className: "w-8 h-8 text-primary" }) })) : (_jsx(SoftCard, { className: "text-center max-w-md", children: _jsx("p", { className: "text-foreground/80 text-lg", children: "No group selected. Create or select a group first." }) })) }) }));
    }
    return (_jsxs(SoftLayout, { children: [_jsxs("div", { className: "px-4 md:px-8 py-8 w-full", children: [_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 }, className: "mb-8", children: [_jsxs("div", { className: "flex items-center justify-between mb-6 flex-wrap gap-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-4xl font-bold text-foreground mb-2", children: _jsx("span", { className: "bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent", children: "Members" }) }), _jsxs("p", { className: "text-muted-foreground", children: [currentGroup.name, " \u2022 ", total, " members"] })] }), _jsx(SoftButton, { variant: "primary", size: "lg", onClick: () => setIsAddModalOpen(true), children: "Add Member" })] }), _jsxs("div", { className: "flex gap-4 items-center flex-wrap", children: [_jsx(Input, { type: "text", placeholder: "Search by name, phone, or email...", value: search, onChange: (e) => {
                                            setSearch(e.target.value);
                                            setPage(1);
                                        }, className: "flex-1 min-w-xs" }), _jsx(SoftButton, { variant: "secondary", size: "md", onClick: () => setIsImportModalOpen(true), children: "Import CSV" })] })] }), isLoading ? (_jsx("div", { className: "flex items-center justify-center py-20", children: _jsx(motion.div, { animate: { rotate: 360 }, transition: { duration: 2, repeat: Infinity }, children: _jsx(Loader, { className: "w-8 h-8 text-primary" }) }) })) : members.length === 0 ? (_jsxs(SoftCard, { className: "text-center py-16", children: [_jsx("div", { className: "mb-6", children: _jsx(Users, { className: "w-16 h-16 text-muted-foreground/50 mx-auto" }) }), _jsx("h2", { className: "text-2xl font-bold text-foreground mb-3", children: search ? 'No Results' : 'No Members Yet' }), _jsx("p", { className: "text-muted-foreground mb-6 max-w-md mx-auto", children: search ? 'No members found matching your search' : 'Add your first member to get started' }), !search && (_jsx(SoftButton, { variant: "primary", onClick: () => setIsAddModalOpen(true), children: "Add First Member" }))] })) : (_jsxs(_Fragment, { children: [_jsx(SoftCard, { variant: "default", className: "overflow-hidden", children: _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full", children: [_jsx("thead", { className: "border-b border-border/40", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-4 text-left text-sm font-semibold text-foreground", children: "Name" }), _jsx("th", { className: "px-6 py-4 text-left text-sm font-semibold text-foreground", children: "Phone" }), _jsx("th", { className: "px-6 py-4 text-left text-sm font-semibold text-foreground", children: "Email" }), _jsx("th", { className: "px-6 py-4 text-left text-sm font-semibold text-foreground", children: "Status" }), _jsx("th", { className: "px-6 py-4 text-left text-sm font-semibold text-foreground", children: "Added" }), _jsx("th", { className: "px-6 py-4 text-left text-sm font-semibold text-foreground", children: "Actions" })] }) }), _jsx("tbody", { className: "divide-y divide-border/40", children: members.map((member, idx) => (_jsxs(motion.tr, { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, transition: { delay: idx * 0.05 }, className: "hover:bg-muted/30 transition-colors duration-normal", children: [_jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsxs("div", { className: "text-sm font-medium text-foreground", children: [member.firstName, " ", member.lastName] }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsx("div", { className: "text-sm text-muted-foreground", children: member.phone }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsx("div", { className: "text-sm text-muted-foreground", children: member.email || '—' }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsx("span", { className: `inline-block px-3 py-1 text-xs font-semibold rounded-lg ${member.optInSms
                                                                    ? 'bg-green-500/20 text-green-400'
                                                                    : 'bg-red-500/20 text-red-400'}`, children: member.optInSms ? 'Opted In' : 'Opted Out' }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-muted-foreground", children: new Date(member.createdAt).toLocaleDateString() }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsxs(motion.button, { whileHover: { scale: 1.05 }, onClick: () => handleDeleteMember(member.id, `${member.firstName} ${member.lastName}`), disabled: deletingMemberId === member.id, className: "text-red-400 hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors flex items-center gap-2", children: [_jsx(Trash2, { className: "w-4 h-4" }), deletingMemberId === member.id ? 'Removing...' : 'Remove'] }) })] }, member.id))) })] }) }) }), pages > 1 && (_jsxs("div", { className: "mt-8 flex justify-center gap-2 items-center", children: [_jsx(SoftButton, { variant: "secondary", onClick: () => setPage(Math.max(1, page - 1)), disabled: page === 1, children: "Previous" }), _jsxs("div", { className: "px-4 py-2 text-muted-foreground font-medium", children: ["Page ", page, " of ", pages] }), _jsx(SoftButton, { variant: "secondary", onClick: () => setPage(Math.min(pages, page + 1)), disabled: page === pages, children: "Next" })] }))] }))] }), _jsx(AddMemberModal, { isOpen: isAddModalOpen, groupId: groupId, onClose: () => setIsAddModalOpen(false), onSuccess: handleAddSuccess }), _jsx(ImportCSVModal, { isOpen: isImportModalOpen, groupId: groupId, onClose: () => setIsImportModalOpen(false), onSuccess: handleImportSuccess })] }));
}
export default MembersPage;
//# sourceMappingURL=MembersPage.js.map