import { create } from 'zustand';
import { createSelectors } from '../hooks/createSelectors';

export interface Branch {
  id: string;
  churchId: string;
  name: string;
  address?: string;
  phone?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  groupCount: number;
  memberCount: number;
}

interface BranchState {
  // State
  branches: Branch[];
  currentBranchId: string | null;
  allBranchesMode: boolean;
  isLoading: boolean;

  // Actions
  setBranches: (branches: Branch[]) => void;
  setCurrentBranch: (branchId: string) => void;
  setAllBranchesMode: (mode: boolean) => void;
  setLoading: (loading: boolean) => void;
  addBranch: (branch: Branch) => void;
  updateBranch: (branchId: string, updates: Partial<Branch>) => void;
  removeBranch: (branchId: string) => void;
  reset: () => void;
}

const useBranchStoreBase = create<BranchState>()((set, get) => ({
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
      branches: state.branches.map((b) =>
        b.id === branchId ? { ...b, ...updates } : b
      ),
    }));
  },

  removeBranch: (branchId) => {
    set((state) => ({
      branches: state.branches.filter((b) => b.id !== branchId),
      // Reset current branch if deleted
      currentBranchId:
        state.currentBranchId === branchId
          ? state.branches[0]?.id || null
          : state.currentBranchId,
    }));
  },

  // ✅ Reset all branch data (used on logout to prevent data leakage)
  reset: () => {
    set({
      branches: [],
      currentBranchId: null,
      allBranchesMode: false,
      isLoading: false,
    });
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
