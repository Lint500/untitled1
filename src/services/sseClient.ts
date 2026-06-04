/**
 * SSE 流式客户端
 * 对应后端 modules/thinking/api_stream.py 的 GET /stream/sse/{session_id}
 *
 * 浏览器 EventSource 不能设置 header，鉴权统一走 ?api_key=xxx
 */
import { buildApiUrl } from './backendConfig';

const API_KEY = import.meta.env.VITE_API_KEY || '';

export interface SSEHandlers {
  onMessage?: (data: any, eventName: string) => void;
  onError?: (err: Event) => void;
  onOpen?: () => void;
}

/**
 * 打开 SSE 流。返回一个 close 函数。
 *
 * @example
 *   const close = openSSE(sessionId, '你好', {
 *     onMessage: (data, evt) => console.log(evt, data),
 *     onError: (e) => console.error(e),
 *   });
 *   // ... 完成后
 *   close();
 */
export function openSSE(
  sessionId: string,
  question: string,
  handlers: SSEHandlers,
): () => void {
  const params = new URLSearchParams({ question });
  if (API_KEY) params.set('api_key', API_KEY);

  const es = new EventSource(`${buildApiUrl(`/stream/sse/${sessionId}`)}?${params}`);

  if (handlers.onOpen) es.addEventListener('open', handlers.onOpen);

  es.addEventListener('message', (e) => {
    try {
      handlers.onMessage?.(JSON.parse(e.data), 'message');
    } catch {
      handlers.onMessage?.(e.data, 'message');
    }
  });

  // 后端会用 event: <name> 区分事件类型，统一转发
  ['thinking', 'message', 'done', 'error', 'ack'].forEach((evtName) => {
    es.addEventListener(evtName, (e: MessageEvent) => {
      try {
        handlers.onMessage?.(JSON.parse(e.data), evtName);
      } catch {
        handlers.onMessage?.(e.data, evtName);
      }
    });
  });

  es.addEventListener('error', (e) => {
    handlers.onError?.(e);
  });

  return () => es.close();
}
