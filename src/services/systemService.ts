import { request } from './request';

export interface ModuleStatus {
  name: string;
  status: 'running' | 'stopped' | 'error' | 'warning';
  health: number;
  lastUpdate: string;
  details?: any;
}

export interface SystemDashboard {
  systemHealth: 'healthy' | 'degraded' | 'critical';
  resources: {
    cpu: number;
    memory: number;
    gpu?: number;
  };
  modules: Record<string, ModuleStatus>;
  alerts: Array<{
    id: string;
    level: 'info' | 'warning' | 'error';
    message: string;
    timestamp: string;
    module?: string;
  }>;
}

export const systemService = {
  getParams: async () => {
    // 从 dashboard + thinking + attention 各取一项关键运行参数
    const safe = async <T,>(p: Promise<T>): Promise<T | null> => {
      try { return await p; } catch { return null; }
    };
    const unwrap = (r: any) =>
      r && typeof r === 'object' && 'success' in r && 'data' in r ? r.data : r;

    const [dashboard, thinking, attention, resources] = await Promise.all([
      safe(request.get('/management/dashboard').then(unwrap)),
      safe(request.get('/management/thinking').then(unwrap)),
      safe(request.get('/attention/status').then(unwrap)),
      safe(request.get('/management/resources').then(unwrap)),
    ]);

    const d: any = dashboard || {};
    const t: any = thinking || {};
    const a: any = attention || {};
    const r: any = resources || {};

    return [
      {
        id: 'system_health',
        name: '系统健康度',
        value: d.system_health || (d.systemHealth ?? '未知'),
        description: '后端 dashboard 上报的整体健康状态',
      },
      {
        id: 'attention_threshold',
        name: '注意力阈值',
        value: String(a.threshold ?? a.attention_level ?? '-'),
        description: '当前 attention 模块阈值（/attention/status）',
      },
      {
        id: 'thinking_initialized',
        name: '思维引擎',
        value: t.initialized ? '已加载' : '未加载',
        description: '主管/专家模型加载状态（/management/thinking）',
      },
      {
        id: 'thinking_experts',
        name: '专家槽位',
        value: String(t.total_experts_in_library ?? t.active_experts?.length ?? 0),
        description: '当前可用专家数量',
      },
      {
        id: 'cpu_usage',
        name: 'CPU 使用率',
        value: `${Math.round((r.cpu_percent ?? d.resources?.cpu ?? 0))}%`,
        description: '后端实时上报的 CPU 占用',
      },
      {
        id: 'memory_usage',
        name: '内存使用率',
        value: `${Math.round((r.memory_percent ?? d.resources?.memory ?? 0))}%`,
        description: '后端实时上报的内存占用',
      },
    ];
  },

  getDashboardOverview: async (): Promise<SystemDashboard> => {
    try {
      const data = await request.get('/management/dashboard');
      return data;
    } catch (error) {
      console.error('获取仪表盘数据失败:', error);
      throw error;
    }
  },

  getHardwareDetails: async () => {
    try {
      const data = await request.get('/management/resources/hardware');
      return data;
    } catch (error) {
      console.error('获取硬件详情失败:', error);
      throw error;
    }
  },

  getResourceStatus: async () => {
    try {
      const data = await request.get('/management/resources/status');
      return data;
    } catch (error) {
      console.error('获取资源状态失败:', error);
      throw error;
    }
  },

  getMemoryStatus: async () => {
    try {
      const data = await request.get('/management/memory/status');
      return data;
    } catch (error) {
      console.error('获取记忆状态失败:', error);
      throw error;
    }
  },

  getPersonality: async () => {
    try {
      const data = await request.get('/management/memory/personality');
      return data;
    } catch (error) {
      console.error('获取人格配置失败:', error);
      throw error;
    }
  },

  clearShortTermMemory: async () => {
    try {
      const data = await request.post('/management/memory/clear_short_term');
      return data;
    } catch (error) {
      console.error('清空短期记忆失败:', error);
      throw error;
    }
  },

  getEmotionStatus: async () => {
    try {
      const data = await request.get('/management/emotion/status');
      return data;
    } catch (error) {
      console.error('获取情绪状态失败:', error);
      throw error;
    }
  },

  guideEmotion: async (targetEmotion: string, intensity: number = 0.8, reason: string = 'Manual override') => {
    try {
      const data = await request.post('/management/emotion/guide', {
        target_emotion: targetEmotion,
        intensity,
        reason,
      });
      return data;
    } catch (error) {
      console.error('引导情绪失败:', error);
      throw error;
    }
  },

  getMonitorLogs: async (limit: number = 50) => {
    try {
      const data = await request.get(`/management/monitor/logs?limit=${limit}`);
      return data;
    } catch (error) {
      console.error('获取监控日志失败:', error);
      throw error;
    }
  },

  getModuleMonitorStatus: async () => {
    try {
      const data = await request.get('/management/monitor/modules');
      return data;
    } catch (error) {
      console.error('获取模块监控状态失败:', error);
      throw error;
    }
  },

  restartModule: async (moduleName: string) => {
    try {
      const data = await request.post('/management/actions/restart_module', {
        module_name: moduleName,
      });
      return data;
    } catch (error) {
      console.error(`重启模块 ${moduleName} 失败:`, error);
      throw error;
    }
  },

  getSystemStatus: async () => {
    try {
      const data = await request.get('/management/status');
      return data;
    } catch (error) {
      console.error('获取系统状态失败:', error);
      throw error;
    }
  },

  getInfoProcessStatus: async () => {
    try {
      const data = await request.get('/info-process/status');
      return data;
    } catch (error) {
      console.error('获取信息处理状态失败:', error);
      throw error;
    }
  },

  getMemoryModuleStatus: async () => {
    try {
      const data = await request.get('/memory/status');
      return data;
    } catch (error) {
      console.error('获取记忆模块状态失败:', error);
      throw error;
    }
  },

  getThinkingStatus: async () => {
    try {
      const data = await request.get('/thinking/status');
      return data;
    } catch (error) {
      console.error('获取思维状态失败:', error);
      throw error;
    }
  },

  getThinkingExperts: async () => {
    try {
      const data = await request.get('/thinking/experts');
      return data;
    } catch (error) {
      console.error('获取专家列表失败:', error);
      throw error;
    }
  },

  getThinkingEmotionStatus: async () => {
    try {
      const data = await request.get('/thinking/emotion/status');
      return data;
    } catch (error) {
      console.error('获取思维情绪状态失败:', error);
      throw error;
    }
  },

  getThinkingEmotionHistory: async (limit: number = 10) => {
    try {
      const data = await request.get(`/thinking/emotion/history?limit=${limit}`);
      return data;
    } catch (error) {
      console.error('获取情绪历史失败:', error);
      throw error;
    }
  },

  getAttentionStatus: async () => {
    try {
      const data = await request.get('/attention/status');
      return data;
    } catch (error) {
      console.error('获取注意力状态失败:', error);
      throw error;
    }
  },

  getOutputStatus: async () => {
    try {
      const data = await request.get('/output/status');
      return data;
    } catch (error) {
      console.error('获取输出状态失败:', error);
      throw error;
    }
  },

  getStreamStatus: async () => {
    try {
      const data = await request.get('/stream/status');
      return data;
    } catch (error) {
      console.error('获取流式思考状态失败:', error);
      throw error;
    }
  },

  checkHealth: async () => {
    try {
      const data = await request.get('/health');
      return data;
    } catch (error) {
      console.error('健康检查失败:', error);
      throw error;
    }
  },
};

export default systemService;
