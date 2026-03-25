import React from 'react';
import DevPanel from '@components/DevPanel';
import { devStore } from '@store';
import LogView from './LogView';
import LogicView from './LogicView';
import Monitor from './Monitor';
import styles from './index.module.css';

const DeveloperPanel: React.FC = () => {
  const { isPanelOpen, setIsPanelOpen, logs } = devStore();

  return (
    <DevPanel isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)}>
      <div className={styles.devPanel}>
        <div className={styles.devPanelGrid}>
          <div className={styles.devPanelSection}>
            <div className={styles.devPanelSectionHeader}>
              <h3 className={styles.devPanelSectionTitle}>日志查看</h3>
            </div>
            <div className={styles.devPanelSectionContent}>
              <LogView logs={logs} />
            </div>
          </div>
          
          <div className={styles.devPanelSection}>
            <div className={styles.devPanelSectionHeader}>
              <h3 className={styles.devPanelSectionTitle}>运行逻辑</h3>
            </div>
            <div className={styles.devPanelSectionContent}>
              <LogicView />
            </div>
          </div>
          
          <div className={styles.devPanelSection}>
            <div className={styles.devPanelSectionHeader}>
              <h3 className={styles.devPanelSectionTitle}>性能监控</h3>
            </div>
            <div className={styles.devPanelSectionContent}>
              <Monitor />
            </div>
          </div>
        </div>
      </div>
    </DevPanel>
  );
};

export default DeveloperPanel;
