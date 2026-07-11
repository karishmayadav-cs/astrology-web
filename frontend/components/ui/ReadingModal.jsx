import React from 'react';
import Modal from 'react-modal';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Award, Brain, Compass, Heart, Eye, Sparkles, Coins, MessageSquare, ShieldAlert, Activity } from 'lucide-react';

// Custom modal styles
const customModalStyles = {
  overlay: {
    backgroundColor: 'rgba(3, 2, 10, 0.85)',
    backdropFilter: 'blur(8px)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px'
  },
  content: {
    position: 'relative',
    top: 'auto',
    left: 'auto',
    right: 'auto',
    bottom: 'auto',
    width: '100%',
    maxWidth: '580px',
    background: 'linear-gradient(135deg, #130b2e 0%, #060312 100%)',
    border: '1.5px solid rgba(212, 175, 55, 0.3)',
    borderRadius: '24px',
    padding: '30px',
    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 25px rgba(212, 175, 55, 0.1)',
    overflowY: 'auto',
    maxHeight: '85vh',
    outline: 'none',
    color: '#fff',
    inset: 'auto'
  }
};

// Map icon strings to Lucide components
const iconMap = {
  Heart: Heart,
  Activity: Activity,
  Brain: Brain,
  Compass: Compass,
  Sparkles: Sparkles,
  Eye: Eye,
  Coins: Coins,
  MessageSquare: MessageSquare,
  ShieldAlert: ShieldAlert
};

export default function ReadingModal({ isOpen, onClose, lineData }) {
  if (!lineData) return null;

  const IconComponent = iconMap[lineData.icon] || Award;
  const lineStyleColor = lineData.color || '#FFD700';

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={customModalStyles}
      contentLabel="Detailed Line Reading"
      ariaHideApp={false} // Avoid warning about element selector
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3, type: 'spring', damping: 25 }}
          >
            {/* Header section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ 
                  background: `${lineStyleColor}15`, 
                  border: `2px solid ${lineStyleColor}40`,
                  borderRadius: '12px',
                  padding: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 0 12px ${lineStyleColor}25`
                }}>
                  <IconComponent size={24} color={lineStyleColor} />
                </div>
                <div>
                  <h3 style={{ 
                    fontFamily: "'Cinzel', serif", 
                    fontSize: '1.4rem', 
                    color: '#ffffff', 
                    margin: 0, 
                    letterSpacing: '0.04em' 
                  }}>
                    {lineData.name}
                  </h3>
                  <p style={{ 
                    fontSize: '0.8rem', 
                    color: 'rgba(255, 255, 255, 0.4)', 
                    margin: '2px 0 0 0',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Vedic Chiromancy Analysis
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button 
                onClick={onClose}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#fff',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 64, 129, 0.15)';
                  e.currentTarget.style.borderColor = 'rgba(255, 64, 129, 0.4)';
                  e.currentTarget.style.color = '#FF4081';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.color = '#fff';
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Score progress section */}
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.02)', 
              border: '1px solid rgba(255, 255, 255, 0.04)',
              borderRadius: '16px',
              padding: '16px 20px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '15px'
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', marginBottom: '6px', fontWeight: '600' }}>
                  <span>Line Energy Strength</span>
                  <span style={{ color: lineStyleColor }}>{lineData.score}%</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${lineData.score}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    style={{ 
                      background: `linear-gradient(to right, ${lineStyleColor}88, ${lineStyleColor})`, 
                      height: '100%', 
                      borderRadius: '4px',
                      boxShadow: `0 0 10px ${lineStyleColor}`
                    }}
                  />
                </div>
              </div>
              <div style={{ 
                fontFamily: "'Cinzel', serif", 
                fontSize: '1.8rem', 
                fontWeight: 'bold', 
                color: lineStyleColor,
                lineHeight: '1',
                paddingLeft: '15px',
                borderLeft: '1px solid rgba(255,255,255,0.1)'
              }}>
                {lineData.score}
              </div>
            </div>

            <div 
              style={{ 
                fontSize: '0.92rem', 
                lineHeight: '1.75', 
                color: 'rgba(255, 255, 255, 0.85)', 
                marginBottom: '26px',
                textAlign: 'justify'
              }}
            >
              {(lineData.fullReading || '').split('\n\n').map((paragraph, index) => (
                <p key={index} style={{ marginBottom: '16px' }}>
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Traits Section */}
            {lineData.traits && lineData.traits.length > 0 && (
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '20px' }}>
                <h5 style={{ 
                  fontFamily: "'Cinzel', serif", 
                  fontSize: '0.85rem', 
                  color: '#FFD700', 
                  margin: '0 0 12px 0',
                  letterSpacing: '0.05em' 
                }}>
                  ✦ Key Soul Signatures
                </h5>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {lineData.traits.map((trait, idx) => (
                    <span 
                      key={idx}
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        color: lineStyleColor,
                        background: `${lineStyleColor}10`,
                        border: `1.5px solid ${lineStyleColor}30`,
                        padding: '4px 12px',
                        borderRadius: '100px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        boxShadow: `0 0 6px ${lineStyleColor}0a`
                      }}
                    >
                      {trait}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  );
}
