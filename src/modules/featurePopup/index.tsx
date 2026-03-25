import React, { useState } from 'react';
import FeatureMenu from './FeatureMenu';
import styles from './index.module.css';

const FeaturePopup: React.FC = () => {
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);

  return (
    <div className={styles.container}>
      {!selectedFeature ? (
        <FeatureMenu onSelectFeature={setSelectedFeature} />
      ) : (
        <div>
          <button
            className={styles.backButton}
            onClick={() => setSelectedFeature(null)}
          >
            ← 返回
          </button>
          <div className={styles.featureContent}>
            {selectedFeature === 'chat' && <div>对话功能模块</div>}
            {selectedFeature === 'voice' && <div>语音通话模块</div>}
            {selectedFeature === 'plugin' && <div>插件管理模块</div>}
            {selectedFeature === 'settings' && <div>设置模块</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default FeaturePopup;
