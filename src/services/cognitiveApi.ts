// 认知系统 API 适配层
// ──────────────────────────────────────────────────────────────────────
// 组件期望的数据结构（SystemStatus / CognitiveState / EventStreamItem / MemoryItem / ChatMessage）
// 不变；本文件负责把后端真实端点（/management/dashboard、/management/thinking、
// /attention/status、/memory/long-term、/stream/session 等）的响应映射成这些结构。
// ──────────────────────────────────────────────────────────────────────
import request from './request';
import API_URLS from './api';
import { streamClient } from './streamClient';

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
  goals: Array<{ name: string; weight: number }>;
  emotion: { value: number; status: 'positive' | 'negative' | 'neutral'; impact: string };
  llm: { isCalling: boolean; costTime?: number; reason?: string };
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

// ── 工具：FastAPI 统一信封 {success, data} 解包 ─────────────────────
function unwrap<T>(resp: any): T {
  if (resp && typeof resp === 'object' && 'success' in resp && 'data' in resp) {
    return resp.data as T;
  }
  return resp as T;
}

// ── 1. 系统状态 → /management/dashboard + /management/thinking ──────
export const getSystemStatus = async (): Promise<SystemStatus> => {
  const [dashboard, thinking, emotion] = await Promise.all([
    request.get(API_URLS.MANAGEMENT_DASHBOARD).then(unwrap).catch(() => null) as Promise<any>,
    request.get(API_URLS.MANAGEMENT_THINKING).then(unwrap).catch(() => null) as Promise<any>,
    request.get(API_URLS.MEMORY_SHORT_TERM_EMOTION).then(unwrap).catch(() => null) as Promise<any>,
  ]);

  let aiState: SystemStatus['aiState'] = 'IDLE';
  if (thinking?.is_thinking) aiState = 'THINKING';
  else if (thinking?.is_responding) aiState = 'RESPONDING';

  return {
    aiState,
    currentGoal: dashboard?.current_goal || dashboard?.goal || '',
    emotionValue: typeof emotion?.value === 'number' ? emotion.value : (emotion?.intensity ?? 0),
    attentionFocus: dashboard?.attention_focus || thinking?.current_focus || '',
    llmStatus: thinking?.manager_loaded ? '运行中' : (thinking?.initialized ? '空闲' : '错误'),
  };
};

// ── 2. 认知状态 → /attention/status + /management/dashboard + /memory ─
export const getCognitiveState = async (): Promise<CognitiveState> => {
  const [attention, dashboard, emotion, thinking] = await Promise.all([
    request.get(API_URLS.ATTENTION_STATUS).then(unwrap).catch(() => null) as Promise<any>,
    request.get(API_URLS.MANAGEMENT_DASHBOARD).then(unwrap).catch(() => null) as Promise<any>,
    request.get(API_URLS.MEMORY_SHORT_TERM_EMOTION).then(unwrap).catch(() => null) as Promise<any>,
    request.get(API_URLS.MANAGEMENT_THINKING).then(unwrap).catch(() => null) as Promise<any>,
  ]);

  const emotionValue = typeof emotion?.value === 'number' ? emotion.value : 0;
  const emotionStatus: CognitiveState['emotion']['status'] =
    emotionValue > 0 ? 'positive' : emotionValue < 0 ? 'negative' : 'neutral';

  return {
    attention: {
      currentTaskWeight: attention?.current_task_weight ?? attention?.task_weight ?? 0,
      newEventWeight: attention?.new_event_weight ?? attention?.event_weight ?? 0,
      status: attention?.status || 'unknown',
    },
    workingMemory: {
      currentGoal: dashboard?.current_goal || thinking?.current_goal || '',
      context: Array.isArray(dashboard?.context) ? dashboard.context : (thinking?.context ?? []),
    },
    goals: Array.isArray(dashboard?.goals) ? dashboard.goals.map((g: any) => ({
      name: g.name || String(g),
      weight: typeof g.weight === 'number' ? g.weight : 1,
    })) : [],
    emotion: {
      value: emotionValue,
      status: emotionStatus,
      impact: emotion?.impact || emotion?.reason || '',
    },
    llm: {
      isCalling: !!thinking?.is_calling,
      costTime: thinking?.last_cost_time,
      reason: thinking?.last_reason,
    },
  };
};

