import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Lottie from 'lottie-react';

export default function LoadingAnimation({ lottieData }) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(5);

  const mysticalMessages = [
    'Reading the cosmic energies...',
    'Consulting the stars and ascendants...',
    'Analyzing your unique aura...',
    'Tracing life paths and destiny lines...',
    'Aligning planetary transits and houses...',
    'Decrypting karmic patterns...',
    'Serving wisdom from the cosmic oracle...'
  ];

  // Cycle messages
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prevIndex) => (prevIndex + 1) % mysticalMessages.length);
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  // Simulate progress bar incrementing
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 95) {
          clearInterval(interval);
          return 95; // Hold at 95% until complete
        }
        // Increment by small random amounts
        return prevProgress + Math.floor(Math.random() * 8) + 2;
      });
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '50px 20px',
        textAlign: 'center',
        minHeight: '400px'
      }}
    >
      {/* Crystal Ball Visual Section */}
      <div style={{ position: 'relative', width: '180px', height: '180px', marginBottom: '30px' }}>
        {/* Layered glowing filters */}
        <div 
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '130px',
            height: '130px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(155, 89, 182, 0.4) 0%, rgba(78, 205, 196, 0.2) 50%, transparent 70%)',
            filter: 'blur(20px)',
            animation: 'pulse 3s infinite alternate',
            zIndex: 0
          }}
        />

        {lottieData ? (
          <Lottie 
            animationData={lottieData} 
            loop={true} 
            style={{ width: '100%', height: '100%', position: 'relative', zIndex: 1 }} 
          />
        ) : (
          /* Mystical CSS/SVG Crystal Ball Fallback */
          <svg 
            viewBox="0 0 100 100" 
            style={{ width: '100%', height: '100%', position: 'relative', zIndex: 1 }}
          >
            {/* Crystal Ball Outer Edge */}
            <circle cx="50" cy="45" r="32" fill="none" stroke="#FFD700" strokeWidth="1" opacity="0.3" />
            
            {/* Crystal Ball Body */}
            <circle 
              cx="50" 
              cy="45" 
              r="30" 
              fill="url(#crystalGrad)" 
              filter="drop-shadow(0 0 8px #9B59B6)"
              style={{ animation: 'spinBall 8s linear infinite' }} 
            />
            
            {/* Inner Sparkles & Nebulous swirls */}
            <path d="M 35 45 Q 50 30, 65 45" fill="none" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1.5" strokeDasharray="3 3" />
            <path d="M 30 38 Q 50 60, 70 38" fill="none" stroke="rgba(78, 205, 196, 0.2)" strokeWidth="2" />
            <circle cx="45" cy="35" r="1.5" fill="#fff" opacity="0.8" />
            <circle cx="58" cy="50" r="1" fill="#fff" opacity="0.6" />
            <circle cx="38" cy="48" r="2" fill="#FFD700" opacity="0.5" />
            
            {/* Crystal Ball Stand */}
            <path 
              d="M 32 78 L 68 78 C 65 72, 60 70, 50 70 C 40 70, 35 72, 32 78 Z" 
              fill="url(#standGrad)" 
              stroke="#d4af37" 
              strokeWidth="1.5" 
            />
            
            <defs>
              <radialGradient id="crystalGrad" cx="30%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
                <stop offset="30%" stopColor="#a29bfe" stopOpacity="0.2" />
                <stop offset="70%" stopColor="#6c5ce7" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#1e134a" stopOpacity="0.95" />
              </radialGradient>
              <linearGradient id="standGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#2c1a4d" />
                <stop offset="100%" stopColor="#0a0518" />
              </linearGradient>
            </defs>
          </svg>
        )}
      </div>

      {/* Rotating Mystical Message */}
      <div style={{ height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
        <AnimatePresence mode="wait">
          <motion.p
            key={messageIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: '1rem',
              color: '#FFD700', // Gold
              letterSpacing: '0.06em',
              margin: 0,
              textShadow: '0 0 8px rgba(255, 215, 0, 0.3)'
            }}
          >
            {mysticalMessages[messageIndex]}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Progress Bar Container */}
      <div style={{ width: '100%', maxWidth: '320px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginBottom: '8px', fontFamily: "'Raleway', sans-serif" }}>
          <span>CALCULATING MATRIX</span>
          <span>{progress}%</span>
        </div>
        
        <div 
          style={{ 
            background: 'rgba(255, 255, 255, 0.03)', 
            height: '6px', 
            borderRadius: '3px', 
            overflow: 'hidden',
            border: '1.5px solid rgba(255,255,255,0.05)'
          }}
        >
          <motion.div 
            animate={{ width: `${progress}%` }}
            transition={{ ease: 'easeInOut' }}
            style={{ 
              background: 'linear-gradient(to right, #4ECDC4, #FF1493)', 
              height: '100%', 
              borderRadius: '3px',
              boxShadow: '0 0 10px rgba(78, 205, 196, 0.6)'
            }}
          />
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes pulse {
          0% { transform: translate(-50%, -50%) scale(0.9); opacity: 0.5; }
          100% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.9; }
        }
        @keyframes spinBall {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
