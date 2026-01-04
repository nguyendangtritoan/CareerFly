import { create } from 'zustand'

export const useStore = create((set) => ({
    // UI State
    isSidebarOpen: true,
    toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

    // Dark Mode
    isDarkMode: true, // Default to dark mode
    toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),

    // Sync State (Optimistic)
    syncStatus: 'idle', // 'idle' | 'syncing' | 'error' | 'offline'
    setSyncStatus: (status) => set({ syncStatus: status }),

    // Manager Mode (FR-06)
    isManagerMode: false,
    toggleManagerMode: () => set((state) => ({ isManagerMode: !state.isManagerMode })),

    // User State
    user: null,
    setUser: (user) => set({ user }),
}))
