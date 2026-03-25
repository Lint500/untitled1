import { useEffect, useState } from 'react';
import { appStore } from '@store';

/**
 * 权限验证 Hook
 * 用于检查用户角色和权限
 */
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
        // 非 Electron 环境，使用默认权限
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

  const hasPermission = (permission: string): boolean => {
    const developerPermissions = [
      'view_dev_panel',
      'edit_params',
      'manage_plugins',
      'manage_users',
      'view_logs',
      'view_monitor',
    ];

    if (isDeveloper) {
      return true;
    }

    const userPermissions = ['view_main', 'use_chat', 'use_voice_call'];
    return userPermissions.includes(permission);
  };

  const canAccess = (feature: string): boolean => {
    const featureMap: Record<string, boolean> = {
      main_window: true,
      chat: true,
      voice_call: true,
      dev_panel: isDeveloper,
      param_editor: isDeveloper,
      plugin_manager: isDeveloper,
      user_manage: isDeveloper,
    };

    return featureMap[feature] || false;
  };

  return {
    userRole,
    isDeveloper,
    isLoading,
    hasPermission,
    canAccess,
    refreshAuth: checkPermission,
  };
}
