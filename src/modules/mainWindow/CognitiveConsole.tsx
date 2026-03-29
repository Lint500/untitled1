import React, { useState } from 'react';
import styles from './MainView.module.css';
import EventStreamPanel from './EventStreamPanel';
import CognitiveStatePanel from './CognitiveStatePanel';
import MemoryPanel from './MemoryPanel';
import InteractionArea from './InteractionArea';
import TopStatusBar from './TopStatusBar';
import { useCognitive } from '@/hooks/useCognitive';

const CognitiveConsole: React.FC = () => {
  const {
    systemStatus,
    eventStream,
    memories,
    cognitiveState,
    messages,
    isLoading,
    sendMessage,
    updateAttentionLevel,
    deleteMemory
  } = useCognitive();

  const [inputValue, setInputValue] = useState('');

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <div className={styles.loadingText}>初始化认知系统...</div>
      </div>
    );
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    await sendMessage(inputValue);
    setInputValue('');
  };

  return (
    <div className={styles.consoleContainer}>
      <TopStatusBar
        systemStatus={systemStatus}
        isInterrupted={false}
      />

      <div className={styles.mainContent}>
        <div className={styles.leftSidebar}>
          <EventStreamPanel events={eventStream} />
          <MemoryPanel
            memories={memories}
            onDeleteMemory={deleteMemory}
          />
        </div>

        <InteractionArea
          messages={messages}
          inputValue={inputValue}
          onInputChange={setInputValue}
          onSendMessage={handleSendMessage}
          cognitiveState={cognitiveState}
        />

        <CognitiveStatePanel
          cognitiveState={cognitiveState}
          attentionLevel={cognitiveState?.attention.currentTaskWeight || 0.65}
          onUpdateAttention={updateAttentionLevel}
        />
      </div>
    </div>
  );
};

export default CognitiveConsole;
