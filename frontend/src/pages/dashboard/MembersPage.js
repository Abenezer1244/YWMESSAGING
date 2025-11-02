import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import useGroupStore from '../../stores/groupStore';
import { getMembers } from '../../api/members';
import { AddMemberModal } from '../../components/members/AddMemberModal';
import { ImportCSVModal } from '../../components/members/ImportCSVModal';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import { Spinner } from '../../components/ui';
export function MembersPage() {
    const { groups, setLoading: setGroupsLoading } = useGroupStore();
    const [searchParams] = useSearchParams();
    const groupId = searchParams.get('groupId') || groups[0]?.id || '';
    const [members, setMembers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const limit = 50;
    const pages = Math.ceil(total / limit);
    const currentGroup = groups.find((g) => g.id === groupId);
    useEffect(() => {
        loadMembers();
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
    if (!currentGroup) {
        return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-primary-50 dark:from-primary-900 to-primary-100 dark:to-primary-950 flex items-center justify-center p-6", children: _jsx(Card, { variant: "default", className: "text-center max-w-md", children: _jsx("p", { className: "text-primary-600 dark:text-primary-400 text-lg", children: "No group selected. Create or select a group first." }) }) }));
    }
    return (_jsxs("div", { className: "min-h-screen bg-gradient-to-br from-primary-50 dark:from-primary-900 to-primary-100 dark:to-primary-950 p-6 transition-colors duration-normal", children: [_jsxs("div", { className: "max-w-7xl mx-auto", children: [_jsxs("div", { className: "mb-8", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-4xl font-bold text-primary-900 dark:text-primary-50 mb-2", children: "\uD83D\uDC64 Members" }), _jsxs("p", { className: "text-primary-600 dark:text-primary-400", children: [currentGroup.name, " \u2022 ", total, " members"] })] }), _jsx(Button, { variant: "primary", size: "lg", onClick: () => setIsAddModalOpen(true), children: "+ Add Member" })] }), _jsxs("div", { className: "flex gap-4 items-center flex-wrap", children: [_jsx(Input, { type: "text", placeholder: "Search by name, phone, or email...", value: search, onChange: (e) => {
                                            setSearch(e.target.value);
                                            setPage(1);
                                        }, className: "flex-1 min-w-xs" }), _jsx(Button, { variant: "primary", size: "md", onClick: () => setIsImportModalOpen(true), children: "\uD83D\uDCE5 Import CSV" })] })] }), isLoading ? (_jsx("div", { className: "flex items-center justify-center py-20", children: _jsx(Spinner, { size: "lg", text: "Loading members..." }) })) : members.length === 0 ? (_jsxs(Card, { variant: "highlight", className: "text-center py-16", children: [_jsx("div", { className: "mb-6", children: _jsx("span", { className: "text-6xl", children: "\uD83D\uDC64" }) }), _jsx("h2", { className: "text-2xl font-bold text-primary-900 dark:text-primary-50 mb-3", children: search ? 'No Results' : 'No Members Yet' }), _jsx("p", { className: "text-primary-600 dark:text-primary-400 mb-6 max-w-md mx-auto", children: search ? 'No members found matching your search' : 'Add your first member to get started' }), !search && (_jsx(Button, { variant: "primary", size: "md", onClick: () => setIsAddModalOpen(true), children: "Add First Member" }))] })) : (_jsxs(_Fragment, { children: [_jsx(Card, { variant: "default", className: "overflow-hidden", children: _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full", children: [_jsx("thead", { className: "bg-primary-100 dark:bg-primary-800 border-b border-primary-200 dark:border-primary-700", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-sm font-semibold text-primary-900 dark:text-primary-50", children: "Name" }), _jsx("th", { className: "px-6 py-3 text-left text-sm font-semibold text-primary-900 dark:text-primary-50", children: "Phone" }), _jsx("th", { className: "px-6 py-3 text-left text-sm font-semibold text-primary-900 dark:text-primary-50", children: "Email" }), _jsx("th", { className: "px-6 py-3 text-left text-sm font-semibold text-primary-900 dark:text-primary-50", children: "Status" }), _jsx("th", { className: "px-6 py-3 text-left text-sm font-semibold text-primary-900 dark:text-primary-50", children: "Added" })] }) }), _jsx("tbody", { className: "divide-y divide-primary-200 dark:divide-primary-700", children: members.map((member) => (_jsxs("tr", { className: "hover:bg-primary-50 dark:hover:bg-primary-700/50 transition-colors duration-normal", children: [_jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsxs("div", { className: "text-sm font-medium text-primary-900 dark:text-primary-50", children: [member.firstName, " ", member.lastName] }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsx("div", { className: "text-sm text-primary-600 dark:text-primary-400", children: member.phone }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsx("div", { className: "text-sm text-primary-600 dark:text-primary-400", children: member.email || '—' }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsx("span", { className: `inline-block px-3 py-1 text-xs font-semibold rounded-full ${member.optInSms
                                                                    ? 'bg-success-100 dark:bg-success-900 text-success-800 dark:text-success-200'
                                                                    : 'bg-danger-100 dark:bg-danger-900 text-danger-800 dark:text-danger-200'}`, children: member.optInSms ? '✅ Opted In' : '❌ Opted Out' }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-primary-600 dark:text-primary-400", children: new Date(member.createdAt).toLocaleDateString() })] }, member.id))) })] }) }) }), pages > 1 && (_jsxs("div", { className: "mt-6 flex justify-center gap-2", children: [_jsx(Button, { variant: "secondary", size: "md", onClick: () => setPage(Math.max(1, page - 1)), disabled: page === 1, children: "\u2190 Previous" }), _jsxs("div", { className: "px-4 py-2 text-primary-700 dark:text-primary-300 font-medium", children: ["Page ", page, " of ", pages] }), _jsx(Button, { variant: "secondary", size: "md", onClick: () => setPage(Math.min(pages, page + 1)), disabled: page === pages, children: "Next \u2192" })] }))] }))] }), _jsx(AddMemberModal, { isOpen: isAddModalOpen, groupId: groupId, onClose: () => setIsAddModalOpen(false), onSuccess: handleAddSuccess }), _jsx(ImportCSVModal, { isOpen: isImportModalOpen, groupId: groupId, onClose: () => setIsImportModalOpen(false), onSuccess: handleImportSuccess })] }));
}
export default MembersPage;
//# sourceMappingURL=MembersPage.js.map