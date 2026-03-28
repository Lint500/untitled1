import React from 'react';
import Avatar from '@components/Avatar';
import { useCognitive } from '@/hooks/useCognitive';
import styles from './MainView.module.css';

const MainView: React.FC = () => {
  const {
    systemStatus,
    eventStream,
    memories,
    cognitiveState,
    messages,
    isLoading,
    sendMessage,
    updateAttentionLevel,
    deleteMemory
  } = useCognitive();

  // 注意力水平从认知状态获取
  const attentionLevel = cognitiveState?.attention.currentTaskWeight || 0.65;

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <div className={styles.loadingText}>加载认知系统...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* 顶部状态栏 - 系统级状态 */}
      <div className={styles.topBar}>
        <div className={styles.statusGroup}>
          <span className={styles.statusLabel}>AI 状态:</span>
          <span className={`${styles.statusValue} ${
            systemStatus?.aiState === 'THINKING' ? styles.statusThinking : 
            systemStatus?.aiState === 'RESPONDING' ? styles.statusResponding : ''
          }`}>
            {systemStatus?.aiState || 'IDLE'}
          </span>
        </div>
        <div className={styles.statusGroup}>
          <span className={styles.statusLabel}>当前目标:</span>
          <span className={styles.statusValue}>{systemStatus?.currentGoal || '-'}</span>
        </div>
        <div className={styles.statusGroup}>
          <span className={styles.statusLabel}>情绪值:</span>
          <span className={`${styles.statusValue} ${
            (systemStatus?.emotionValue || 0) > 0 ? styles.emotionPositive : 
            (systemStatus?.emotionValue || 0) < 0 ? styles.emotionNegative : ''
          }`}>
            {(systemStatus?.emotionValue || 0) > 0 ? '+' : ''}{systemStatus?.emotionValue || 0}
          </span>
        </div>
        <div className={styles.statusGroup}>
          <span className={styles.statusLabel}>注意力焦点:</span>
          <span className={styles.statusValue}>{systemStatus?.attentionFocus || '-'}</span>
        </div>
        <div className={styles.statusGroup}>
          <span className={styles.statusLabel}>LLM 状态:</span>
          <span className={styles.statusValue}>{systemStatus?.llmStatus || '-'}</span>
        </div>
        <Avatar size="small" />
      </div>

      {/* 主体内容区 */}
      <div className={styles.mainContent}>
        {/* 左侧边栏 */}
        <div className={styles.leftSidebar}>
          {/* 事件流 */}
          <div className={styles.eventStream}>
            <h3 className={styles.panelTitle}>事件流 Event Stream</h3>
            <div className={styles.eventList}>
              {eventStream.length === 0 ? (
                <div className={styles.emptyState}>暂无事件</div>
              ) : (
                eventStream.slice(0, 20).map((event, index) => (
                  <div key={index} className={styles.eventItem}>
                    <span className={styles.eventTime}>[{event.timestamp}]</span>
                    <span className={styles.eventText}>{event.message}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 记忆系统 */}
          <div className={styles.memorySystem}>
            <h3 className={styles.panelTitle}>记忆系统 Memory</h3>
            <div className={styles.memoryContent}>
              {memories.length === 0 ? (
                <div className={styles.emptyState}>暂无记忆</div>
              ) : (
                memories.slice(0, 10).map(memory => (
                  <div key={memory.id} className={styles.memoryItem}>
                    <span className={styles.memoryText}>{memory.content}</span>
                    <div className={styles.memoryActions}>
                      <button className={styles.memoryBtn}>详情</button>
                      <button 
                        className={styles.memoryBtn}
                        onClick={() => deleteMemory(memory.id)}
                      >
                        删除
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* 中间主交互区 */}
        <div className={styles.centerArea}>
          <div className={styles.chatContainer}>
            {/* 对话区域 */}
            <div className={styles.chatMessages}>
              {messages.map((message, index) => (
                <div 
                  key={index} 
                  className={message.role === 'user' ? styles.userMessage : styles.aiMessage}
                >
                  <div className={styles.messageHeader}>
                    <span className={styles.messageRole}>
                      {message.role === 'user' ? '用户' : 'AI'}
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
                          className={step.completed ? styles.processStepCompleted : styles.processStep}
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
            
            {/* 输入区域 */}
            <div className={styles.inputArea}>
              <input 
                type="text" 
                className={styles.messageInput}
                placeholder="输入消息..."
              />
              <button className={styles.sendButton} onClick={() => sendMessage('')} disabled>
                发送
              </button>
            </div>
          </div>
        </div>

        {/* 右侧认知状态面板 */}
        <div className={styles.cognitivePanel}>
          <h3 className={styles.panelTitle}>认知状态 Cognitive State</h3>
          
          {/* 4.1 Attention */}
          <div className={styles.cognitiveSection}>
            <h4 className={styles.sectionTitle}>Attention 注意力</h4>
            <div className={styles.stateRow}>
              <span className={styles.stateLabel}>当前任务权重:</span>
              <span className={styles.stateValue}>
                {cognitiveState?.attention.currentTaskWeight ? cognitiveState.attention.currentTaskWeight.toFixed(2) : '-'}
              </span>
            </div>
            <div className={styles.stateRow}>
              <span className={styles.stateLabel}>新事件权重:</span>
              <span className={styles.stateValue}>
                {cognitiveState?.attention.newEventWeight ? cognitiveState.attention.newEventWeight.toFixed(2) : '-'}
              </span>
            </div>
            <div className={styles.stateRow}>
              <span className={styles.stateLabel}>状态:</span>
              <span className={styles.stateTag}>
                {cognitiveState?.attention.status || '-'}
              </span>
            </div>
            <div className={styles.controlGroup}>
              <label className={styles.controlLabel}>专注度调节</label>
              <input 
                type="range" 
                min="0.3" 
                max="1.0" 
                step="0.1"
                value={attentionLevel}
                onChange={(e) => updateAttentionLevel(parseFloat(e.target.value))}
                className={styles.slider}
              />
              <div className={styles.sliderValue}>{attentionLevel.toFixed(1)}</div>
            </div>
          </div>

          {/* 4.2 Working Memory */}
          <div className={styles.cognitiveSection}>
            <h4 className={styles.sectionTitle}>Working Memory 工作记忆</h4>
            <div className={styles.stateRow}>
              <span className={styles.stateLabel}>当前目标:</span>
              <span className={styles.stateValue}>
                {cognitiveState?.workingMemory.currentGoal || '-'}
              </span>
            </div>
            <div className={styles.contextBox}>
              {cognitiveState?.workingMemory.context && cognitiveState.workingMemory.context.length > 0 ? (
                cognitiveState.workingMemory.context.map((item, index) => (
                  <div key={index} className={styles.contextItem}>• {item}</div>
                ))
              ) : (
                <div className={styles.emptyState}>无上下文信息</div>
              )}
            </div>
          </div>

          {/* 4.3 Goal System */}
          <div className={styles.cognitiveSection}>
            <h4 className={styles.sectionTitle}>Goal System 目标系统</h4>
            <div className={styles.goalList}>
              {cognitiveState?.goals && cognitiveState.goals.length > 0 ? (
                cognitiveState.goals.map((goal, index) => (
                  <div key={index} className={styles.goalItem}>
                    <span className={styles.goalName}>{goal.name}</span>
                    <span className={styles.goalWeight}>{goal.weight.toFixed(1)}</span>
                  </div>
                ))
              ) : (
                <div className={styles.emptyState}>无活跃目标</div>
              )}
            </div>
          </div>

          {/* 4.4 Emotion */}
          <div className={styles.cognitiveSection}>
            <h4 className={styles.sectionTitle}>Emotion 情绪</h4>
            <div className={styles.emotionDisplay}>
              <div className={styles.emotionValue}>
                {cognitiveState?.emotion.value !== undefined ? 
                  (cognitiveState.emotion.value > 0 ? '+' : '') + cognitiveState.emotion.value : '-'}
              </div>
              <div className={styles.emotionStatus}>
                {cognitiveState?.emotion.status || '-'}
              </div>
              <div className={styles.emotionImpact}>
                {cognitiveState?.emotion.impact || '-'}
              </div>
            </div>
          </div>

          {/* 4.5 LLM 状态 */}
          <div className={styles.cognitiveSection}>
            <h4 className={styles.sectionTitle}>LLM Status</h4>
            <div className={styles.stateRow}>
              <span className={styles.stateLabel}>是否调用:</span>
              <span className={styles.stateValue}>
                {cognitiveState?.llm.isCalling !== undefined ? (cognitiveState.llm.isCalling ? '是' : '否') : '-'}
              </span>
            </div>
            {cognitiveState?.llm.costTime !== undefined && cognitiveState.llm.costTime !== null && (
              <div className={styles.stateRow}>
                <span className={styles.stateLabel}>耗时:</span>
                <span className={styles.stateValue}>
                  {cognitiveState.llm.costTime.toFixed(1)}s
                </span>
              </div>
            )}
            {cognitiveState?.llm.reason && (
              <div className={styles.stateRow}>
                <span className={styles.stateLabel}>原因:</span>
                <span className={styles.stateValue}>
                  {cognitiveState.llm.reason}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainView;
