import React from 'react';
import styles from './MainView.module.css';
import type { MemoryItem } from '@/services/cognitiveApi';

interface MemoryPanelProps {
  memories: MemoryItem[];
  onDeleteMemory: (id: string) => Promise<void>;
}

const MemoryPanel: React.FC<MemoryPanelProps> = ({ memories, onDeleteMemory }) => {
  return (
    <div className={styles.memoryPanel}>
      <h3 className={styles.panelTitle}>
        <span className={styles.titleIcon}>💾</span>
        记忆系统 Memory
      </h3>
      <div className={styles.memoryContent}>
        {memories.length === 0 ? (
          <div className={styles.emptyState}>暂无记忆</div>
        ) : (
          memories.slice(0, 10).map(memory => (
            <div key={memory.id} className={styles.memoryItem}>
              <div className={styles.memoryHeader}>
                <span className={styles.memoryImportance}>
                  [{(memory.importance || 0).toFixed(2)}]
                </span>
                <span className={styles.memoryDate}>{memory.createdAt}</span>
              </div>
              <span className={styles.memoryText}>{memory.content}</span>
              <div className={styles.memoryActions}>
                <button className={styles.memoryBtn}>详情</button>
                <button
                  className={`${styles.memoryBtn} ${styles.memoryBtnDanger}`}
                  onClick={() => onDeleteMemory(memory.id)}
                >
                  删除
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MemoryPanel;
