/**
 * 渲染进程 IPC 调用封装
 * 供前端使用，提供类型安全的 IPC 调用接口
 */

// 声明全局类型
declare global {
  interface Window {
    electronAPI?: {
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
    };
  }
}

export class IpcRenderer {
  /**
   * 调用主进程方法
   * @param channel IPC 通道名称
   * @param args 参数
   */
  static async invoke(channel: string, ...args: any[]): Promise<any> {
    // 尝试通过暴露的 API 调用
    if (window.electronAPI) {
      const apiMethod = this.getApiMethod(channel);
      if (apiMethod && typeof apiMethod === 'function') {
        return await apiMethod(...args);
      }
    }
    
    throw new Error(`Electron API not available for channel: ${channel}`);
  }

  /**
   * 监听主进程事件
   * @param channel IPC 通道名称
   * @param callback 回调函数
   */
  static on(channel: string, callback: (...args: any[]) => void) {
    if (window.electronAPI?.on) {
      window.electronAPI.on(channel, callback);
    }
  }

  /**
   * 移除监听器
   * @param channel IPC 通道名称
   * @param callback 回调函数
   */
  static removeListener(channel: string, callback: (...args: any[]) => void) {
    if (window.electronAPI?.removeListener) {
      window.electronAPI.removeListener(channel, callback);
    }
  }

  /**
   * 获取 API 方法
   * @param channel IPC 通道名称
   */
  private static getApiMethod(channel: string): Function | undefined {
    const parts = channel.split(':');
    if (parts.length < 2) {
      return undefined;
    }

    const [module, method] = parts;
    const moduleAPI = window.electronAPI?.[module];
    
    if (moduleAPI && typeof moduleAPI === 'object') {
      return (moduleAPI as any)[method];
    }

    return undefined;
  }
}

/**
 * 快捷调用方法
 */
export const ipc = {
  // 权限相关
  checkAuth: () => IpcRenderer.invoke('auth:check'),
  
  // 窗口相关
  createPopup: () => IpcRenderer.invoke('window:createPopup'),
  closePopup: () => IpcRenderer.invoke('window:closePopup'),
  
  // 日志相关
  sendLog: (data: any) => IpcRenderer.invoke('log:send', data),
};
