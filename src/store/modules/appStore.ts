import { create } from 'zustand';

interface AppState {
  isPopupVisible: boolean;
  theme: 'light' | 'dark';
  userRole: 'user' | 'developer';
  setIsPopupVisible: (visible: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setUserRole: (role: 'user' | 'developer') => void;
}

export const appStore = create<AppState>((set) => ({
  isPopupVisible: false,
  theme: 'light',
  userRole: 'user',
  setIsPopupVisible: (visible) => set({ isPopupVisible: visible }),
  setTheme: (theme) => set({ theme }),
  setUserRole: (role) => set({ userRole: role }),
}));

// 为了兼容旧代码
export const useUserStore = appStore;
