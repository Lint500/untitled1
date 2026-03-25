import React, { useEffect, useState } from 'react';
import { pluginService, Plugin } from '@services/pluginService';
import styles from './PluginManager.module.css';

const PluginManager: React.FC = () => {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlugins();
  }, []);

  const loadPlugins = async () => {
    try {
      setLoading(true);
      const data = await pluginService.getAllPlugins();
      setPlugins(data);
    } catch (error) {
      console.error('Failed to load plugins:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePlugin = async (pluginId: string, enabled: boolean) => {
    try {
      if (enabled) {
        await pluginService.enablePlugin(pluginId);
      } else {
        await pluginService.disablePlugin(pluginId);
      }
      await loadPlugins();
    } catch (error) {
      console.error('Failed to toggle plugin:', error);
    }
  };

  const handleUninstallPlugin = async (pluginId: string) => {
    if (!confirm('确定要卸载这个插件吗？')) return;

    try {
      await pluginService.uninstallPlugin(pluginId);
      await loadPlugins();
    } catch (error) {
      console.error('Failed to uninstall plugin:', error);
    }
  };

  if (loading) {
    return <div className={styles.loading}>加载中...</div>;
  }

  return (
    <div className={styles.pluginManager}>
      <h2 className={styles.listTitle}>插件管理</h2>
      
      <div className={styles.pluginList}>
        {plugins.map((plugin) => (
          <div
            key={plugin.id}
            className={`${styles.pluginCard} ${plugin.enabled ? styles.enabled : ''}`}
          >
            <div className={styles.pluginHeader}>
              <div className={styles.pluginInfo}>
                <h3 className={styles.pluginName}>{plugin.name}</h3>
                <p className={styles.pluginDescription}>
                  {plugin.description}
                </p>
                <p className={styles.pluginMeta}>
                  版本：{plugin.version} | 作者：{plugin.author}
                </p>
              </div>
              <div className={styles.pluginActions}>
                <button
                  className={`${styles.toggleButton} ${plugin.enabled ? styles.disable : styles.enable}`}
                  onClick={() => handleTogglePlugin(plugin.id, !plugin.enabled)}
                >
                  {plugin.enabled ? '禁用' : '启用'}
                </button>
                <button
                  className={styles.uninstallButton}
                  onClick={() => handleUninstallPlugin(plugin.id)}
                >
                  卸载
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PluginManager;
