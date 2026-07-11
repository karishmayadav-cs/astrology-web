import React from 'react';
import { motion } from 'framer-motion';

export default function FutureTimeline({ timelineData }) {
  // Safe fallback if data is missing
  const defaultTimeline = {
    shortTerm: {
      period: 'Next 3 Months',
      prediction: 'A period of swift career changes or new projects. Focus on adaptability and aligning with your core ambitions.',
      icon: '🚀'
    },
    mediumTerm: {
      period: '6–12 Months',
      prediction: 'Relationships and emotional bonds will experience deep harmony and growth. An ideal phase for building long-term ties.',
      icon: '💖'
    },
    longTerm: {
      period: '2–5 Years',
      prediction: 'Significant financial gains and establishing a firm foundation for your career. The fruits of your patience will manifest.',
      icon: '🏺'
    }
  };

  const data = timelineData || defaultTimeline;

  // Convert the object into a linear array of milestones
  const milestones = [
    { key: 'shortTerm', title: 'Short Term Prediction', ...data.shortTerm, color: '#FF6B6B' },
    { key: 'mediumTerm', title: 'Medium Term Prediction', ...data.mediumTerm, color: '#FF1493' },
    { key: 'longTerm', title: 'Long Term Prediction', ...data.longTerm, color: '#9B59B6' }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  const lineVariants = {
    hidden: { height: 0 },
    show: { height: '100%', transition: { duration: 1.5, ease: 'easeInOut' } }
  };

  return (
    <div 
      className="future-timeline-container" 
      style={{ 
        position: 'relative', 
        width: '100%', 
        maxWidth: '850px', 
        margin: '40px auto', 
        padding: '20px 0'
      }}
    >
      {/* Central Timeline Vertical Line */}
      <div 
        style={{
          position: 'absolute',
          left: '50%',
          top: '0',
          bottom: '0',
          width: '4px',
          transform: 'translateX(-50%)',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '2px',
          zIndex: 0
        }}
      />
      
      {/* Animated Growing Gradient Line */}
      <motion.div 
        variants={lineVariants}
        initial="hidden"
        animate="show"
        style={{
          position: 'absolute',
          left: '50%',
          top: '0',
          width: '4px',
          transform: 'translateX(-50%)',
          background: 'linear-gradient(to bottom, #FF6B6B 0%, #FF1493 50%, #9B59B6 100%)',
          borderRadius: '2px',
          boxShadow: '0 0 10px rgba(255, 20, 147, 0.4)',
          zIndex: 1,
          originY: 0
        }}
      />

      <motion.div 
        variants={containerVariants} 
        initial="hidden" 
        animate="show" 
        style={{ position: 'relative', zIndex: 2 }}
      >
        {milestones.map((milestone, idx) => {
          const isLeft = idx % 2 === 0;

          return (
            <div 
              key={milestone.key} 
              className={`timeline-row ${isLeft ? 'left' : 'right'}`}
              style={{
                display: 'flex',
                justifyContent: isLeft ? 'flex-start' : 'flex-end',
                alignItems: 'center',
                width: '100%',
                margin: '40px 0',
                position: 'relative'
              }}
            >
              {/* Timeline Center Node */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: idx * 0.3 + 0.2, type: 'spring', stiffness: 120 }}
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: '#0c0721',
                  border: `4px solid ${milestone.color}`,
                  transform: 'translate(-50%, -50%)',
                  boxShadow: `0 0 12px ${milestone.color}`,
                  zIndex: 3,
                  cursor: 'pointer'
                }}
                whileHover={{ scale: 1.3 }}
              />

              {/* Milestone Card */}
              <motion.div
                initial={{ 
                  opacity: 0, 
                  x: isLeft ? -50 : 50 
                }}
                animate={{ 
                  opacity: 1, 
                  x: 0 
                }}
                transition={{ 
                  duration: 0.6, 
                  type: 'spring', 
                  stiffness: 80 
                }}
                className="glass-card timeline-card"
                style={{
                  width: '44%',
                  background: 'linear-gradient(135deg, rgba(24, 18, 50, 0.7) 0%, rgba(8, 5, 25, 0.95) 100%)',
                  border: `1.5px solid rgba(255, 255, 255, 0.04)`,
                  borderLeft: isLeft ? `none` : `3px solid ${milestone.color}`,
                  borderRight: isLeft ? `3px solid ${milestone.color}` : `none`,
                  borderRadius: '16px',
                  padding: '24px',
                  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
                  backdropFilter: 'blur(10px)',
                  textAlign: 'left',
                  position: 'relative'
                }}
              >
                {/* Pointer arrow for timeline cards */}
                <div 
                  style={{
                    position: 'absolute',
                    top: '50%',
                    right: isLeft ? '-8px' : 'auto',
                    left: isLeft ? 'auto' : '-8px',
                    transform: 'translateY(-50%) rotate(45deg)',
                    width: '16px',
                    height: '16px',
                    background: 'rgba(8, 5, 25, 0.95)',
                    borderRight: isLeft ? `1.5px solid ${milestone.color}` : 'none',
                    borderTop: isLeft ? `1.5px solid ${milestone.color}` : 'none',
                    borderLeft: isLeft ? 'none' : `1.5px solid ${milestone.color}`,
                    borderBottom: isLeft ? 'none' : `1.5px solid ${milestone.color}`,
                    zIndex: -1
                  }}
                />

                {/* Card Content */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '2rem', filter: `drop-shadow(0 0 6px ${milestone.color}50)` }}>
                    {milestone.icon}
                  </span>
                  <div>
                    <span 
                      style={{ 
                        fontSize: '0.75rem', 
                        color: milestone.color, 
                        fontWeight: '700', 
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        fontFamily: "'Cinzel', serif"
                      }}
                    >
                      {milestone.period}
                    </span>
                    <h4 
                      style={{ 
                        margin: '2px 0 0 0', 
                        color: '#fff', 
                        fontFamily: "'Cinzel', serif",
                        fontSize: '1rem',
                        letterSpacing: '0.04em'
                      }}
                    >
                      {milestone.title}
                    </h4>
                  </div>
                </div>

                <p 
                  style={{ 
                    fontSize: '0.88rem', 
                    lineHeight: '1.6', 
                    color: 'rgba(255, 255, 255, 0.85)',
                    margin: 0
                  }}
                >
                  {milestone.prediction}
                </p>
              </motion.div>
            </div>
          );
        })}
      </motion.div>

      {/* CSS overrides for mobile layouts */}
      <style>{`
        @media (max-width: 768px) {
          .future-timeline-container {
            padding-left: 20px !important;
          }
          .future-timeline-container > div:first-child,
          .future-timeline-container > div:nth-child(2) {
            left: 20px !important;
            transform: none !important;
          }
          .timeline-row {
            justify-content: flex-start !important;
            margin: 30px 0 !important;
          }
          .timeline-row > div:first-child {
            left: 20px !important;
            transform: translate(-50%, -50%) !important;
          }
          .timeline-card {
            width: calc(100% - 45px) !important;
            margin-left: 45px !important;
            border-left: 3px solid currentColor !important;
            border-right: none !important;
          }
          .timeline-card > div:nth-child(2) {
            left: -8px !important;
            right: auto !important;
            border-left: 1.5px solid currentColor !important;
            border-bottom: 1.5px solid currentColor !important;
            border-right: none !important;
            border-top: none !important;
          }
        }
      `}</style>
    </div>
  );
}
