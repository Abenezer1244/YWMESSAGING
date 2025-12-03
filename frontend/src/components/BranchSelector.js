import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useBranchStore } from '../stores/branchStore';
export function BranchSelector() {
    const { branches, currentBranchId, allBranchesMode, setCurrentBranch, setAllBranchesMode } = useBranchStore();
    const [isOpen, setIsOpen] = useState(false);
    const currentBranch = branches.find((b) => b.id === currentBranchId);
    if (branches.length === 0) {
        return null;
    }
    return (_jsxs("div", { className: "relative", children: [_jsxs("button", { onClick: () => setIsOpen(!isOpen), className: "px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition", children: [_jsx("span", { className: "text-sm font-medium", children: allBranchesMode ? 'All Branches' : currentBranch?.name || 'Select Branch' }), _jsx("svg", { className: `w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`, fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 14l-7 7m0 0l-7-7m7 7V3" }) })] }), isOpen && (_jsx("div", { className: "absolute top-full left-0 mt-2 w-56 bg-white border border-gray-300 rounded-lg shadow-lg z-50", children: _jsxs("div", { className: "p-2", children: [_jsx("button", { onClick: () => {
                                setAllBranchesMode(true);
                                setIsOpen(false);
                            }, className: `w-full text-left px-4 py-2 rounded-lg transition ${allBranchesMode
                                ? 'bg-blue-50 text-blue-600 font-medium'
                                : 'hover:bg-gray-50'}`, children: "\uD83D\uDCCA All Branches" }), _jsx("div", { className: "border-t my-2" }), branches.map((branch) => (_jsx("button", { onClick: () => {
                                setCurrentBranch(branch.id);
                                setIsOpen(false);
                            }, className: `w-full text-left px-4 py-2 rounded-lg transition ${currentBranchId === branch.id && !allBranchesMode
                                ? 'bg-blue-50 text-blue-600 font-medium'
                                : 'hover:bg-gray-50'}`, children: _jsxs("div", { children: [_jsx("div", { className: "font-medium text-sm", children: branch.name }), _jsxs("div", { className: "text-xs text-gray-500", children: [branch.groupCount, " group", branch.groupCount !== 1 ? 's' : '', " \u2022 ", branch.memberCount, " member", branch.memberCount !== 1 ? 's' : ''] })] }) }, branch.id)))] }) }))] }));
}
export default BranchSelector;
//# sourceMappingURL=BranchSelector.js.map