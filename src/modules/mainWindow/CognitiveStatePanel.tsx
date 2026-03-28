import React from 'react';
import styles from './MainView.module.css';
import type { CognitiveState } from '@/services/cognitiveApi';

interface CognitiveStatePanelProps {
  cognitiveState: CognitiveState | null;
  attentionLevel: number;
  onUpdateAttention: (level: number) => Promise<void>;
}

const CognitiveStatePanel: React.FC<CognitiveStatePanelProps> = ({
  cognitiveState,
  attentionLevel,
  onUpdateAttention
}) => {
  return (
    <div className={styles.cognitivePanel}>
      <h3 className={styles.panelTitle}>
        <span className={styles.titleIcon}>🧠</span>
        认知状态 Cognitive State
      </h3>

      <div className={styles.cognitiveSection}>
        <h4 className={styles.sectionTitle}>Attention 注意力</h4>
        <div className={styles.stateRow}>
          <span className={styles.stateLabel}>当前任务权重:</span>
          <span className={styles.stateValueHighlight}>
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
          <span className={`${styles.stateTag} ${styles.tagWarning}`}>
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
            onChange={(e) => onUpdateAttention(parseFloat(e.target.value))}
            className={styles.slider}
          />
          <div className={styles.sliderValue}>{attentionLevel.toFixed(1)}</div>
        </div>
      </div>

      <div className={styles.cognitiveSection}>
        <h4 className={styles.sectionTitle}>Working Memory 工作记忆</h4>
        <div className={styles.stateRow}>
          <span className={styles.stateLabel}>当前目标:</span>
          <span className={styles.stateValueGoal}>
            {cognitiveState?.workingMemory.currentGoal || '-'}
          </span>
        </div>
        <div className={styles.contextBox}>
          {cognitiveState?.workingMemory.context && cognitiveState.workingMemory.context.length > 0 ? (
            cognitiveState.workingMemory.context.map((item, index) => (
              <div key={index} className={styles.contextItem}>• {item}</div>
            ))
          ) : (
            <div className={styles.emptyStateSmall}>无上下文信息</div>
          )}
        </div>
      </div>

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
            <div className={styles.emptyStateSmall}>无活跃目标</div>
          )}
        </div>
      </div>

      <div className={styles.cognitiveSection}>
        <h4 className={styles.sectionTitle}>Emotion 情绪</h4>
        <div className={styles.emotionDisplay}>
          <div className={`${styles.emotionValue} ${
            (cognitiveState?.emotion.value || 0) > 0 ? styles.emotionPositive : 
            (cognitiveState?.emotion.value || 0) < 0 ? styles.emotionNegative : ''
          }`}>
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

      <div className={styles.cognitiveSection}>
        <h4 className={styles.sectionTitle}>LLM Status</h4>
        <div className={styles.stateRow}>
          <span className={styles.stateLabel}>是否调用:</span>
          <span className={styles.stateValueBool}>
            {cognitiveState?.llm.isCalling !== undefined ? (cognitiveState.llm.isCalling ? 'YES' : 'NO') : '-'}
          </span>
        </div>
        {cognitiveState?.llm.costTime !== undefined && cognitiveState.llm.costTime !== null && (
          <div className={styles.stateRow}>
            <span className={styles.stateLabel}>耗时:</span>
            <span className={styles.stateValueTime}>
              {cognitiveState.llm.costTime.toFixed(1)}s
            </span>
          </div>
        )}
        {cognitiveState?.llm.reason && (
          <div className={styles.stateRow}>
            <span className={styles.stateLabel}>原因:</span>
            <span className={styles.stateValueReason}>
              {cognitiveState.llm.reason}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CognitiveStatePanel;
