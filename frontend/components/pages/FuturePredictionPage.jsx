import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Calendar, Compass, ShieldAlert, Sparkles, AlertTriangle } from 'lucide-react';
import FutureTimeline from '../visualizations/FutureTimeline';
import PersonalityChart from '../visualizations/PersonalityChart';
import LuckyElements from '../visualizations/LuckyElements';
import ScoreMeter from '../visualizations/ScoreMeter';
import TabsInterface from '../ui/TabsInterface';
import ReadingModal from '../ui/ReadingModal';
import LoadingAnimation from '../ui/LoadingAnimation';
import DownloadButton from '../ui/DownloadButton';

export default function FuturePredictionPage({ userData }) {
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  // Tab state inside future predictions page
  const [activeTab, setActiveTab] = useState('overview');
  // Selected category for modal details
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handlePredict = async (e) => {
    e.preventDefault();
    if (!userData) {
      setError('Please submit your birth profile first in the Planets & Houses section.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('/api/future-prediction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: userData.name,
          dob: userData.dob,
          tob: userData.tob,
          pob: userData.pob,
          gender: userData.gender || 'male',
          question: question.trim()
        })
      });

      if (!response.ok) {
        throw new Error('Predictions retrieval failed. Check server logs.');
      }

      const data = await response.json();
      setResult(data.prediction);
      setActiveTab('overview');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to connect to oracle. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setQuestion('');
    setError('');
  };

  const openCategoryDetails = (key, data) => {
    setSelectedCategory({
      name: data.title,
      icon: key === 'career' ? 'Compass' : key === 'love' ? 'Heart' : key === 'health' ? 'Activity' : key === 'finance' ? 'Coins' : 'Sparkles',
      color: data.color || '#FFD700',
      score: data.score || 80,
      fullReading: data.prediction,
      traits: key === 'career' ? ['Ambitious', 'Leader'] : key === 'love' ? ['Romantic', 'Harmonious'] : key === 'health' ? ['Vital', 'Balanced'] : key === 'finance' ? ['Prosperous', 'Stable'] : ['Mindful', 'Intuitive']
    });
    setIsModalOpen(true);
  };

  return (
    <div className="future-page-container" style={{ width: '100%', margin: '0 auto', paddingBottom: '30px' }}>
      
      {!result && !isLoading && (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card"
          style={{ maxWidth: '600px', margin: '0 auto', padding: '30px' }}
        >
          <h3 style={{ fontFamily: "'Cinzel', serif", color: '#FFD700', marginBottom: '16px', letterSpacing: '0.05em', textAlign: 'center' }}>
            🔮 Future Prediction Oracle
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', lineHeight: '1.6', marginBottom: '24px', textAlign: 'center' }}>
            Consult the Groq-powered Vedic and Western Oracle. Ask a specific question about your future or request general life guidance.
          </p>

          <form onSubmit={handlePredict} style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div className="form-group form-full" style={{ width: '100%' }}>
              <label className="form-label" htmlFor="future-question" style={{ marginBottom: '8px', color: '#FFD700' }}>
                💬 State Your Question or Focus Area (Optional)
              </label>
              <textarea
                id="future-question"
                className="form-input"
                style={{ 
                  height: '110px', 
                  resize: 'vertical', 
                  padding: '12px',
                  background: 'rgba(0,0,0,0.2)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px',
                  color: '#fff',
                  width: '100%',
                  outline: 'none',
                  fontSize: '0.9rem',
                  lineHeight: '1.5'
                }}
                placeholder="e.g., What does my career look like in the next 12 months? Will I find stability in my relationships? Or leave blank for general guidance."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
            </div>

            {error && (
              <div style={{ color: '#FF6B6B', fontSize: '0.85rem', fontWeight: '500' }}>
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              className="btn-cosmic"
              style={{ width: '100%', maxWidth: '320px', padding: '12px 20px', fontSize: '0.95rem' }}
            >
              ✨ Generate Future Predictions ✨
            </button>
          </form>
        </motion.div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="glass-card" style={{ maxWidth: '600px', margin: '0 auto', padding: '40px' }}>
          <LoadingAnimation />
        </div>
      )}

      {/* Structured Result Display */}
      {result && !isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          id="print-area-future"
        >
          {/* Tabs Menu */}
          <TabsInterface activeTab={activeTab} onTabChange={setActiveTab} isFace={false} />

          {/* Tab 1: Overview */}
          {activeTab === 'overview' && (
            <div className="tab-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px', maxWidth: '750px', margin: '0 auto' }}>
              
              <div 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'row', 
                  alignItems: 'center', 
                  justifyContent: 'space-around', 
                  flexWrap: 'wrap',
                  gap: '20px',
                  background: 'rgba(255,255,255,0.01)',
                  border: '1px solid rgba(255,255,255,0.04)',
                  padding: '30px',
                  borderRadius: '24px'
                }}
              >
                <ScoreMeter score={result.overallScore} label="Overall Destiny Potential" size={160} />
                <div style={{ flex: 1, minWidth: '250px', textAlign: 'left' }}>
                  <span style={{ fontSize: '0.75rem', color: '#FFD700', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: "'Cinzel', serif" }}>
                    ✦ Oracle Reading Profile ✦
                  </span>
                  <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: '1.6rem', color: '#fff', margin: '4px 0 10px 0' }}>
                    {result.personalityType}
                  </h3>
                  <p style={{ fontSize: '0.92rem', lineHeight: '1.6', color: 'rgba(255,255,255,0.8)', margin: 0 }}>
                    {result.summary}
                  </p>
                </div>
              </div>

              {/* Sun & Moon sign analysis */}
              {result.sunMoonSign && (
                <div className="glass-card" style={{ padding: '24px', borderLeft: '3px solid #9B59B6' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <Sparkles size={20} color="#9B59B6" />
                    <h4 style={{ fontFamily: "'Cinzel', serif", color: '#ffffff', margin: 0, fontSize: '1.05rem', letterSpacing: '0.04em' }}>
                      Sun in {result.sunMoonSign.sunSign} &amp; Moon in {result.sunMoonSign.moonSign}
                    </h4>
                  </div>
                  <p style={{ fontSize: '0.9rem', lineHeight: '1.6', color: 'rgba(255, 255, 255, 0.8)', margin: 0 }}>
                    {result.sunMoonSign.analysis}
                  </p>
                </div>
              )}

              {/* Current life phase */}
              <div className="glass-card" style={{ padding: '24px', borderLeft: '3px solid #4ECDC4' }}>
                <h4 style={{ fontFamily: "'Cinzel', serif", color: '#4ECDC4', margin: '0 0 10px 0', fontSize: '0.95rem', letterSpacing: '0.04em' }}>
                  ⏳ Current Astrological Life Phase
                </h4>
                <p style={{ fontSize: '0.9rem', lineHeight: '1.6', color: 'rgba(255, 255, 255, 0.85)', margin: 0 }}>
                  {result.currentLifePhase}
                </p>
              </div>

              {/* Strengths & Weaknesses Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                <div className="glass-card" style={{ padding: '24px', borderLeft: '3px solid #4ECDC4' }}>
                  <h4 style={{ fontFamily: "'Cinzel', serif", color: '#4ECDC4', margin: '0 0 14px 0', fontSize: '0.95rem' }}>
                    📈 Personal Strengths
                  </h4>
                  <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)', lineHeight: '1.7' }}>
                    {result.strengths && result.strengths.map((str, idx) => <li key={idx}>{str}</li>)}
                  </ul>
                </div>
                <div className="glass-card" style={{ padding: '24px', borderLeft: '3px solid #FF6B6B' }}>
                  <h4 style={{ fontFamily: "'Cinzel', serif", color: '#FF6B6B', margin: '0 0 14px 0', fontSize: '0.95rem' }}>
                    ⚠️ Potential Traps &amp; Shadows
                  </h4>
                  <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)', lineHeight: '1.7' }}>
                    {result.weaknesses && result.weaknesses.map((wk, idx) => <li key={idx}>{wk}</li>)}
                  </ul>
                </div>
              </div>

              {/* Warnings and Best Months */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                <div className="glass-card" style={{ padding: '24px', borderLeft: '3px solid #FFD700' }}>
                  <h4 style={{ fontFamily: "'Cinzel', serif", color: '#FFD700', margin: '0 0 10px 0', fontSize: '0.95rem', letterSpacing: '0.04em' }}>
                    🏆 Peak Energy Months
                  </h4>
                  <p style={{ fontSize: '0.9rem', lineHeight: '1.6', color: 'rgba(255, 255, 255, 0.85)', margin: 0 }}>
                    Your high vibration months: <strong>{result.bestMonths && result.bestMonths.join(', ')}</strong>. Plan key ventures, career adjustments, and agreements during these months.
                  </p>
                </div>
                <div className="glass-card" style={{ padding: '24px', borderLeft: '3px solid #FF6B6B' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <AlertTriangle size={18} color="#FF6B6B" />
                    <h4 style={{ fontFamily: "'Cinzel', serif", color: '#FF6B6B', margin: 0, fontSize: '0.95rem', letterSpacing: '0.04em' }}>
                      Astrological Warnings
                    </h4>
                  </div>
                  <p style={{ fontSize: '0.9rem', lineHeight: '1.6', color: 'rgba(255, 255, 255, 0.85)', margin: 0 }}>
                    {result.warnings}
                  </p>
                </div>
              </div>

              {/* Recommendations Card */}
              <div className="glass-card" style={{ padding: '24px', borderLeft: '3px solid #FFD700' }}>
                <h4 style={{ fontFamily: "'Cinzel', serif", color: '#FFD700', margin: '0 0 14px 0', fontSize: '0.95rem' }}>
                  ✨ Recommendations for the Year Ahead
                </h4>
                <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '0.9rem', color: 'rgba(255,255,255,0.85)', lineHeight: '1.7' }}>
                  {result.recommendations && result.recommendations.map((rec, idx) => <li key={idx}>{rec}</li>)}
                </ul>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '10px' }}>
                <DownloadButton userData={userData} readingData={result} type="Future" />
                <button 
                  onClick={handleReset} 
                  className="btn-cosmic" 
                  style={{ 
                    padding: '12px 28px', 
                    background: 'rgba(255, 64, 129, 0.1)', 
                    border: '1px solid rgba(255, 64, 129, 0.4)', 
                    color: '#fff',
                    fontFamily: "'Cinzel', serif",
                    fontSize: '0.88rem',
                    letterSpacing: '0.08em',
                    boxShadow: 'none',
                    marginTop: '20px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 64, 129, 0.2)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 64, 129, 0.1)'}
                >
                  Ask Another Question
                </button>
              </div>

            </div>
          )}

          {/* Tab 2: Visual (Life Categories Grid) */}
          {activeTab === 'visual' && (
            <div className="tab-fade-in" style={{ maxWidth: '850px', margin: '0 auto' }}>
              <h3 style={{ fontFamily: "'Cinzel', serif", color: '#FFD700', textAlign: 'center', marginBottom: '10px', fontSize: '1.2rem', letterSpacing: '0.05em' }}>
                💼 Life Category Analysis
              </h3>
              <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginBottom: '24px' }}>
                Click on any category card below to expand and read full mystical forecasting details.
              </p>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '20px',
                width: '100%'
              }}>
                {Object.entries(result.categories).map(([key, data]) => {
                  return (
                    <motion.div
                      key={key}
                      whileHover={{ scale: 1.05, y: -4 }}
                      onClick={() => openCategoryDetails(key, data)}
                      className="glass-card"
                      style={{
                        padding: '24px',
                        cursor: 'pointer',
                        borderTop: `3px solid ${data.color || '#FFD700'}`,
                        background: 'linear-gradient(135deg, rgba(22, 16, 48, 0.7) 0%, rgba(8, 5, 25, 0.95) 100%)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        minHeight: '200px'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <h4 style={{ fontFamily: "'Cinzel', serif", color: '#fff', fontSize: '1.05rem', margin: 0 }}>
                            {data.title}
                          </h4>
                          <span style={{ fontSize: '1.1rem', color: data.color }}>{data.score}%</span>
                        </div>
                        
                        <p style={{ 
                          fontSize: '0.85rem', 
                          lineHeight: '1.5', 
                          color: 'rgba(255,255,255,0.75)',
                          display: '-webkit-box',
                          WebkitLineClamp: '3',
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {data.prediction}
                        </p>
                      </div>

                      <button
                        style={{
                          background: 'none',
                          border: 'none',
                          color: data.color || '#FFD700',
                          fontSize: '0.78rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          padding: '6px 0 0 0',
                          textAlign: 'left',
                          fontFamily: "'Cinzel', serif"
                        }}
                      >
                        Read Detailed Analysis ✦
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 3: Personality Radar */}
          {activeTab === 'personality' && (
            <div className="tab-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px', maxWidth: '750px', margin: '0 auto' }}>
              <h3 style={{ fontFamily: "'Cinzel', serif", color: '#FFD700', textAlign: 'center', margin: '0 0 -10px 0', fontSize: '1.2rem', letterSpacing: '0.05em' }}>
                📊 Aura Attribute Breakdown
              </h3>
              <div style={{ height: '380px', width: '100%' }}>
                <PersonalityChart radarData={result.personalityRadar} />
              </div>
            </div>
          )}

          {/* Tab 4: Lucky Elements */}
          {activeTab === 'lucky' && (
            <div className="tab-fade-in" style={{ maxWidth: '750px', margin: '0 auto' }}>
              <h3 style={{ fontFamily: "'Cinzel', serif", color: '#FFD700', textAlign: 'center', marginBottom: '20px', fontSize: '1.2rem', letterSpacing: '0.05em' }}>
                🎁 Auspicious Alignments
              </h3>
              <LuckyElements luckyElements={result.luckyElements} />
            </div>
          )}

          {/* Tab 5: Future Predictions Timeline */}
          {activeTab === 'future' && (
            <div className="tab-fade-in" style={{ maxWidth: '850px', margin: '0 auto' }}>
              <h3 style={{ fontFamily: "'Cinzel', serif", color: '#FFD700', textAlign: 'center', marginBottom: '10px', fontSize: '1.2rem', letterSpacing: '0.05em' }}>
                🔮 Tracing the Timelines
              </h3>
              <FutureTimeline timelineData={result.futurePredictions} />
            </div>
          )}

        </motion.div>
      )}

      {/* Modal for detailed categories */}
      <ReadingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        lineData={selectedCategory}
      />
    </div>
  );
}
