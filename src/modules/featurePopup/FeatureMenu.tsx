import React from 'react';
import styles from './FeatureMenu.module.css';

interface FeatureMenuProps {
  onSelectFeature: (feature: string) => void;
}

const FeatureMenu: React.FC<FeatureMenuProps> = ({ onSelectFeature }) => {
  const features = [
    { id: 'chat', name: '对话', icon: '💬' },
    { id: 'voice', name: '语音通话', icon: '🎤' },
    { id: 'plugin', name: '插件管理', icon: '🔌' },
    { id: 'settings', name: '设置', icon: '⚙️' },
  ];

  return (
    <div className={styles.menu}>
      <h2 className={styles.menuTitle}>功能菜单</h2>
      <div className={styles.featureList}>
        {features.map((feature) => (
          <button
            key={feature.id}
            className={styles.featureButton}
            onClick={() => onSelectFeature(feature.id)}
          >
            <span className={styles.featureIcon}>{feature.icon}</span>
            <span className={styles.featureName}>{feature.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default FeatureMenu;
