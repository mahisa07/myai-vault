import React from 'react';

export interface MyAIVaultLogoProps {
  /** Size of the logo icon in pixels or Tailwind classes */
  size?: number | string;
  /** Additional CSS classes for the container */
  className?: string;
  /** Whether to show only the icon without wordmark text */
  iconOnly?: boolean;
  /** Whether to show the subtitle "DIGITAL IDENTITY SYSTEM" */
  showSubtitle?: boolean;
  /** Custom subtitle text if needed */
  subtitleText?: string;
  /** Direction layout: 'horizontal' or 'vertical' */
  layout?: 'horizontal' | 'vertical';
}

/**
 * Standalone SVG Icon for MyAI Vault
 * Represents:
 * 1. Modern Digital Vault / Folder Container (#0F4C4C)
 * 2. Document / Certificate with folded corner (#FFFFFF)
 * 3. Central Protection Lock / Security Shield Plate
 * 4. AI Connected Neural Nodes & Constellation Lines (#6F8F72)
 * 5. Digital Identity Sweeping Ribbon Arc (#6F8F72)
 */
export const MyAIVaultLogoIcon: React.FC<{
  className?: string;
  size?: number | string;
}> = ({ className = 'w-6 h-6', size }) => {
  const style = typeof size === 'number' ? { width: size, height: size } : undefined;

  return (
    <svg
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      {/* 1. Identity Orbital Ribbon (Sweeping Outer Arc) */}
      <path
        d="M3 24C4.8 30.5 15 33.5 26.5 31C32 29.8 34.5 26.5 33.5 22.5"
        stroke="#6F8F72"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeDasharray="28 2"
        opacity="0.85"
      />

      {/* 2. Outer Digital Vault / Folder Container Plate */}
      <rect
        x="5"
        y="7"
        width="26"
        height="23"
        rx="4.5"
        fill="#0F4C4C"
      />

      {/* 3. Embedded Vault Inner Shadow / Accent Line */}
      <rect
        x="6.5"
        y="8.5"
        width="23"
        height="20"
        rx="3.5"
        stroke="#6F8F72"
        strokeWidth="0.8"
        strokeOpacity="0.4"
      />

      {/* 4. Document / Page Emerging inside the Vault */}
      <path
        d="M11.5 4H20.5L25.5 9V24.5C25.5 25.6046 24.6046 26.5 23.5 26.5H11.5C10.3954 26.5 9.5 25.6046 9.5 24.5V6C9.5 4.89543 10.3954 4 11.5 4Z"
        fill="#FFFFFF"
        stroke="#0F4C4C"
        strokeWidth="1.2"
      />

      {/* 5. Document Folded Corner */}
      <path
        d="M20.5 4V9H25.5"
        fill="#F7F3EA"
        stroke="#0F4C4C"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />

      {/* Document Detail Content Lines */}
      <line x1="12.5" y1="11" x2="17.5" y2="11" stroke="#0F4C4C" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.4" />
      <line x1="12.5" y1="13.5" x2="16.5" y2="13.5" stroke="#0F4C4C" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.3" />

      {/* 6. AI Neural Network Nodes & Constellation Lines */}
      <line x1="12.5" y1="7.5" x2="16.5" y2="6" stroke="#6F8F72" strokeWidth="1" />
      <line x1="16.5" y1="6" x2="22.5" y2="7.5" stroke="#6F8F72" strokeWidth="1" />
      <circle cx="12.5" cy="7.5" r="1.3" fill="#6F8F72" />
      <circle cx="16.5" cy="6" r="1.5" fill="#0F4C4C" stroke="#FFFFFF" strokeWidth="0.8" />
      <circle cx="22.5" cy="7.5" r="1.3" fill="#6F8F72" />

      {/* 7. Central Protection Lock Shackle & Shield Body */}
      <path
        d="M14.5 16.5V14.5C14.5 12.8431 15.8431 11.5 17.5 11.5C19.1569 11.5 20.5 12.8431 20.5 14.5V16.5"
        stroke="#0F4C4C"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      />

      {/* Shield Lock Plate Body */}
      <path
        d="M13 16.5H22C22.5523 16.5 23 16.9477 23 17.5V20.5C23 22.5 17.5 24.5 17.5 24.5C17.5 24.5 12 22.5 12 20.5V17.5C12 16.9477 12.4477 16.5 13 16.5Z"
        fill="#0F4C4C"
      />

      {/* Lock Keyhole Center Dot */}
      <circle cx="17.5" cy="19.5" r="1" fill="#F7F3EA" />
      <path d="M17.5 20.5V22" stroke="#F7F3EA" strokeWidth="1" strokeLinecap="round" />

      {/* Security Sparkle Accents */}
      <circle cx="7" cy="13" r="1" fill="#6F8F72" />
      <circle cx="29" cy="22" r="1" fill="#6F8F72" />
    </svg>
  );
};

/**
 * Reusable Full MyAI Vault Branding Logo Component
 * Renders SVG Icon + Wordmark Text + Subtitle
 */
export const MyAIVaultLogo: React.FC<MyAIVaultLogoProps> = ({
  size = 'md',
  className = '',
  iconOnly = false,
  showSubtitle = true,
  subtitleText = 'DIGITAL IDENTITY SYSTEM',
  layout = 'horizontal',
}) => {
  const iconContainerSizes = {
    sm: 'w-8 h-8 rounded-lg',
    md: 'w-10 h-10 rounded-xl',
    lg: 'w-12 h-12 rounded-2xl',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
  };

  const titleSizes = {
    sm: 'text-sm sm:text-base',
    md: 'text-lg sm:text-xl',
    lg: 'text-2xl sm:text-3xl',
  };

  const subtitleSizes = {
    sm: 'text-[9px]',
    md: 'text-[10px]',
    lg: 'text-xs',
  };

  const currentSizeKey = typeof size === 'string' && size in iconContainerSizes ? (size as 'sm' | 'md' | 'lg') : 'md';

  if (iconOnly) {
    return (
      <div
        className={`${iconContainerSizes[currentSizeKey]} bg-[#0F4C4C] text-white flex items-center justify-center shadow-md shrink-0 ${className}`}
      >
        <MyAIVaultLogoIcon className={iconSizes[currentSizeKey]} />
      </div>
    );
  }

  return (
    <div
      className={`flex ${
        layout === 'vertical' ? 'flex-col items-center text-center space-y-2' : 'items-center space-x-3'
      } ${className}`}
    >
      <div
        className={`${iconContainerSizes[currentSizeKey]} bg-[#0F4C4C] text-white flex items-center justify-center shadow-md shrink-0 transition-transform group-hover:scale-105`}
      >
        <MyAIVaultLogoIcon className={iconSizes[currentSizeKey]} />
      </div>

      <div>
        <div className={`${titleSizes[currentSizeKey]} font-extrabold tracking-tight leading-none`}>
          <span className="text-[#0F4C4C]">MyAI</span>{' '}
          <span className="text-[#2F3437]">Vault</span>
        </div>

        {showSubtitle && (
          <span
            className={`block ${subtitleSizes[currentSizeKey]} text-[#6F8F72] font-mono tracking-wider uppercase font-semibold mt-0.5`}
          >
            {subtitleText}
          </span>
        )}
      </div>
    </div>
  );
};

export default MyAIVaultLogo;
