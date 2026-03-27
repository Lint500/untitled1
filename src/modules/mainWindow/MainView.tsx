import React from 'react';
import Avatar from '@components/Avatar';
import { useAuth } from '@hooks/useAuth';
import styles from './MainView.module.css';

const MainView: React.FC = () => {
  const { isDeveloper, userRole } = useAuth();

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>欢迎使用 Electron + React 应用</h1>

      <Avatar size="large" />

      <p className={styles.subtitle}>点击头像打开功能菜单</p>

      <div className={styles.infoCard}>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>当前角色:</span>{' '}
          <span className={styles.infoValue}>{isDeveloper ? '开发者' : '普通用户'}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>角色类型:</span>{' '}
          <span className={styles.infoValue}>{userRole}</span>
        </div>
      </div>
    </div>
  );
};

export default MainView;
