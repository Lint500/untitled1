import React from 'react';
import styles from './MainView.module.css';

interface InterruptControlProps {
  onInterrupt: () => void;
  disabled: boolean;
}

const InterruptControl: React.FC<InterruptControlProps> = ({ onInterrupt, disabled }) => {
  return (
    <div className={styles.interruptControl}>
      <button
        className={`${styles.interruptButton} ${disabled ? styles.interruptDisabled : ''}`}
        onClick={onInterrupt}
        disabled={disabled}
      >
        <span className={styles.interruptIcon}>⛔</span>
        <span className={styles.interruptText}>打断 AI</span>
      </button>
      <div className={styles.interruptHint}>
        强制中断当前任务，发送高优先级事件
      </div>
    </div>
  );
};

export default InterruptControl;
