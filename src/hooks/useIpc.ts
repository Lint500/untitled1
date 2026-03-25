import { useEffect, useState } from 'react';

/**
 * IPC 通信 Hook
 * 封装与 Electron 主进程的通信
 */
export function useIpc() {
  const [isElectron, setIsElectron] = useState(false);

  useEffect(() => {
    // 检查是否在 Electron 环境中
    setIsElectron(!!window.electronAPI);
  }, []);

  /**
   * 检查权限
   */
  const checkAuth = async () => {
    if (!window.electronAPI) {
      return { role: 'user', isDeveloper: false };
    }
    return await window.electronAPI.auth.check();
  };

  /**
   * 创建弹窗
   */
  const createPopup = async () => {
    if (!window.electronAPI) {
      console.warn('Electron API not available');
      return;
    }
    await window.electronAPI.window.createPopup();
  };

  /**
   * 关闭弹窗
   */
  const closePopup = async () => {
    if (!window.electronAPI) {
      console.warn('Electron API not available');
      return;
    }
    await window.electronAPI.window.closePopup();
  };

  /**
   * 发送日志
   */
  const sendLog = async (data: any) => {
    if (!window.electronAPI) {
      console.log('Log:', data);
      return;
    }
    await window.electronAPI.log.send(data);
  };

  return {
    isElectron,
    checkAuth,
    createPopup,
    closePopup,
    sendLog,
  };
}
