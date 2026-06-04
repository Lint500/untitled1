import request from './request';

// 后端 data_process 模块的统一前缀（参考 D:/ai_backend/infra/data_process/api.py）
const DP = '/data-process';

/**
 * ============================================================================
 * Humanoid AGI - 信息处理模块 API
 * ============================================================================
 */

// 语音识别接口
export const recognizeSpeech = async (audioFile: File, language: string = 'auto', task: string = 'transcribe') => {
  const formData = new FormData();
  formData.append('audio_file', audioFile);
  formData.append('language', language);
  formData.append('task', task);

  return request.post(`${DP}/speech/recognize`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

// Base64音频识别
export const recognizeSpeechBase64 = async (audio: string, language: string = 'auto') => {
  return request.post(`${DP}/speech/recognize-base64`, null, {
    params: { audio, language }
  });
};

// 图像分析接口
export const analyzeImage = async (imageFile: File, prompt: string = '详细描述这张图片，包含所有可见的物体、场景和细节') => {
  const formData = new FormData();
  formData.append('image_file', imageFile);
  formData.append('prompt', prompt);

  return request.post(`${DP}/image/analyze`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

// 分析网络图片URL
export const analyzeImageUrl = async (imageUrl: string, prompt: string = '详细描述这张图片') => {
  return request.post(`${DP}/image/analyze-url`, null, {
    params: { image_url: imageUrl, prompt }
  });
};

// 分析Base64编码的图片
export const analyzeImageBase64 = async (image: string, prompt: string = '详细描述这张图片') => {
  return request.post(`${DP}/image/analyze-base64`, null, {
    params: { image, prompt }
  });
};

// 获取信息处理模块状态
export const getInformationStatus = () => {
  return request.get(`${DP}/status`);
};

// UI元素检测接口
export const detectUiElements = async (imageFile: File, elementTypes?: string) => {
  const formData = new FormData();
  formData.append('image_file', imageFile);
  if (elementTypes) {
    formData.append('element_types', elementTypes);
  }

  return request.post(`${DP}/image/detect-ui`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

// 带自然语言查询的图像分析
export const analyzeWithQuery = async (imageFile: File, query: string = '详细描述这张图片，包含所有UI元素的位置和颜色') => {
  const formData = new FormData();
  formData.append('image_file', imageFile);
  formData.append('query', query);

  return request.post(`${DP}/image/analyze-query`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

// 在图像上绘制UI元素标注
export const drawUiElements = async (imageFile: File, elementData: any) => {
  const formData = new FormData();
  formData.append('image_file', imageFile);
  formData.append('element_data', typeof elementData === 'string' ? elementData : JSON.stringify(elementData));

  return request.post(`${DP}/image/draw-elements`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

/**
 * ============================================================================
 * Humanoid AGI - 工具管理模块 API
 * ============================================================================
 */

// 列出所有可用工具
export const listTools = (source?: string) => {
  return request.get('/tools/', { params: source ? { source } : {} });
};

// 获取工具管理器状态
export const getToolStatus = () => {
  return request.get('/tools/status');
};

// 调用工具
export const callTool = (toolName: string, params: Record<string, any> = {}) => {
  return request.post('/tools/call', { tool_name: toolName, params });
};

// 同步调用工具
export const callToolSync = (toolName: string, params: Record<string, any> = {}) => {
  return request.post('/tools/call-sync', { tool_name: toolName, params });
};

// 从JSON调用工具
export const callFromJson = (jsonStr: string) => {
  return request.post('/tools/call-json', jsonStr);
};

// 获取工具调用历史
export const getToolEvents = (params?: {
  limit?: number;
  tool_name?: string;
  success?: boolean;
  since?: number;
}) => {
  return request.get('/tools/events', { params });
};

// 清空工具调用历史
export const clearToolEvents = () => {
  return request.delete('/tools/events');
};

// 获取工具调用统计
export const getToolEventStats = () => {
  return request.get('/tools/events/stats');
};

// 手动注册工具
export const registerTool = (data: { name: string; description?: string; params?: Record<string, string> }) => {
  return request.post('/tools/register', data);
};

// 重新加载插件工具
export const reloadPluginTools = (pluginName: string) => {
  return request.post(`/tools/reload/${pluginName}`);
};

// 获取已加载工具的插件列表
export const getLoadedPlugins = () => {
  return request.get('/tools/plugins/loaded');
};

// 获取工具详情
export const getToolInfo = (toolName: string) => {
  return request.get(`/tools/info/${toolName}`);
};

/**
 * ============================================================================
 * Humanoid AGI - 记忆管理模块 API
 * ============================================================================
 */

// 添加对话到短期记忆
export const addDialogMemory = (data: { role: string; text: string; metadata?: Record<string, any> }) => {
  return request.post('/memory/short-term/dialog', data);
};

// 获取对话上下文
export const getContext = (limit: number = 20) => {
  return request.get('/memory/short-term/context', { params: { limit } });
};

// 设置工作记忆
export const setWorkingMemory = (data: Record<string, any>) => {
  return request.post('/memory/short-term/working', data);
};

// 获取工作记忆
export const getWorkingMemory = (key: string) => {
  return request.get(`/memory/short-term/working/${key}`);
};

// 获取当前情绪
export const getCurrentEmotion = () => {
  return request.get('/memory/short-term/emotion');
};

// 设置当前情绪
export const setCurrentEmotion = (emotion: Record<string, any>) => {
  return request.post('/memory/short-term/emotion', emotion);
};

// 清空短期记忆
export const clearShortTermMemory = () => {
  return request.delete('/memory/short-term/clear');
};

// 保存长期记忆
export const saveLongTermMemory = (memoryType: string, content: Record<string, any>) => {
  return request.post('/memory/long-term', { memory_type: memoryType, content });
};

// 加载长期记忆
export const loadLongTermMemory = (memoryType: string, limit: number = 50) => {
  return request.get(`/memory/long-term/${memoryType}`, { params: { limit } });
};

// 搜索长期记忆
export const searchLongTermMemory = (memoryType: string, keywords: string, limit: number = 20) => {
  return request.get(`/memory/long-term/${memoryType}/search`, {
    params: { keywords, limit }
  });
};

// 删除长期记忆
export const deleteLongTermMemory = (memoryId: string, memoryType?: string) => {
  return request.delete(`/memory/long-term/${memoryId}`, {
    params: memoryType ? { memory_type: memoryType } : {}
  });
};

// 获取完整人格配置
export const getPersonality = () => {
  return request.get('/memory/personality');
};

// 获取人格特征
export const getPersonalityTrait = (key: string, defaultValue?: string) => {
  return request.get(`/memory/personality/trait/${key}`, {
    params: defaultValue ? { default: defaultValue } : {}
  });
};

// 更新人格特征
export const updatePersonalityTrait = (key: string, data: Record<string, any>) => {
  return request.put(`/memory/personality/trait/${key}`, data);
};

// 获取价值观倾向
export const getValues = () => {
  return request.get('/memory/personality/values');
};

// 获取黑匣子日志
export const getBlackboxLogs = (logType: string, limit: number = 50) => {
  return request.get(`/memory/blackbox/${logType}`, { params: { limit } });
};

// 获取时间线
export const getTimeline = (limit: number = 100) => {
  return request.get('/memory/blackbox/timeline', { params: { limit } });
};

// 搜索所有类型的记忆
export const searchMemories = (keywords: string, limit: number = 20) => {
  return request.get('/memory/search', { params: { keywords, limit } });
};

// 获取记忆模块综合状态
export const getMemoryStatus = () => {
  return request.get('/memory/status');
};

// 获取记忆状态摘要
export const getMemorySummary = () => {
  return request.get('/memory/summary');
};

// 保存记忆快照
export const saveSnapshot = (snapshotName: string) => {
  return request.post('/memory/snapshot', { snapshot_name: snapshotName });
};

/**
 * ============================================================================
 * Humanoid AGI - 流式思考模块 API
 * ============================================================================
 */

// 创建流式会话
export const createSession = () => {
  return request.post('/stream/session');
};

// SSE 流式响应（GET）
export const sseSessionGet = (sessionId: string, question: string = '') => {
  return request.get(`/stream/sse/${sessionId}`, {
    params: { question }
  });
};

// SSE 流式响应（POST）
export const sseSessionPost = (sessionId: string, question: string = '') => {
  return request.post(`/stream/sse/${sessionId}`, null, {
    params: { question }
  });
};

// 获取会话上下文
export const getSessionContext = (sessionId: string) => {
  return request.get(`/stream/context/${sessionId}`);
};

// 关闭会话
export const closeSession = (sessionId: string) => {
  return request.delete(`/stream/session/${sessionId}`);
};

// 获取系统状态
export const getStreamStatus = () => {
  return request.get('/stream/status');
};

/**
 * ============================================================================
 * Humanoid AGI - 注意力模块 API
 * ============================================================================
 */

// 计算注意力权重
export const calculateWeight = (data?: {
  base_weight?: number;
  sound_level?: number;
  visual_level?: number;
  task_priority?: number;
  emotion_intensity?: number;
}) => {
  return request.post('/attention/weight/calculate', null, { params: data });
};

// 通过注意力模块分层召回记忆
export const recallMemories = (query: string, attentionLevel: number = 0.6) => {
  return request.post('/attention/memory/recall', null, {
    params: { query, attention_level: attentionLevel }
  });
};

// 调度任务优先级
export const scheduleTasks = (tasks: Array<Record<string, any>>) => {
  return request.post('/attention/task/schedule', tasks);
};

// 获取注意力系统状态
export const getAttentionStatus = () => {
  return request.get('/attention/status');
};

// 分析用户输入的注意力决策
export const analyzeAttention = (data: {
  user_input: string;
  context?: Array<Record<string, any>>;
  short_term_memory?: Array<string>;
}) => {
  return request.post('/attention/analyze', data);
};

// 对记忆列表进行注意力打分
export const scoreMemories = (query: string, memories: Array<Record<string, any>>, attentionLevel: number = 0.6) => {
  return request.post('/attention/memory/score', {
    query,
    memories,
    attention_level: attentionLevel
  });
};

/**
 * ============================================================================
 * Humanoid AGI - 管理控制台模块 API
 * ============================================================================
 */

// 获取仪表盘核心数据
export const getDashboard = () => {
  return request.get('/management/dashboard');
};

// 获取完整系统信息
export const getSystemInfo = () => {
  return request.get('/management/system');
};

// 获取当前进程信息
export const getProcessInfo = () => {
  return request.get('/management/system/process');
};

// 获取所有模块列表
export const getAllModules = () => {
  return request.get('/management/modules');
};

// 获取所有模块状态详情
export const getModulesStatus = () => {
  return request.get('/management/modules/status');
};

// 获取单个模块详情
export const getModuleDetail = (moduleName: string) => {
  return request.get(`/management/modules/${moduleName}`);
};

// 刷新模块状态
export const refreshModule = (moduleName: string) => {
  return request.post(`/management/modules/${moduleName}/refresh`);
};

// 获取记忆模块完整信息
export const getMemoryFull = () => {
  return request.get('/management/memory');
};

// 获取工具熟练度
export const getToolSkills = () => {
  return request.get('/management/memory/tool-skills');
};

// 记录工具使用成功
export const recordToolSuccess = (toolName: string) => {
  return request.post(`/management/memory/tool-skills/${toolName}/success`);
};

// 记录工具使用失败
export const recordToolFailure = (toolName: string) => {
  return request.post(`/management/memory/tool-skills/${toolName}/failure`);
};

// 清空记忆
export const clearMemory = (scope: string = 'short_term') => {
  return request.post('/management/memory/clear', null, { params: { scope } });
};

// 获取感知模块完整信息
export const getPerceptionFull = () => {
  return request.get('/management/perception');
};

// 启动感知监控
export const startPerception = () => {
  return request.post('/management/perception/start');
};

// 停止感知监控
export const stopPerception = () => {
  return request.post('/management/perception/stop');
};

// 清空调知池
export const clearPerception = () => {
  return request.post('/management/perception/clear');
};

// 获取数据库信息
export const getDatabaseInfo = () => {
  return request.get('/management/database');
};

// 获取资源使用情况
export const getResources = () => {
  return request.get('/management/resources');
};

// 获取信息处理模块状态
export const getInfoProcessStatus = () => {
  return request.get('/management/info-process');
};

// 获取思维模块状态
export const getThinkingStatus = () => {
  return request.get('/management/thinking');
};

// 获取注意力模块状态
export const getManagementAttentionStatus = () => {
  return request.get('/management/attention');
};

// 获取安全模块状态
export const getSecurityStatus = () => {
  return request.get('/management/security');
};

// 健康检查
export const healthCheck = () => {
  return request.get('/management/health');
};

// 获取实时指标
export const getLiveMetrics = () => {
  return request.get('/management/metrics/live');
};

// 获取指标历史
export const getMetricHistory = (metricName: string, params?: {
  start?: number;
  end?: number;
  limit?: number;
}) => {
  return request.get(`/management/metrics/history/${metricName}`, { params });
};

// 获取指标统计
export const getMetricStats = (metricName: string) => {
  return request.get(`/management/metrics/stats/${metricName}`);
};

// 获取告警列表
export const getAlerts = (severity?: string, limit: number = 100) => {
  return request.get('/management/alerts', {
    params: { severity, limit }
  });
};

// 获取告警摘要
export const getAlertSummary = () => {
  return request.get('/management/alerts/summary');
};

// 获取告警规则
export const getAlertRules = () => {
  return request.get('/management/alerts/rules');
};

// 创建告警规则
export const createAlertRule = (data: Record<string, any>) => {
  return request.post('/management/alerts/rules', data);
};
