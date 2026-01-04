import { create } from 'zustand'

export const useStore = create((set) => ({
    // UI State
    isSidebarOpen: true,
    toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

    // Privacy Blur
    isPrivacyBlurred: false,
    setPrivacyBlur: (blurred) => set({ isPrivacyBlurred: blurred }),

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
