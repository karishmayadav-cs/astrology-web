import React from 'react';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';

export default function ReadingCards({ linesData, type = 'palm', onCardClick }) {
  if (!linesData) return null;

  // Metadata mappings for palm lines
  const palmMeta = {
    lifeLine: { name: 'Life Line', iconName: 'Heart', color: '#FF6B6B', desc: 'Vitality, energy, and life path' },
    heartLine: { name: 'Heart Line', iconName: 'Activity', color: '#FF1493', desc: 'Emotions, romance, and relationships' },
    headLine: { name: 'Head Line', iconName: 'Brain', color: '#4ECDC4', desc: 'Intellect, mindset, and wisdom' },
    fateLine: { name: 'Fate Line', iconName: 'Compass', color: '#9B59B6', desc: 'Career, destiny, and major milestones' }
  };

  // Metadata mappings for facial zones
  const faceMeta = {
    forehead: { name: 'Forehead', iconName: 'Sparkles', color: '#4ECDC4', desc: 'Intelligence, luck, and ancestry' },
    eyes: { name: 'Eyes', iconName: 'Eye', color: '#FF1493', desc: 'Emotions, soul depth, and intuition' },
    nose: { name: 'Nose', iconName: 'Coins', color: '#FFD700', desc: 'Wealth, career capacity, and health' },
    lips: { name: 'Lips', iconName: 'MessageSquare', color: '#9B59B6', desc: 'Communication style, love, and relationships' },
    chin: { name: 'Chin', iconName: 'ShieldAlert', color: '#FF6B6B', desc: 'Willpower, longevity, and determination' }
  };

  const meta = type === 'palm' ? palmMeta : faceMeta;

  // Framer Motion animation configuration
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 80 } }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="reading-cards-grid"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '20px',
        width: '100%',
        margin: '20px 0'
      }}
    >
      {Object.entries(linesData).map(([key, data]) => {
        const itemMeta = meta[key];
        if (!itemMeta) return null;

        // Retrieve Lucide Icon dynamically
        const IconComponent = Icons[itemMeta.iconName] || Icons.HelpCircle;

        return (
          <motion.div
            key={key}
            variants={cardVariants}
            whileHover={{ scale: 1.05, y: -5 }}
            className="glass-card reading-card"
            style={{
              background: `linear-gradient(135deg, rgba(28, 18, 60, 0.6) 0%, rgba(12, 7, 33, 0.85) 100%)`,
              border: `1px solid rgba(255, 255, 255, 0.05)`,
              borderTop: `2px solid ${itemMeta.color}`,
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
              backdropFilter: 'blur(10px)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
              position: 'relative',
              overflow: 'hidden'
            }}
            onClick={() => onCardClick({
              key,
              name: itemMeta.name,
              icon: itemMeta.iconName,
              color: itemMeta.color,
              ...data
            })}
          >
            {/* Ambient background glow matching line color */}
            <div 
              style={{
                position: 'absolute',
                top: '-30px',
                right: '-30px',
                width: '100px',
                height: '100px',
                background: `radial-gradient(circle, ${itemMeta.color}15 0%, transparent 70%)`,
                borderRadius: '50%',
                pointerEvents: 'none'
              }}
            />

            <div>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ 
                    background: `${itemMeta.color}15`, 
                    padding: '8px', 
                    borderRadius: '10px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    border: `1.5px solid ${itemMeta.color}33`
                  }}>
                    <IconComponent size={20} color={itemMeta.color} />
                  </div>
                  <h4 style={{ 
                    fontFamily: "'Cinzel', serif", 
                    fontSize: '1.05rem', 
                    color: '#fff', 
                    margin: 0,
                    letterSpacing: '0.05em' 
                  }}>
                    {itemMeta.name}
                  </h4>
                </div>
                
                {/* Score */}
                <div style={{ 
                  fontFamily: "'Cinzel', serif", 
                  fontSize: '1rem', 
                  fontWeight: 'bold', 
                  color: itemMeta.color 
                }}>
                  {data.score}%
                </div>
              </div>

              {/* Description */}
              <p style={{ 
                fontSize: '0.75rem', 
                color: 'rgba(255, 255, 255, 0.4)', 
                margin: '-8px 0 12px 0',
                fontStyle: 'italic'
              }}>
                {itemMeta.desc}
              </p>

              {/* Progress Bar */}
              <div style={{ 
                background: 'rgba(255,255,255,0.05)', 
                height: '6px', 
                borderRadius: '3px', 
                overflow: 'hidden', 
                marginBottom: '16px' 
              }}>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${data.score}%` }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                  style={{ 
                    background: itemMeta.color, 
                    height: '100%', 
                    borderRadius: '3px',
                    boxShadow: `0 0 8px ${itemMeta.color}80`
                  }}
                />
              </div>

              {/* Summary */}
              <p style={{ 
                fontSize: '0.85rem', 
                lineHeight: '1.5', 
                color: 'rgba(255, 255, 255, 0.8)', 
                marginBottom: '18px',
                minHeight: '40px',
                display: '-webkit-box',
                WebkitLineClamp: '2',
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {data.shortDescription}
              </p>
            </div>

            <div>
              {/* Badges */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '18px' }}>
                {data.traits && data.traits.slice(0, 3).map((trait, index) => (
                  <span 
                    key={index} 
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: '500',
                      background: `rgba(255, 255, 255, 0.03)`,
                      border: `1px solid rgba(255, 255, 255, 0.08)`,
                      color: 'rgba(255, 255, 255, 0.7)',
                      padding: '3px 8px',
                      borderRadius: '100px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.03em'
                    }}
                  >
                    {trait}
                  </span>
                ))}
              </div>

              {/* CTA Button */}
              <button 
                className="btn-cosmic-card"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  background: 'transparent',
                  border: `1.5px solid ${itemMeta.color}50`,
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontFamily: "'Cinzel', serif",
                  letterSpacing: '0.05em'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = itemMeta.color;
                  e.target.style.borderColor = itemMeta.color;
                  e.target.style.boxShadow = `0 0 12px ${itemMeta.color}50`;
                  e.target.style.color = '#000';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.borderColor = `${itemMeta.color}50`;
                  e.target.style.boxShadow = 'none';
                  e.target.style.color = '#fff';
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onCardClick({
                    key,
                    name: itemMeta.name,
                    icon: itemMeta.iconName,
                    color: itemMeta.color,
                    ...data
                  });
                }}
              >
                Read Full Reading ✦
              </button>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
