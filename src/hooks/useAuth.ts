import { useEffect, useState } from 'react';
import { appStore } from '@store';

export function useAuth() {
  const { userRole, setUserRole } = appStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isDeveloper, setIsDeveloper] = useState(false);

  useEffect(() => {
    checkPermission();
  }, []);

  const checkPermission = async () => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.auth.check();
        setUserRole(result.role as 'user' | 'developer');
        setIsDeveloper(result.isDeveloper);
      } else {
        setUserRole('user');
        setIsDeveloper(false);
      }
    } catch (error) {
      console.error('Failed to check auth:', error);
      setUserRole('user');
      setIsDeveloper(false);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    userRole,
    isDeveloper,
    isLoading,
    refreshAuth: checkPermission,
  };
}
