/**
 * 流式思考 WebSocket 客户端
 * 对应后端 modules/thinking/api_stream.py 的 /stream/ws/{session_id}
 */
import request from './request';
import { buildWsUrl } from './backendConfig';

const API_KEY = import.meta.env.VITE_API_KEY || '';

export interface StreamEvent {
  type: string;
  event: string;
  session_id: string;
  role: string;
  content: string;
  data: Record<string, any>;
  timestamp: number;
}

export interface StreamDebugEvent {
  direction: 'in' | 'out' | 'system' | 'error';
  timestamp: string;
  label: string;
  payload: any;
}

export type StreamHandler = (event: StreamEvent) => void;
export type DebugHandler = (event: StreamDebugEvent) => void;

export class StreamClient {
  private ws?: WebSocket;
  private sessionId = '';
  private handlers = new Set<StreamHandler>();
  private debugHandlers = new Set<DebugHandler>();
  private heartbeatTimer?: number;
  private reconnectAttempts = 0;
  private manuallyClosed = false;
  private lastWsUrl = '';
  private lastError = '';

  on(handler: StreamHandler): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  onDebug(handler: DebugHandler): () => void {
    this.debugHandlers.add(handler);
    return () => this.debugHandlers.delete(handler);
  }

  private emitDebug(direction: StreamDebugEvent['direction'], label: string, payload: any) {
    const item: StreamDebugEvent = {
      direction,
      label,
      payload,
      timestamp: new Date().toLocaleTimeString(),
    };
    this.debugHandlers.forEach((handler) => handler(item));
  }

  async connect(): Promise<void> {
    this.manuallyClosed = false;
    this.lastError = '';

    if (!this.sessionId) {
      this.emitDebug('system', 'POST /stream/session', { hasApiKey: Boolean(API_KEY) });
      const resp: any = await request.post(`/stream/session`);
      const sid = resp?.data?.session_id || resp?.session_id;
      if (!sid) {
        throw new Error('创建会话失败：返回体无 session_id');
      }
      this.sessionId = sid;
      this.emitDebug('system', 'session_created', { session_id: sid });
    }

    const keyParam = API_KEY ? `?api_key=${encodeURIComponent(API_KEY)}` : '';
    const fullUrl = `${buildWsUrl(`/stream/ws/${this.sessionId}`)}${keyParam}`;
    this.lastWsUrl = fullUrl.replace(/api_key=[^&]+/, 'api_key=***');
    this.emitDebug('system', 'WS connecting', { url: this.lastWsUrl, hasApiKey: Boolean(API_KEY) });

    await new Promise<void>((resolve, reject) => {
      const ws = new WebSocket(fullUrl);
      const onOpen = () => {
        ws.removeEventListener('error', onError);
        this.ws = ws;
        this.reconnectAttempts = 0;
        this.startHeartbeat();
        this.bindMessageHandlers();
        this.emitDebug('system', 'WS open', { session_id: this.sessionId });
        resolve();
      };
      const onError = () => {
        ws.removeEventListener('open', onOpen);
        this.lastError = 'WebSocket 连接失败';
        this.emitDebug('error', 'WS error', { url: this.lastWsUrl });
        reject(new Error('WebSocket 连接失败'));
      };
      ws.addEventListener('open', onOpen, { once: true });
      ws.addEventListener('error', onError, { once: true });
    });
  }

  private bindMessageHandlers() {
    if (!this.ws) return;
    this.ws.addEventListener('message', (e) => {
      try {
        const evt: StreamEvent = JSON.parse(e.data);
        this.emitDebug('in', `${evt.type}/${evt.event}`, evt);
        this.handlers.forEach((handler) => handler(evt));
      } catch (err) {
        this.lastError = '事件解析失败';
        this.emitDebug('error', 'parse_error', { raw: e.data, error: String(err) });
        console.error('[StreamClient] 事件解析失败', err);
      }
    });
    this.ws.addEventListener('close', (event) => {
      this.stopHeartbeat();
      this.ws = undefined;
      this.emitDebug('system', 'WS close', { code: event.code, reason: event.reason });
      if (!this.manuallyClosed) this.tryReconnect();
    });
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatTimer = window.setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        const payload = { type: 'ping' };
        this.emitDebug('out', 'ping', payload);
        this.ws.send(JSON.stringify(payload));
      }
    }, 20000);
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = undefined;
    }
  }

  private async tryReconnect() {
    if (this.reconnectAttempts >= 5) {
      this.lastError = 'WebSocket 重连超过 5 次，已放弃';
      this.emitDebug('error', 'reconnect_give_up', { attempts: this.reconnectAttempts });
      console.warn('[StreamClient] 重连超过 5 次，放弃');
      return;
    }
    this.reconnectAttempts += 1;
    const delay = Math.min(1000 * 2 ** this.reconnectAttempts, 30000);
    this.emitDebug('system', 'WS reconnect_scheduled', { delay, attempt: this.reconnectAttempts });
    setTimeout(() => {
      if (!this.manuallyClosed) {
        this.connect().catch((err) => {
          this.lastError = err?.message || 'WebSocket 重连失败';
          this.emitDebug('error', 'reconnect_failed', { error: this.lastError });
        });
      }
    }, delay);
  }

  sendInput(content: string): boolean {
    if (this.ws?.readyState !== WebSocket.OPEN) {
      this.lastError = 'WebSocket 未打开，无法发送 input';
      this.emitDebug('error', 'send_failed', { reason: this.lastError, content });
      return false;
    }
    const payload = { type: 'input', content };
    this.emitDebug('out', 'input', payload);
    this.ws.send(JSON.stringify(payload));
    return true;
  }

  sendStop(): boolean {
    if (this.ws?.readyState !== WebSocket.OPEN) return false;
    const payload = { type: 'stop' };
    this.emitDebug('out', 'stop', payload);
    this.ws.send(JSON.stringify(payload));
    return true;
  }

  close() {
    this.manuallyClosed = true;
    this.stopHeartbeat();
    this.ws?.close();
    this.ws = undefined;
    this.sessionId = '';
    this.emitDebug('system', 'client_closed', {});
  }

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  get currentSessionId(): string {
    return this.sessionId;
  }

  get debugState() {
    return {
      connected: this.isConnected,
      sessionId: this.sessionId,
      wsUrl: this.lastWsUrl,
      lastError: this.lastError,
      hasApiKey: Boolean(API_KEY),
      reconnectAttempts: this.reconnectAttempts,
    };
  }
}

export const streamClient = new StreamClient();