// ── 3. 事件流 → /management/monitor/logs ─────────────────────────────
//   后端返回数组形如 [{timestamp, level, message, module, ...}]
export const getEventStream = async (limit: number = 50): Promise<EventStreamItem[]> => {
  const data = await request.get(API_URLS.MANAGEMENT_MONITOR_LOGS, { params: { limit } })
    .then(unwrap)
    .catch(() => []) as any[];

  if (!Array.isArray(data)) return [];

  return data.map((it: any) => ({
    timestamp: it.timestamp || it.time || new Date().toISOString(),
    type: it.type || it.module || 'log',
    message: it.message || it.msg || '',
    level: (it.level === 'warning' ? 'warn' : it.level) as EventStreamItem['level'],
  }));
};

// ── 4. 记忆列表 → /memory/long-term/{type} 聚合 ──────────────────────
//   后端合法类型：dialog / thought / preference / summary / evolution / event
//   组件展示用："dialog"（最贴近 episodic）+ "thought"（最贴近 semantic）
export const getMemories = async (): Promise<MemoryItem[]> => {
  const fetchType = (memType: string) =>
    request.get(`${API_URLS.MEMORY_LONG_TERM}/${memType}`, { params: { limit: 50 } })
      .catch(() => []) as Promise<any[]>;

  const [dialogs, thoughts] = await Promise.all([
    fetchType('dialog'),
    fetchType('thought'),
  ]);

  const all = [...(Array.isArray(dialogs) ? dialogs : []), ...(Array.isArray(thoughts) ? thoughts : [])];

  return all.map((m: any, idx: number) => ({
    id: String(m.id ?? m.memory_id ?? `mem-${idx}`),
    content: m.content || m.text || JSON.stringify(m).slice(0, 200),
    createdAt: m.created_at || m.timestamp || '',
    importance: typeof m.importance === 'number' ? m.importance : (m.weight ?? 0),
  }));
};

// ── 5. 删除记忆 → DELETE /memory/long-term/{memory_id} ────────────────
export const deleteMemory = (id: string) => {
  return request.delete(`${API_URLS.MEMORY_LONG_TERM}/${id}`);
};

// ── 6. 注意力等级 → /attention/weight/calculate ─────────────────────
export const updateAttentionLevel = (level: number) => {
  // 后端通过 weight/calculate 接收 base_weight
  return request.post(API_URLS.ATTENTION_WEIGHT_CALCULATE, null, {
    params: { base_weight: level },
  });
};

// ── 7. 发送消息 → 走 streamClient（WebSocket）─────────────────────────
//   组件期望同步拿到 assistant 回复；WebSocket 是流式 → 用 Promise 等 done
export const sendMessage = async (content: string): Promise<ChatMessage> => {
  if (!streamClient.isConnected) {
    await streamClient.connect();
  }

  return new Promise<ChatMessage>((resolve, reject) => {
    let finalContent = '';
    const steps: ProcessStep[] = [];
    let resolved = false;
    const timeout = window.setTimeout(() => {
      if (!resolved) {
        resolved = true;
        unsubscribe();
        reject(new Error('AI 响应超时（20s）。如果一直卡住，请检查后端 .env 里的 LARGE_MODEL_API_KEY 是否是真实可用的模型 Key。'));
      }
    }, 20000);

    const unsubscribe = streamClient.on((evt) => {
      // 累积助手回复
      if (evt.type === 'message' && evt.event === 'assistant_message') {
        finalContent = evt.content;
      }
      // 收集思考过程
      if (evt.type === 'thinking' || evt.event === 'thinking_step') {
        steps.push({ icon: '💭', text: evt.content?.slice(0, 80) || '', completed: true });
      }
      // 完成
      if (evt.type === 'done' && !resolved) {
        resolved = true;
        clearTimeout(timeout);
        unsubscribe();
        resolve({
          id: String(evt.timestamp || Date.now()),
          role: 'assistant',
          content: finalContent || evt.content || '',
          timestamp: new Date().toLocaleTimeString(),
          processSteps: steps,
        });
      }
      // 错误
      if (evt.type === 'error' && !resolved) {
        resolved = true;
        clearTimeout(timeout);
        unsubscribe();
        reject(new Error(evt.content || 'AI 调用失败'));
      }
    });

    if (!streamClient.sendInput(content)) {
      resolved = true;
      clearTimeout(timeout);
      unsubscribe();
      reject(new Error('WebSocket 未就绪，发送失败'));
    }
  });
};

// ── 8. 设置目标 → 后端没有直接的 /system/goals，写入工作记忆代替 ─────
export const setGoal = (goal: string) => {
  return request.post(API_URLS.MEMORY_SHORT_TERM_WORKING, { current_goal: goal });
};
