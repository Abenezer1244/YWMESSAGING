import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import useGroupStore from '../../stores/groupStore';
import { getMembers } from '../../api/members';
import { AddMemberModal } from '../../components/members/AddMemberModal';
import { ImportCSVModal } from '../../components/members/ImportCSVModal';
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
        return (_jsx("div", { className: "flex items-center justify-center h-96 text-gray-500", children: "No group selected. Create or select a group first." }));
    }
    return (_jsxs("div", { className: "min-h-screen bg-gray-50", children: [_jsx("div", { className: "bg-white shadow", children: _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4", children: [_jsxs("div", { className: "mb-4", children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Members" }), _jsxs("p", { className: "text-gray-600 mt-1", children: [currentGroup.name, " \u2022 ", total, " members"] })] }), _jsxs("div", { className: "flex gap-4 items-center", children: [_jsx("input", { type: "text", placeholder: "Search by name, phone, or email...", value: search, onChange: (e) => {
                                        setSearch(e.target.value);
                                        setPage(1);
                                    }, className: "flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" }), _jsx("button", { onClick: () => setIsImportModalOpen(true), className: "bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition", children: "\uD83D\uDCE5 Import CSV" }), _jsx("button", { onClick: () => setIsAddModalOpen(true), className: "bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition", children: "+ Add Member" })] })] }) }), _jsx("main", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: isLoading ? (_jsx("div", { className: "text-center py-12", children: _jsx("p", { className: "text-gray-500", children: "Loading members..." }) })) : members.length === 0 ? (_jsxs("div", { className: "text-center py-12", children: [_jsx("p", { className: "text-gray-500 text-lg mb-4", children: search ? 'No members found matching your search' : 'No members yet' }), !search && (_jsx("button", { onClick: () => setIsAddModalOpen(true), className: "bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition", children: "Add First Member" }))] })) : (_jsxs(_Fragment, { children: [_jsx("div", { className: "bg-white rounded-lg shadow overflow-hidden", children: _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full", children: [_jsx("thead", { className: "bg-gray-50 border-b", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-sm font-semibold text-gray-900", children: "Name" }), _jsx("th", { className: "px-6 py-3 text-left text-sm font-semibold text-gray-900", children: "Phone" }), _jsx("th", { className: "px-6 py-3 text-left text-sm font-semibold text-gray-900", children: "Email" }), _jsx("th", { className: "px-6 py-3 text-left text-sm font-semibold text-gray-900", children: "Status" }), _jsx("th", { className: "px-6 py-3 text-left text-sm font-semibold text-gray-900", children: "Added" })] }) }), _jsx("tbody", { className: "divide-y", children: members.map((member) => (_jsxs("tr", { className: "hover:bg-gray-50", children: [_jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsxs("div", { className: "text-sm font-medium text-gray-900", children: [member.firstName, " ", member.lastName] }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsx("div", { className: "text-sm text-gray-600", children: member.phone }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsx("div", { className: "text-sm text-gray-600", children: member.email || '—' }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsx("span", { className: `inline-block px-3 py-1 text-xs font-semibold rounded-full ${member.optInSms
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-red-100 text-red-800'}`, children: member.optInSms ? 'Opted In' : 'Opted Out' }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-600", children: new Date(member.createdAt).toLocaleDateString() })] }, member.id))) })] }) }) }), pages > 1 && (_jsxs("div", { className: "mt-6 flex justify-center gap-2", children: [_jsx("button", { onClick: () => setPage(Math.max(1, page - 1)), disabled: page === 1, className: "px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50", children: "Previous" }), _jsxs("div", { className: "px-4 py-2 text-gray-700", children: ["Page ", page, " of ", pages] }), _jsx("button", { onClick: () => setPage(Math.min(pages, page + 1)), disabled: page === pages, className: "px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50", children: "Next" })] }))] })) }), _jsx(AddMemberModal, { isOpen: isAddModalOpen, groupId: groupId, onClose: () => setIsAddModalOpen(false), onSuccess: handleAddSuccess }), _jsx(ImportCSVModal, { isOpen: isImportModalOpen, groupId: groupId, onClose: () => setIsImportModalOpen(false), onSuccess: handleImportSuccess })] }));
}
export default MembersPage;
//# sourceMappingURL=MembersPage.js.map