import { useState } from 'react';
import { aiService } from '@services/aiService';

/**
 * AI 功能 Hook
 * 封装 AI 对话和语音通话功能
 */
export function useAI() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 发送对话消息
   */
  const sendMessage = async (message: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await aiService.chat(message);
      return response;
    } catch (err: any) {
      setError(err.message || '发送消息失败');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 发起语音通话
   */
  const startVoiceCall = async (targetId?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await aiService.voiceCall.start(targetId);
      return result;
    } catch (err: any) {
      setError(err.message || '语音通话失败');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 结束语音通话
   */
  const endVoiceCall = async (callId: string) => {
    try {
      await aiService.voiceCall.end(callId);
    } catch (err: any) {
      setError(err.message || '结束通话失败');
      throw err;
    }
  };

  /**
   * 流式对话
   */
  const streamChat = async (
    message: string,
    onChunk: (chunk: string) => void
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      await aiService.streamChat(message, onChunk);
    } catch (err: any) {
      setError(err.message || '流式对话失败');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    sendMessage,
    startVoiceCall,
    endVoiceCall,
    streamChat,
  };
}
