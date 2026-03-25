import React from 'react';
import { useIpc } from '@hooks/useIpc';
import styles from './Avatar.module.css';

interface AvatarProps {
  onClick?: () => void;
  size?: 'small' | 'medium' | 'large' | number;
}

const Avatar: React.FC<AvatarProps> = ({ onClick, size = 'medium' }) => {
  const { createPopup } = useIpc();

  const handleClick = async () => {
    await createPopup();
    onClick?.();
  };

  const getSizeValue = () => {
    if (typeof size === 'number') {
      return { '--avatar-size': `${size}px` } as React.CSSProperties;
    }
    return {};
  };

  return (
    <div
      className={`${styles.avatar} ${typeof size === 'string' ? styles[size] : ''}`}
      onClick={handleClick}
      style={getSizeValue()}
    >
      <span className={styles.avatarIcon}>👤</span>
    </div>
  );
};

export default Avatar;
