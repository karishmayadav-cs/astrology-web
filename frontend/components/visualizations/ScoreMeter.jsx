import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

export default function ScoreMeter({ score = 80, label = 'Overall Alignment Score', size = 160 }) {
  const [displayValue, setDisplayValue] = useState(0);
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  useEffect(() => {
    // Count-up animation using Framer Motion's animate utility
    const controls = animate(0, score, {
      duration: 1.6,
      ease: 'easeOut',
      onUpdate: (latest) => setDisplayValue(Math.round(latest))
    });
    return () => controls.stop();
  }, [score]);

  // Stroke offset calculated from target score
  const strokeDashoffset = circumference - (displayValue / 100) * circumference;

  // Determine indicator color based on score tier
  const getScoreColor = (val) => {
    if (val < 60) return '#FF6B6B'; // Red/Rose
    if (val >= 85) return '#FFD700'; // Gold
    return '#4ECDC4'; // Teal
  };

  const currentColor = getScoreColor(displayValue);

  return (
    <div 
      className="score-meter-wrapper" 
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        margin: '20px auto'
      }}
    >
      <div 
        style={{ 
          position: 'relative', 
          width: size, 
          height: size, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}
      >
        {/* Soft background aura */}
        <div
          style={{
            position: 'absolute',
            width: '80%',
            height: '80%',
            background: `radial-gradient(circle, ${currentColor}1a 0%, transparent 70%)`,
            filter: 'blur(10px)',
            pointerEvents: 'none',
            zIndex: 0
          }}
        />

        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', zIndex: 1 }}>
          {/* Track Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="rgba(255, 255, 255, 0.04)"
            strokeWidth={strokeWidth}
          />
          {/* Progress Circle with glow filter */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={currentColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: 'stroke 0.3s ease',
              filter: `drop-shadow(0 0 5px ${currentColor}aa)`
            }}
          />
        </svg>

        {/* Central Text Panel */}
        <div 
          style={{ 
            position: 'absolute', 
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2
          }}
        >
          <motion.span 
            style={{ 
              fontSize: size > 120 ? '2.2rem' : '1.8rem', 
              fontWeight: 'bold', 
              color: '#ffffff',
              fontFamily: "'Cinzel', serif",
              lineHeight: '1',
              display: 'block'
            }}
          >
            {displayValue}%
          </motion.span>
          <span 
            style={{ 
              fontSize: '0.62rem', 
              color: 'rgba(255,255,255,0.4)', 
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginTop: '4px',
              fontFamily: "'Raleway', sans-serif",
              fontWeight: 'bold'
            }}
          >
            AURA
          </span>
        </div>
      </div>

      {/* Label */}
      <h4 
        style={{ 
          fontFamily: "'Cinzel', serif", 
          color: '#e2e8f0', 
          fontSize: '0.9rem', 
          letterSpacing: '0.06em', 
          margin: '16px 0 0 0',
          textAlign: 'center'
        }}
      >
        {label}
      </h4>
    </div>
  );
}
