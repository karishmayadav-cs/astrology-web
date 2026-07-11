import React from 'react';
import { Radar } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js';

// Register Chart.js components required for Radar charts
ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

export default function PersonalityChart({ radarData }) {
  // Fallback data if none provided
  const dataValues = radarData
    ? [
        radarData.intelligence ?? 80,
        radarData.love ?? 80,
        radarData.career ?? 80,
        radarData.health ?? 80,
        radarData.wealth ?? 80,
        radarData.spirituality ?? 80
      ]
    : [80, 85, 75, 90, 70, 85];

  const data = {
    labels: ['Intelligence 🧠', 'Love 💞', 'Career 💼', 'Health 🌿', 'Wealth 💵', 'Spirituality 🕉️'],
    datasets: [
      {
        label: 'Aura Alignment',
        data: dataValues,
        backgroundColor: 'rgba(212, 175, 55, 0.2)', // Semi-transparent gold
        borderColor: '#FFD700', // Solid Gold
        borderWidth: 2,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#FFD700',
        pointHoverBackgroundColor: '#FFD700',
        pointHoverBorderColor: '#ffffff',
        pointRadius: 4,
        pointHoverRadius: 6,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false // Hide default dataset legend
      },
      tooltip: {
        backgroundColor: 'rgba(15, 10, 35, 0.95)',
        titleColor: '#FFD700',
        titleFont: {
          family: "'Cinzel', serif",
          size: 13
        },
        bodyColor: '#e2e8f0',
        bodyFont: {
          family: "'Raleway', sans-serif",
          size: 12
        },
        borderColor: 'rgba(212, 175, 55, 0.3)',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: (context) => `Alignment: ${context.parsed.y}%`
        }
      }
    },
    scales: {
      r: {
        min: 0,
        max: 100,
        ticks: {
          stepSize: 20,
          display: false, // Hide tick numbers for a cleaner look
        },
        grid: {
          color: 'rgba(78, 205, 196, 0.15)', // Light teal grid
          lineWidth: 1
        },
        angleLines: {
          color: 'rgba(212, 175, 55, 0.15)', // Light gold spokes
          lineWidth: 1
        },
        pointLabels: {
          color: '#e2e8f0',
          font: {
            family: "'Raleway', sans-serif",
            size: 11,
            weight: '600'
          },
          padding: 8
        }
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="glass-card chart-container-card"
      style={{
        background: 'linear-gradient(135deg, rgba(20, 15, 45, 0.5) 0%, rgba(8, 5, 25, 0.8) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '20px',
        padding: '24px',
        width: '100%',
        height: '350px',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(10px)',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}
    >
      {/* Decorative ambient corner glow */}
      <div 
        style={{
          position: 'absolute',
          bottom: '-40px',
          left: '-40px',
          width: '120px',
          height: '120px',
          background: 'radial-gradient(circle, rgba(78, 205, 196, 0.12) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none'
        }}
      />
      <div 
        style={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          width: '120px',
          height: '120px',
          background: 'radial-gradient(circle, rgba(212, 175, 55, 0.08) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none'
        }}
      />

      <div style={{ width: '100%', height: '100%', position: 'relative', zIndex: 1 }}>
        <Radar data={data} options={options} />
      </div>
    </motion.div>
  );
}
