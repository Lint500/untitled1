import React, { useState } from 'react';
import DevPanel from '../../components/DevPanel';
import { devStore } from '../../store';
import LogView from './LogView';
import LogicView from './LogicView';
import Monitor from './Monitor';
import AdminSystem from '../adminSystem';
import FeaturePopup from '../featurePopup';
import styles from './index.module.css';

const DeveloperPanel: React.FC = () => {
  const { isPanelOpen, setIsPanelOpen, logs } = devStore();
  const [activeTab, setActiveTab] = useState<'dev' | 'admin' | 'plugins' | 'monitor'>('dev');
  const [showAvatarPopup, setShowAvatarPopup] = useState(false);

  const handleOpenAdminPanel = () => {
    setActiveTab('admin');
  };

  const handleOpenPluginSystem = () => {
    setActiveTab('plugins');
  };

  const handleOpenAvatarPopup = () => {
    setShowAvatarPopup(true);
  };

  const handleCloseAvatarPopup = () => {
    setShowAvatarPopup(false);
  };

  const renderDevPanel = () => (
    <div className={styles.devPanel}>
      <div className={styles.devPanelHeader}>
        <h2 className={styles.devPanelTitle}>开发者面板</h2>
        <div className={styles.quickActions}>
          <button className={styles.actionButton} onClick={handleOpenAdminPanel}>
            管理系统
          </button>
          <button className={styles.actionButton} onClick={handleOpenPluginSystem}>
            插件系统
          </button>
          <button className={styles.actionButton} onClick={handleOpenAvatarPopup}>
            头像悬浮窗
          </button>
        </div>
      </div>

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
      </div>
    </div>
  );

  const renderAdminPanel = () => (
    <div className={styles.adminPanelWrapper}>
      <div className={styles.adminPanelHeader}>
        <button className={styles.backButton} onClick={() => setActiveTab('dev')}>
          ← 返回
        </button>
        <h2 className={styles.adminPanelTitle}>管理系统</h2>
      </div>
      <AdminSystem />
    </div>
  );

  const renderPluginPanel = () => (
    <div className={styles.pluginPanelWrapper}>
      <div className={styles.pluginPanelHeader}>
        <button className={styles.backButton} onClick={() => setActiveTab('dev')}>
          ← 返回
        </button>
        <h2 className={styles.pluginPanelTitle}>插件管理</h2>
      </div>
      <AdminSystem />
    </div>
  );

  const renderMonitorPanel = () => (
    <div className={styles.monitorPanelWrapper}>
      <div className={styles.monitorPanelHeader}>
        <button className={styles.backButton} onClick={() => setActiveTab('dev')}>
          ← 返回
        </button>
        <h2 className={styles.monitorPanelTitle}>系统监控面板</h2>
      </div>
      <Monitor />
    </div>
  );

  const renderAvatarPopup = () => (
    <div className={styles.avatarPopupWrapper}>
      <div className={styles.avatarPopupHeader}>
        <button className={styles.backButton} onClick={handleCloseAvatarPopup}>
          ← 关闭悬浮窗
        </button>
        <h2 className={styles.avatarPopupTitle}>机器人助手</h2>
      </div>
      <FeaturePopup />
    </div>
  );

  return (
    <DevPanel isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)}>
      <div className={styles.container}>
        <div className={styles.tabList}>
          <button
            className={`${styles.tabButton} ${activeTab === 'dev' ? styles.active : ''}`}
            onClick={() => setActiveTab('dev')}
          >
            开发者工具
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === 'admin' ? styles.active : ''}`}
            onClick={() => setActiveTab('admin')}
          >
            管理系统
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === 'plugins' ? styles.active : ''}`}
            onClick={() => setActiveTab('plugins')}
          >
            插件管理
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === 'monitor' ? styles.active : ''}`}
            onClick={() => setActiveTab('monitor')}
          >
            系统监控
          </button>
        </div>

        <div className={styles.tabContent}>
          {activeTab === 'dev' && renderDevPanel()}
          {activeTab === 'admin' && renderAdminPanel()}
          {activeTab === 'plugins' && renderPluginPanel()}
          {activeTab === 'monitor' && renderMonitorPanel()}
        </div>
      </div>

      {showAvatarPopup && (
        <div className={styles.avatarPopupOverlay} onClick={handleCloseAvatarPopup}>
          <div className={styles.avatarPopupContent} onClick={(e) => e.stopPropagation()}>
            <FeaturePopup onClose={handleCloseAvatarPopup} />
          </div>
        </div>
      )}
    </DevPanel>
  );
};

export default DeveloperPanel;
