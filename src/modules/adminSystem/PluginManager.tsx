import { useEffect, useState } from 'react';
import { pluginService } from '../../services/pluginService';
import styles from './PluginManager.module.css';

interface Plugin {
  id: string;
  name: string;
  version: string;
  status: 'active' | 'inactive';
  description: string;
}

const PluginManager: React.FC = () => {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlugins();
  }, []);

  const loadPlugins = async () => {
    try {
      const data = await pluginService.getPlugins();
      setPlugins(data);
    } catch (error) {
      console.error('加载插件失败:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className={styles.loading}>加载中...</div>;
  }

  return (
    <div className={styles.pluginManager}>
      <h2 className={styles.title}>插件管理</h2>
      <div className={styles.pluginList}>
        {plugins.map((plugin) => (
          <div key={plugin.id} className={styles.pluginCard}>
            <div className={styles.pluginHeader}>
              <div className={styles.pluginInfo}>
                <h3 className={styles.pluginName}>{plugin.name}</h3>
                <p className={styles.pluginDescription}>{plugin.description}</p>
                <p className={styles.pluginMeta}>版本：{plugin.version}</p>
              </div>
              <div className={styles.pluginActions}>
                <button className={`${styles.toggleButton} ${plugin.status === 'active' ? styles.disable : styles.enable}`}>
                  {plugin.status === 'active' ? '禁用' : '启用'}
                </button>
                <button className={styles.uninstallButton}>删除</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PluginManager;
