'use client';

import React, { useState } from 'react';

interface BaalanceLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  animated?: boolean;
  className?: string;
  onClick?: () => void;
}

export const BaalanceLogo: React.FC<BaalanceLogoProps> = ({
  size = 'md',
  showTagline = true,
  animated = true,
  className = '',
  onClick,
}) => {
  const [animationKey, setAnimationKey] = useState(0);

  const triggerAnimation = () => {
    setAnimationKey(prev => prev + 1);
  };

  // Dimensions based on size
  const scale =
    size === 'sm' ? 0.6 : size === 'md' ? 0.85 : size === 'lg' ? 1.15 : 1.45;

  return (
    <div
      onClick={() => {
        triggerAnimation();
        onClick?.();
      }}
      className={`inline-flex flex-col items-center select-none cursor-pointer group transition-transform ${className}`}
      title="Click to replay hair follicle growth"
    >
      <div className="relative flex items-center justify-center">
        <svg
          key={animationKey}
          viewBox="0 0 480 135"
          className="overflow-visible"
          style={{
            width: `${480 * scale * 0.52}px`,
            height: `${135 * scale * 0.52}px`,
          }}
        >
          <defs>
            {/* Glow filters for the cortisol bio-fluorescent nodes */}
            <filter id="follicleGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur1" />
              <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="blur2" />
              <feMerge>
                <feMergeNode in="blur2" />
                <feMergeNode in="blur1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <linearGradient id="follicleGradient" x1="0%" y1="100%" x2="50%" y2="0%">
              <stop offset="0%" stopColor="#0B1320" />
              <stop offset="40%" stopColor="#1E293B" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>

            <linearGradient id="terracottaGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#C47352" />
              <stop offset="100%" stopColor="#B36242" />
            </linearGradient>

            <linearGradient id="tealGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0D4F59" />
              <stop offset="100%" stopColor="#093E47" />
            </linearGradient>
          </defs>

          {/* 1. "BAAL" in Terracotta */}
          <text
            x="20"
            y="112"
            fill="url(#terracottaGradient)"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontWeight="800"
            fontSize="76"
            letterSpacing="1.5"
          >
            BAAL
          </text>

          {/* 2. THE HAIR FOLLICLE & BULB (Tightly nested between BAAL and ANCE) */}
          <g id="hair-follicle-unit">
            {/* Follicle Bulb at Base - Slender biological droplet */}
            <g className="follicle-bulb">
              <ellipse
                cx="237"
                cy="110"
                rx="8.5"
                ry="16"
                fill="#0F172A"
                stroke="#FFFFFF"
                strokeWidth="2"
              />
              <ellipse
                cx="237"
                cy="111"
                rx="4.5"
                ry="9"
                fill="#1E293B"
              />
              <circle
                cx="237"
                cy="109"
                r="2.5"
                fill="#38BDF8"
                opacity="0.85"
                className={animated ? 'animate-ping' : ''}
              />
            </g>

            {/* Background guide path for visual grounding */}
            <path
              d="M 237 98 C 235 68, 243 36, 255 8"
              fill="none"
              stroke="#0F172A"
              strokeWidth="2.2"
              strokeLinecap="round"
              opacity="0.3"
            />

            {/* Hair Shaft Recurring Growth Path from Bulb */}
            <path
              d="M 237 98 C 235 68, 243 36, 255 8"
              fill="none"
              stroke="url(#follicleGradient)"
              strokeWidth="4.8"
              strokeLinecap="round"
              style={{
                strokeDasharray: 180,
                strokeDashoffset: 0,
                animation: animated ? 'recurringHairGrowth 4.2s ease-in-out infinite' : 'none',
              }}
            />

            {/* Fine hair tip extension */}
            <path
              d="M 253 12 C 256 8, 259 4, 262 1"
              fill="none"
              stroke="#0F172A"
              strokeWidth="2"
              strokeLinecap="round"
              style={{
                strokeDasharray: 30,
                strokeDashoffset: 0,
                animation: animated ? 'recurringTipGrowth 4.2s ease-in-out infinite' : 'none',
              }}
            />

            {/* Cuticle texture notches */}
            <path
              d="M 238 82 L 241 80 M 239 68 L 242 66 M 241 54 L 245 52 M 244 40 L 248 38 M 248 26 L 252 24"
              stroke="rgba(255,255,255,0.45)"
              strokeWidth="1.2"
              strokeLinecap="round"
            />

            {/* Node 1: Month 2 Mid-Shaft node */}
            <g
              transform="translate(241, 54)"
              filter="url(#follicleGlow)"
              className={animated ? 'animate-pulse' : ''}
              style={{ animationDuration: '2.5s' }}
            >
              <circle cx="0" cy="0" r="5.5" fill="#38BDF8" opacity="0.95" />
              <circle cx="0" cy="0" r="3" fill="#FFFFFF" />
              <circle cx="0" cy="0" r="8.5" fill="#38BDF8" opacity="0.25" className={animated ? 'animate-ping' : ''} style={{ animationDuration: '3s' }} />
            </g>

            {/* Node 2: Month 3 Tip node */}
            <g
              transform="translate(253, 20)"
              filter="url(#follicleGlow)"
              className={animated ? 'animate-pulse' : ''}
              style={{ animationDuration: '2s', animationDelay: '0.4s' }}
            >
              <circle cx="0" cy="0" r="5" fill="#38BDF8" opacity="0.95" />
              <circle cx="0" cy="0" r="2.5" fill="#FFFFFF" />
              <circle cx="0" cy="0" r="7.5" fill="#38BDF8" opacity="0.25" className={animated ? 'animate-ping' : ''} style={{ animationDuration: '3.2s', animationDelay: '0.5s' }} />
            </g>
          </g>

          {/* 3. "ANCE" in Deep Teal - snugly placed right after the strand */}
          <text
            x="249"
            y="112"
            fill="url(#tealGradient)"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontWeight="800"
            fontSize="76"
            letterSpacing="1.5"
          >
            ANCE
          </text>
        </svg>
      </div>

      {/* Tagline */}
      {showTagline && (
        <div className="mt-1 flex items-center justify-center">
          <span
            className="font-sans text-[11px] sm:text-xs font-semibold tracking-[0.24em] text-[#0D4F59] uppercase transition-colors group-hover:text-[#3186FF]"
          >
            Your hair keeps the receipts.
          </span>
        </div>
      )}

      <style jsx>{`
        @keyframes recurringHairGrowth {
          0% {
            stroke-dashoffset: 180;
            opacity: 0.2;
          }
          8% {
            opacity: 1;
          }
          38% {
            stroke-dashoffset: 0;
            opacity: 1;
          }
          82% {
            stroke-dashoffset: 0;
            opacity: 1;
          }
          94% {
            stroke-dashoffset: 0;
            opacity: 0.3;
          }
          100% {
            stroke-dashoffset: 180;
            opacity: 0.2;
          }
        }

        @keyframes recurringTipGrowth {
          0%, 25% {
            stroke-dashoffset: 30;
            opacity: 0;
          }
          45%, 82% {
            stroke-dashoffset: 0;
            opacity: 1;
          }
          94%, 100% {
            stroke-dashoffset: 30;
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};
