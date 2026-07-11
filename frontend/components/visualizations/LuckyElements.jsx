import React from 'react';
import { motion } from 'framer-motion';
import { Hash, Palette, Gem, Calendar, Compass } from 'lucide-react';

export default function LuckyElements({ luckyElements }) {
  // Safe fallbacks
  const data = luckyElements || {
    numbers: [3, 6, 9],
    colors: ['Gold', 'Indigo'],
    days: ['Thursday', 'Friday'],
    stones: ['Yellow Sapphire', 'Diamond'],
    direction: 'North-East'
  };

  const cards = [
    {
      label: 'Lucky Numbers',
      value: Array.isArray(data.numbers) ? data.numbers.join(', ') : data.numbers,
      icon: Hash,
      color: '#9B59B6', // Purple
      bgGrad: 'linear-gradient(135deg, rgba(155, 89, 182, 0.15) 0%, rgba(155, 89, 182, 0.02) 100%)'
    },
    {
      label: 'Lucky Colors',
      value: Array.isArray(data.colors) ? data.colors.join(', ') : data.colors,
      icon: Palette,
      color: '#4ECDC4', // Teal/Green
      bgGrad: 'linear-gradient(135deg, rgba(78, 205, 196, 0.15) 0%, rgba(78, 205, 196, 0.02) 100%)'
    },
    {
      label: 'Auspicious Days',
      value: Array.isArray(data.days) ? data.days.join(', ') : data.days,
      icon: Calendar,
      color: '#FF1493', // Pink
      bgGrad: 'linear-gradient(135deg, rgba(255, 20, 147, 0.15) 0%, rgba(255, 20, 147, 0.02) 100%)'
    },
    {
      label: 'Lucky Stones',
      value: Array.isArray(data.stones) ? data.stones.join(', ') : data.stones,
      icon: Gem,
      color: '#FFD700', // Gold
      bgGrad: 'linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 215, 0, 0.02) 100%)'
    },
    {
      label: 'Ideal Direction',
      value: data.direction || 'East',
      icon: Compass,
      color: '#FF6B6B', // Red-Orange
      bgGrad: 'linear-gradient(135deg, rgba(255, 107, 107, 0.15) 0%, rgba(255, 107, 107, 0.02) 100%)'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { scale: 0.9, opacity: 0 },
    show: { scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="lucky-elements-grid"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '16px',
        width: '100%',
        margin: '20px 0'
      }}
    >
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={index}
            variants={cardVariants}
            whileHover={{ scale: 1.06, y: -4 }}
            className="glass-card lucky-element-card"
            style={{
              background: `linear-gradient(135deg, rgba(22, 16, 48, 0.7) 0%, rgba(8, 5, 25, 0.9) 100%)`,
              border: '1px solid rgba(255, 255, 255, 0.04)',
              borderBottom: `3px solid ${card.color}`,
              borderRadius: '16px',
              padding: '20px',
              textAlign: 'center',
              boxShadow: '0 4px 24px rgba(0, 0, 0, 0.25)',
              backdropFilter: 'blur(8px)',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            {/* Soft inner glow gradient */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: card.bgGrad,
                pointerEvents: 'none',
                opacity: 0.5,
                zIndex: 0
              }}
            />

            <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {/* Animated Icon Container */}
              <div
                style={{
                  background: `${card.color}15`,
                  border: `1.5px solid ${card.color}30`,
                  borderRadius: '50%',
                  padding: '12px',
                  marginBottom: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 0 10px ${card.color}1a`
                }}
              >
                <Icon size={24} color={card.color} />
              </div>

              {/* Value */}
              <h5
                style={{
                  fontSize: '1.05rem',
                  fontWeight: '700',
                  color: '#ffffff',
                  margin: '0 0 6px 0',
                  lineHeight: '1.3',
                  textShadow: `0 0 6px ${card.color}20`
                }}
              >
                {card.value}
              </h5>

              {/* Label */}
              <span
                style={{
                  fontSize: '0.75rem',
                  color: 'rgba(255, 255, 255, 0.45)',
                  textTransform: 'uppercase',
                  fontWeight: '600',
                  letterSpacing: '0.08em',
                  fontFamily: "'Cinzel', serif"
                }}
              >
                {card.label}
              </span>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
