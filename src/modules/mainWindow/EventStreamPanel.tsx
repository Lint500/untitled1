import React, { useEffect, useRef } from 'react';
import styles from './MainView.module.css';
import type { EventStreamItem } from '@/services/cognitiveApi';

interface EventStreamPanelProps {
  events: EventStreamItem[];
}

const EventStreamPanel: React.FC<EventStreamPanelProps> = ({ events }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events]);

  const getLevelClass = (level?: string) => {
    switch (level) {
      case 'error':
        return styles.eventError;
      case 'warn':
        return styles.eventWarn;
      case 'debug':
        return styles.eventDebug;
      default:
        return styles.eventInfo;
    }
  };

  return (
    <div className={styles.eventStreamPanel}>
      <h3 className={styles.panelTitle}>
        <span className={styles.titleIcon}>⚡</span>
        事件流 Event Stream
      </h3>
      <div className={styles.eventList} ref={scrollRef}>
        {events.length === 0 ? (
          <div className={styles.emptyState}>等待事件...</div>
        ) : (
          events.slice(0, 50).map((event, index) => (
            <div
              key={index}
              className={`${styles.eventItem} ${getLevelClass(event.level)}`}
            >
              <span className={styles.eventTime}>{event.timestamp}</span>
              <span className={styles.eventText}>{event.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EventStreamPanel;
