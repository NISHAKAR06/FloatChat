import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useSidebarStore = create(
  persist(
    (set) => ({
      collapsed: false,
      toggleCollapsed: () => set(state => ({ collapsed: !state.collapsed })),
      setCollapsed: (collapsed) => set({ collapsed })
    }),
    {
      name: 'sidebar-storage',
    }
  )
);

export default useSidebarStore;