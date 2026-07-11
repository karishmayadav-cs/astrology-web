import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function InteractiveFace({ onZoneClick, zonesData }) {
  const [hoveredZone, setHoveredZone] = useState(null);

  // Zone display metadata
  const zoneDetails = {
    forehead: { name: 'Forehead', icon: '🧠', color: '#4ECDC4', label: 'Intelligence & Fortune' },
    eyes: { name: 'Eyes', icon: '👁️', color: '#FF1493', label: 'Emotions & Soul' },
    nose: { name: 'Nose', icon: '💵', color: '#FFD700', label: 'Wealth & Career' },
    lips: { name: 'Lips', icon: '💬', color: '#9B59B6', label: 'Communication & Love' },
    chin: { name: 'Chin', icon: '🛡️', color: '#FF6B6B', label: 'Willpower & Longevity' }
  };

  const handleZoneClick = (zoneKey) => {
    if (zonesData && zonesData[zoneKey] && onZoneClick) {
      onZoneClick({
        key: zoneKey,
        name: zoneDetails[zoneKey].name,
        icon: zoneKey === 'forehead' ? 'Brain' : zoneKey === 'eyes' ? 'Eye' : zoneKey === 'nose' ? 'Coins' : zoneKey === 'lips' ? 'MessageSquare' : 'ShieldAlert',
        color: zoneDetails[zoneKey].color,
        ...zonesData[zoneKey]
      });
    }
  };

  return (
    <div className="interactive-face-container" style={{ position: 'relative', width: '100%', maxWidth: '380px', margin: '0 auto' }}>
      {/* Mystical Background Aura */}
      <div 
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '80%',
          height: '80%',
          background: 'radial-gradient(circle, rgba(78, 205, 196, 0.15) 0%, rgba(0, 0, 0, 0) 70%)',
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
          <filter id="glow-forehead" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-eyes" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-nose" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-lips" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-chin" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          
          {/* Face Skin Gradient */}
          <radialGradient id="face-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#12183c" stopOpacity="0.75"/>
            <stop offset="100%" stopColor="#070921" stopOpacity="0.95"/>
          </radialGradient>
        </defs>

        <style>{`
          .face-outline {
            fill: url(#face-grad);
            stroke: #d4af37;
            stroke-width: 2.5;
            stroke-linecap: round;
            stroke-linejoin: round;
            filter: drop-shadow(0px 0px 8px rgba(212, 175, 55, 0.22));
          }
          .facial-decor-line {
            fill: none;
            stroke: #31216b;
            stroke-width: 1.5;
            opacity: 0.5;
            pointer-events: none;
          }
          .face-zone-interactive {
            fill: rgba(255, 255, 255, 0.01);
            stroke-width: 2.5;
            stroke-linecap: round;
            cursor: pointer;
            transition: all 0.3s ease;
          }
          .face-zone-interactive:hover {
            fill: rgba(255, 255, 255, 0.08);
            stroke-width: 4;
            opacity: 1 !important;
          }
        `}</style>

        {/* Face Outline Path */}
        <path className="face-outline" d="
          M 200 60
          C 280 60, 320 100, 320 200
          C 320 300, 280 400, 200 440
          C 120 400, 80 300, 80 200
          C 80 100, 120 60, 200 60
          Z" />

        {/* Decorative elements */}
        <path className="facial-decor-line" d="M 80 180 C 65 180, 65 240, 80 250" />
        <path className="facial-decor-line" d="M 320 180 C 335 180, 335 240, 320 250" />
        <path className="facial-decor-line" d="M 120 110 Q 200 120, 280 110" />

        {/* Forehead Zone */}
        <path
          id="forehead"
          className="face-zone-interactive"
          d="
            M 130 115
            C 170 100, 230 100, 270 115
            C 285 140, 280 160, 270 165
            Q 200 175, 130 165
            C 120 160, 115 140, 130 115
            Z"
          stroke="#4ECDC4"
          opacity={hoveredZone === 'forehead' ? 1 : 0.6}
          style={{ filter: hoveredZone === 'forehead' ? 'url(#glow-forehead)' : 'none' }}
          onMouseEnter={() => setHoveredZone('forehead')}
          onMouseLeave={() => setHoveredZone(null)}
          onClick={() => handleZoneClick('forehead')}
        />

        {/* Eyes Zone */}
        <g>
          <path
            id="eyes"
            className="face-zone-interactive"
            d="
              M 110 185
              Q 200 195, 290 185
              C 305 210, 305 235, 290 240
              Q 200 245, 110 240
              C 95 235, 95 210, 110 185
              Z"
            stroke="#FF1493"
            opacity={hoveredZone === 'eyes' ? 1 : 0.6}
            style={{ filter: hoveredZone === 'eyes' ? 'url(#glow-eyes)' : 'none' }}
            onMouseEnter={() => setHoveredZone('eyes')}
            onMouseLeave={() => setHoveredZone(null)}
            onClick={() => handleZoneClick('eyes')}
          />
          {/* Static Eye Guide Marks */}
          <path className="facial-decor-line" d="M 135 212 Q 155 198, 175 212 Q 155 220, 135 212 Z" />
          <path className="facial-decor-line" d="M 225 212 Q 245 198, 265 212 Q 245 220, 225 212 Z" />
        </g>

        {/* Nose Zone */}
        <g>
          <path
            id="nose"
            className="face-zone-interactive"
            d="
              M 175 220
              L 225 220
              L 230 330
              C 230 345, 170 345, 170 330
              Z"
            stroke="#FFD700"
            opacity={hoveredZone === 'nose' ? 1 : 0.6}
            style={{ filter: hoveredZone === 'nose' ? 'url(#glow-nose)' : 'none' }}
            onMouseEnter={() => setHoveredZone('nose')}
            onMouseLeave={() => setHoveredZone(null)}
            onClick={() => handleZoneClick('nose')}
          />
          <path className="facial-decor-line" d="M 185 240 L 185 310 Q 200 320, 215 310 L 215 240" strokeWidth="1" />
          <path className="facial-decor-line" d="M 175 320 C 185 300, 215 300, 225 320" strokeWidth="1" />
        </g>

        {/* Lips Zone */}
        <g>
          <path
            id="lips"
            className="face-zone-interactive"
            d="
              M 140 345
              Q 200 335, 260 345
              C 275 370, 265 395, 250 400
              Q 200 405, 150 400
              C 135 395, 125 370, 140 345
              Z"
            stroke="#9B59B6"
            opacity={hoveredZone === 'lips' ? 1 : 0.6}
            style={{ filter: hoveredZone === 'lips' ? 'url(#glow-lips)' : 'none' }}
            onMouseEnter={() => setHoveredZone('lips')}
            onMouseLeave={() => setHoveredZone(null)}
            onClick={() => handleZoneClick('lips')}
          />
          <path className="facial-decor-line" d="M 160 365 Q 200 350, 240 365 Q 200 380, 160 365" strokeWidth="1" />
        </g>

        {/* Chin Zone */}
        <path
          id="chin"
          className="face-zone-interactive"
          d="
            M 120 405
            Q 200 408, 280 405
            C 270 425, 240 442, 200 442
            C 160 442, 130 425, 120 405
            Z"
          stroke="#FF6B6B"
          opacity={hoveredZone === 'chin' ? 1 : 0.6}
          style={{ filter: hoveredZone === 'chin' ? 'url(#glow-chin)' : 'none' }}
          onMouseEnter={() => setHoveredZone('chin')}
          onMouseLeave={() => setHoveredZone(null)}
          onClick={() => handleZoneClick('chin')}
        />
      </motion.svg>

      {/* Floating Tooltip */}
      {hoveredZone && (
        <div
          className="face-tooltip"
          style={{
            position: 'absolute',
            bottom: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(15, 10, 35, 0.95)',
            border: `1.5px solid ${zoneDetails[hoveredZone].color}`,
            borderRadius: '8px',
            padding: '6px 14px',
            color: '#fff',
            fontSize: '0.85rem',
            textAlign: 'center',
            boxShadow: `0 0 10px ${zoneDetails[hoveredZone].color}40`,
            pointerEvents: 'none',
            zIndex: 10,
            fontFamily: "'Cinzel', serif",
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <span>{zoneDetails[hoveredZone].icon}</span>
          <strong style={{ color: zoneDetails[hoveredZone].color }}>
            {zoneDetails[hoveredZone].name}
          </strong>
          <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>
            ({zoneDetails[hoveredZone].label})
          </span>
        </div>
      )}
    </div>
  );
}
