import React from 'react';
import styles from './LogicView.module.css';

const LogicView: React.FC = () => {
  return (
    <div className={styles.logicContainer}>
      <div className={styles.statusTitle}>应用运行状态</div>
      
      <div className={styles.statusSection}>
        <div className={styles.statusLabel}>主进程状态</div>
        <div className={`${styles.statusText} ${styles.statusSuccess}`}>✓ 运行中</div>
      </div>

      <div className={styles.statusSection}>
        <div className={styles.statusLabel}>渲染进程状态</div>
        <div className={`${styles.statusText} ${styles.statusSuccess}`}>✓ 运行中</div>
      </div>

      <div className={styles.statusSection}>
        <div className={styles.statusLabel}>IPC 通信</div>
        <div className={`${styles.statusText} ${styles.statusSuccess}`}>✓ 正常</div>
      </div>

      <div className={styles.statusSection}>
        <div className={styles.statusLabel}>权限验证</div>
        <div className={`${styles.statusText} ${styles.statusSuccess}`}>✓ 已验证</div>
      </div>

      <div className={styles.statusSection}>
        <div className={styles.statusLabel}>服务状态</div>
        <div className={`${styles.statusText} ${styles.statusSuccess}`}>所有服务正常</div>
      </div>
    </div>
  );
};

export default LogicView;
