import React, { useState } from 'react';
import styles from './MainView.module.css';
import EventStreamPanel from './EventStreamPanel';
import CognitiveStatePanel from './CognitiveStatePanel';
import MemoryPanel from './MemoryPanel';
import InteractionArea from './InteractionArea';
import TopStatusBar from './TopStatusBar';
import InterruptControl from './InterruptControl';
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
  const [isInterrupted, setIsInterrupted] = useState(false);

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

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInterrupt = async () => {
    setIsInterrupted(true);
    await sendMessage('[SYSTEM_INTERRUPT] 用户强制中断当前任务');
    setTimeout(() => setIsInterrupted(false), 2000);
  };

  return (
    <div className={styles.consoleContainer}>
      <TopStatusBar
        systemStatus={systemStatus}
        isInterrupted={isInterrupted}
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
          onKeyPress={handleKeyPress}
          cognitiveState={cognitiveState}
        />

        <CognitiveStatePanel
          cognitiveState={cognitiveState}
          attentionLevel={cognitiveState?.attention.currentTaskWeight || 0.65}
          onUpdateAttention={updateAttentionLevel}
        />
      </div>

      <InterruptControl
        onInterrupt={handleInterrupt}
        disabled={isInterrupted}
      />
    </div>
  );
};

export default CognitiveConsole;
