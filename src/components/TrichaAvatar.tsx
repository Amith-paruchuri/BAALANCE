import React from 'react';

interface TrichaAvatarProps {
  size?: number;
  className?: string;
  /** Gentle idle motion (a blink and a sway of the curl). Off for small inline avatars. */
  animated?: boolean;
}

/**
 * Tricha, the BAALANCE coach. "Tricha" comes from the Greek for hair, so her
 * hair is the feature: a terracotta wave ending in one curl, like the strand
 * in the logo. Drawn as SVG so it stays sharp at any size.
 */
export const TrichaAvatar: React.FC<TrichaAvatarProps> = ({ size = 40, className = '', animated = false }) => (
  <svg
    viewBox="0 0 96 96"
    width={size}
    height={size}
    className={`shrink-0 ${className}`}
    role="img"
    aria-label="Tricha, the BAALANCE AI coach"
  >
    <defs>
      <linearGradient id="trichaBg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#16636E" />
        <stop offset="100%" stopColor="#09373E" />
      </linearGradient>
      <linearGradient id="trichaHair" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#D08A68" />
        <stop offset="100%" stopColor="#A9573A" />
      </linearGradient>
      <clipPath id="trichaClip">
        <circle cx="48" cy="48" r="48" />
      </clipPath>
    </defs>

    <g clipPath="url(#trichaClip)">
      <rect width="96" height="96" fill="url(#trichaBg)" />
      {/* soft ring, like a stress gauge behind her */}
      <circle cx="48" cy="50" r="38" fill="none" stroke="#FFFFFF" strokeOpacity="0.08" strokeWidth="6" />

      {/* shoulders */}
      <path d="M14 100 C16 78 32 72 48 72 C64 72 80 78 82 100 Z" fill="#F6F2EC" />
      <path d="M40 72 C42 79 54 79 56 72 L56 66 L40 66 Z" fill="#EBCBB6" />

      {/* hair behind the face */}
      <path d="M21 56 C17 30 32 14 50 14 C68 14 80 28 76 52 C75 62 72 70 68 74 L28 74 C24 70 22 64 21 56 Z" fill="url(#trichaHair)" />

      {/* face */}
      <ellipse cx="48" cy="50" rx="19" ry="21" fill="#F6DDCB" />

      {/* fringe sweeping across the forehead */}
      <path d="M27 46 C28 30 40 24 52 25 C62 26 69 33 70 44 C63 37 54 34 46 36 C38 38 32 42 27 46 Z" fill="url(#trichaHair)" />

      {/* the curl: one strand lifting off, as in the logo */}
      <g>
        <path d="M66 22 C76 16 86 22 84 32 C83 38 76 40 73 35 C71 31 75 28 78 30" fill="none" stroke="#D08A68" strokeWidth="4" strokeLinecap="round" />
        {animated && (
          <animateTransform attributeName="transform" type="rotate" values="0 68 26; 5 68 26; 0 68 26" dur="4.5s" repeatCount="indefinite" />
        )}
      </g>

      {/* eyes */}
      <g fill="#2B1F1A">
        <ellipse cx="40.5" cy="51" rx="2.6" ry="3.2">
          {animated && <animate attributeName="ry" values="3.2;3.2;0.4;3.2;3.2" keyTimes="0;0.46;0.5;0.54;1" dur="5s" repeatCount="indefinite" />}
        </ellipse>
        <ellipse cx="55.5" cy="51" rx="2.6" ry="3.2">
          {animated && <animate attributeName="ry" values="3.2;3.2;0.4;3.2;3.2" keyTimes="0;0.46;0.5;0.54;1" dur="5s" repeatCount="indefinite" />}
        </ellipse>
      </g>
      <circle cx="41.4" cy="50" r="0.9" fill="#FFFFFF" />
      <circle cx="56.4" cy="50" r="0.9" fill="#FFFFFF" />

      {/* cheeks and smile */}
      <circle cx="35.5" cy="58" r="3.6" fill="#E9A48C" opacity="0.55" />
      <circle cx="60.5" cy="58" r="3.6" fill="#E9A48C" opacity="0.55" />
      <path d="M41 60.5 Q48 67 55 60.5" fill="none" stroke="#2B1F1A" strokeWidth="2.4" strokeLinecap="round" />

      {/* a spark: she is an AI */}
      <path d="M17 22 L19.2 28.8 L26 31 L19.2 33.2 L17 40 L14.8 33.2 L8 31 L14.8 28.8 Z" fill="#F6B73C" />
    </g>
  </svg>
);
