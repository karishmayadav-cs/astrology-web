import React from 'react';
import { motion } from 'framer-motion';

export default function TabsInterface({ activeTab, onTabChange, isFace = false }) {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: '🎯' },
    { id: 'visual', label: isFace ? 'Face Zones' : 'Palm Lines', icon: isFace ? '👤' : '✋' },
    { id: 'personality', label: 'Personality', icon: '📊' },
    { id: 'lucky', label: 'Lucky Elements', icon: '🎁' },
    { id: 'future', label: 'Future Insights', icon: '🔮' }
  ];

  return (
    <div 
      className="tabs-nav-container"
      style={{
        display: 'flex',
        justifyContent: 'center',
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '16px',
        padding: '6px',
        margin: '25px auto',
        maxWidth: '700px',
        overflowX: 'auto',
        whiteSpace: 'nowrap',
        scrollbarWidth: 'none', // Firefox
        msOverflowStyle: 'none', // IE
      }}
    >
      <div 
        style={{ 
          display: 'flex', 
          gap: '4px', 
          width: '100%', 
          justifyContent: 'space-between'
        }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              style={{
                position: 'relative',
                padding: '10px 18px',
                background: 'transparent',
                border: 'none',
                color: isActive ? '#FFD700' : 'rgba(255, 255, 255, 0.6)',
                fontSize: '0.85rem',
                fontWeight: '600',
                fontFamily: "'Cinzel', serif",
                letterSpacing: '0.05em',
                cursor: 'pointer',
                transition: 'color 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                borderRadius: '12px',
                outline: 'none'
              }}
            >
              {/* Sliding Background Pill */}
              {isActive && (
                <motion.div
                  layoutId="activeTabPill"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.12) 0%, rgba(212, 175, 55, 0.05) 100%)',
                    border: '1.5px solid rgba(212, 175, 55, 0.25)',
                    borderRadius: '12px',
                    zIndex: 0
                  }}
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}

              <span style={{ position: 'relative', zIndex: 1 }}>{tab.icon}</span>
              <span style={{ position: 'relative', zIndex: 1 }}>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Hide scrollbar styles */}
      <style>{`
        .tabs-nav-container::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
