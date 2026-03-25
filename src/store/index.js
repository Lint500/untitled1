// 自己控制状态管理 - Zustand
import { create } from 'zustand'

// 用户状态
export const useUserStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  
  login: (userData) => set({ 
    user: userData, 
    isAuthenticated: true 
  }),
  
  logout: () => set({ 
    user: null, 
    isAuthenticated: false 
  }),
  
  updateUser: (data) => set((state) => ({
    user: { ...state.user, ...data }
  }))
}))

// 应用全局状态
export const useAppStore = create((set) => ({
  theme: 'light',
  sidebarOpen: true,
  notifications: [],
  
  setTheme: (theme) => set({ theme }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  addNotification: (msg) => set((state) => ({ 
    notifications: [...state.notifications, msg] 
  })),
  clearNotifications: () => set({ notifications: [] })
}))

// Dev 面板状态
export const useDevStore = create((set) => ({
  isPanelOpen: false,
  logs: [],
  
  setIsPanelOpen: (open) => set({ isPanelOpen: open }),
  addLog: (log) => set((state) => ({ logs: [...state.logs, log] })),
  clearLogs: () => set({ logs: [] })
}))
