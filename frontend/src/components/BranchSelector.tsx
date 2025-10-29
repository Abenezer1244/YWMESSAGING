import { useState } from 'react';
import useBranchStore from '../stores/branchStore';

export function BranchSelector() {
  const { branches, currentBranchId, allBranchesMode, setCurrentBranch, setAllBranchesMode } = useBranchStore();
  const [isOpen, setIsOpen] = useState(false);

  const currentBranch = branches.find((b) => b.id === currentBranchId);

  if (branches.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition"
      >
        <span className="text-sm font-medium">
          {allBranchesMode ? 'All Branches' : currentBranch?.name || 'Select Branch'}
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
          <div className="p-2">
            {/* All Branches Option */}
            <button
              onClick={() => {
                setAllBranchesMode(true);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2 rounded-lg transition ${
                allBranchesMode
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'hover:bg-gray-50'
              }`}
            >
              📊 All Branches
            </button>

            <div className="border-t my-2" />

            {/* Individual Branches */}
            {branches.map((branch) => (
              <button
                key={branch.id}
                onClick={() => {
                  setCurrentBranch(branch.id);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2 rounded-lg transition ${
                  currentBranchId === branch.id && !allBranchesMode
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div>
                  <div className="font-medium text-sm">{branch.name}</div>
                  <div className="text-xs text-gray-500">
                    {branch.groupCount} group{branch.groupCount !== 1 ? 's' : ''} • {branch.memberCount} member
                    {branch.memberCount !== 1 ? 's' : ''}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default BranchSelector;
