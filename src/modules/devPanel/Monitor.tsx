import React, { useEffect, useState } from 'react';
import { devStore } from '@store';
import styles from './Monitor.module.css';

const Monitor: React.FC = () => {
  const { performanceData, setPerformanceData } = devStore();
  const [cpu, setCpu] = useState(0);
  const [memory, setMemory] = useState(0);

  useEffect(() => {
    // 模拟性能数据更新
    const interval = setInterval(() => {
      const newCpu = Math.floor(Math.random() * 100);
      const newMemory = Math.floor(Math.random() * 100);
      
      setCpu(newCpu);
      setMemory(newMemory);
      setPerformanceData({ cpu: newCpu, memory: newMemory, fps: 60 });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const getProgressClass = (value: number) => {
    if (value > 80) return styles.high;
    if (value > 50) return styles.medium;
    return styles.low;
  };

  return (
    <div className={styles.monitorContainer}>
      <div className={styles.metricSection}>
        <div className={styles.metricLabel}>CPU 使用率</div>
        <div className={styles.progressBar}>
          <div 
            className={`${styles.progressFill} ${getProgressClass(cpu)}`}
            style={{ width: `${cpu}%` }}
          />
        </div>
        <div className={styles.metricValue}>{cpu}%</div>
      </div>

      <div className={styles.metricSection}>
        <div className={styles.metricLabel}>内存使用率</div>
        <div className={styles.progressBar}>
          <div 
            className={`${styles.progressFill} ${getProgressClass(memory)}`}
            style={{ width: `${memory}%` }}
          />
        </div>
        <div className={styles.metricValue}>{memory}%</div>
      </div>

      <div className={styles.metricSection}>
        <div className={styles.metricLabel}>FPS</div>
        <div className={styles.fpsValue}>
          {performanceData?.fps || 60}
        </div>
      </div>
    </div>
  );
};

export default Monitor;
