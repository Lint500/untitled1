import React, { useEffect, useRef } from 'react';

interface ProcessStep {
  icon: string;
  text: string;
  completed: boolean;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  processSteps?: ProcessStep[];
  isThinking?: boolean;
}

interface InteractionAreaProps {
  messages: ChatMessage[];
  inputValue: string;
  isLoading?: boolean;
  thinkingSteps?: string[];
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  cognitiveState?: any;
}

const InteractionArea: React.FC<InteractionAreaProps> = ({
  messages,
  inputValue,
  isLoading,
  thinkingSteps = [],
  onInputChange,
  onSendMessage,
  onKeyPress,
  cognitiveState,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, thinkingSteps, isLoading]);

  return (
    <div style={styles.container}>
      {/* 消息列表 */}
      <div style={styles.messageList}>
        {messages.length === 0 && !isLoading ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>🧠</div>
            <div style={styles.emptyTitle}>类人大模型已就绪</div>
            <div style={styles.emptySubtitle}>开始对话，感受真实的思考过程</div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <div key={msg.id} style={msg.role === 'user' ? styles.userBubbleWrap : styles.aiBubbleWrap}>
                {msg.role !== 'user' && (
                  <div style={styles.avatar}>🤖</div>
                )}
                <div style={msg.role === 'user' ? styles.userBubble : styles.aiBubble}>
                  {/* 思考步骤折叠展示 */}
                  {msg.processSteps && msg.processSteps.length > 0 && (
                    <details style={styles.thinkDetails}>
                      <summary style={styles.thinkSummary}>
                        💭 思考过程（{msg.processSteps.length} 步）
                      </summary>
                      <div style={styles.thinkSteps}>
                        {msg.processSteps.map((step, i) => (
                          <div key={i} style={styles.thinkStep}>
                            <span style={styles.thinkStepIcon}>{step.icon}</span>
                            <span style={styles.thinkStepText}>{step.text}</span>
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                  <div style={styles.messageText}>{msg.content}</div>
                  <div style={styles.timestamp}>{msg.timestamp}</div>
                </div>
                {msg.role === 'user' && (
                  <div style={styles.avatar}>👤</div>
                )}
              </div>
            ))}

            {/* 实时思考流 */}
            {isLoading && (
              <div style={styles.aiBubbleWrap}>
                <div style={styles.avatar}>🤖</div>
                <div style={styles.aiBubble}>
                  {thinkingSteps.length > 0 ? (
                    <div style={styles.liveThinking}>
                      <div style={styles.thinkingLabel}>💭 正在思考...</div>
                      {thinkingSteps.slice(-3).map((step, i) => (
                        <div key={i} style={styles.liveStep}>{step}</div>
                      ))}
                    </div>
                  ) : (
                    <div style={styles.typingDots}>
                      <span />
                      <span />
                      <span />
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      {/* 输入框区域 */}
      <div style={styles.inputWrapper}>
        {cognitiveState?.emotion && (
          <div style={styles.emotionBar}>
            当前情绪：{cognitiveState.emotion.status === 'positive' ? '😊 积极' : cognitiveState.emotion.status === 'negative' ? '😟 消极' : '😐 中性'}
            &nbsp;|&nbsp;注意力焦点：{cognitiveState.workingMemory?.currentGoal || '待机'}
          </div>
        )}
        <div style={styles.inputRow}>
          <textarea
            style={styles.textarea}
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={onKeyPress as any}
            placeholder="和 AI 说话... (Enter 发送，Shift+Enter 换行)"
            rows={3}
            disabled={isLoading}
          />
          <button
            style={isLoading ? { ...styles.sendBtn, ...styles.sendBtnDisabled } : styles.sendBtn}
            onClick={onSendMessage}
            disabled={isLoading || !inputValue.trim()}
          >
            {isLoading ? '思考中...' : '发送'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes blink {
          0%, 80%, 100% { opacity: 0; }
          40% { opacity: 1; }
        }
        details > summary { cursor: pointer; }
        details[open] > summary { margin-bottom: 8px; }
      `}</style>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    background: '#0d1117',
    color: '#e6edf3',
    fontFamily: '"Segoe UI", system-ui, sans-serif',
  },
  messageList: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    gap: '12px',
    opacity: 0.5,
  },
  emptyIcon: { fontSize: '48px' },
  emptyTitle: { fontSize: '18px', fontWeight: 600, color: '#7c8db5' },
  emptySubtitle: { fontSize: '13px', color: '#4d5d7a' },
  userBubbleWrap: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    gap: '8px',
  },
  aiBubbleWrap: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    gap: '8px',
  },
  avatar: {
    fontSize: '24px',
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  userBubble: {
    maxWidth: '65%',
    background: 'linear-gradient(135deg, #1f6feb, #388bfd)',
    borderRadius: '18px 18px 4px 18px',
    padding: '10px 14px',
    boxShadow: '0 2px 8px rgba(31,111,235,0.3)',
  },
  aiBubble: {
    maxWidth: '72%',
    background: '#161b22',
    border: '1px solid #30363d',
    borderRadius: '18px 18px 18px 4px',
    padding: '10px 14px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
  },
  messageText: {
    fontSize: '14px',
    lineHeight: '1.6',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  timestamp: {
    fontSize: '11px',
    opacity: 0.5,
    marginTop: '4px',
    textAlign: 'right',
  },
  thinkDetails: {
    marginBottom: '8px',
    fontSize: '12px',
  },
  thinkSummary: {
    color: '#7c8db5',
    fontSize: '12px',
    listStyle: 'none',
  },
  thinkSteps: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    paddingLeft: '8px',
    borderLeft: '2px solid #30363d',
    marginTop: '6px',
  },
  thinkStep: {
    display: 'flex',
    gap: '6px',
    alignItems: 'flex-start',
  },
  thinkStepIcon: { flexShrink: 0 },
  thinkStepText: {
    color: '#7c8db5',
    fontSize: '12px',
    lineHeight: '1.4',
  },
  liveThinking: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  thinkingLabel: {
    fontSize: '12px',
    color: '#7c8db5',
    marginBottom: '4px',
  },
  liveStep: {
    fontSize: '12px',
    color: '#4d5d7a',
    lineHeight: '1.4',
    maxWidth: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  typingDots: {
    display: 'flex',
    gap: '4px',
    padding: '4px 0',
  },
  inputWrapper: {
    borderTop: '1px solid #21262d',
    padding: '12px 16px',
    background: '#0d1117',
    flexShrink: 0,
  },
  emotionBar: {
    fontSize: '11px',
    color: '#4d5d7a',
    marginBottom: '8px',
    padding: '4px 8px',
    background: '#161b22',
    borderRadius: '4px',
    border: '1px solid #21262d',
  },
  inputRow: {
    display: 'flex',
    gap: '10px',
    alignItems: 'flex-end',
  },
  textarea: {
    flex: 1,
    background: '#161b22',
    border: '1px solid #30363d',
    borderRadius: '10px',
    color: '#e6edf3',
    fontSize: '14px',
    padding: '10px 14px',
    resize: 'none',
    outline: 'none',
    lineHeight: '1.5',
    fontFamily: 'inherit',
    transition: 'border-color 0.2s',
  },
  sendBtn: {
    background: 'linear-gradient(135deg, #1f6feb, #388bfd)',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'opacity 0.2s',
    flexShrink: 0,
    height: '42px',
  },
  sendBtnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
    background: '#21262d',
  },
};

export default InteractionArea;
