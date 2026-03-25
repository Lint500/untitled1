/* Electron API 类型声明 */
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
  [key: string]: any;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export {};
