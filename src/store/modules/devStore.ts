import { create } from 'zustand';

export interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  data?: any;
}

interface DevState {
  isPanelOpen: boolean;
  logs: LogEntry[];
  performanceData: {
    cpu?: number;
    memory?: number;
    fps?: number;
  } | null;
  setIsPanelOpen: (open: boolean) => void;
  addLog: (log: LogEntry) => void;
  setPerformanceData: (data: { cpu?: number; memory?: number; fps?: number }) => void;
  clearLogs: () => void;
}

export const devStore = create<DevState>((set) => ({
  isPanelOpen: false,
  logs: [],
  performanceData: null,
  setIsPanelOpen: (open) => set({ isPanelOpen: open }),
  addLog: (log) => set((state) => ({ logs: [...state.logs, log] })),
  setPerformanceData: (data) => set({ performanceData: data }),
  clearLogs: () => set({ logs: [] }),
}));
