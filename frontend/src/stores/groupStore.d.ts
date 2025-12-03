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
export declare const useGroupStore: {
    (): GroupState;
    <U>(selector: (state: GroupState) => U): U;
    <U>(selector: (state: GroupState) => U, equalityFn: (a: U, b: U) => boolean): U;
} & import("zustand").StoreApi<GroupState> & {
    use: {
        groups: () => Group[];
        currentGroupId: () => string | null;
        isLoading: () => boolean;
        setGroups: () => (groups: Group[]) => void;
        setCurrentGroup: () => (groupId: string) => void;
        setLoading: () => (loading: boolean) => void;
        addGroup: () => (group: Group) => void;
        updateGroup: () => (groupId: string, updates: Partial<Group>) => void;
        removeGroup: () => (groupId: string) => void;
    };
};
export {};
//# sourceMappingURL=groupStore.d.ts.map