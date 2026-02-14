import React from 'react';

export const Logo = ({ className = "h-12 w-auto" }: { className?: string }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 200 200" 
      className={className}
      fill="none"
    >
      <defs>
        <linearGradient id="gold-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDB931" />
          <stop offset="25%" stopColor="#FDF5A6" />
          <stop offset="50%" stopColor="#D4AF37" />
          <stop offset="75%" stopColor="#FDF5A6" />
          <stop offset="100%" stopColor="#996515" />
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      
      <circle cx="100" cy="100" r="90" stroke="url(#gold-gradient)" strokeWidth="2" opacity="0.3" />
      <ellipse cx="100" cy="100" rx="95" ry="30" stroke="url(#gold-gradient)" strokeWidth="1" transform="rotate(-15 100 100)" opacity="0.4" />
      
      <path 
        d="M100 180 C 100 180, 20 130, 20 70 C 20 30, 60 10, 90 40 L 100 50 L 110 40 C 140 10, 180 30, 180 70 C 180 130, 100 180, 100 180 Z" 
        fill="none" 
        stroke="url(#gold-gradient)" 
        strokeWidth="6"
        filter="url(#glow)"
      />
      
      <text 
        x="100" 
        y="115" 
        fontFamily="serif" 
        fontSize="24" 
        fontWeight="bold" 
        fill="url(#gold-gradient)" 
        textAnchor="middle"
        style={{textShadow: '1px 1px 2px rgba(0,0,0,0.3)'}}
      >
        LoveWorld
      </text>
    </svg>
  );
};