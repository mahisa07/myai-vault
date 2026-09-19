import React from 'react';
import { MyAIVaultLogoIcon, MyAIVaultLogo, MyAIVaultLogoProps } from './MyAIVaultLogo';

export { MyAIVaultLogoIcon, MyAIVaultLogo };

export interface VaultLogoIconProps {
  className?: string;
  strokeWidth?: number;
  size?: number | string;
}

/**
 * Backwards compatible export for VaultLogoIcon
 * Uses the new scalable inline SVG logo component
 */
export const VaultLogoIcon: React.FC<VaultLogoIconProps> = ({
  className = 'w-5 h-5',
  size,
}) => {
  return <MyAIVaultLogoIcon className={className} size={size} />;
};

export interface VaultBrandHeaderProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  subtitleText?: string;
  className?: string;
}

/**
 * Backwards compatible export for VaultBrandHeader
 * Displays the new MyAI Vault SVG Logo with colored wordmark & subtitle
 */
export const VaultBrandHeader: React.FC<VaultBrandHeaderProps> = ({
  size = 'md',
  showSubtitle = true,
  subtitleText = 'Digital Identity System',
  className = '',
}) => {
  return (
    <MyAIVaultLogo
      size={size}
      showSubtitle={showSubtitle}
      subtitleText={subtitleText}
      className={className}
    />
  );
};

export default MyAIVaultLogo;
