export interface Group {
    id: string;
    name: string;
    description?: string;
    welcomeMessageEnabled: boolean;
    welcomeMessageText?: string;
    memberCount: number;
    createdAt: string;
    updatedAt: string;
}
interface GroupState {
    groups: Group[];
    currentGroupId: string | null;
    isLoading: boolean;
    setGroups: (groups: Group[]) => void;
    setCurrentGroup: (groupId: string) => void;
    setLoading: (loading: boolean) => void;
    addGroup: (group: Group) => void;
    updateGroup: (groupId: string, updates: Partial<Group>) => void;
    removeGroup: (groupId: string) => void;
}
declare const useGroupStore: import("zustand").UseBoundStore<import("zustand").StoreApi<GroupState>>;
export default useGroupStore;
//# sourceMappingURL=groupStore.d.ts.map