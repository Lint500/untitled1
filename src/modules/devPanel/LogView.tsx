import React from 'react';
import { LogEntry } from '@store';
import styles from './LogView.module.css';

interface LogViewProps {
  logs: LogEntry[];
}

const LogView: React.FC<LogViewProps> = ({ logs }) => {
  const getLogLevelClass = (level: string) => {
    return `${styles.logLevel} ${styles[level.toLowerCase()]}`;
  };

  return (
    <div className={styles.logContainer}>
      {logs.length === 0 ? (
        <p className={styles.emptyLogs}>暂无日志</p>
      ) : (
        logs.map((log, index) => (
          <div key={index} className={styles.logEntry}>
            <span className={styles.logTimestamp}>
              {new Date(log.timestamp).toLocaleTimeString()}
            </span>{' '}
            <span className={getLogLevelClass(log.level)}>
              {log.level.toUpperCase()}
            </span>{' '}
            <span className={styles.logMessage}>{log.message}</span>
            {log.data && (
              <pre className={styles.logData}>
                {JSON.stringify(log.data, null, 2)}
              </pre>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default LogView;
