'use client';

import React from 'react';

interface BrandLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  showBadge?: boolean;
  className?: string;
  withText?: boolean;
  textClassName?: string;
}

export function BrandLogo({
  size = 'md',
  showBadge = true,
  className = '',
  withText = false,
  textClassName = '',
}: BrandLogoProps) {
  // Resolve numeric size in pixels
  let pxSize = 40;
  if (typeof size === 'number') {
    pxSize = size;
  } else {
    switch (size) {
      case 'xs':
        pxSize = 24;
        break;
      case 'sm':
        pxSize = 32;
        break;
      case 'md':
        pxSize = 40;
        break;
      case 'lg':
        pxSize = 56;
        break;
      case 'xl':
        pxSize = 72;
        break;
    }
  }

  const rawId = React.useId();
  const uid = `eh-${rawId.replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const bgGradId = `${uid}-bg`;
  const glowGradId = `${uid}-glow`;
  const goldGradId = `${uid}-gold`;
  const borderGradId = `${uid}-border`;
  const shadowFilterId = `${uid}-shadow`;

  const svgContent = (
    <svg
      width={pxSize}
      height={pxSize}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 transition-transform duration-200 ${className}`}
    >
      <defs>
        {/* Deep Luxury Indigo-to-Sky Gradient */}
        <linearGradient id={bgGradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4338ca" />
          <stop offset="50%" stopColor="#4f46e5" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>

        {/* Glow Accent Gradient */}
        <linearGradient id={glowGradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#818cf8" />
        </linearGradient>

        {/* Elite Crown Gold Gradient */}
        <linearGradient id={goldGradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>

        {/* Squircle Border Gradient */}
        <linearGradient id={borderGradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a5b4fc" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.4" />
        </linearGradient>

        {/* Soft Drop Shadow Filter */}
        <filter id={shadowFilterId} x="-10%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#4f46e5" floodOpacity="0.35" />
        </filter>
      </defs>

      {showBadge ? (
        <>
          {/* Rounded Squircle Shield Base */}
          <rect
            x="3"
            y="3"
            width="94"
            height="94"
            rx="26"
            fill={`url(#${bgGradId})`}
            filter={`url(#${shadowFilterId})`}
          />
          {/* Subtle Inner Border */}
          <rect
            x="4"
            y="4"
            width="92"
            height="92"
            rx="25"
            stroke={`url(#${borderGradId})`}
            strokeWidth="1.75"
            fill="none"
          />
        </>
      ) : null}

      {/* --- EH Monogram & Architectural Emblem --- */}
      <g id={`${uid}-emblem`}>
        {/* Elite Beacon Star at Summit */}
        <path
          d="M 50 10 L 53.5 17 L 60.5 17 L 55 21 L 57 28 L 50 23.5 L 43 28 L 45 21 L 39.5 17 L 46.5 17 Z"
          fill={`url(#${goldGradId})`}
        />

        {/* Sweeping Residential Roof Gable */}
        <path
          d="M 21 40 L 50 18 L 79 40 L 73.5 44 L 50 26.5 L 26.5 44 Z"
          fill="#ffffff"
          fillOpacity="0.95"
        />

        {/* Left Column (Left Stem of 'H' & Back of 'E') */}
        <rect
          x="26"
          y="42"
          width="10"
          height="38"
          rx="4"
          fill="#ffffff"
        />

        {/* 'E' Top Wing */}
        <rect
          x="35"
          y="42"
          width="15"
          height="7.5"
          rx="3"
          fill="#ffffff"
        />

        {/* 'H' Crossbar & 'E' Center Bridge (Connects Both Towers) */}
        <rect
          x="35"
          y="57"
          width="30"
          height="8"
          rx="3"
          fill={`url(#${glowGradId})`}
        />

        {/* 'E' Bottom Wing */}
        <rect
          x="35"
          y="72.5"
          width="15"
          height="7.5"
          rx="3"
          fill="#ffffff"
        />

        {/* Right Column (Right Tower of 'H') */}
        <rect
          x="64"
          y="42"
          width="10"
          height="38"
          rx="4"
          fill="#ffffff"
        />

        {/* Architectural High-Rise Window Slits on Right Tower */}
        <circle cx="69" cy="48" r="1.75" fill="#4f46e5" />
        <circle cx="69" cy="69" r="1.75" fill="#4f46e5" />
        <circle cx="69" cy="74" r="1.75" fill="#4f46e5" />

        {/* Modern Foundation Accent Bar */}
        <rect
          x="22"
          y="83"
          width="56"
          height="3.5"
          rx="1.75"
          fill={`url(#${glowGradId})`}
          fillOpacity="0.8"
        />
      </g>
    </svg>
  );

  if (!withText) {
    return svgContent;
  }

  return (
    <div className="flex items-center gap-3 group">
      {svgContent}
      <div className={textClassName}>
        <div className="font-bold text-lg tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          Elite Homes
          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            PG
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
          Hostel & Accommodation Management
        </p>
      </div>
    </div>
  );
}
