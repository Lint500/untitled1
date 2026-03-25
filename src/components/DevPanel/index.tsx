import React from 'react';
import styles from './DevPanel.module.css';

interface DevPanelProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const DevPanel: React.FC<DevPanelProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.devPanel}>
      <div className={styles.devPanelHeader}>
        <h3 className={styles.devPanelTitle}>开发者面板</h3>
        <button className={styles.closeButton} onClick={onClose}>
          ×
        </button>
      </div>
      <div className={styles.devPanelContent}>
        {children}
      </div>
    </div>
  );
};

export default DevPanel;
