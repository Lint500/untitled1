import React, { useEffect } from 'react';
import MainWindow from '@modules/mainWindow';
import DeveloperPanel from '@modules/devPanel';
import AdminSystem from '@modules/adminSystem';
import { useAuth } from '@hooks/useAuth';
import { devStore } from '@store';

function App() {
  const { isDeveloper, isLoading } = useAuth();
  const { setIsPanelOpen } = devStore();

  useEffect(() => {
    // 开发者可以通过快捷键打开开发者面板
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F12' || (e.ctrlKey && e.key === 'I')) {
        e.preventDefault();
        setIsPanelOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsPanelOpen]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>加载中...</div>
      </div>
    );
  }

  return (
    <div className="App">
      {/* 主窗口 */}
      <MainWindow />

      {/* 开发者面板（仅开发者可见） */}
      {isDeveloper && <DeveloperPanel />}

      {/* 管理系统入口（可选，根据需求添加路由） */}
      {/* <AdminSystem /> */}
    </div>
  );
}

export default App;
