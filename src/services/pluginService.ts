// 插件服务适配层
// 后端有两个插件来源：
//   1. /plugin-store/plugins  —— 商店列表（可下载）
//   2. /tools/plugins/loaded  —— 已加载到 tool_manager 的插件（运行中）
// 合并展示：已加载的标记为 active，商店里其余的标记为 inactive。
import request from './request';
import API_URLS from './api';

interface Plugin {
  id: string;
  name: string;
  version: string;
  status: 'active' | 'inactive';
  description: string;
}

function unwrap<T>(resp: any): T {
  if (resp && typeof resp === 'object' && 'success' in resp && 'data' in resp) {
    return resp.data as T;
  }
  return resp as T;
}

export const pluginService = {
  getPlugins: async (): Promise<Plugin[]> => {
    const [storeResp, loadedResp] = await Promise.all([
      request.get(API_URLS.PLUGIN_STORE_PLUGINS, { params: { page: 1, page_size: 50 } })
        .then(unwrap)
        .catch(() => ({ plugins: [] })) as Promise<any>,
      request.get(API_URLS.TOOLS_LOADED_PLUGINS)
        .then(unwrap)
        .catch(() => []) as Promise<any>,
    ]);

    const loadedNames = new Set<string>(
      Array.isArray(loadedResp)
        ? loadedResp.map((p: any) => (typeof p === 'string' ? p : p.name || p.id)).filter(Boolean)
        : []
    );

    const storeList: any[] = Array.isArray(storeResp?.plugins) ? storeResp.plugins : [];

    const fromStore: Plugin[] = storeList.map((p: any) => ({
      id: String(p.id ?? p.name),
      name: p.name || p.id,
      version: p.version || '0.0.0',
      status: loadedNames.has(p.name || p.id) ? 'active' : 'inactive',
      description: p.description || '',
    }));

    // 已加载但商店没收录的（本地手装的）追加进去
    const storeIds = new Set(fromStore.map((p) => p.id));
    const fromLocal: Plugin[] = Array.from(loadedNames)
      .filter((name) => !storeIds.has(name))
      .map((name) => ({
        id: name,
        name,
        version: 'local',
        status: 'active' as const,
        description: '本地已加载插件',
      }));

    return [...fromStore, ...fromLocal];
  },

  install: async (pluginId: string) => {
    return request.post(API_URLS.PLUGIN_STORE_INSTALL, { plugin_id: pluginId });
  },

  reload: async (pluginName: string) => {
    return request.post(`${API_URLS.TOOLS_RELOAD}/${pluginName}`);
  },
};
