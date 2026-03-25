import React, { useState } from 'react';
import ParamEditor from './ParamEditor';
import PluginManager from './PluginManager';
import UserManage from './UserManage';
import styles from './index.module.css';

const AdminSystem: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'params' | 'plugins' | 'users'>('params');

  return (
    <div className={styles.adminSystem}>
      <h1 className={styles.adminTitle}>管理系统</h1>
      
      <div className={styles.tabList}>
        <button
          className={`${styles.tabButton} ${activeTab === 'params' ? styles.active : ''}`}
          onClick={() => setActiveTab('params')}
        >
          参数编辑
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'plugins' ? styles.active : ''}`}
          onClick={() => setActiveTab('plugins')}
        >
          插件管理
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'users' ? styles.active : ''}`}
          onClick={() => setActiveTab('users')}
        >
          用户管理
        </button>
      </div>

      <div className={styles.tabContent}>
        {activeTab === 'params' && <ParamEditor />}
        {activeTab === 'plugins' && <PluginManager />}
        {activeTab === 'users' && <UserManage />}
      </div>
    </div>
  );
};

export default AdminSystem;
