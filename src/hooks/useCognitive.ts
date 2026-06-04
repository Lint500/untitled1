import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getSystemStatus,
  getEventStream,
  getMemories,
  getCognitiveState,
  updateAttentionLevel,
  deleteMemory,
  type SystemStatus,
  type EventStreamItem,
  type MemoryItem,
  type CognitiveState,
  type ChatMessage,
} from '@/services/cognitiveApi';
import { streamClient } from '@/services/streamClient';
import type { StreamEvent, StreamDebugEvent } from '@/services/streamClient';

interface UseCognitiveReturn {
  systemStatus: SystemStatus | null;
  eventStream: EventStreamItem[];
  memories: MemoryItem[];
  cognitiveState: CognitiveState | null;
  messages: ChatMessage[];
  isLoading: boolean;
  isSending: boolean;
  thinkingSteps: string[];
  streamDebugEvents: StreamDebugEvent[];
  streamDebugState: ReturnType<typeof streamClient.debugState extends never ? never : typeof streamClient['debugState']>;
  sendMessage: (content: string) => Promise<void>;
  updateAttentionLevel: (level: number) => Promise<void>;
  deleteMemory: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const extractEventContent = (evt: StreamEvent): string => {
  if (typeof evt.content === 'string' && evt.content.trim()) return evt.content;
  const data = evt.data || {};
  const candidates = [data.content, data.message, data.text, data.response, data.result];
  const found = candidates.find((item) => typeof item === 'string' && item.trim());
  return found || '';
};

const isAssistantEvent = (evt: StreamEvent): boolean => {
  return (
    evt.event === 'assistant_message' ||
    evt.role === 'assistant' ||
    evt.role === 'main' ||
    evt.type === 'message' ||
    evt.event === 'response' ||
    evt.event === 'final_response'
  );
};

export const useCognitive = (): UseCognitiveReturn => {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [eventStream, setEventStream] = useState<EventStreamItem[]>([]);
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [cognitiveState, setCognitiveState] = useState<CognitiveState | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [thinkingSteps, setThinkingSteps] = useState<string[]>([]);
  const [streamDebugEvents, setStreamDebugEvents] = useState<StreamDebugEvent[]>([]);
  const [streamDebugState, setStreamDebugState] = useState(streamClient.debugState);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  const loadSystemStatus = useCallback(async () => {
    try {
      const data = await getSystemStatus();
      setSystemStatus(data);
    } catch (error) {
      console.error('Failed to load system status:', error);
    }
  }, []);

  const loadCognitiveState = useCallback(async () => {
    try {
      const data = await getCognitiveState();
      setCognitiveState(data);
    } catch (error) {
      console.error('Failed to load cognitive state:', error);
    }
  }, []);

  const loadEventStream = useCallback(async () => {
    try {
      const data = await getEventStream(20);
      setEventStream(data);
    } catch (error) {
      console.error('Failed to load event stream:', error);
    }
  }, []);

  const loadMemories = useCallback(async () => {
    try {
      const data = await getMemories();
      setMemories(data);
    } catch (error) {
      console.error('Failed to load memories:', error);
    }
  }, []);

  const handleSendMessage = useCallback(async (content: string) => {
    if (isSending) return;
    setIsSending(true);
    setThinkingSteps([]);

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages((prev) => [...prev, userMessage]);

    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    try {
      if (!streamClient.isConnected) {
        await streamClient.connect();
        setStreamDebugState(streamClient.debugState);
      }

      let finalContent = '';
      const steps: Array<{ icon: string; text: string; completed: boolean }> = [];

      await new Promise<void>((resolve, reject) => {
        const timeout = window.setTimeout(() => {
          unsubscribeRef.current?.();
          unsubscribeRef.current = null;
          const debug = streamClient.debugState;
          reject(new Error(`AI 响应超时（90s）。最后连接状态：${debug.connected ? 'WS已连接' : 'WS未连接'}；最后错误：${debug.lastError || '无'}`));
        }, 90000);

        const finish = (evt?: StreamEvent) => {
          clearTimeout(timeout);
          unsubscribeRef.current?.();
          unsubscribeRef.current = null;

          const assistantMsg: ChatMessage = {
            id: String(evt?.timestamp || Date.now()),
            role: 'assistant',
            content: finalContent || extractEventContent(evt as StreamEvent) || '（后端返回完成事件，但没有回复内容）',
            timestamp: new Date().toLocaleTimeString(),
            processSteps: steps.length > 0 ? steps : undefined,
          };
          setMessages((prev) => [...prev, assistantMsg]);
          setThinkingSteps([]);
          setStreamDebugState(streamClient.debugState);
          resolve();
        };

        const unsubscribe = streamClient.on((evt: StreamEvent) => {
          const contentText = extractEventContent(evt);

          if (evt.type === 'thinking' || evt.event === 'thinking_step' || evt.type === 'status') {
            if (contentText) {
              steps.push({ icon: evt.type === 'status' ? '⚙️' : '💭', text: contentText.slice(0, 160), completed: true });
              setThinkingSteps((prev) => [...prev.slice(-10), contentText.slice(0, 160)]);
            }
          }

          if (isAssistantEvent(evt) && contentText && evt.type !== 'done') {
            finalContent = contentText;
          }

          if (evt.type === 'done' || evt.event === 'done') {
            finish(evt);
          }

          if (evt.type === 'error') {
            clearTimeout(timeout);
            unsubscribeRef.current?.();
            unsubscribeRef.current = null;
            const errorDetail = evt.data?.error_message || evt.data?.detail || contentText || 'AI 调用失败';
            reject(new Error(`后端错误：${errorDetail}`));
          }
        });

        unsubscribeRef.current = unsubscribe;

        const sent = streamClient.sendInput(content);
        setStreamDebugState(streamClient.debugState);
        if (!sent) {
          clearTimeout(timeout);
          unsubscribe();
          unsubscribeRef.current = null;
          reject(new Error(`WebSocket 未就绪，请稍后重试。${streamClient.debugState.lastError || ''}`));
        }
      });
    } catch (error: any) {
      console.error('Failed to send message:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'system',
          content: `⚠️ ${error?.message || '发送失败，请检查后端是否已启动，以及 VITE_API_KEY 是否与 SIMPLE_API_KEY 一致'}`,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
      setThinkingSteps([]);
      setStreamDebugState(streamClient.debugState);
    } finally {
      setIsSending(false);
    }
  }, [isSending]);

  const handleUpdateAttentionLevel = useCallback(async (level: number) => {
    try {
      await updateAttentionLevel(level);
    } catch (error) {
      console.error('Failed to update attention level:', error);
    }
  }, []);

  const handleDeleteMemory = useCallback(async (id: string) => {
    try {
      await deleteMemory(id);
      setMemories((prev) => prev.filter((m) => m.id !== id));
    } catch (error) {
      console.error('Failed to delete memory:', error);
    }
  }, []);

  const refresh = useCallback(async () => {
    await Promise.all([
      loadSystemStatus(),
      loadCognitiveState(),
      loadEventStream(),
      loadMemories(),
    ]);
  }, [loadSystemStatus, loadCognitiveState, loadEventStream, loadMemories]);

  useEffect(() => {
    const debugUnsubscribe = streamClient.onDebug((event) => {
      setStreamDebugEvents((prev) => [...prev.slice(-199), event]);
      setStreamDebugState(streamClient.debugState);
    });

    const init = async () => {
      await refresh();
      setIsLoading(false);
    };
    init();

    const statusInterval = setInterval(loadSystemStatus, 5000);
    const cognitiveInterval = setInterval(loadCognitiveState, 8000);
    const eventStreamInterval = setInterval(loadEventStream, 3000);

    return () => {
      clearInterval(statusInterval);
      clearInterval(cognitiveInterval);
      clearInterval(eventStreamInterval);
      debugUnsubscribe();
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [refresh, loadSystemStatus, loadCognitiveState, loadEventStream]);

  return {
    systemStatus,
    eventStream,
    memories,
    cognitiveState,
    messages,
    isLoading,
    isSending,
    thinkingSteps,
    streamDebugEvents,
    streamDebugState,
    sendMessage: handleSendMessage,
    updateAttentionLevel: handleUpdateAttentionLevel,
    deleteMemory: handleDeleteMemory,
    refresh,
  };
};
