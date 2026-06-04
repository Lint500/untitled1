// AI 服务适配层
// chat       → 走 WebSocket（streamClient），单次 Promise 形式
// streamChat → 走 SSE，按事件触发 onChunk
// voiceCall  → 后端目前只有 /output/speech（合成）+ /speech/recognize（识别），
//              没有"通话"概念；保留接口签名但实现为占位以免破坏调用方
import request from './request';
import { streamClient } from './streamClient';
import { openSSE } from './sseClient';


interface ChatResponse {
  message: string;
  conversationId: string;
}

interface VoiceCallResponse {
  callId: string;
  status: 'connected' | 'disconnected' | 'failed';
}

export const aiService = {
  /** 普通对话 — 走 WebSocket，等待完整响应 */
  chat: async (message: string): Promise<ChatResponse> => {
    if (!streamClient.isConnected) {
      await streamClient.connect();
    }

    return new Promise<ChatResponse>((resolve, reject) => {
      let finalContent = '';
      let resolved = false;
      const timeout = window.setTimeout(() => {
        if (!resolved) {
          resolved = true;
          unsubscribe();
          reject(new Error('AI 响应超时（60s）'));
        }
      }, 60000);

      const unsubscribe = streamClient.on((evt) => {
        if (evt.type === 'message' && evt.event === 'assistant_message') {
          finalContent = evt.content;
        }
        if (evt.type === 'done' && !resolved) {
          resolved = true;
          clearTimeout(timeout);
          unsubscribe();
          resolve({
            message: finalContent || evt.content || '',
            conversationId: streamClient.currentSessionId,
          });
        }
        if (evt.type === 'error' && !resolved) {
          resolved = true;
          clearTimeout(timeout);
          unsubscribe();
          reject(new Error(evt.content || 'AI 调用失败'));
        }
      });

      if (!streamClient.sendInput(message)) {
        resolved = true;
        clearTimeout(timeout);
        unsubscribe();
        reject(new Error('WebSocket 未就绪'));
      }
    });
  },

  /** 流式对话 — 走 SSE，按事件触发 onChunk */
  streamChat: async (
    message: string,
    onChunk: (chunk: string) => void,
  ): Promise<void> => {
    // SSE 需要先有 session_id
    const sessionResp: any = await request.post('/stream/session');
    const sessionId = sessionResp?.data?.session_id || sessionResp?.session_id;
    if (!sessionId) throw new Error('创建 SSE 会话失败');

    await new Promise<void>((resolve, reject) => {
      const close = openSSE(sessionId, message, {
        onMessage: (data, evtName) => {
          if (typeof data === 'object' && data) {
            const content = data.content || '';
            if (content) onChunk(content);
            if (data.type === 'done' || evtName === 'done') {
              close();
              resolve();
            }
            if (data.type === 'error' || evtName === 'error') {
              close();
              reject(new Error(content || 'SSE 错误'));
            }
          } else if (typeof data === 'string') {
            onChunk(data);
          }
        },
        onError: () => {
          close();
          reject(new Error('SSE 连接错误'));
        },
      });
    });
  },

  /** 语音通话 — 后端无对应实现，保留接口避免破坏调用方 */
  voiceCall: {
    start: async (_targetId?: string): Promise<VoiceCallResponse> => {
      console.warn('[aiService.voiceCall.start] 后端暂未实现，已返回占位状态');
      return { callId: '', status: 'failed' };
    },
    end: async (_callId: string): Promise<void> => {
      console.warn('[aiService.voiceCall.end] 后端暂未实现');
    },
  },

  /** 对话历史 — 走 /stream/context/{session_id} */
  getHistory: async (conversationId: string) => {
    return request.get(`/stream/context/${conversationId}`);
  },

  /** 清空对话历史 — DELETE /stream/session/{session_id} */
  clearHistory: async (conversationId: string) => {
    return request.delete(`/stream/session/${conversationId}`);
  },
};
