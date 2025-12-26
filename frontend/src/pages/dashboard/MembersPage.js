import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Trash2, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../stores/authStore';
import { useBranchStore } from '../../stores/branchStore';
import { useGroupStore } from '../../stores/groupStore';
import { getMembers, removeMember } from '../../api/members';
import { getGroups } from '../../api/groups';
import { AddMemberModal } from '../../components/members/AddMemberModal';
import { ImportCSVModal } from '../../components/members/ImportCSVModal';
import { SoftLayout, SoftCard, SoftButton } from '../../components/SoftUI';
import Input from '../../components/ui/Input';
import { MobileTable } from '../../components/responsive';
import { designTokens } from '../../utils/designTokens';
export function MembersPage() {
    const auth = useAuthStore();
    const { branches } = useBranchStore();
    const { groups, setGroups } = useGroupStore();
    const [searchParams] = useSearchParams();
    const { groupId: urlGroupId } = useParams();
    const [isInitialLoading, setIsInitialLoading] = useState(!groups.length);
    const groupId = urlGroupId || searchParams.get('groupId') || groups[0]?.id || '';
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
    // Define loadMembers function first (must be before useEffect hooks)
    // CRITICAL: Only update total on first load (page=1) or search, NOT on every page navigation
    const loadMembers = useCallback(async (pageNum = 1, updateTotal = true) => {
        if (!groupId)
            return;
        try {
            setIsLoading(true);
            const data = await getMembers(groupId, {
                page: pageNum,
                limit,
                search: search || undefined,
            });
            setMembers(data.data);
            // CRITICAL FIX: Only update total count when explicitly requested
            // This prevents pagination from showing changing "X of Y" as data modifies
            // Total is updated only on:
            // 1. Initial load (page 1)
            // 2. After search
            // 3. After add/import/delete (explicit calls)
            // NOT on page navigation
            if (updateTotal) {
                setTotal(data.pagination.total);
            }
        }
        catch (error) {
            toast.error(error.message || 'Failed to load members');
        }
        finally {
            setIsLoading(false);
        }
    }, [groupId, search]);
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
    // Load members when group changes (initial load) - UPDATE TOTAL
    useEffect(() => {
        if (groupId) {
            loadMembers(1, true); // true = update total
        }
    }, [groupId, loadMembers]);
    // Load members when page changes (pagination) - DON'T UPDATE TOTAL
    // This keeps pagination stable and prevents "X of Y" from changing
    useEffect(() => {
        if (groupId && page > 1) {
            loadMembers(page, false); // false = don't update total
        }
    }, [page, groupId, loadMembers]);
    // Debounce search - wait 500ms after user stops typing before searching
    useEffect(() => {
        if (!groupId)
            return;
        const searchTimer = setTimeout(() => {
            // Reset to page 1 when searching
            setPage(1);
            loadMembers(1, true); // true = update total for new search results
        }, 500);
        return () => clearTimeout(searchTimer);
    }, [search, groupId, loadMembers]);
    const handleAddSuccess = async (newMember) => {
        // Refetch members list after successful add
        // Reset to page 1 and load fresh data
        setPage(1);
        // Small delay to ensure backend has committed the write
        await new Promise(resolve => setTimeout(resolve, 300));
        await loadMembers(1, true); // true = update total
        setIsAddModalOpen(false);
    };
    const handleImportSuccess = async () => {
        setPage(1);
        // Small delay to ensure all members have been written to database
        await new Promise(resolve => setTimeout(resolve, 300));
        await loadMembers(1, true); // true = update total
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
    if (isInitialLoading) {
        return (_jsx(SoftLayout, { children: _jsx("div", { className: "min-h-screen bg-background flex items-center justify-center p-6", children: _jsx(motion.div, { animate: { rotate: 360 }, transition: { duration: 2, repeat: Infinity }, children: _jsx(Loader, { className: "w-8 h-8 text-primary" }) }) }) }));
    }
    // Show error if no group selected and no groupId in URL
    if (!groupId) {
        return (_jsx(SoftLayout, { children: _jsx("div", { className: "min-h-screen bg-background flex items-center justify-center p-6", children: _jsx(SoftCard, { className: "text-center max-w-md", children: _jsx("p", { className: "text-foreground/80 text-lg", children: "No group selected. Create or select a group first." }) }) }) }));
    }
    return (_jsxs(SoftLayout, { children: [_jsxs("div", { className: "px-4 md:px-8 py-8 w-full", children: [_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 }, className: "mb-8", children: [_jsxs("div", { className: "flex items-center justify-between mb-6 flex-wrap gap-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-4xl font-bold text-foreground mb-2", children: _jsx("span", { className: "bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent", children: "Members" }) }), _jsxs("p", { className: "text-muted-foreground", children: [currentGroup?.name || 'Group', " \u2022 ", total, " members"] })] }), _jsx(SoftButton, { variant: "primary", size: "lg", onClick: () => setIsAddModalOpen(true), children: "Add Member" })] }), _jsxs("div", { className: "flex gap-4 items-center flex-wrap", children: [_jsx(Input, { type: "text", placeholder: "Search by name, phone, or email...", value: search, onChange: (e) => {
                                            setSearch(e.target.value);
                                            setPage(1);
                                        }, className: "flex-1 min-w-xs" }), _jsx(SoftButton, { variant: "secondary", size: "md", onClick: () => setIsImportModalOpen(true), children: "Import CSV" })] })] }), isLoading ? (_jsx("div", { className: "flex items-center justify-center py-20", children: _jsx(motion.div, { animate: { rotate: 360 }, transition: { duration: 2, repeat: Infinity }, children: _jsx(Loader, { className: "w-8 h-8 text-primary" }) }) })) : members.length === 0 ? (_jsxs(SoftCard, { className: "text-center py-16", children: [_jsx("div", { className: "mb-6", children: _jsx(Users, { className: "w-16 h-16 text-muted-foreground/50 mx-auto" }) }), _jsx("h2", { className: "text-2xl font-bold text-foreground mb-3", children: search ? 'No Results' : 'No Members Yet' }), _jsx("p", { className: "text-muted-foreground mb-6 max-w-md mx-auto", children: search ? 'No members found matching your search' : 'Add your first member to get started' }), !search && (_jsx(SoftButton, { variant: "primary", onClick: () => setIsAddModalOpen(true), children: "Add First Member" }))] })) : (_jsxs(_Fragment, { children: [_jsx(SoftCard, { variant: "default", className: "overflow-hidden", children: _jsx(MobileTable, { data: members, columns: [
                                        {
                                            label: 'Name',
                                            key: 'firstName',
                                            render: (member) => `${member.firstName} ${member.lastName}`,
                                        },
                                        {
                                            label: 'Phone',
                                            key: 'phone',
                                        },
                                        {
                                            label: 'Email',
                                            key: 'email',
                                            hideOnMobile: false,
                                        },
                                        {
                                            label: 'Status',
                                            key: 'optInSms',
                                            render: (member) => (_jsx("span", { className: `inline-block px-3 py-1 text-xs font-semibold rounded-lg ${member.optInSms
                                                    ? 'bg-green-500/20 text-green-400'
                                                    : 'bg-red-500/20 text-red-400'}`, children: member.optInSms ? 'Opted In' : 'Opted Out' })),
                                        },
                                        {
                                            label: 'Added',
                                            key: 'createdAt',
                                            render: (member) => new Date(member.createdAt).toLocaleDateString(),
                                        },
                                    ], keyField: "id", renderActions: (member) => (_jsxs(motion.button, { whileHover: { scale: 1.05 }, onClick: () => handleDeleteMember(member.id, `${member.firstName} ${member.lastName}`), disabled: deletingMemberId === member.id, style: {
                                            minHeight: designTokens.touchTarget.enhanced,
                                            minWidth: designTokens.touchTarget.enhanced,
                                        }, className: "text-red-400 hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors flex items-center gap-2 px-3 py-2", children: [_jsx(Trash2, { className: "w-4 h-4" }), deletingMemberId === member.id ? 'Removing...' : 'Remove'] })) }) }), pages > 1 && (_jsxs("div", { className: "mt-8 flex justify-center gap-2 items-center", children: [_jsx(SoftButton, { variant: "secondary", onClick: () => setPage(Math.max(1, page - 1)), disabled: page === 1, children: "Previous" }), _jsxs("div", { className: "px-4 py-2 text-muted-foreground font-medium", children: ["Page ", page, " of ", pages] }), _jsx(SoftButton, { variant: "secondary", onClick: () => setPage(Math.min(pages, page + 1)), disabled: page === pages, children: "Next" })] }))] }))] }), _jsx(AddMemberModal, { isOpen: isAddModalOpen, groupId: groupId, onClose: () => setIsAddModalOpen(false), onSuccess: handleAddSuccess }), _jsx(ImportCSVModal, { isOpen: isImportModalOpen, groupId: groupId, onClose: () => setIsImportModalOpen(false), onSuccess: handleImportSuccess })] }));
}
export default MembersPage;
//# sourceMappingURL=MembersPage.js.map