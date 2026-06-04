import React, { useState } from 'react';
import styles from './MainView.module.css';
import EventStreamPanel from './EventStreamPanel';
import CognitiveStatePanel from './CognitiveStatePanel';
import MemoryPanel from './MemoryPanel';
import InteractionArea from './InteractionArea';
import TopStatusBar from './TopStatusBar';
import SystemMonitor from './SystemMonitor';
import DeveloperPanel from '../devPanel';
import FeaturePopup from '../featurePopup';
import { useCognitive } from '@/hooks/useCognitive';

type CenterTab = 'chat' | 'monitor';
type DevTab = 'console' | 'network' | 'ws' | 'state' | 'memory';

const stringifyCompact = (value: any, max = 220): string => {
  if (value === undefined || value === null) return '';
  const text = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
  return text.length > max ? `${text.slice(0, max)}...` : text;
};

const CognitiveConsole: React.FC = () => {
  const {
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
    sendMessage,
    updateAttentionLevel,
    deleteMemory,
  } = useCognitive();

  const [inputValue, setInputValue] = useState('');
  const [isInterrupted, setIsInterrupted] = useState(false);
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [showMonitor, setShowMonitor] = useState(false);
  const [centerTab, setCenterTab] = useState<CenterTab>('chat');
  const [devTab, setDevTab] = useState<DevTab>('console');

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <div className={styles.loadingText}>初始化认知系统...</div>
      </div>
    );
  }

  const handleSendMessage = async () => {
    const content = inputValue.trim();
    if (!content || isSending) return;
    setInputValue('');
    setCenterTab('chat');
    await sendMessage(content);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInterrupt = async () => {
    setIsInterrupted(true);
    await sendMessage('[SYSTEM_INTERRUPT] 用户强制中断当前任务');
    setTimeout(() => setIsInterrupted(false), 2000);
  };

  const renderDevTools = () => (
    <div className={styles.devtoolsShell}>
      <div className={styles.devtoolsToolbar}>
        {([
          ['console', 'Console'],
          ['network', 'Network'],
          ['ws', 'WS'],
          ['state', 'State'],
          ['memory', 'Memory'],
        ] as Array<[DevTab, string]>).map(([key, label]) => (
          <button
            key={key}
            className={`${styles.devtoolsTab} ${devTab === key ? styles.devtoolsTabActive : ''}`}
            onClick={() => setDevTab(key)}
          >
            {label}
          </button>
        ))}
        <div className={styles.devtoolsSpacer} />
        <span className={streamDebugState.connected ? styles.devtoolsOnline : styles.devtoolsOffline}>
          {streamDebugState.connected ? '● WS Connected' : '● WS Disconnected'}
        </span>
        <button className={styles.devtoolsAction} onClick={() => setShowMonitor(true)}>System Monitor</button>
        <button className={styles.devtoolsAction} onClick={handleInterrupt} disabled={!isSending}>Stop</button>
      </div>

      <div className={styles.devtoolsStatusBar}>
        <span>AI: {systemStatus?.aiState || 'UNKNOWN'}</span>
        <span>LLM: {systemStatus?.llmStatus || '未知'}</span>
        <span>Messages: {messages.length}</span>
        <span>Session: {streamDebugState.sessionId || '-'}</span>
        <span>API Key: {streamDebugState.hasApiKey ? 'loaded' : 'missing'}</span>
        {streamDebugState.lastError && <span className={styles.devtoolsErrorText}>Error: {streamDebugState.lastError}</span>}
      </div>

      <div className={styles.devtoolsContent}>
        {devTab === 'console' && (
          <div className={styles.consoleLogList}>
            {eventStream.length === 0 && streamDebugEvents.length === 0 ? (
              <div className={styles.devtoolsEmpty}>暂无日志。发送一条消息后，这里会显示 HTTP/WS/后端事件。</div>
            ) : (
              <>
                {eventStream.slice(-50).map((ev, idx) => (
                  <div key={`log-${idx}`} className={`${styles.consoleLogRow} ${styles[`log_${ev.level || 'info'}`] || ''}`}>
                    <span className={styles.consoleTime}>{ev.timestamp}</span>
                    <span className={styles.consoleLevel}>{ev.level || 'info'}</span>
                    <span className={styles.consoleMessage}>[{ev.type}] {ev.message}</span>
                  </div>
                ))}
                {streamDebugEvents.slice(-80).map((ev, idx) => (
                  <div key={`debug-${idx}`} className={`${styles.consoleLogRow} ${ev.direction === 'error' ? styles.log_error : ''}`}>
                    <span className={styles.consoleTime}>{ev.timestamp}</span>
                    <span className={styles.consoleLevel}>{ev.direction}</span>
                    <span className={styles.consoleMessage}>{ev.label} {stringifyCompact(ev.payload, 260)}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {devTab === 'network' && (
          <div className={styles.networkTable}>
            <div className={styles.networkHeader}>
              <span>Method</span><span>Path</span><span>Status</span><span>说明</span>
            </div>
            <div className={styles.networkRow}><span>POST</span><span>/api/stream/session</span><span>{streamDebugState.sessionId ? '200' : 'pending / 401?'}</span><span>创建流式会话，需 X-API-Key</span></div>
            <div className={styles.networkRow}><span>WS</span><span>/ws/stream/ws/{'{session_id}'}</span><span>{streamDebugState.connected ? '101' : 'closed'}</span><span>浏览器 WebSocket，key 走 query</span></div>
            <div className={styles.networkRow}><span>GET</span><span>/api/management/dashboard</span><span>{systemStatus ? '200' : 'failed'}</span><span>系统状态</span></div>
            <div className={styles.networkRow}><span>GET</span><span>/api/management/monitor/logs</span><span>{eventStream.length ? '200' : 'empty'}</span><span>后端日志</span></div>
            <div className={styles.networkHint}>如果第一行是 401，说明前端 dev server 没加载 VITE_API_KEY：重启前端即可。</div>
          </div>
        )}

        {devTab === 'ws' && (
          <div className={styles.wsPanel}>
            <div className={styles.wsMetaGrid}>
              <div><b>Connected</b><span>{String(streamDebugState.connected)}</span></div>
              <div><b>Session</b><span>{streamDebugState.sessionId || '-'}</span></div>
              <div><b>Reconnects</b><span>{streamDebugState.reconnectAttempts}</span></div>
              <div><b>URL</b><span>{streamDebugState.wsUrl || '-'}</span></div>
            </div>
            <div className={styles.wsFrames}>
              {streamDebugEvents.slice(-120).map((ev, idx) => (
                <details key={idx} className={`${styles.wsFrame} ${styles[`ws_${ev.direction}`] || ''}`}>
                  <summary><span>{ev.timestamp}</span><b>{ev.direction.toUpperCase()}</b><em>{ev.label}</em></summary>
                  <pre>{stringifyCompact(ev.payload, 2000)}</pre>
                </details>
              ))}
            </div>
          </div>
        )}

        {devTab === 'state' && (
          <div className={styles.stateInspector}>
            <div className={styles.stateCard}><h4>SystemStatus</h4><pre>{stringifyCompact(systemStatus, 4000)}</pre></div>
            <div className={styles.stateCard}><h4>CognitiveState</h4><pre>{stringifyCompact(cognitiveState, 4000)}</pre></div>
            <div className={styles.stateCard}><h4>StreamDebugState</h4><pre>{stringifyCompact(streamDebugState, 4000)}</pre></div>
          </div>
        )}

        {devTab === 'memory' && (
          <div className={styles.memoryInspector}>
            {memories.length === 0 ? <div className={styles.devtoolsEmpty}>暂无记忆</div> : memories.map((mem) => (
              <div key={mem.id} className={styles.memoryInspectItem}>
                <div><b>{mem.id}</b><span>{mem.createdAt}</span></div>
                <p>{mem.content}</p>
                <button onClick={() => deleteMemory(mem.id)}>Delete</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className={styles.consoleContainer}>
      <TopStatusBar systemStatus={systemStatus} isInterrupted={isInterrupted} onOpenMonitor={() => setShowMonitor(true)} />

      <div className={styles.mainContent}>
        <button className={`${styles.toggleButton} ${styles.toggleLeft}`} onClick={() => setShowLeftPanel(!showLeftPanel)} title={showLeftPanel ? '隐藏左侧面板' : '显示左侧面板'}>
          {showLeftPanel ? '◀' : '▶'}
        </button>

        {showLeftPanel && (
          <div className={styles.leftSidebar}>
            <EventStreamPanel events={eventStream} />
            <MemoryPanel memories={memories} onDeleteMemory={deleteMemory} />
          </div>
        )}

        <div className={styles.centerArea}>
          <div className={styles.centerTabBar}>
            <button className={`${styles.centerTabBtn} ${centerTab === 'chat' ? styles.centerTabActive : ''}`} onClick={() => setCenterTab('chat')}>
              💬 对话 {isSending && centerTab !== 'chat' && <span className={styles.tabBadge}>●</span>}
            </button>
            <button className={`${styles.centerTabBtn} ${centerTab === 'monitor' ? styles.centerTabActive : ''}`} onClick={() => setCenterTab('monitor')}>
              🛠 DevTools {streamDebugState.lastError && <span className={styles.tabBadge}>!</span>}
            </button>
          </div>

          {centerTab === 'chat' && (
            <InteractionArea
              messages={messages}
              inputValue={inputValue}
              isLoading={isSending}
              thinkingSteps={thinkingSteps}
              onInputChange={setInputValue}
              onSendMessage={handleSendMessage}
              onKeyPress={handleKeyPress}
              cognitiveState={cognitiveState}
            />
          )}

          {centerTab === 'monitor' && renderDevTools()}
        </div>

        <button className={`${styles.toggleButton} ${styles.toggleRight}`} onClick={() => setShowRightPanel(!showRightPanel)} title={showRightPanel ? '隐藏右侧面板' : '显示右侧面板'}>
          {showRightPanel ? '▶' : '◀'}
        </button>

        {showRightPanel && (
          <div className={styles.rightSidebar}>
            <CognitiveStatePanel
              cognitiveState={cognitiveState}
              attentionLevel={cognitiveState?.attention?.currentTaskWeight || 0.65}
              onUpdateAttention={updateAttentionLevel}
            />
          </div>
        )}
      </div>

      <div className={styles.robotAvatarContainer}><FeaturePopup /></div>
      <DeveloperPanel />
      <SystemMonitor isOpen={showMonitor} onClose={() => setShowMonitor(false)} />
    </div>
  );
};

export default CognitiveConsole;
