import request from './request';
import { API_URLS } from './api';

export interface Plugin {
  id: string;
  name: string;
  version: string;
  description: string;
  enabled: boolean;
  author: string;
}

/**
 * 插件管理服务
 */
export const pluginService = {
  /**
   * 获取所有插件
   */
  getAllPlugins: async (): Promise<Plugin[]> => {
    return request.get(API_URLS.PLUGINS);
  },

  /**
   * 安装插件
   */
  installPlugin: async (pluginUrl: string): Promise<Plugin> => {
    return request.post(API_URLS.PLUGIN_INSTALL, { url: pluginUrl });
  },

  /**
   * 卸载插件
   */
  uninstallPlugin: async (pluginId: string): Promise<void> => {
    return request.post(API_URLS.PLUGIN_UNINSTALL, { id: pluginId });
  },

  /**
   * 启用插件
   */
  enablePlugin: async (pluginId: string): Promise<Plugin> => {
    return request.post(API_URLS.PLUGIN_ENABLE, { id: pluginId });
  },

  /**
   * 禁用插件
   */
  disablePlugin: async (pluginId: string): Promise<Plugin> => {
    return request.post(API_URLS.PLUGIN_DISABLE, { id: pluginId });
  },

  /**
   * 更新插件
   */
  updatePlugin: async (pluginId: string): Promise<Plugin> => {
    return request.put(`${API_URLS.PLUGINS}/${pluginId}`);
  },

  /**
   * 获取插件详情
   */
  getPluginDetail: async (pluginId: string): Promise<Plugin> => {
    return request.get(`${API_URLS.PLUGINS}/${pluginId}`);
  },
};
