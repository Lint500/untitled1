import { contextBridge, ipcRenderer } from 'electron';

// 定义暴露给渲染进程的 API 类型
export interface ElectronAPI {
  auth: {
    check: () => Promise<{ role: string; isDeveloper: boolean }>;
  };
  window: {
    createPopup: () => Promise<void>;
    closePopup: () => Promise<void>;
  };
  log: {
    send: (data: any) => Promise<void>;
  };
}

// 暴露安全的 IPC 接口
contextBridge.exposeInMainWorld('electronAPI', {
  auth: {
    check: () => ipcRenderer.invoke('auth:check'),
  },
  window: {
    createPopup: () => ipcRenderer.invoke('window:createPopup'),
    closePopup: () => ipcRenderer.invoke('window:closePopup'),
  },
  log: {
    send: (data: any) => ipcRenderer.invoke('log:send', data),
  },
});
