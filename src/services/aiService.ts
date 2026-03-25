import request from './request';
import { API_URLS } from './api';

/**
 * AI 服务
 * 提供对话、语音通话等功能
 */
interface ChatResponse {
  message: string;
  conversationId: string;
}

interface VoiceCallResponse {
  callId: string;
  status: 'connected' | 'disconnected' | 'failed';
}

export const aiService = {
  /**
   * 普通对话
   */
  chat: async (message: string): Promise<ChatResponse> => {
    return request.post(API_URLS.AI_CHAT, { message });
  },

  /**
   * 流式对话
   */
  streamChat: async (
    message: string,
    onChunk: (chunk: string) => void
  ): Promise<void> => {
    const response = await fetch(`${process.env.REACT_APP_API_URL}${API_URLS.AI_STREAM}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader!.read();
      if (done) break;

      const chunk = decoder.decode(value);
      onChunk(chunk);
    }
  },

  /**
   * 语音通话
   */
  voiceCall: {
    /**
     * 发起通话
     */
    start: async (targetId?: string): Promise<VoiceCallResponse> => {
      return request.post(API_URLS.AI_VOICE, { targetId });
    },

    /**
     * 结束通话
     */
    end: async (callId: string): Promise<void> => {
      return request.delete(`${API_URLS.AI_VOICE}/${callId}`);
    },
  },

  /**
   * 获取对话历史
   */
  getHistory: async (conversationId: string) => {
    return request.get(`${API_URLS.AI_CHAT}/${conversationId}`);
  },

  /**
   * 清空对话历史
   */
  clearHistory: async (conversationId: string) => {
    return request.delete(`${API_URLS.AI_CHAT}/${conversationId}`);
  },
};
