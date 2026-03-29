import React, { useEffect, useRef } from 'react';
import styles from './MainView.module.css';
import type { ChatMessage } from '@/services/cognitiveApi';
import type { CognitiveState } from '@/services/cognitiveApi';

interface InteractionAreaProps {
  messages: ChatMessage[];
  inputValue: string;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
  onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  cognitiveState: CognitiveState | null;
}

const InteractionArea: React.FC<InteractionAreaProps> = ({
  messages,
  inputValue,
  onInputChange,
  onSendMessage,
  onKeyPress,
  cognitiveState
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className={styles.interactionArea}>
      <div className={styles.aiBehaviorStream}>
        <h3 className={styles.subPanelTitle}>
          <span className={styles.titleIcon}>⚙️</span>
          AI 行为流 AI Behavior Stream
        </h3>
        {cognitiveState && (
          <div className={styles.behaviorSteps}>
            {cognitiveState.llm.isCalling && (
              <div className={`${styles.behaviorStep} ${styles.stepActive}`}>
                <span className={styles.stepIcon}>🔄</span>
                <span className={styles.stepText}>正在调用 LLM...</span>
              </div>
            )}
            {cognitiveState.attention.newEventWeight > 0.7 && (
              <div className={`${styles.behaviorStep} ${styles.stepCompleted}`}>
                <span className={styles.stepIcon}>✅</span>
                <span className={styles.stepText}>重要性评估：{(cognitiveState.attention.newEventWeight * 100).toFixed(0)}%</span>
              </div>
            )}
            {cognitiveState.goals.length > 0 && (
              <div className={`${styles.behaviorStep} ${styles.stepCompleted}`}>
                <span className={styles.stepIcon}>🎯</span>
                <span className={styles.stepText}>目标激活：{cognitiveState.goals[0].name}</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className={styles.chatContainer}>
        <div className={styles.chatMessages} ref={scrollRef}>
          {messages.map((message, index) => (
            <div
              key={index}
              className={`${styles.message} ${message.role === 'user' ? styles.userMessage : styles.aiMessage}`}
            >
              <div className={styles.messageHeader}>
                <span className={styles.messageRole}>
                  {message.role === 'user' ? '👤 用户' : '🤖 AI'}
                </span>
                <span className={styles.messageTime}>{message.timestamp}</span>
              </div>
              <div className={styles.messageContent}>
                {message.content}
              </div>
              {message.processSteps && message.processSteps.length > 0 && (
                <div className={styles.aiProcess}>
                  {message.processSteps.map((step, stepIndex) => (
                    <div
                      key={stepIndex}
                      className={`${styles.processStep} ${step.completed ? styles.processStepCompleted : styles.processStepPending}`}
                    >
                      <span className={styles.processIcon}>{step.icon}</span>
                      <span className={styles.processText}>{step.text}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className={styles.inputArea}>
          <input
            type="text"
            className={styles.messageInput}
            placeholder="输入消息... (按 Enter 发送)"
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyPress={onKeyPress}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                onSendMessage();
              }
            }}
          />
          <button
            className={styles.sendButton}
            onClick={onSendMessage}
            disabled={!inputValue.trim()}
          >
            发送
          </button>
        </div>
      </div>
    </div>
  );
};

export default InteractionArea;
