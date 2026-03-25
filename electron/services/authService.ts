/**
 * 权限服务
 * 区分普通用户和开发者角色
 */
export type UserRole = 'user' | 'developer';

export interface AuthResult {
  role: UserRole;
  isDeveloper: boolean;
  permissions: string[];
}

export class AuthService {
  private role: UserRole = 'user';
  private permissions: Map<UserRole, string[]> = new Map([
    ['user', ['view_main', 'use_chat', 'use_voice_call']],
    [
      'developer',
      [
        'view_main',
        'use_chat',
        'use_voice_call',
        'view_dev_panel',
        'edit_params',
        'manage_plugins',
        'manage_users',
        'view_logs',
        'view_monitor',
      ],
    ],
  ]);

  /**
   * 检查权限
   */
  checkPermission(): AuthResult {
    return {
      role: this.role,
      isDeveloper: this.role === 'developer',
      permissions: this.permissions.get(this.role) || [],
    };
  }

  /**
   * 设置用户角色
   */
  setRole(role: UserRole): void {
    this.role = role;
  }

  /**
   * 获取当前角色
   */
  getRole(): UserRole {
    return this.role;
  }

  /**
   * 检查是否有特定权限
   */
  hasPermission(permission: string): boolean {
    const userPermissions = this.permissions.get(this.role) || [];
    return userPermissions.includes(permission);
  }

  /**
   * 验证是否可以访问某个功能
   */
  canAccess(feature: string): boolean {
    const permissionMap: Record<string, UserRole[]> = {
      main_window: ['user', 'developer'],
      chat: ['user', 'developer'],
      voice_call: ['user', 'developer'],
      dev_panel: ['developer'],
      param_editor: ['developer'],
      plugin_manager: ['developer'],
      user_manage: ['developer'],
    };

    const allowedRoles = permissionMap[feature];
    if (!allowedRoles) {
      return false;
    }

    return allowedRoles.includes(this.role);
  }
}
