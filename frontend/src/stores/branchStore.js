import { create } from 'zustand';
import { createSelectors } from '../hooks/createSelectors';
const useBranchStoreBase = create()((set, get) => ({
    // State
    branches: [],
    currentBranchId: null,
    allBranchesMode: false,
    isLoading: false,
    // Actions
    setBranches: (branches) => {
        set({ branches });
        // Auto-select first branch if none selected
        if (branches.length > 0 && !get().currentBranchId) {
            set({ currentBranchId: branches[0].id });
        }
    },
    setCurrentBranch: (branchId) => {
        set({ currentBranchId: branchId, allBranchesMode: false });
    },
    setAllBranchesMode: (mode) => {
        set({ allBranchesMode: mode });
    },
    setLoading: (loading) => {
        set({ isLoading: loading });
    },
    addBranch: (branch) => {
        set((state) => ({
            branches: [...state.branches, branch],
        }));
    },
    updateBranch: (branchId, updates) => {
        set((state) => ({
            branches: state.branches.map((b) => b.id === branchId ? { ...b, ...updates } : b),
        }));
    },
    removeBranch: (branchId) => {
        set((state) => ({
            branches: state.branches.filter((b) => b.id !== branchId),
            // Reset current branch if deleted
            currentBranchId: state.currentBranchId === branchId
                ? state.branches[0]?.id || null
                : state.currentBranchId,
        }));
    },
}));
/**
 * Branch Store with Auto-Generated Selectors
 *
 * Usage:
 * ✅ useStore.use.branches() - Only re-renders when branches array changes
 * ✅ useStore.use.currentBranchId() - Only re-renders when current branch ID changes
 * ✅ Manual (still works): useStore((state) => state.branches)
 */
export const useBranchStore = createSelectors(useBranchStoreBase);
//# sourceMappingURL=branchStore.js.map