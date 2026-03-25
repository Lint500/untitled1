import { ipcMain } from 'electron';

/**
 * 主进程 IPC 监听器封装
 * 用于统一管理主进程的 IPC 事件监听
 */
export class IpcMain {
  private static handlers: Map<string, (...args: any[]) => any> = new Map();

  /**
   * 注册 IPC 处理器
   * @param channel 通道名称
   * @param listener 处理函数
   */
  static register(channel: string, listener: (...args: any[]) => Promise<any>) {
    this.handlers.set(channel, listener);
    
    ipcMain.handle(channel, async (_, ...args) => {
      try {
        const handler = this.handlers.get(channel);
        if (!handler) {
          throw new Error(`No handler registered for channel: ${channel}`);
        }
        return await listener(...args);
      } catch (error) {
        console.error(`IPC Error on channel ${channel}:`, error);
        throw error;
      }
    });
  }

  /**
   * 注册一次性 IPC 监听器
   * @param channel 通道名称
   * @param listener 处理函数
   */
  static once(channel: string, listener: (...args: any[]) => void) {
    ipcMain.once(channel, (_, ...args) => {
      listener(...args);
    });
  }

  /**
   * 移除 IPC 处理器
   * @param channel 通道名称
   */
  static removeHandler(channel: string) {
    this.handlers.delete(channel);
    ipcMain.removeHandler(channel);
  }

  /**
   * 清空所有 IPC 处理器
   */
  static clearAll() {
    this.handlers.clear();
  }
}
