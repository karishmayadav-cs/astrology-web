import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, Trash2 } from 'lucide-react';
import InteractiveFace from '../visualizations/InteractiveFace';
import ReadingCards from '../visualizations/ReadingCards';
import PersonalityChart from '../visualizations/PersonalityChart';
import LuckyElements from '../visualizations/LuckyElements';
import FutureTimeline from '../visualizations/FutureTimeline';
import ScoreMeter from '../visualizations/ScoreMeter';
import TabsInterface from '../ui/TabsInterface';
import ReadingModal from '../ui/ReadingModal';
import LoadingAnimation from '../ui/LoadingAnimation';
import DownloadButton from '../ui/DownloadButton';
import { getApiUrl } from '../../utils/api';

export default function FaceReadingPage({ userData }) {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  // Tab state inside face page
  const [activeTab, setActiveTab] = useState('overview');
  // Selected zone for modal
  const [selectedZone, setSelectedZone] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('dragover');
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('dragover');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      processFile(file);
    } else {
      setError('Please provide a valid portrait image.');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file) => {
    setError('');
    const reader = new FileReader();
    reader.onload = (evt) => {
      setPreview(evt.target.result);
      setImage(evt.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    setImage(null);
    setPreview('');
    setResult(null);
    setError('');
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(getApiUrl('/api/face-reading'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image, mimeType: 'image/jpeg' })
      });

      if (!response.ok) {
        throw new Error('Analysis request failed. Please check network/server logs.');
      }

      const data = await response.json();
      setResult(data.reading);
      setActiveTab('overview');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to analyze face. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const openZoneDetails = (zoneData) => {
    setSelectedZone(zoneData);
    setIsModalOpen(true);
  };

  return (
    <div className="face-page-container" style={{ width: '100%', margin: '0 auto', paddingBottom: '30px' }}>
      
      {!result && !isLoading && (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card"
          style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', padding: '30px' }}
        >
          <h3 style={{ fontFamily: "'Cinzel', serif", color: '#FFD700', marginBottom: '16px', letterSpacing: '0.05em' }}>
            👤 Face Reading (Physiognomy)
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', lineHeight: '1.6', marginBottom: '24px' }}>
            Upload a clear, front-facing portrait to analyze your facial proportions based on the traditional Mian Xiang and Samudrik Shastra systems.
          </p>

          {/* Drag and Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('face-image-file').click()}
            style={{
              border: '2px dashed rgba(212, 175, 55, 0.3)',
              borderRadius: '16px',
              padding: '40px 20px',
              cursor: 'pointer',
              background: 'rgba(255,255,255,0.01)',
              transition: 'all 0.3s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px'
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = '#FFD700'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.3)'}
          >
            <input
              type="file"
              id="face-image-file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />

            {!preview ? (
              <>
                <Camera size={44} color="#FFD700" style={{ opacity: 0.7 }} />
                <span style={{ fontWeight: '600', color: '#e2e8f0', fontSize: '0.95rem' }}>
                  Click to Select or Drop Portrait Image
                </span>
                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
                  Your photo is processed in-memory and discarded
                </span>
              </>
            ) : (
              <div style={{ position: 'relative', width: '100%', maxWidth: '280px' }}>
                <img
                  src={preview}
                  alt="Face Upload"
                  style={{ width: '100%', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', display: 'block' }}
                />
                <button
                  onClick={(e) => { e.stopPropagation(); handleRemove(); }}
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: 'rgba(255, 75, 75, 0.85)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    padding: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </div>

          {error && (
            <div style={{ color: '#FF6B6B', fontSize: '0.85rem', marginTop: '14px', fontWeight: '500' }}>
              ⚠️ {error}
            </div>
          )}

          {preview && (
            <button
              onClick={handleAnalyze}
              className="btn-cosmic"
              style={{ marginTop: '24px', width: '100%', maxWidth: '280px', padding: '12px 20px', fontSize: '0.95rem' }}
            >
              ✨ Read My Face ✨
            </button>
          )}
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
          id="print-area-face"
        >
          {/* Tabs Menu */}
          <TabsInterface activeTab={activeTab} onTabChange={setActiveTab} isFace={true} />

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
                <ScoreMeter score={result.overallScore} label="Overall Character Alignment" size={160} />
                <div style={{ flex: 1, minWidth: '250px', textAlign: 'left' }}>
                  <span style={{ fontSize: '0.75rem', color: '#FFD700', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: "'Cinzel', serif" }}>
                    ✦ Physiognomy Profile ✦
                  </span>
                  <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: '1.6rem', color: '#fff', margin: '4px 0 10px 0' }}>
                    {result.personalityType}
                  </h3>
                  <p style={{ fontSize: '0.92rem', lineHeight: '1.6', color: 'rgba(255,255,255,0.8)', margin: 0 }}>
                    {result.summary}
                  </p>
                </div>
              </div>

              {/* Strengths & Weaknesses Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                <div className="glass-card" style={{ padding: '24px', borderLeft: '3px solid #4ECDC4' }}>
                  <h4 style={{ fontFamily: "'Cinzel', serif", color: '#4ECDC4', margin: '0 0 14px 0', fontSize: '0.95rem' }}>
                    📈 Character Strengths
                  </h4>
                  <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)', lineHeight: '1.7' }}>
                    {result.strengths && result.strengths.map((str, idx) => <li key={idx}>{str}</li>)}
                  </ul>
                </div>
                <div className="glass-card" style={{ padding: '24px', borderLeft: '3px solid #FF6B6B' }}>
                  <h4 style={{ fontFamily: "'Cinzel', serif", color: '#FF6B6B', margin: '0 0 14px 0', fontSize: '0.95rem' }}>
                    ⚠️ Challenges &amp; Traps
                  </h4>
                  <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)', lineHeight: '1.7' }}>
                    {result.weaknesses && result.weaknesses.map((wk, idx) => <li key={idx}>{wk}</li>)}
                  </ul>
                </div>
              </div>

              {/* Recommendations Card */}
              <div className="glass-card" style={{ padding: '24px', borderLeft: '3px solid #FFD700' }}>
                <h4 style={{ fontFamily: "'Cinzel', serif", color: '#FFD700', margin: '0 0 14px 0', fontSize: '0.95rem' }}>
                  ✨ Recommendations for Growth
                </h4>
                <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '0.9rem', color: 'rgba(255,255,255,0.85)', lineHeight: '1.7' }}>
                  {result.recommendations && result.recommendations.map((rec, idx) => <li key={idx}>{rec}</li>)}
                </ul>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '10px' }}>
                <DownloadButton userData={userData} readingData={result} type="Face" />
                <button 
                  onClick={handleRemove} 
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
                  Analyze Another Portrait
                </button>
              </div>

            </div>
          )}

          {/* Tab 2: Face Zones */}
          {activeTab === 'visual' && (
            <div className="tab-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '30px', alignItems: 'center' }}>
              <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', padding: '20px', borderRadius: '24px', width: '100%', maxWidth: '400px' }}>
                <InteractiveFace zonesData={result.lines} onZoneClick={openZoneDetails} />
              </div>
              <div style={{ width: '100%', maxWidth: '850px' }}>
                <h4 style={{ fontFamily: "'Cinzel', serif", color: '#FFD700', textAlign: 'center', marginBottom: '10px', fontSize: '1rem', letterSpacing: '0.06em' }}>
                  ✦ Select a zone above or click cards below to view detailed readings ✦
                </h4>
                <ReadingCards linesData={result.lines} type="face" onCardClick={openZoneDetails} />
              </div>
            </div>
          )}

          {/* Tab 3: Personality radar */}
          {activeTab === 'personality' && (
            <div className="tab-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px', maxWidth: '750px', margin: '0 auto' }}>
              <h3 style={{ fontFamily: "'Cinzel', serif", color: '#FFD700', textAlign: 'center', margin: '0 0 -10px 0', fontSize: '1.2rem', letterSpacing: '0.05em' }}>
                📊 Aura Attribute Breakdown
              </h3>
              <div style={{ height: '380px', width: '100%' }}>
                <PersonalityChart radarData={result.personalityRadar} />
              </div>
              <div className="glass-card" style={{ padding: '24px', textAlign: 'center' }}>
                <p style={{ fontSize: '0.92rem', color: 'rgba(255,255,255,0.85)', lineHeight: '1.7', margin: 0, fontStyle: 'italic' }}>
                  "Your radial physiognomy scores are mapped based on feature proportions and facial symmetry. Higher indicators signify regions where energy channels flow in alignment with nature."
                </p>
              </div>
            </div>
          )}

          {/* Tab 4: Lucky elements */}
          {activeTab === 'lucky' && (
            <div className="tab-fade-in" style={{ maxWidth: '750px', margin: '0 auto' }}>
              <h3 style={{ fontFamily: "'Cinzel', serif", color: '#FFD700', textAlign: 'center', marginBottom: '20px', fontSize: '1.2rem', letterSpacing: '0.05em' }}>
                🎁 Your Auspicious Elements
              </h3>
              <LuckyElements luckyElements={result.luckyElements} />
              <div className="glass-card" style={{ padding: '24px', marginTop: '20px' }}>
                <h4 style={{ fontFamily: "'Cinzel', serif", color: '#FFD700', margin: '0 0 10px 0', fontSize: '0.9rem', letterSpacing: '0.05em' }}>
                  How to utilize these elements:
                </h4>
                <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.75)', lineHeight: '1.6', margin: 0 }}>
                  Incorporate your lucky colors and gemstones into your daily life. Facing your ideal direction ({result.luckyElements.direction}) during complex decision-making, rituals, or career steps channels positive planetary configurations toward your aura matrix.
                </p>
              </div>
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

      {/* Modal for detail cards */}
      <ReadingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        lineData={selectedZone}
      />
    </div>
  );
}
