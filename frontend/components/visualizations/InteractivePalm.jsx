import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function InteractivePalm({ onLineClick, linesData }) {
  const [hoveredLine, setHoveredLine] = useState(null);

  // Line display names and icons
  const lineDetails = {
    lifeLine: { name: 'Life Line', iconName: 'Heart', iconEmoji: '❤️', color: '#FF6B6B' },
    heartLine: { name: 'Heart Line', iconName: 'Activity', iconEmoji: '💖', color: '#FF1493' },
    headLine: { name: 'Head Line', iconName: 'Brain', iconEmoji: '🧠', color: '#4ECDC4' },
    fateLine: { name: 'Fate Line', iconName: 'Compass', iconEmoji: '🔮', color: '#9B59B6' }
  };

  const handleLineClick = (lineKey) => {
    if (linesData && linesData[lineKey] && onLineClick) {
      onLineClick({
        key: lineKey,
        name: lineDetails[lineKey].name,
        icon: lineDetails[lineKey].iconName,
        color: lineDetails[lineKey].color,
        ...linesData[lineKey]
      });
    }
  };

  return (
    <div className="interactive-palm-container" style={{ position: 'relative', width: '100%', maxWidth: '400px', margin: '0 auto' }}>
      {/* Mystical Background Aura */}
      <div 
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '80%',
          height: '80%',
          background: 'radial-gradient(circle, rgba(155, 89, 182, 0.15) 0%, rgba(0, 0, 0, 0) 70%)',
          filter: 'blur(20px)',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />

      <motion.svg
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        viewBox="0 0 400 500"
        width="100%"
        height="100%"
        style={{ display: 'block', zIndex: 1, position: 'relative' }}
      >
        <defs>
          {/* Glowing Filters */}
          <filter id="glow-life" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-heart" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-head" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-fate" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          
          {/* Hand Skin Gradient */}
          <radialGradient id="hand-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1a113a" stopOpacity="0.8"/>
            <stop offset="100%" stopColor="#0b061d" stopOpacity="0.95"/>
          </radialGradient>
        </defs>

        <style>{`
          .hand-outline {
            fill: url(#hand-grad);
            stroke: #d4af37;
            stroke-width: 2.5;
            stroke-linecap: round;
            stroke-linejoin: round;
            filter: drop-shadow(0px 0px 8px rgba(212, 175, 55, 0.25));
          }
          .palm-creases {
            fill: none;
            stroke: #4a348c;
            stroke-width: 1.5;
            stroke-dasharray: 4 2;
            opacity: 0.6;
          }
          .palm-line-interactive {
            fill: none;
            stroke-width: 6;
            stroke-linecap: round;
            cursor: pointer;
            transition: all 0.3s ease;
          }
          .palm-line-interactive:hover {
            stroke-width: 9;
            opacity: 1 !important;
          }
        `}</style>

        {/* Hand Outline Path */}
        <path className="hand-outline" d="
          M 130 460 
          C 115 440, 95 380, 95 330 
          C 95 315, 80 300, 70 290
          C 55 275, 30 260, 45 235
          C 55 220, 85 245, 105 270
          C 105 230, 110 160, 115 110
          C 118 90, 142 90, 142 110
          C 142 150, 145 200, 148 220
          C 148 180, 158 100, 165 60
          C 168 40, 192 40, 192 60
          C 192 120, 195 200, 198 220
          C 198 180, 215 100, 222 75
          C 225 55, 248 55, 248 75
          C 248 140, 248 200, 248 230
          C 248 190, 268 120, 275 110
          C 278 95, 300 100, 298 120
          C 292 180, 282 250, 285 300
          C 288 340, 310 380, 310 405
          C 310 440, 290 460, 270 460
          Z" />

        {/* Artistic details on palm */}
        <path className="palm-creases" d="M 120 330 Q 150 360, 190 350" />
        <path className="palm-creases" d="M 230 310 Q 255 330, 280 300" />
        <path className="palm-creases" d="M 160 270 Q 180 290, 210 270" />
        <path className="palm-creases" d="M 250 250 C 265 240, 270 210, 275 190" />
        <path className="palm-creases" d="M 130 220 C 120 200, 115 170, 120 150" />

        {/* Life Line */}
        <path
          id="lifeLine"
          className="palm-line-interactive"
          d="M 125 240 C 135 290, 120 380, 200 440"
          stroke="#FF6B6B"
          opacity={hoveredLine === 'lifeLine' ? 1 : 0.7}
          style={{ filter: hoveredLine === 'lifeLine' ? 'url(#glow-life)' : 'none' }}
          onMouseEnter={() => setHoveredLine('lifeLine')}
          onMouseLeave={() => setHoveredLine(null)}
          onClick={() => handleLineClick('lifeLine')}
        />

        {/* Head Line */}
        <path
          id="headLine"
          className="palm-line-interactive"
          d="M 125 242 C 160 245, 230 260, 275 305"
          stroke="#4ECDC4"
          opacity={hoveredLine === 'headLine' ? 1 : 0.7}
          style={{ filter: hoveredLine === 'headLine' ? 'url(#glow-head)' : 'none' }}
          onMouseEnter={() => setHoveredLine('headLine')}
          onMouseLeave={() => setHoveredLine(null)}
          onClick={() => handleLineClick('headLine')}
        />

        {/* Heart Line */}
        <path
          id="heartLine"
          className="palm-line-interactive"
          d="M 285 210 C 230 180, 160 205, 145 240"
          stroke="#FF1493"
          opacity={hoveredLine === 'heartLine' ? 1 : 0.7}
          style={{ filter: hoveredLine === 'heartLine' ? 'url(#glow-heart)' : 'none' }}
          onMouseEnter={() => setHoveredLine('heartLine')}
          onMouseLeave={() => setHoveredLine(null)}
          onClick={() => handleLineClick('heartLine')}
        />

        {/* Fate Line */}
        <path
          id="fateLine"
          className="palm-line-interactive"
          d="M 200 450 C 200 370, 202 290, 192 195"
          stroke="#9B59B6"
          opacity={hoveredLine === 'fateLine' ? 1 : 0.7}
          style={{ filter: hoveredLine === 'fateLine' ? 'url(#glow-fate)' : 'none' }}
          onMouseEnter={() => setHoveredLine('fateLine')}
          onMouseLeave={() => setHoveredLine(null)}
          onClick={() => handleLineClick('fateLine')}
        />
      </motion.svg>

      {/* Floating Tooltip displaying hovered line details */}
      {hoveredLine && (
        <div
          className="palm-tooltip"
          style={{
            position: 'absolute',
            bottom: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(15, 10, 35, 0.9)',
            border: `1.5px solid ${lineDetails[hoveredLine].color}`,
            borderRadius: '8px',
            padding: '6px 14px',
            color: '#fff',
            fontSize: '0.85rem',
            textAlign: 'center',
            boxShadow: `0 0 10px ${lineDetails[hoveredLine].color}40`,
            pointerEvents: 'none',
            zIndex: 10,
            fontFamily: "'Cinzel', serif",
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <span>{lineDetails[hoveredLine].iconEmoji}</span>
          <strong style={{ color: lineDetails[hoveredLine].color }}>
            {lineDetails[hoveredLine].name}
          </strong>
        </div>
      )}
    </div>
  );
}
