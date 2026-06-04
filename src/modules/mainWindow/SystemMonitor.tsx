import React, { useEffect, useState, useCallback } from 'react';
import { systemService, SystemDashboard } from '@services/systemService';
import styles from './MainView.module.css';

interface Alert {
  id: string;
  level: 'info' | 'warning' | 'error';
  message: string;
  timestamp: string;
  module?: string;
}

interface SystemMonitorProps {
  isOpen: boolean;
  onClose: () => void;
}

const SystemMonitor: React.FC<SystemMonitorProps> = ({ isOpen, onClose }) => {
  const [dashboard, setDashboard] = useState<SystemDashboard | null>(null);
  const [moduleStatuses, setModuleStatuses] = useState<Record<string, any>>({});
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<'overview' | 'modules' | 'thinking' | 'memory' | 'attention' | 'alerts'>('overview');

  const [thinkingData, setThinkingData] = useState<any>(null);
  const [expertsData, setExpertsData] = useState<any>(null);
  const [emotionData, setEmotionData] = useState<any>(null);
  const [memoryData, setMemoryData] = useState<any>(null);
  const [attentionData, setAttentionData] = useState<any>(null);
  const [infoProcessData, setInfoProcessData] = useState<any>(null);
  const [outputData, setOutputData] = useState<any>(null);
  const [streamData, setStreamData] = useState<any>(null);
  const [resourceDetails, setResourceDetails] = useState<any>(null);

  const fetchAllData = useCallback(async () => {
    try {
      const [
        dashboardData,
        moduleData,
        logsData,
        thinkingStatus,
        expertsList,
        emotionStatus,
        memoryStatus,
        attentionStatus,
        infoProcessStatus,
        outputStatus,
        streamStatus,
        hardwareDetails,
      ] = await Promise.all([
        systemService.getDashboardOverview().catch(() => null),
        systemService.getModuleMonitorStatus().catch(() => null),
        systemService.getMonitorLogs(20).catch(() => []),
        systemService.getThinkingStatus().catch(() => null),
        systemService.getThinkingExperts().catch(() => null),
        systemService.getThinkingEmotionStatus().catch(() => null),
        systemService.getMemoryModuleStatus().catch(() => null),
        systemService.getAttentionStatus().catch(() => null),
        systemService.getInfoProcessStatus().catch(() => null),
        systemService.getOutputStatus().catch(() => null),
        systemService.getStreamStatus().catch(() => null),
        systemService.getHardwareDetails().catch(() => null),
      ]);

      if (dashboardData) setDashboard(dashboardData);
      if (moduleData) setModuleStatuses(moduleData);
      if (logsData && Array.isArray(logsData)) setAlerts(logsData.slice(0, 20));

      setThinkingData(thinkingStatus);
      setExpertsData(expertsList);
      setEmotionData(emotionStatus);
      setMemoryData(memoryStatus);
      setAttentionData(attentionStatus);
      setInfoProcessData(infoProcessStatus);
      setOutputData(outputStatus);
      setStreamData(streamStatus);
      setResourceDetails(hardwareDetails);

      setLastUpdate(new Date());
      setLoading(false);
    } catch (error) {
      console.error('获取监控数据失败:', error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchAllData();
      const interval = setInterval(fetchAllData, 5000);
      return () => clearInterval(interval);
    }
  }, [isOpen, fetchAllData]);

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

  if (!isOpen) return null;

  const systemHealth = dashboard?.systemHealth || 'unknown';

  return (
    <div className={styles.monitorOverlay} onClick={onClose}>
      <div className={styles.monitorPanel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.monitorHeader}>
          <h2 className={styles.monitorTitle}>📊 系统监控面板</h2>
          <div className={styles.monitorTabs}>
            <button className={`${styles.monitorTab} ${activeTab === 'overview' ? styles.active : ''}`} onClick={() => setActiveTab('overview')}>
              总览
            </button>
            <button className={`${styles.monitorTab} ${activeTab === 'modules' ? styles.active : ''}`} onClick={() => setActiveTab('modules')}>
              模块
            </button>
            <button className={`${styles.monitorTab} ${activeTab === 'thinking' ? styles.active : ''}`} onClick={() => setActiveTab('thinking')}>
              思维
            </button>
            <button className={`${styles.monitorTab} ${activeTab === 'memory' ? styles.active : ''}`} onClick={() => setActiveTab('memory')}>
              记忆
            </button>
            <button className={`${styles.monitorTab} ${activeTab === 'attention' ? styles.active : ''}`} onClick={() => setActiveTab('attention')}>
              注意力
            </button>
            <button className={`${styles.monitorTab} ${activeTab === 'alerts' ? styles.active : ''}`} onClick={() => setActiveTab('alerts')}>
              告警
            </button>
          </div>
          <button className={styles.monitorCloseButton} onClick={onClose}>×</button>
        </div>

        <div className={styles.monitorContent}>
          {loading ? (
            <div className={styles.loadingState}>加载中...</div>
          ) : (
            <>
              {activeTab === 'overview' && (
                <div className={styles.overviewTab}>
                  <div className={styles.healthBar}>
                    <div className={styles.systemHealth}>
                      <span className={`${styles.healthIcon} ${getStatusClass(systemHealth)}`}>
                        {getStatusIcon(systemHealth)}
                      </span>
                      <span className={styles.healthText}>
                        系统状态: {systemHealth === 'healthy' ? '正常' : systemHealth === 'degraded' ? '降级' : '严重'}
                      </span>
                    </div>
                    <div className={styles.updateTime}>最后更新: {formatTime(lastUpdate)}</div>
                  </div>

                  {dashboard && (
                    <div className={styles.resourceSection}>
                      <h4 className={styles.sectionTitle}>资源使用</h4>
                      <div className={styles.resourceGrid}>
                        <div className={styles.resourceItem}>
                          <div className={styles.resourceLabel}>CPU</div>
                          <div className={styles.progressBar}>
                            <div className={`${styles.progressFill} ${getResourceClass(dashboard.resources.cpu)}`} style={{ width: `${dashboard.resources.cpu}%` }} />
                          </div>
                          <div className={styles.resourceValue}>{dashboard.resources.cpu}%</div>
                        </div>
                        <div className={styles.resourceItem}>
                          <div className={styles.resourceLabel}>内存</div>
                          <div className={styles.progressBar}>
                            <div className={`${styles.progressFill} ${getResourceClass(dashboard.resources.memory)}`} style={{ width: `${dashboard.resources.memory}%` }} />
                          </div>
                          <div className={styles.resourceValue}>{dashboard.resources.memory}%</div>
                        </div>
                        {dashboard.resources.gpu !== undefined && (
                          <div className={styles.resourceItem}>
                            <div className={styles.resourceLabel}>GPU</div>
                            <div className={styles.progressBar}>
                              <div className={`${styles.progressFill} ${getResourceClass(dashboard.resources.gpu)}`} style={{ width: `${dashboard.resources.gpu}%` }} />
                            </div>
                            <div className={styles.resourceValue}>{dashboard.resources.gpu}%</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {resourceDetails && (
                    <div className={styles.resourceSection}>
                      <h4 className={styles.sectionTitle}>硬件详情</h4>
                      <div className={styles.hardwareGrid}>
                        {resourceDetails.cpu && (
                          <div className={styles.hardwareItem}>
                            <div className={styles.hardwareLabel}>CPU型号</div>
                            <div className={styles.hardwareValue}>{resourceDetails.cpu.model || '未知'}</div>
                          </div>
                        )}
                        {resourceDetails.memory && (
                          <div className={styles.hardwareItem}>
                            <div className={styles.hardwareLabel}>总内存</div>
                            <div className={styles.hardwareValue}>{resourceDetails.memory.total || '未知'}</div>
                          </div>
                        )}
                        {resourceDetails.gpu && (
                          <div className={styles.hardwareItem}>
                            <div className={styles.hardwareLabel}>GPU型号</div>
                            <div className={styles.hardwareValue}>{resourceDetails.gpu.model || '未知'}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className={styles.moduleQuickView}>
                    <h4 className={styles.sectionTitle}>模块快速状态</h4>
                    <div className={styles.moduleGrid}>
                      {Object.entries(moduleStatuses).slice(0, 6).map(([moduleName, status]: [string, any]) => (
                        <div key={moduleName} className={styles.moduleCard}>
                          <div className={styles.moduleHeader}>
                            <span className={`${styles.moduleStatus} ${getStatusClass(status.status || status.health)}`}>
                              {getStatusIcon(status.status || status.health)}
                            </span>
                            <span className={styles.moduleName}>{moduleName}</span>
                          </div>
                          {status.health !== undefined && (
                            <div className={styles.moduleMetric}>健康度: {Math.round(status.health * 100)}%</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {alerts.length > 0 && (
                    <div className={styles.alertSection}>
                      <h4 className={styles.sectionTitle}>最新告警 (Top 5)</h4>
                      <div className={styles.alertList}>
                        {alerts.slice(0, 5).map((alert) => (
                          <div key={alert.id} className={`${styles.alertItem} ${getAlertLevelClass(alert.level)}`}>
                            <div className={styles.alertHeader}>
                              <span className={styles.alertLevel}>[{alert.level.toUpperCase()}]</span>
                              <span className={styles.alertTime}>{formatTimestamp(alert.timestamp)}</span>
                            </div>
                            <div className={styles.alertMessage}>{alert.message}</div>
                            {alert.module && <div className={styles.alertModule}>模块: {alert.module}</div>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'modules' && (
                <div className={styles.modulesTab}>
                  <div className={styles.moduleGrid}>
                    {Object.entries(moduleStatuses).map(([moduleName, status]: [string, any]) => (
                      <div key={moduleName} className={styles.moduleCard}>
                        <div className={styles.moduleHeader}>
                          <span className={`${styles.moduleStatus} ${getStatusClass(status.status || status.health)}`}>
                            {getStatusIcon(status.status || status.health)}
                          </span>
                          <span className={styles.moduleName}>{moduleName}</span>
                        </div>
                        <div className={styles.moduleInfo}>
                          {status.health !== undefined && (
                            <div className={styles.moduleMetric}>健康度: {Math.round(status.health * 100)}%</div>
                          )}
                          {status.resourceUsage && (
                            <div className={styles.moduleMetric}>资源占用: {status.resourceUsage}%</div>
                          )}
                          {status.lastUpdate && (
                            <div className={styles.moduleMetric}>更新: {formatTimestamp(status.lastUpdate)}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {infoProcessData && (
                    <div className={styles.detailSection}>
                      <h4 className={styles.sectionTitle}>信息处理系统</h4>
                      <div className={styles.detailGrid}>
                        <div className={styles.detailItem}>
                          <div className={styles.detailLabel}>语音识别</div>
                          <div className={styles.detailValue}>{infoProcessData.speech?.status || '未知'}</div>
                        </div>
                        <div className={styles.detailItem}>
                          <div className={styles.detailLabel}>文本分析</div>
                          <div className={styles.detailValue}>{infoProcessData.text?.status || '未知'}</div>
                        </div>
                        <div className={styles.detailItem}>
                          <div className={styles.detailLabel}>图像分析</div>
                          <div className={styles.detailValue}>{infoProcessData.image?.status || '未知'}</div>
                        </div>
                        <div className={styles.detailItem}>
                          <div className={styles.detailLabel}>处理队列</div>
                          <div className={styles.detailValue}>{infoProcessData.queue?.length || 0}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {outputData && (
                    <div className={styles.detailSection}>
                      <h4 className={styles.sectionTitle}>输出系统</h4>
                      <div className={styles.detailGrid}>
                        <div className={styles.detailItem}>
                          <div className={styles.detailLabel}>文本输出</div>
                          <div className={styles.detailValue}>{outputData.text?.status || '未知'}</div>
                        </div>
                        <div className={styles.detailItem}>
                          <div className={styles.detailLabel}>语音合成</div>
                          <div className={styles.detailValue}>{outputData.speech?.status || '未知'}</div>
                        </div>
                        <div className={styles.detailItem}>
                          <div className={styles.detailLabel}>键鼠控制</div>
                          <div className={styles.detailValue}>{outputData.km?.status || '未知'}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {streamData && (
                    <div className={styles.detailSection}>
                      <h4 className={styles.sectionTitle}>流式思考</h4>
                      <div className={styles.detailGrid}>
                        <div className={styles.detailItem}>
                          <div className={styles.detailLabel}>活跃会话</div>
                          <div className={styles.detailValue}>{streamData.active_sessions || 0}</div>
                        </div>
                        <div className={styles.detailItem}>
                          <div className={styles.detailLabel}>消息池积压</div>
                          <div className={styles.detailValue}>{streamData.pending_messages || 0}</div>
                        </div>
                        <div className={styles.detailItem}>
                          <div className={styles.detailLabel}>SSE连接</div>
                          <div className={styles.detailValue}>{streamData.connections || 0}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'thinking' && (
                <div className={styles.thinkingTab}>
                  {thinkingData && (
                    <div className={styles.thinkingOverview}>
                      <h4 className={styles.sectionTitle}>思维引擎状态</h4>
                      <div className={styles.detailGrid}>
                        <div className={styles.detailItem}>
                          <div className={styles.detailLabel}>初始化</div>
                          <div className={styles.detailValue}>
                            <span className={thinkingData.initialized ? styles.statusHealthy : styles.statusError}>
                              {thinkingData.initialized ? '● 已加载' : '○ 未加载'}
                            </span>
                          </div>
                        </div>
                        <div className={styles.detailItem}>
                          <div className={styles.detailLabel}>主管模型</div>
                          <div className={styles.detailValue}>
                            <span className={thinkingData.manager_loaded ? styles.statusHealthy : styles.statusError}>
                              {thinkingData.manager_loaded ? '● 已加载' : '○ 未加载'}
                            </span>
                          </div>
                        </div>
                        <div className={styles.detailItem}>
                          <div className={styles.detailLabel}>专家模型</div>
                          <div className={styles.detailValue}>
                            <span className={thinkingData.expert_loaded ? styles.statusHealthy : styles.statusError}>
                              {thinkingData.expert_loaded ? '● 已加载' : '○ 未加载'}
                            </span>
                          </div>
                        </div>
                        <div className={styles.detailItem}>
                          <div className={styles.detailLabel}>专家总数</div>
                          <div className={styles.detailValue}>{thinkingData.total_experts_in_library || 0}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {expertsData && (
                    <div className={styles.expertsSection}>
                      <h4 className={styles.sectionTitle}>专家系统</h4>
                      <div className={styles.expertsGrid}>
                        {(expertsData.active_experts || []).map((expert: string, idx: number) => (
                          <div key={idx} className={styles.expertCard}>
                            <div className={styles.expertHeader}>
                              <span className={styles.expertSlot}>槽位 {idx}</span>
                              <span className={`${styles.expertStatus} ${styles.statusHealthy}`}>● 激活</span>
                            </div>
                            <div className={styles.expertName}>{expert}</div>
                          </div>
                        ))}
                        {[0, 1, 2, 3].filter(i => i >= (expertsData.active_experts || []).length).map(slot => (
                          <div key={slot} className={`${styles.expertCard} ${styles.expertEmpty}`}>
                            <div className={styles.expertSlot}>槽位 {slot}</div>
                            <div className={styles.expertEmptyText}>空</div>
                          </div>
                        ))}
                      </div>
                      <div className={styles.availableExperts}>
                        <div className={styles.detailLabel}>可用专家库 ({(expertsData.available_experts || []).length}个)</div>
                        <div className={styles.expertTags}>
                          {(expertsData.available_experts || []).map((expert: string, idx: number) => (
                            <span key={idx} className={styles.expertTag}>{expert}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {emotionData && (
                    <div className={styles.emotionSection}>
                      <h4 className={styles.sectionTitle}>情绪系统</h4>
                      <div className={styles.detailGrid}>
                        <div className={styles.detailItem}>
                          <div className={styles.detailLabel}>判断次数</div>
                          <div className={styles.detailValue}>{emotionData.total_judgments || 0}</div>
                        </div>
                        <div className={styles.detailItem}>
                          <div className={styles.detailLabel}>引导次数</div>
                          <div className={styles.detailValue}>{emotionData.total_guidance || 0}</div>
                        </div>
                        <div className={styles.detailItem}>
                          <div className={styles.detailLabel}>校准次数</div>
                          <div className={styles.detailValue}>{emotionData.total_calibrations || 0}</div>
                        </div>
                        <div className={styles.detailItem}>
                          <div className={styles.detailLabel}>当前情绪</div>
                          <div className={styles.detailValue}>{emotionData.current_emotion || '未知'}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'memory' && (
                <div className={styles.memoryTab}>
                  {memoryData && (
                    <>
                      <div className={styles.memoryOverview}>
                        <h4 className={styles.sectionTitle}>记忆模块总览</h4>
                        <div className={styles.detailGrid}>
                          <div className={styles.detailItem}>
                            <div className={styles.detailLabel}>短期记忆</div>
                            <div className={styles.detailValue}>{memoryData.short_term?.count || 0} 条</div>
                          </div>
                          <div className={styles.detailItem}>
                            <div className={styles.detailLabel}>长期记忆</div>
                            <div className={styles.detailValue}>{memoryData.long_term?.count || 0} 条</div>
                          </div>
                          <div className={styles.detailItem}>
                            <div className={styles.detailLabel}>工作记忆</div>
                            <div className={styles.detailValue}>{memoryData.working_memory?.size || 0} KB</div>
                          </div>
                          <div className={styles.detailItem}>
                            <div className={styles.detailLabel}>黑匣子日志</div>
                            <div className={styles.detailValue}>{memoryData.blackbox?.count || 0} 条</div>
                          </div>
                        </div>
                      </div>

                      {memoryData.short_term && (
                        <div className={styles.detailSection}>
                          <h4 className={styles.sectionTitle}>短期记忆详情</h4>
                          <div className={styles.detailGrid}>
                            <div className={styles.detailItem}>
                              <div className={styles.detailLabel}>对话记录</div>
                              <div className={styles.detailValue}>{memoryData.short_term.dialogs || 0}</div>
                            </div>
                            <div className={styles.detailItem}>
                              <div className={styles.detailLabel}>容量上限</div>
                              <div className={styles.detailValue}>{memoryData.short_term.capacity || 100}</div>
                            </div>
                            <div className={styles.detailItem}>
                              <div className={styles.detailLabel}>使用率</div>
                              <div className={styles.detailValue}>{memoryData.short_term.usage_percent || 0}%</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {memoryData.long_term && (
                        <div className={styles.detailSection}>
                          <h4 className={styles.sectionTitle}>长期记忆分类</h4>
                          <div className={styles.memoryTypes}>
                            {Object.entries(memoryData.long_term.types || {}).map(([type, count]: [string, any]) => (
                              <div key={type} className={styles.memoryTypeItem}>
                                <div className={styles.memoryTypeName}>{type}</div>
                                <div className={styles.memoryTypeCount}>{count} 条</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {activeTab === 'attention' && (
                <div className={styles.attentionTab}>
                  {attentionData && (
                    <>
                      <div className={styles.attentionOverview}>
                        <h4 className={styles.sectionTitle}>注意力系统</h4>
                        <div className={styles.detailGrid}>
                          <div className={styles.detailItem}>
                            <div className={styles.detailLabel}>当前任务权重</div>
                            <div className={styles.detailValue}>{attentionData.current_task_weight?.toFixed(2) || '-'}</div>
                          </div>
                          <div className={styles.detailItem}>
                            <div className={styles.detailLabel}>新事件权重</div>
                            <div className={styles.detailValue}>{attentionData.new_event_weight?.toFixed(2) || '-'}</div>
                          </div>
                          <div className={styles.detailItem}>
                            <div className={styles.detailLabel}>状态</div>
                            <div className={styles.detailValue}>{attentionData.status || '未知'}</div>
                          </div>
                          <div className={styles.detailItem}>
                            <div className={styles.detailLabel}>任务队列</div>
                            <div className={styles.detailValue}>{attentionData.task_queue?.length || 0}</div>
                          </div>
                        </div>
                      </div>

                      {attentionData.task_queue && attentionData.task_queue.length > 0 && (
                        <div className={styles.detailSection}>
                          <h4 className={styles.sectionTitle}>任务调度队列</h4>
                          <div className={styles.taskList}>
                            {attentionData.task_queue.map((task: any, idx: number) => (
                              <div key={idx} className={styles.taskItem}>
                                <div className={styles.taskName}>{task.name || `任务 ${idx + 1}`}</div>
                                <div className={styles.taskPriority}>优先级: {task.priority || '普通'}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {activeTab === 'alerts' && (
                <div className={styles.alertsTab}>
                  <div className={styles.alertList}>
                    {alerts.map((alert) => (
                      <div key={alert.id} className={`${styles.alertItem} ${getAlertLevelClass(alert.level)}`}>
                        <div className={styles.alertHeader}>
                          <span className={styles.alertLevel}>[{alert.level.toUpperCase()}]</span>
                          <span className={styles.alertTime}>{formatTimestamp(alert.timestamp)}</span>
                        </div>
                        <div className={styles.alertMessage}>{alert.message}</div>
                        {alert.module && <div className={styles.alertModule}>模块: {alert.module}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SystemMonitor;
