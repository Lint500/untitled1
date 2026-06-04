import React, { useState, useRef } from 'react';
import styles from './index.module.css';
import AdminSystem from '../adminSystem';
import { sendMessage as sendAiMessage } from '../../services/cognitiveApi';

interface FeaturePopupProps {
  onClose?: () => void;
}

const FeaturePopup: React.FC<FeaturePopupProps> = ({ onClose }) => {
  const [showChat, setShowChat] = useState(false);
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([
    { role: 'ai', content: '你好！我是你的智能助手，有什么可以帮你的吗？' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);

  // 拖拽相关状态
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const popupRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (popupRef.current) {
      setIsDragging(true);
      const rect = popupRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  const handleSendMessage = async () => {
    const content = inputValue.trim();
    if (!content || isSending) return;

    setInputValue('');
    setIsSending(true);
    setMessages(prev => [...prev, { role: 'user', content }]);

    try {
      const reply = await sendAiMessage(content);
      setMessages(prev => [...prev, {
        role: 'ai',
        content: reply.content || '后端已完成处理，但没有返回可展示内容。'
      }]);
    } catch (error: any) {
      setMessages(prev => [...prev, {
        role: 'ai',
        content: `⚠️ ${error?.message || 'AI 调用失败，请检查后端服务、API Key 或模型配置。'}`
      }]);
    } finally {
      setIsSending(false);
    }
  };

  const handleOpenSettings = () => {
    setActivePanel('settings');
  };

  const handleOpenPlugins = () => {
    setActivePanel('plugins');
  };

  const handleOpenAdmin = () => {
    setActivePanel('admin');
  };

  const handleBack = () => {
    setActivePanel(null);
  };

  if (activePanel) {
    return (
      <div className={styles.popupContainer} ref={popupRef}>
        <div className={styles.panelHeader}>
          <button className={styles.backButton} onClick={handleBack}>
            ← 返回
          </button>
          <h3 className={styles.panelTitle}>
            {activePanel === 'settings' && '系统设置'}
            {activePanel === 'plugins' && '插件管理'}
            {activePanel === 'admin' && '管理系统'}
          </h3>
        </div>
        <div className={styles.panelContent}>
          {activePanel === 'admin' ? (
            <AdminSystem />
          ) : (
            <div className={styles.placeholderPanel}>
              {activePanel === 'settings' && '🔧 设置面板'}
              {activePanel === 'plugins' && '🧩 插件系统'}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${styles.popupContainer} ${isDragging ? styles.dragging : ''}`}
      ref={popupRef}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
      }}
    >
      {/* 机器人头像 - 可拖拽 */}
      <div
        className={styles.robotAvatar}
        onMouseDown={handleMouseDown}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <div className={styles.avatarCircle}>
          <span className={styles.avatarIcon}>🤖</span>
        </div>
        <div className={styles.statusDot}></div>
      </div>

      {/* 快捷操作按钮 */}
      <div className={styles.quickActions}>
        <button
          className={styles.actionButton}
          onClick={() => setShowChat(!showChat)}
          title="对话"
        >
          💬
        </button>
        <button
          className={styles.actionButton}
          onClick={handleOpenSettings}
          title="设置"
        >
          ⚙️
        </button>
        <button
          className={styles.actionButton}
          onClick={handleOpenPlugins}
          title="插件"
        >
          🧩
        </button>
        <button
          className={styles.actionButton}
          onClick={handleOpenAdmin}
          title="管理"
        >
          👨‍
        </button>
      </div>

      {/* 简易对话框 */}
      {showChat && (
        <div className={styles.chatBox}>
          <div className={styles.chatHeader}>
            <span>智能助手</span>
            <button
              className={styles.closeChatButton}
              onClick={() => setShowChat(false)}
            >
              ✕
            </button>
          </div>

          <div className={styles.chatMessages}>
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`${styles.message} ${msg.role === 'user' ? styles.messageUser : styles.messageAI}`}
              >
                <div className={styles.messageBubble}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isSending && (
              <div className={`${styles.message} ${styles.messageAI}`}>
                <div className={styles.messageBubble}>
                  正在连接大模型，请稍候...
                </div>
              </div>
            )}
          </div>

          <div className={styles.chatInput}>
            <input
              type="text"
              className={styles.inputField}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={isSending ? '等待回复中...' : '输入消息...'}
              disabled={isSending}
            />
            <button className={styles.sendButton} onClick={handleSendMessage} disabled={isSending}>
              {isSending ? '发送中' : '发送'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeaturePopup;
