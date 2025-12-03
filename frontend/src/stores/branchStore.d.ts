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
    branches: Branch[];
    currentBranchId: string | null;
    allBranchesMode: boolean;
    isLoading: boolean;
    setBranches: (branches: Branch[]) => void;
    setCurrentBranch: (branchId: string) => void;
    setAllBranchesMode: (mode: boolean) => void;
    setLoading: (loading: boolean) => void;
    addBranch: (branch: Branch) => void;
    updateBranch: (branchId: string, updates: Partial<Branch>) => void;
    removeBranch: (branchId: string) => void;
}
/**
 * Branch Store with Auto-Generated Selectors
 *
 * Usage:
 * ✅ useStore.use.branches() - Only re-renders when branches array changes
 * ✅ useStore.use.currentBranchId() - Only re-renders when current branch ID changes
 * ✅ Manual (still works): useStore((state) => state.branches)
 */
export declare const useBranchStore: {
    (): BranchState;
    <U>(selector: (state: BranchState) => U): U;
    <U>(selector: (state: BranchState) => U, equalityFn: (a: U, b: U) => boolean): U;
} & import("zustand").StoreApi<BranchState> & {
    use: {
        branches: () => Branch[];
        currentBranchId: () => string | null;
        allBranchesMode: () => boolean;
        isLoading: () => boolean;
        setBranches: () => (branches: Branch[]) => void;
        setCurrentBranch: () => (branchId: string) => void;
        setAllBranchesMode: () => (mode: boolean) => void;
        setLoading: () => (loading: boolean) => void;
        addBranch: () => (branch: Branch) => void;
        updateBranch: () => (branchId: string, updates: Partial<Branch>) => void;
        removeBranch: () => (branchId: string) => void;
    };
};
export {};
//# sourceMappingURL=branchStore.d.ts.map