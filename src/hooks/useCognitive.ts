import { useState, useEffect, useCallback } from 'react';
import {
  getSystemStatus,
  getEventStream,
  getMemories,
  getCognitiveState,
  sendMessage,
  updateAttentionLevel,
  deleteMemory,
  type SystemStatus,
  type EventStreamItem,
  type MemoryItem,
  type CognitiveState,
  type ChatMessage
} from '@/services/cognitiveApi';

interface UseCognitiveReturn {
  // 数据
  systemStatus: SystemStatus | null;
  eventStream: EventStreamItem[];
  memories: MemoryItem[];
  cognitiveState: CognitiveState | null;
  messages: ChatMessage[];
  isLoading: boolean;
  
  // 操作
  sendMessage: (content: string) => Promise<void>;
  updateAttentionLevel: (level: number) => Promise<void>;
  deleteMemory: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

/**
 * 认知系统 Hook
 * 统一管理认知相关的所有数据和操作
 */
export const useCognitive = (): UseCognitiveReturn => {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [eventStream, setEventStream] = useState<EventStreamItem[]>([]);
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [cognitiveState, setCognitiveState] = useState<CognitiveState | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 加载系统状态
  const loadSystemStatus = useCallback(async () => {
    try {
      const data = await getSystemStatus();
      setSystemStatus(data);
    } catch (error) {
      console.error('Failed to load system status:', error);
    }
  }, []);

  // 加载认知状态
  const loadCognitiveState = useCallback(async () => {
    try {
      const data = await getCognitiveState();
      setCognitiveState(data);
    } catch (error) {
      console.error('Failed to load cognitive state:', error);
    }
  }, []);

  // 加载事件流
  const loadEventStream = useCallback(async () => {
    try {
      const data = await getEventStream(20);
      setEventStream(data);
    } catch (error) {
      console.error('Failed to load event stream:', error);
    }
  }, []);

  // 加载记忆
  const loadMemories = useCallback(async () => {
    try {
      const data = await getMemories();
      setMemories(data);
    } catch (error) {
      console.error('Failed to load memories:', error);
    }
  }, []);

  // 发送消息
  const handleSendMessage = useCallback(async (content: string) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await sendMessage(content);
      setMessages(prev => [...prev, response]);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }, []);

  // 更新注意力
  const handleUpdateAttentionLevel = useCallback(async (level: number) => {
    try {
      await updateAttentionLevel(level);
    } catch (error) {
      console.error('Failed to update attention level:', error);
    }
  }, []);

  // 删除记忆
  const handleDeleteMemory = useCallback(async (id: string) => {
    try {
      await deleteMemory(id);
      setMemories(prev => prev.filter(m => m.id !== id));
    } catch (error) {
      console.error('Failed to delete memory:', error);
    }
  }, []);

  // 刷新所有数据
  const refresh = useCallback(async () => {
    await Promise.all([
      loadSystemStatus(),
      loadCognitiveState(),
      loadEventStream(),
      loadMemories()
    ]);
  }, [loadSystemStatus, loadCognitiveState, loadEventStream, loadMemories]);

  // 初始化加载
  useEffect(() => {
    const init = async () => {
      await refresh();
      setIsLoading(false);
    };
    
    init();

    // 定时刷新
    const statusInterval = setInterval(loadSystemStatus, 2000);
    const cognitiveInterval = setInterval(loadCognitiveState, 3000);
    const eventStreamInterval = setInterval(loadEventStream, 1000);

    return () => {
      clearInterval(statusInterval);
      clearInterval(cognitiveInterval);
      clearInterval(eventStreamInterval);
    };
  }, [refresh, loadSystemStatus, loadCognitiveState, loadEventStream]);

  return {
    // 数据
    systemStatus,
    eventStream,
    memories,
    cognitiveState,
    messages,
    isLoading,
    
    // 操作
    sendMessage: handleSendMessage,
    updateAttentionLevel: handleUpdateAttentionLevel,
    deleteMemory: handleDeleteMemory,
    refresh
  };
};
