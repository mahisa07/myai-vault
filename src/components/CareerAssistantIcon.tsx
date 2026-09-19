import React from 'react';

export interface CareerAssistantIconProps {
  className?: string;
  size?: number | string;
  style?: React.CSSProperties;
}

/**
 * CareerAssistantIcon — Custom Inline SVG Icon for MyAI Vault Career Assistant
 * Represents:
 * 1. Document / Card Container (#0F4C4C)
 * 2. Integrated Chat / Speech Bubble (#6F8F72)
 * 3. Verified Document Check / Evidence Mark (#FFFFFF)
 * 4. AI Constellation Node detail (#F7F3EA)
 */
export const CareerAssistantIcon: React.FC<CareerAssistantIconProps> = ({
  className = 'w-5 h-5',
  size,
  style,
}) => {
  const customStyle = typeof size === 'number' ? { width: size, height: size, ...style } : style;

  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={customStyle}
    >
      {/* 1. Base Document / Card Body */}
      <rect
        x="4"
        y="4"
        width="20"
        height="22"
        rx="3.5"
        fill="#0F4C4C"
      />

      {/* Document Fold Accent Line */}
      <path
        d="M17 4V9.5H24"
        fill="#6F8F72"
        fillOpacity="0.4"
        stroke="#F7F3EA"
        strokeWidth="0.8"
        strokeLinejoin="round"
      />

      {/* Document Text Lines */}
      <line x1="8" y1="9" x2="14" y2="9" stroke="#F7F3EA" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.8" />
      <line x1="8" y1="12" x2="16" y2="16" stroke="#F7F3EA" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.6" />
      <line x1="8" y1="15" x2="13" y2="15" stroke="#F7F3EA" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.4" />

      {/* 2. Integrated Chat / Speech Bubble Overlay */}
      <path
        d="M14 15C14 12.7909 15.7909 11 18 11H25C27.2091 11 29 12.7909 29 15V20C29 22.2091 27.2091 24 25 24H21L17 27.5V24H18C15.7909 24 14 22.2091 14 20V15Z"
        fill="#6F8F72"
        stroke="#FFFFFF"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />

      {/* 3. Verification Checkmark inside Chat Bubble */}
      <path
        d="M18.5 17.5L20.5 19.5L24.5 15.5"
        stroke="#FFFFFF"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* 4. AI Constellation Intelligence Node Dots & Connecting Line */}
      <line x1="8" y1="20" x2="11" y2="22" stroke="#6F8F72" strokeWidth="1" strokeDasharray="1 1" />
      <circle cx="8" cy="20" r="1.2" fill="#6F8F72" />
      <circle cx="11" cy="22" r="1.2" fill="#F7F3EA" />
    </svg>
  );
};

export default CareerAssistantIcon;
