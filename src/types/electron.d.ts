/* Electron API 类型声明 */

/* 静态资源模块声明 */
declare module '*.png' {
  const value: string;
  export default value;
}

declare module '*.jpg' {
  const value: string;
  export default value;
}

declare module '*.jpeg' {
  const value: string;
  export default value;
}

declare module '*.gif' {
  const value: string;
  export default value;
}

declare module '*.svg' {
  const value: string;
  export default value;
}

declare module '*.ico' {
  const value: string;
  export default value;
}

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
