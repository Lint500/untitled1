import React from 'react';
import styles from './MainView.module.css';
import type { SystemStatus } from '../../services/cognitiveApi';
import { devStore } from '../../store';

interface TopStatusBarProps {
  systemStatus: SystemStatus | null;
  isInterrupted: boolean;
  onOpenMonitor: () => void;
}

const TopStatusBar: React.FC<TopStatusBarProps> = ({ systemStatus, isInterrupted, onOpenMonitor }) => {
  const getStatusClass = (state: string) => {
    switch (state) {
      case 'THINKING':
        return styles.statusThinking;
      case 'RESPONDING':
        return styles.statusResponding;
      default:
        return '';
    }
  };

  const getEmotionClass = (value: number) => {
    if (value > 0) return styles.emotionPositive;
    if (value < 0) return styles.emotionNegative;
    return '';
  };

  const handleOpenSettings = () => {
    devStore.getState().setIsPanelOpen(true);
  };

  return (
    <div className={styles.topBar}>
      <div className={styles.statusGroup}>
        <span className={styles.statusLabel}>AI 状态:</span>
        <span className={`${styles.statusValue} ${getStatusClass(systemStatus?.aiState || '')}`}>
          {isInterrupted ? 'INTERRUPTED' : systemStatus?.aiState || 'IDLE'}
        </span>
      </div>

      <div className={styles.statusSeparator}>|</div>

      <div className={styles.statusGroup}>
        <span className={styles.statusLabel}>当前目标:</span>
        <span className={styles.statusValueGoal}>{systemStatus?.currentGoal || '-'}</span>
      </div>

      <div className={styles.statusSeparator}>|</div>

      <div className={styles.statusGroup}>
        <span className={styles.statusLabel}>情绪值:</span>
        <span className={`${styles.statusValue} ${getEmotionClass(systemStatus?.emotionValue || 0)}`}>
          {(systemStatus?.emotionValue || 0) > 0 ? '+' : ''}{systemStatus?.emotionValue || 0}
        </span>
      </div>

      <div className={styles.statusSeparator}>|</div>

      <div className={styles.statusGroup}>
        <span className={styles.statusLabel}>注意力焦点:</span>
        <span className={styles.statusValue}>{systemStatus?.attentionFocus || '-'}</span>
      </div>

      <div className={styles.statusSeparator}>|</div>

      <div className={styles.statusGroup}>
        <span className={styles.statusLabel}>LLM 状态:</span>
        <span className={styles.statusValue}>{systemStatus?.llmStatus || '-'}</span>
      </div>

      <div className={styles.statusSeparator}>|</div>

      <button
        className={styles.monitorButton}
        onClick={onOpenMonitor}
        title="打开系统监控面板"
      >
        📊 监控
      </button>

      <div className={styles.statusSeparator}>|</div>

      <button
        className={styles.settingsButton}
        onClick={handleOpenSettings}
        title="打开设置面板"
      >
        ⚙️ 设置
      </button>

      <div className={styles.statusSpacer} />

      <div className={styles.systemIndicator}>
        <div className={styles.indicatorDot}></div>
        <span className={styles.indicatorText}>SYSTEM ONLINE</span>
      </div>
    </div>
  );
};

export default TopStatusBar;
