import React, { useEffect, useState, useCallback } from 'react';
import { systemService, SystemDashboard } from '@services/systemService';
import styles from './Monitor.module.css';

interface Alert {
  id: string;
  level: 'info' | 'warning' | 'error';
  message: string;
  timestamp: string;
  module?: string;
}

const Monitor: React.FC = () => {
  const [dashboard, setDashboard] = useState<SystemDashboard | null>(null);
  const [moduleStatuses, setModuleStatuses] = useState<Record<string, any>>({});
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [moduleDetails, setModuleDetails] = useState<any>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      const [dashboardData, moduleData, logsData] = await Promise.all([
        systemService.getDashboardOverview().catch(() => null),
        systemService.getModuleMonitorStatus().catch(() => null),
        systemService.getMonitorLogs(20).catch(() => []),
      ]);

      if (dashboardData) {
        setDashboard(dashboardData);
      }

      if (moduleData) {
        setModuleStatuses(moduleData);
      }

      if (logsData && Array.isArray(logsData)) {
        setAlerts(logsData.slice(0, 10));
      }

      setLastUpdate(new Date());
      setLoading(false);
    } catch (error) {
      console.error('获取监控数据失败:', error);
      setLoading(false);
    }
  }, []);

  const fetchModuleDetails = async (moduleName: string) => {
    try {
      let data;
      switch (moduleName) {
        case 'info-process':
          data = await systemService.getInfoProcessStatus();
          break;
        case 'memory':
          data = await systemService.getMemoryModuleStatus();
          break;
        case 'thinking':
          data = await systemService.getThinkingStatus();
          break;
        case 'attention':
          data = await systemService.getAttentionStatus();
          break;
        case 'output':
          data = await systemService.getOutputStatus();
          break;
        case 'stream':
          data = await systemService.getStreamStatus();
          break;
        default:
          data = moduleStatuses[moduleName];
      }
      setModuleDetails(data);
      setSelectedModule(moduleName);
    } catch (error) {
      console.error(`获取模块 ${moduleName} 详情失败:`, error);
    }
  };

  const handleRestartModule = async (moduleName: string) => {
    if (!window.confirm(`确定要重启模块 "${moduleName}" 吗？`)) {
      return;
    }

    try {
      await systemService.restartModule(moduleName);
      alert(`模块 "${moduleName}" 重启成功`);
      fetchDashboardData();
    } catch (error) {
      alert(`重启模块 "${moduleName}" 失败`);
    }
  };

  const handleClearMemory = async () => {
    if (!window.confirm('确定要清空短期记忆吗？')) {
      return;
    }

    try {
      await systemService.clearShortTermMemory();
      alert('短期记忆已清空');
      fetchDashboardData();
    } catch (error) {
      alert('清空短期记忆失败');
    }
  };

  useEffect(() => {
    fetchDashboardData();

    const interval = setInterval(fetchDashboardData, 5000);

    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
      case 'healthy':
        return '●';
      case 'warning':
      case 'degraded':
        return '◐';
      case 'error':
      case 'critical':
      case 'stopped':
        return '○';
      default:
        return '?';
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'running':
      case 'healthy':
        return styles.statusHealthy;
      case 'warning':
      case 'degraded':
        return styles.statusWarning;
      case 'error':
      case 'critical':
      case 'stopped':
        return styles.statusError;
      default:
        return styles.statusUnknown;
    }
  };

  const getResourceClass = (value: number) => {
    if (value > 80) return styles.high;
    if (value > 50) return styles.medium;
    return styles.low;
  };

  const getAlertLevelClass = (level: string) => {
    switch (level) {
      case 'error':
        return styles.alertError;
      case 'warning':
        return styles.alertWarning;
      case 'info':
        return styles.alertInfo;
      default:
        return styles.alertInfo;
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', { hour12: false });
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('zh-CN', { hour12: false });
  };

  if (loading) {
    return (
      <div className={styles.monitorContainer}>
        <div className={styles.loadingState}>加载中...</div>
      </div>
    );
  }

  const systemHealth = dashboard?.systemHealth || 'unknown';

  return (
    <div className={styles.monitorContainer}>
      <div className={styles.headerSection}>
        <div className={styles.systemHealth}>
          <span className={`${styles.healthIcon} ${getStatusClass(systemHealth)}`}>
            {getStatusIcon(systemHealth)}
          </span>
          <span className={styles.healthText}>
            系统状态: {systemHealth === 'healthy' ? '正常' : systemHealth === 'degraded' ? '降级' : '严重'}
          </span>
        </div>
        <div className={styles.updateTime}>
          最后更新: {formatTime(lastUpdate)}
        </div>
      </div>

      {dashboard && (
        <div className={styles.resourceSection}>
          <h4 className={styles.sectionTitle}>资源使用</h4>
          <div className={styles.resourceGrid}>
            <div className={styles.resourceItem}>
              <div className={styles.resourceLabel}>CPU</div>
              <div className={styles.progressBar}>
                <div
                  className={`${styles.progressFill} ${getResourceClass(dashboard.resources.cpu)}`}
                  style={{ width: `${dashboard.resources.cpu}%` }}
                />
              </div>
              <div className={styles.resourceValue}>{dashboard.resources.cpu}%</div>
            </div>
            <div className={styles.resourceItem}>
              <div className={styles.resourceLabel}>内存</div>
              <div className={styles.progressBar}>
                <div
                  className={`${styles.progressFill} ${getResourceClass(dashboard.resources.memory)}`}
                  style={{ width: `${dashboard.resources.memory}%` }}
                />
              </div>
              <div className={styles.resourceValue}>{dashboard.resources.memory}%</div>
            </div>
          </div>
        </div>
      )}

      <div className={styles.moduleSection}>
        <h4 className={styles.sectionTitle}>模块状态</h4>
        <div className={styles.moduleGrid}>
          {Object.entries(moduleStatuses).map(([moduleName, status]: [string, any]) => (
            <div
              key={moduleName}
              className={styles.moduleCard}
              onClick={() => fetchModuleDetails(moduleName)}
            >
              <div className={styles.moduleHeader}>
                <span className={`${styles.moduleStatus} ${getStatusClass(status.status || status.health)}`}>
                  {getStatusIcon(status.status || status.health)}
                </span>
                <span className={styles.moduleName}>{moduleName}</span>
              </div>
              <div className={styles.moduleInfo}>
                {status.health !== undefined && (
                  <div className={styles.moduleMetric}>
                    健康度: {Math.round(status.health * 100)}%
                  </div>
                )}
                {status.lastUpdate && (
                  <div className={styles.moduleMetric}>
                    更新: {formatTimestamp(status.lastUpdate)}
                  </div>
                )}
              </div>
              <button
                className={styles.restartButton}
                onClick={(e) => {
                  e.stopPropagation();
                  handleRestartModule(moduleName);
                }}
              >
                重启
              </button>
            </div>
          ))}
        </div>
      </div>

      {selectedModule && moduleDetails && (
        <div className={styles.detailsSection}>
          <div className={styles.detailsHeader}>
            <h4 className={styles.sectionTitle}>{selectedModule} 详情</h4>
            <button
              className={styles.closeButton}
              onClick={() => {
                setSelectedModule(null);
                setModuleDetails(null);
              }}
            >
              ×
            </button>
          </div>
          <div className={styles.detailsContent}>
            <pre>{JSON.stringify(moduleDetails, null, 2)}</pre>
          </div>
        </div>
      )}

      {alerts.length > 0 && (
        <div className={styles.alertSection}>
          <h4 className={styles.sectionTitle}>告警信息</h4>
          <div className={styles.alertList}>
            {alerts.map((alert) => (
              <div key={alert.id} className={`${styles.alertItem} ${getAlertLevelClass(alert.level)}`}>
                <div className={styles.alertHeader}>
                  <span className={styles.alertLevel}>
                    [{alert.level.toUpperCase()}]
                  </span>
                  <span className={styles.alertTime}>
                    {formatTimestamp(alert.timestamp)}
                  </span>
                </div>
                <div className={styles.alertMessage}>{alert.message}</div>
                {alert.module && (
                  <div className={styles.alertModule}>模块: {alert.module}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={styles.actionSection}>
        <button className={styles.actionButton} onClick={handleClearMemory}>
          清空短期记忆
        </button>
        <button className={styles.refreshButton} onClick={fetchDashboardData}>
          刷新
        </button>
      </div>
    </div>
  );
};

export default Monitor;
