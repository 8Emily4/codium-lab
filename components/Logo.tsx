import React from "react";

interface LogoProps {
  className?: string;
}

export default function Logo({ className = "h-7 w-7" }: LogoProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="32" height="32" rx="8" fill="#09090B" />
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        {/* C-loop */}
        <path
          d="M14.5,11 A 5,5 0 1, 0 14.5,21"
          stroke="url(#logo-brand-grad)"
          strokeWidth="2.8"
        />
        {/* L-loop */}
        <path
          d="M18,11 V21 H22.5"
          stroke="#FFFFFF"
          strokeWidth="2.5"
        />
        {/* Center Accent Dot */}
        <circle cx="18" cy="16" r="1.2" fill="#FFFFFF" />
      </g>
      <defs>
        <linearGradient
          id="logo-brand-grad"
          x1="0"
          y1="0"
          x2="32"
          y2="32"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#6366F1" />
          <stop offset="0.5" stopColor="#8B5CF6" />
          <stop offset="1" stopColor="#D946EF" />
        </linearGradient>
      </defs>
    </svg>
  );
}
