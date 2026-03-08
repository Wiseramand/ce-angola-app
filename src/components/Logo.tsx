
import React from 'react';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = "h-12 w-auto" }) => {
  return (
    <svg 
      viewBox="0 0 300 250" 
      className={className}
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#FDF5E6', stopOpacity: 1 }} />
          <stop offset="20%" style={{ stopColor: '#FFD700', stopOpacity: 1 }} />
          <stop offset="50%" style={{ stopColor: '#C5A059', stopOpacity: 1 }} />
          <stop offset="80%" style={{ stopColor: '#8B6508', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#C5A059', stopOpacity: 1 }} />
        </linearGradient>
        <filter id="goldShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
          <feOffset dx="2" dy="2" result="offsetblur" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.5" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      
      {/* Heart Shape */}
      <path 
        d="M150 230 C150 230 20 160 20 85 C20 40 60 20 90 20 C115 20 135 35 150 55 C165 35 185 20 210 20 C240 20 280 40 280 85 C280 160 150 230 150 230Z" 
        stroke="url(#goldGradient)" 
        strokeWidth="12"
        filter="url(#goldShadow)"
        fill="transparent"
      />
      
      {/* World Grid/Lines inside Heart */}
      <path 
        d="M70 45 Q150 100 230 45 M45 80 Q150 140 255 80 M35 120 Q150 180 265 120 M150 25 L150 220 M80 30 Q100 120 100 200 M220 30 Q200 120 200 200" 
        stroke="url(#goldGradient)" 
        strokeWidth="3" 
        opacity="0.6"
      />

      {/* LoveWorld Text */}
      <text 
        x="150" 
        y="125" 
        textAnchor="middle" 
        fill="url(#goldGradient)" 
        style={{ 
          fontFamily: 'Montserrat, sans-serif', 
          fontWeight: '900', 
          fontSize: '42px',
          filter: 'drop-shadow(2px 2px 2px rgba(0,0,0,0.3))'
        }}
      >
        LoveWorld
      </text>

      {/* Orbit/Ring around the heart */}
      <ellipse 
        cx="150" 
        cy="120" 
        rx="145" 
        ry="35" 
        stroke="url(#goldGradient)" 
        strokeWidth="6"
        fill="transparent"
        transform="rotate(-5, 150, 120)"
      />
    </svg>
  );
};

export default Logo;
