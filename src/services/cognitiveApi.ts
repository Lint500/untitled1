// 认知系统 API 服务
import request from './request';
import API_URLS from './api';

export interface SystemStatus {
  aiState: 'IDLE' | 'THINKING' | 'RESPONDING';
  currentGoal: string;
  emotionValue: number;
  attentionFocus: string;
  llmStatus: '运行中' | '空闲' | '错误';
}

export interface EventStreamItem {
  timestamp: string;
  type: string;
  message: string;
  level?: 'info' | 'warn' | 'error' | 'debug';
}

export interface MemoryItem {
  id: string;
  content: string;
  createdAt: string;
  importance?: number;
}

export interface CognitiveState {
  attention: {
    currentTaskWeight: number;
    newEventWeight: number;
    status: string;
  };
  workingMemory: {
    currentGoal: string;
    context: string[];
  };
  goals: Array<{
    name: string;
    weight: number;
  }>;
  emotion: {
    value: number;
    status: 'positive' | 'negative' | 'neutral';
    impact: string;
  };
  llm: {
    isCalling: boolean;
    costTime?: number;
    reason?: string;
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  processSteps?: ProcessStep[];
}

export interface ProcessStep {
  icon: string;
  text: string;
  completed: boolean;
}

/**
 * 获取系统状态
 */
export const getSystemStatus = () => {
  return request.get<SystemStatus>(API_URLS.SYSTEM_STATUS || '/system/status');
};

/**
 * 获取事件流
 */
export const getEventStream = (limit: number = 50) => {
  return request.get<EventStreamItem[]>(`${API_URLS.EVENT_STREAM || '/system/events'}?limit=${limit}`);
};

/**
 * 获取记忆列表
 */
export const getMemories = () => {
  return request.get<MemoryItem[]>(API_URLS.MEMORIES || '/system/memories');
};

/**
 * 删除记忆
 */
export const deleteMemory = (id: string) => {
  return request.delete(`${API_URLS.MEMORIES || '/system/memories'}/${id}`);
};

/**
 * 获取认知状态
 */
export const getCognitiveState = () => {
  return request.get<CognitiveState>(API_URLS.COGNITIVE_STATE || '/system/cognitive');
};

/**
 * 更新注意力水平
 */
export const updateAttentionLevel = (level: number) => {
  return request.post('/system/attention', { level });
};

/**
 * 发送聊天消息
 */
export const sendMessage = (content: string) => {
  return request.post<ChatMessage>(API_URLS.AI_CHAT, { content });
};

/**
 * 设置目标
 */
export const setGoal = (goal: string) => {
  return request.post('/system/goals', { goal });
};
