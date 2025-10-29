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
declare const useBranchStore: import("zustand").UseBoundStore<import("zustand").StoreApi<BranchState>>;
export default useBranchStore;
//# sourceMappingURL=branchStore.d.ts.map