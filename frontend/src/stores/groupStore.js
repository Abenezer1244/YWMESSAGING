import { create } from 'zustand';
const useGroupStore = create()((set, get) => ({
    // State
    groups: [],
    currentGroupId: null,
    isLoading: false,
    // Actions
    setGroups: (groups) => {
        set({ groups });
        // Auto-select first group if none selected
        if (groups.length > 0 && !get().currentGroupId) {
            set({ currentGroupId: groups[0].id });
        }
    },
    setCurrentGroup: (groupId) => {
        set({ currentGroupId: groupId });
    },
    setLoading: (loading) => {
        set({ isLoading: loading });
    },
    addGroup: (group) => {
        set((state) => ({
            groups: [...state.groups, group],
        }));
        // Auto-select first group
        if (get().groups.length === 1) {
            set({ currentGroupId: group.id });
        }
    },
    updateGroup: (groupId, updates) => {
        set((state) => ({
            groups: state.groups.map((g) => g.id === groupId ? { ...g, ...updates } : g),
        }));
    },
    removeGroup: (groupId) => {
        set((state) => ({
            groups: state.groups.filter((g) => g.id !== groupId),
            // Reset current group if deleted
            currentGroupId: state.currentGroupId === groupId
                ? state.groups[0]?.id || null
                : state.currentGroupId,
        }));
    },
}));
export default useGroupStore;
//# sourceMappingURL=groupStore.js.map