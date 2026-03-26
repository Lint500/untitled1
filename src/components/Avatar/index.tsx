import React from 'react';
import { useIpc } from '@hooks/useIpc';
import logo192 from '@/assets/images/logo192.png';
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
      <img src={logo192} alt="Avatar" className={styles.avatarIcon} />
    </div>
  );
};

export default Avatar;
