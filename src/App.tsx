import React, { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import DeveloperPanel from './modules/devPanel';
import { useAuth } from './hooks/useAuth';
import { devStore } from './store';

function App() {
  const { isDeveloper, isLoading } = useAuth();
  const { setIsPanelOpen } = devStore();

  useEffect(() => {
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
      <RouterProvider router={router} />
      {isDeveloper && <DeveloperPanel />}
    </div>
  );
}

export default App;
