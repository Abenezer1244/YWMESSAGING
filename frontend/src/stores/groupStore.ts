import { create } from 'zustand';
import { createSelectors } from '../hooks/createSelectors';

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
  // State
  groups: Group[];
  currentGroupId: string | null;
  isLoading: boolean;

  // Actions
  setGroups: (groups: Group[]) => void;
  setCurrentGroup: (groupId: string) => void;
  setLoading: (loading: boolean) => void;
  addGroup: (group: Group) => void;
  updateGroup: (groupId: string, updates: Partial<Group>) => void;
  removeGroup: (groupId: string) => void;
  reset: () => void;
}

const useGroupStoreBase = create<GroupState>()((set, get) => ({
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
      groups: state.groups.map((g) =>
        g.id === groupId ? { ...g, ...updates } : g
      ),
    }));
  },

  removeGroup: (groupId) => {
    set((state) => ({
      groups: state.groups.filter((g) => g.id !== groupId),
      // Reset current group if deleted
      currentGroupId:
        state.currentGroupId === groupId
          ? state.groups[0]?.id || null
          : state.currentGroupId,
    }));
  },

  // ✅ Reset all group data (used on logout to prevent data leakage)
  reset: () => {
    set({
      groups: [],
      currentGroupId: null,
      isLoading: false,
    });
  },
}));

export const useGroupStore = createSelectors(useGroupStoreBase);
