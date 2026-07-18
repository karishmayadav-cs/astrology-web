import React, { useState, useEffect, useRef, Component } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PalmReadingPage from './components/pages/PalmReadingPage';
import FaceReadingPage from './components/pages/FaceReadingPage';
import FuturePredictionPage from './components/pages/FuturePredictionPage';

// ErrorBoundary catches any React render crash and shows a friendly message
class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, info) { console.error('CosmicSoul render error:', error, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '32px', textAlign: 'center', color: '#f0c040', fontFamily: "'Cinzel',serif" }}>
          <h3>⚠️ Display Error</h3>
          <p style={{ color: '#aaa', fontSize: '0.9rem', marginTop: '8px' }}>{this.state.error?.message}</p>
          <button onClick={() => this.setState({ hasError: false, error: null })} style={{ marginTop: '16px', padding: '8px 20px', background: 'rgba(240,192,64,0.15)', border: '1px solid #f0c040', borderRadius: '8px', color: '#f0c040', cursor: 'pointer' }}>Try Again</button>
        </div>
      );
    }
    return this.props.children;
  }
}



const RASHIS = [
  { name: 'Mesha (Aries)', symbol: '♈', lord: 'Mars', element: 'Fire' },
  { name: 'Vrishabha (Taurus)', symbol: '♉', lord: 'Venus', element: 'Earth' },
  { name: 'Mithuna (Gemini)', symbol: '♊', lord: 'Mercury', element: 'Air' },
  { name: 'Karka (Cancer)', symbol: '♋', lord: 'Moon', element: 'Water' },
  { name: 'Simha (Leo)', symbol: '♌', lord: 'Sun', element: 'Fire' },
  { name: 'Kanya (Virgo)', symbol: '♍', lord: 'Mercury', element: 'Earth' },
  { name: 'Tula (Libra)', symbol: '♎', lord: 'Venus', element: 'Air' },
  { name: 'Vrischika (Scorpio)', symbol: '♏', lord: 'Mars', element: 'Water' },
  { name: 'Dhanu (Sagittarius)', symbol: '♐', lord: 'Jupiter', element: 'Fire' },
  { name: 'Makara (Capricorn)', symbol: '♑', lord: 'Saturn', element: 'Earth' },
  { name: 'Kumbha (Aquarius)', symbol: '♒', lord: 'Saturn', element: 'Air' },
  { name: 'Meena (Pisces)', symbol: '♓', lord: 'Jupiter', element: 'Water' }
];

const PLANETS = [
  { name: 'Sun', symbol: '☉', abbr: 'Su', icon: '🌞', color: '#FFB300' },
  { name: 'Moon', symbol: '☽', abbr: 'Mo', icon: '🌙', color: '#E0E0E0' },
  { name: 'Mars', symbol: '♂', abbr: 'Ma', icon: '🔴', color: '#FF5722' },
  { name: 'Mercury', symbol: '☿', abbr: 'Me', icon: '💚', color: '#4CAF50' },
  { name: 'Jupiter', symbol: '♃', abbr: 'Ju', icon: '🟡', color: '#FF9800' },
  { name: 'Venus',   symbol: '♀', abbr: 'Ve', icon: '💗', color: '#E91E63' },
  { name: 'Saturn',  symbol: '♄', abbr: 'Sa', icon: '🪐', color: '#607D8B' },
  { name: 'Rahu',    symbol: '☊', abbr: 'Ra', icon: '🌑', color: '#9C27B0' },
  { name: 'Ketu',    symbol: '☋', abbr: 'Ke', icon: '🌀', color: '#795548' }
];

const MULANK_DATA = [
  {},
  { title: 'The Sun — Surya' },
  { title: 'The Moon — Chandra' },
  { title: 'Jupiter — Guru' },
  { title: 'Rahu — The Innovator' },
  { title: 'Mercury — Budha' },
  { title: 'Venus — Shukra' },
  { title: 'Ketu — The Mystic' },
  { title: 'Saturn — Shani' },
  { title: 'Mars — Mangal' }
];

export default function App() {
  // Optimized Starfield Canvas Background Animation
  useEffect(() => {
    const canvas = document.getElementById('cosmos-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    let W = window.innerWidth;
    let H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    let bgGradient = null;
    function initBg() {
      bgGradient = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * 0.8);
      bgGradient.addColorStop(0, '#06040f');
      bgGradient.addColorStop(0.5, '#03020a');
      bgGradient.addColorStop(1, '#000005');
    }
    initBg();

    let stars = [];
    let shooters = [];

    function Star() {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.r = Math.random() * 1.6 + 0.2;
      this.speed = Math.random() * 0.6 + 0.1;
      this.brightness = Math.random();
      this.maxBrightness = Math.random() * 0.8 + 0.2;
      this.minBrightness = Math.random() * 0.1;
      this.direction = Math.random() > 0.5 ? 1 : -1;
      this.hue = Math.random() < 0.1 ? Math.random() * 60 + 180 : 0;
    }

    const count = Math.min(280, Math.max(120, Math.floor((W * H) / 5000)));
    for (let i = 0; i < count; i++) stars.push(new Star());

    function spawnShooter() {
      shooters.push({
        x: Math.random() * W,
        y: Math.random() * H * 0.5,
        vx: (Math.random() * 6 + 3) * (Math.random() > 0.5 ? 1 : -1),
        vy: Math.random() * 3 + 1.5,
        len: Math.random() * 120 + 80,
        life: 1,
        decay: Math.random() * 0.025 + 0.015,
        color: `hsl(${Math.random() * 60 + 40}, 100%, 80%)`
      });
    }

    let animationId;
    let lastTime = 0;
    const targetInterval = 1000 / 35; // ~35 FPS target for smooth visual effect with low GPU overhead

    function drawStars(ts) {
      animationId = requestAnimationFrame(drawStars);
      if (ts - lastTime < targetInterval) return;
      lastTime = ts;

      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, W, H);

      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        s.brightness += s.speed * s.direction * 0.025;
        if (s.brightness >= s.maxBrightness) { s.brightness = s.maxBrightness; s.direction = -1; }
        if (s.brightness <= s.minBrightness) { s.brightness = s.minBrightness; s.direction = 1; }

        const sparkle = Math.sin((ts || 0) / 180 + s.x) * 0.22;
        const a = Math.max(0, Math.min(1, s.brightness + sparkle));

        ctx.fillStyle = s.hue ? `hsla(${s.hue}, 80%, 80%, ${a})` : `rgba(220, 230, 255, ${a})`;

        if (s.r > 1.2 && a > 0.4) {
          ctx.strokeStyle = s.hue ? `hsla(${s.hue}, 80%, 80%, ${a * 0.6})` : `rgba(220, 230, 255, ${a * 0.6})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(s.x - s.r * 4, s.y);
          ctx.lineTo(s.x + s.r * 4, s.y);
          ctx.moveTo(s.x, s.y - s.r * 4);
          ctx.lineTo(s.x, s.y + s.r * 4);
          ctx.stroke();
        }
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }

      for (let i = shooters.length - 1; i >= 0; i--) {
        const sh = shooters[i];
        const grd = ctx.createLinearGradient(sh.x, sh.y, sh.x - sh.vx * 12, sh.y - sh.vy * 12);
        grd.addColorStop(0, sh.color.replace(')', `,${sh.life})`).replace('hsl', 'hsla'));
        grd.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.strokeStyle = grd;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(sh.x, sh.y);
        ctx.lineTo(sh.x - sh.vx * 12, sh.y - sh.vy * 12);
        ctx.stroke();

        sh.x += sh.vx;
        sh.y += sh.vy;
        sh.life -= sh.decay;
        if (sh.life <= 0) shooters.splice(i, 1);
      }

      if (Math.random() < 0.005) spawnShooter();
    }

    const handleResize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W;
      canvas.height = H;
      initBg();
    };
    window.addEventListener('resize', handleResize);

    animationId = requestAnimationFrame(drawStars);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);


  // Form State
  const [form, setForm] = useState({
    fullname: '',
    dob: '',
    tob: '',
    pob: '',
    currentLocation: '',
    gender: 'male',
    timezone: 'auto',
    isBirthTimeApprox: false
  });
  const [formError, setFormError] = useState(false);
  const [isOverlayLoading, setIsOverlayLoading] = useState(false);
  const [activeProfile, setActiveProfile] = useState(null);

  // Active Tab state
  const [currentTab, setCurrentTab] = useState('planets');

  // Daily Horoscope State
  const [dailyDate, setDailyDate] = useState(new Date().toISOString().split('T')[0]);
  const [dailyLoading, setDailyLoading] = useState(false);
  const [dailyHoroscope, setDailyHoroscope] = useState(null);

  // Journey History State
  const [journeyLoading, setJourneyLoading] = useState(false);
  const [journeyData, setJourneyData] = useState(null);
  const [selectedJourneyDate, setSelectedJourneyDate] = useState(null);

  // Feedback states
  const [feedbackSuccess, setFeedbackSuccess] = useState({});

  const handleFormChange = (e) => {
    const { id, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullname || !form.dob || !form.tob || !form.pob || !form.currentLocation) {
      setFormError(true);
      return;
    }
    setFormError(false);
    setIsOverlayLoading(true);

    try {
      const payload = {
        name: form.fullname,
        dob: form.dob,
        tob: form.tob,
        pob: form.pob,
        gender: form.gender,
        isBirthTimeApprox: form.isBirthTimeApprox,
        currentLocation: form.currentLocation,
        tz: form.timezone === 'auto' ? '' : form.timezone
      };

      const response = await fetch('/api/astrology/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server error ${response.status}`);
      }
      const data = await response.json();
      setActiveProfile(data);
      setCurrentTab('planets');
      
      // Auto-trigger daily horoscope load
      loadDailyHoroscope(data, dailyDate);

      // Scroll to results
      setTimeout(() => {
        const resultsEl = document.getElementById('results-section');
        if (resultsEl) resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);

    } catch (err) {
      console.error('Blueprint error:', err);
      setFormError(true);
      // Show a visible inline error instead of a blocking alert
      const errBox = document.getElementById('form-error');
      if (errBox) errBox.textContent = `⚠️ Error: ${err.message || 'Could not connect to server. Make sure the backend is running.'}` ;
    } finally {
      setIsOverlayLoading(false);
    }
  };

  const loadDailyHoroscope = async (profile = activeProfile, targetDate = dailyDate) => {
    if (!profile) return;
    setDailyLoading(true);
    setDailyHoroscope(null);
    try {
      const payload = {
        name: profile.name,
        dob: profile.dob,
        tob: profile.tob,
        pob: profile.pob,
        tz: profile.tz,
        gender: profile.gender,
        isBirthTimeApprox: profile.isBirthTimeApprox,
        currentLocation: form.currentLocation.trim() || profile.pob,
        dateStr: targetDate
      };

      const res = await fetch('/api/daily-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Daily horoscope retrieval failed");
      const daily = await res.json();
      setDailyHoroscope(daily);
    } catch (err) {
      console.error(err);
    } finally {
      setDailyLoading(false);
    }
  };

  const loadJourneyHistory = async () => {
    if (!activeProfile) return;
    setJourneyLoading(true);
    setJourneyData(null);
    try {
      const res = await fetch('/api/journey-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: activeProfile.name,
          dob: activeProfile.dob,
          tob: activeProfile.tob,
          pob: activeProfile.pob
        })
      });

      if (!res.ok) throw new Error("History fetch failed");
      const journey = await res.json();
      setJourneyData(journey);
    } catch (err) {
      console.error(err);
    } finally {
      setJourneyLoading(false);
    }
  };

  const handleTabClick = (tabId) => {
    setCurrentTab(tabId);
    if (tabId === 'daily' && activeProfile) {
      loadDailyHoroscope(activeProfile, dailyDate);
    } else if (tabId === 'journey' && activeProfile) {
      loadJourneyHistory();
    }
  };

  const submitFeedback = async (type, rating) => {
    if (!activeProfile) return;
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: activeProfile.name,
          dob: activeProfile.dob,
          tob: activeProfile.tob,
          pob: activeProfile.pob,
          type,
          rating,
          date: type === 'daily' ? dailyDate : null
        })
      });
      if (res.ok) {
        setFeedbackSuccess(prev => ({ ...prev, [type]: rating }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      {/* Canvas Background */}
      <canvas id="cosmos-canvas"></canvas>

      {/* Nebula Blobs */}
      <div className="nebula-blob nb1"></div>
      <div className="nebula-blob nb2"></div>
      <div className="nebula-blob nb3"></div>

      {/* Loading Overlay */}
      {isOverlayLoading && (
        <div className="loading-overlay active" id="loading-overlay">
          <div className="cosmic-spinner"></div>
          <div className="loading-text">Reading the stars for you…</div>
        </div>
      )}

      <div className="page-wrapper">
        {/* HEADER */}
        <header>
          <div className="logo-orbit">
            <span className="logo-icon">🔮</span>
          </div>
          <h1 className="site-title">CosmicSoul</h1>
          <p className="site-tagline">Your Vedic Astrology &amp; Numerology Oracle</p>
          <div className="header-divider"></div>
        </header>

        {/* INPUT FORM */}
        <section className="input-section">
          <div className="glass-card">
            <h2 className="section-title">✦ Enter Your Birth Details ✦</h2>
            <form id="astro-form" onSubmit={handleFormSubmit} noValidate>
              <div className="form-grid">
                <div className="form-group form-full">
                  <label className="form-label" htmlFor="fullname">👤 Full Name</label>
                  <input 
                    type="text" 
                    id="fullname" 
                    className="form-input" 
                    placeholder="e.g. Aarav Sharma" 
                    value={form.fullname} 
                    onChange={handleFormChange}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="dob">📅 Date of Birth</label>
                  <input 
                    type="date" 
                    id="dob" 
                    className="form-input" 
                    value={form.dob} 
                    onChange={handleFormChange}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="tob">⏰ Time of Birth</label>
                  <input 
                    type="time" 
                    id="tob" 
                    className="form-input" 
                    value={form.tob} 
                    onChange={handleFormChange}
                    required 
                  />
                </div>
                <div className="form-group form-full" style={{ flexDirection: 'row', alignItems: 'center', gap: '10px', marginTop: '-6px' }}>
                  <input 
                    type="checkbox" 
                    id="isBirthTimeApprox" 
                    checked={form.isBirthTimeApprox} 
                    onChange={handleFormChange}
                    style={{ width: '20px', height: '20px', cursor: 'pointer' }} 
                  />
                  <label className="form-label" htmlFor="isBirthTimeApprox" style={{ cursor: 'pointer', color: 'var(--text-secondary)', textTransform: 'none', letterSpacing: '0', fontSize: '0.85rem' }}>
                    My birth time is approximate / unknown
                  </label>
                </div>
                <div className="form-group form-full">
                  <label className="form-label" htmlFor="pob">📍 Place of Birth</label>
                  <input 
                    type="text" 
                    id="pob" 
                    className="form-input" 
                    placeholder="e.g. Mumbai, Maharashtra, India" 
                    value={form.pob} 
                    onChange={handleFormChange}
                    required 
                  />
                </div>
                <div className="form-group form-full">
                  <label className="form-label" htmlFor="currentLocation">📍 Current Location (For Daily Horoscope)</label>
                  <input 
                    type="text" 
                    id="currentLocation" 
                    className="form-input" 
                    placeholder="e.g. Pune, Maharashtra, India" 
                    value={form.currentLocation} 
                    onChange={handleFormChange}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="gender">⚧ Gender</label>
                  <select id="gender" className="form-select" value={form.gender} onChange={handleFormChange}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other / Prefer not to say</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="timezone">🌐 Timezone (Auto-detect option)</label>
                  <select id="timezone" className="form-select" value={form.timezone} onChange={handleFormChange}>
                    <option value="auto">Auto-detect from coordinates (Recommended)</option>
                    <option value="5.5">IST +5:30</option>
                    <option value="0">UTC +0:00</option>
                    <option value="1">CET +1:00</option>
                    <option value="5">PKT +5:00</option>
                    <option value="-5">EST -5:00</option>
                    <option value="-8">PST -8:00</option>
                  </select>
                </div>
              </div>
              
              {formError && (
                <div className="error-msg show" id="form-error">⚠️ Please fill all required fields.</div>
              )}
              
              <div className="form-group" style={{ marginTop: '24px' }}>
                <button type="submit" className="btn-cosmic" id="reveal-btn">
                  ✨ Reveal My Cosmic Blueprint ✨
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* RESULTS SECTION */}
        {activeProfile && (
          <ErrorBoundary>
          <section id="results-section" className="show">
            {/* Confidence Banner */}
            {activeProfile.isBirthTimeApprox && (
              <div className="confidence-banner show" id="confidence-banner">
                <span style={{ fontSize: '1.4rem' }}>⚠️</span>
                <div>
                  <strong>Approximate Birth Time Configured:</strong> House cusps, Dashas, and career/marriage predictions are calculated with lower confidence.
                </div>
              </div>
            )}

            <div className="results-header reveal revealed show">
              <div className="user-greeting" id="greeting-text">
                🌟 Cosmic Blueprint of <strong>{activeProfile.name}</strong>
              </div>
              <div className="user-subtitle" id="subtitle-text">
                Born on {new Date(activeProfile.dob).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at {activeProfile.tob} in {activeProfile.pob}
              </div>
              <div className="header-divider" style={{ marginTop: '16px' }}></div>
            </div>

            {/* Numerology Numbers Grid */}
            <div className="num-grid reveal revealed show" id="num-grid">
              {[
                { val: activeProfile.mulank, label: 'Mulank', desc: `Root Number — ${MULANK_DATA[activeProfile.mulank]?.title || ''}` },
                { val: activeProfile.bhagyank, label: 'Bhagyank', desc: 'Destiny Number — Your life path & fortune' },
                { val: activeProfile.nameank, label: 'Namank', desc: 'Name Number — Vibration of your identity' },
                { val: activeProfile.lagna.rashi + 1, label: 'Lagna House', desc: `Ascendant: ${RASHIS[activeProfile.lagna.rashi].name}` },
                { val: (activeProfile.moonRashi !== undefined ? activeProfile.moonRashi : (activeProfile.planetHouses?.Moon?.rashi ?? 0)) + 1, label: 'Rashi No.', desc: `Moon Sign: ${RASHIS[activeProfile.moonRashi !== undefined ? activeProfile.moonRashi : (activeProfile.planetHouses?.Moon?.rashi ?? 0)].name}` },
                { val: activeProfile.nakshatra.pada, label: 'Nakshatra Pada', desc: `${activeProfile.nakshatra.name} Nakshatra` }
              ].map((c, i) => (
                <div className="num-card" key={i}>
                  <div className="num-value">{c.val}</div>
                  <div className="num-label">{c.label}</div>
                  <div className="num-desc">{c.desc}</div>
                </div>
              ))}
            </div>

            {/* Nakshatra Card */}
            <div className="nakshatra-card reveal revealed show" id="nakshatra-card">
              <div className="nakshatra-symbol">{activeProfile.nakshatra.symbol}</div>
              <div className="nakshatra-info">
                <h3>🌟 {activeProfile.nakshatra.name} Nakshatra — Pada {activeProfile.nakshatra.pada}</h3>
                <p>
                  <strong>Moon Sign:</strong> {RASHIS[activeProfile.moonRashi !== undefined ? activeProfile.moonRashi : (activeProfile.planetHouses?.Moon?.rashi ?? 0)].name} &nbsp;|&nbsp; 
                  <strong> Lord:</strong> {activeProfile.nakshatra.lord} &nbsp;|&nbsp; 
                  <strong> Deity:</strong> {activeProfile.nakshatra.deity} &nbsp;|&nbsp; 
                  <strong> Nature:</strong> {activeProfile.nakshatra.nature}
                </p>
                <p style={{ marginTop: '10px' }}>{activeProfile.nakshatra.desc}</p>
              </div>
            </div>

            {/* Main Tabs Navigation */}
            <div className="tabs-wrapper reveal revealed show">
              <div className="tabs-nav" id="tabs-nav">
                <button className={`tab-btn ${currentTab === 'planets' ? 'active' : ''}`} onClick={() => handleTabClick('planets')}>🪐 Planets &amp; Houses</button>
                <button className={`tab-btn ${currentTab === 'love' ? 'active' : ''}`} onClick={() => handleTabClick('love')}>💞 Love &amp; Marriage</button>
                <button className={`tab-btn ${currentTab === 'career' ? 'active' : ''}`} onClick={() => handleTabClick('career')}>💼 Career &amp; Finance</button>
                <button className={`tab-btn ${currentTab === 'health' ? 'active' : ''}`} onClick={() => handleTabClick('health')}>🌿 Health &amp; Wellness</button>
                <button className={`tab-btn ${currentTab === 'dasha' ? 'active' : ''}`} onClick={() => handleTabClick('dasha')}>⏳ Dasha Periods</button>
                <button className={`tab-btn ${currentTab === 'lucky' ? 'active' : ''}`} onClick={() => handleTabClick('lucky')}>🍀 Lucky Elements</button>
                <button className={`tab-btn ${currentTab === 'daily' ? 'active' : ''}`} onClick={() => handleTabClick('daily')}>📅 Daily Horoscope</button>
                <button className={`tab-btn ${currentTab === 'palm' ? 'active' : ''}`} onClick={() => handleTabClick('palm')}>✋ Palm Reading</button>
                <button className={`tab-btn ${currentTab === 'face' ? 'active' : ''}`} onClick={() => handleTabClick('face')}>👤 Face Reading</button>
                <button className={`tab-btn ${currentTab === 'journey' ? 'active' : ''}`} onClick={() => handleTabClick('journey')}>📖 My Journey</button>
                <button className={`tab-btn ${currentTab === 'future' ? 'active' : ''}`} onClick={() => handleTabClick('future')}>🔮 Future Prediction</button>
              </div>

              {/* TAB CONTENTS */}

              {/* Planets & Houses Tab */}
              {currentTab === 'planets' && (
                <div className="tab-content active" id="tab-planets">
                  <div className="glass-card">
                    <div className="planet-table-wrapper">
                      <table className="planet-table" id="planet-table">
                        <thead>
                          <tr>
                            <th>Planet</th>
                            <th>D1 Rashi</th>
                            <th>D1 House</th>
                            <th>D9 Navamsa Rashi</th>
                            <th>D9 House</th>
                            <th>Degree</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody id="planet-tbody">
                          {/* Lagna Row */}
                          <tr style={{ background: 'rgba(240,192,64,0.05)' }}>
                            <td><span className="planet-icon">⬆️</span><span className="planet-name" style={{ color: 'var(--gold)' }}>Lagna (Ascendant)</span></td>
                            <td><span className="rashi-badge" style={{ borderColor: 'var(--gold)', color: 'var(--gold)' }}>{RASHIS[activeProfile.lagna.rashi].symbol} {RASHIS[activeProfile.lagna.rashi].name}</span></td>
                            <td><span className="house-num">House 1</span></td>
                            <td><span className="rashi-badge" style={{ borderColor: 'var(--gold)', color: 'var(--gold)' }}>{RASHIS[activeProfile.d9Chart.Lagna.rashi].symbol} {RASHIS[activeProfile.d9Chart.Lagna.name] || RASHIS[activeProfile.d9Chart.Lagna.rashi].name}</span></td>
                            <td><span className="house-num" style={{ color: 'var(--gold)' }}>House 1</span></td>
                            <td>{activeProfile.lagna.deg.toFixed(1)}°</td>
                            <td><span style={{ color: '#66bb6a', fontSize: '.8rem', fontWeight: 600 }}>Fixed</span></td>
                          </tr>
                          {/* Planet Rows */}
                          {Object.entries(activeProfile.planetHouses).map(([name, data]) => {
                            const p = PLANETS.find(x => x.name === name);
                            if (!p) return null; // skip unknown planets safely
                            const rashi = RASHIS[data.rashi];
                            if (!rashi) return null;
                            const d9Data = activeProfile.d9Chart[name];
                            if (!d9Data) return null;
                            const d9Rashi = RASHIS[d9Data.rashi];
                            if (!d9Rashi) return null;
                            return (
                              <tr key={name}>
                                <td><span className="planet-icon">{p.icon}</span><span className="planet-name">{name}</span></td>
                                <td><span className="rashi-badge">{rashi.symbol} {rashi.name}</span></td>
                                <td><span className="house-num">House {data.house}</span></td>
                                <td><span className="rashi-badge" style={{ borderColor: 'var(--accent-pink)', color: '#f0aaff' }}>{d9Rashi.symbol} {d9Rashi.name}</span></td>
                                <td><span className="house-num" style={{ color: 'var(--accent-pink)' }}>House {d9Data.house}</span></td>
                                <td>{data.deg.toFixed(1)}°</td>
                                <td>{data.retro ? <span className="retrograde">℞ Retrograde</span> : <span style={{ color: '#66bb6a', fontSize: '.8rem', fontWeight: 600 }}>Direct</span>}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Love & Marriage Tab */}
              {currentTab === 'love' && (
                <div className="tab-content active" id="tab-love">
                  <div className="predictions-grid" id="love-grid">
                    {activeProfile.lovePreds.map((c, i) => (
                      <div className={`pred-card ${c.type}`} key={i}>
                        <div className="pred-header"><span className="pred-icon">{c.icon}</span><span className="pred-title">{c.title}</span></div>
                        <div className="pred-body" dangerouslySetInnerHTML={{ __html: c.body }} />
                        <div className="star-rating">
                          {'★'.repeat(c.stars)}{'☆'.repeat(5 - c.stars)}
                        </div>
                      </div>
                    ))}
                  </div>
                  <details className="basis-details" style={{ marginTop: '24px', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '12px', background: 'rgba(255,255,255,0.02)' }} open>
                    <summary style={{ cursor: 'pointer', fontFamily: "'Cinzel',serif", color: 'var(--gold)', fontSize: '0.85rem', letterSpacing: '0.05em', outline: 'none' }}>✦ Basis of This Reading</summary>
                    <div className="basis-content" style={{ marginTop: '12px', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                      <p><strong>Methodology:</strong> {activeProfile.basisOfReading.calculationMethod}</p>
                      <p><strong>Lagna Degree:</strong> {activeProfile.basisOfReading.lagnaDegree}</p>
                      <p><strong>Moon Nakshatra:</strong> {activeProfile.basisOfReading.moonNakshatra}</p>
                      <p><strong>Active Dasha Period:</strong> {activeProfile.basisOfReading.mahadasha} ({activeProfile.basisOfReading.antardasha})</p>
                      <p><strong>Astrological Placements Scanned:</strong> 7th Lord Mahadasha | Venus in House {activeProfile.planetHouses.Venus.house} ({RASHIS[activeProfile.planetHouses.Venus.rashi].name})</p>
                    </div>
                  </details>
                  <div className="feedback-container" style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.85rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
                    <span>Was this prediction accurate?</span>
                    {feedbackSuccess['love'] ? (
                      <span style={{ color: 'var(--gold)' }}>Thank you for your feedback! (Rated: {feedbackSuccess['love'] === 'accurate' ? '👍 Yes' : '👎 No'})</span>
                    ) : (
                      <>
                        <button className="feedback-btn" onClick={() => submitFeedback('love', 'accurate')}>👍 Yes</button>
                        <button className="feedback-btn" onClick={() => submitFeedback('love', 'inaccurate')}>👎 No</button>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Career & Finance Tab */}
              {currentTab === 'career' && (
                <div className="tab-content active" id="tab-career">
                  <div className="predictions-grid" id="career-grid">
                    {activeProfile.careerPreds.map((c, i) => (
                      <div className={`pred-card ${c.type}`} key={i}>
                        <div className="pred-header"><span className="pred-icon">{c.icon}</span><span className="pred-title">{c.title}</span></div>
                        <div className="pred-body" dangerouslySetInnerHTML={{ __html: c.body }} />
                        <div className="star-rating">
                          {'★'.repeat(c.stars)}{'☆'.repeat(5 - c.stars)}
                        </div>
                      </div>
                    ))}
                  </div>
                  <details className="basis-details" style={{ marginTop: '24px', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '12px', background: 'rgba(255,255,255,0.02)' }} open>
                    <summary style={{ cursor: 'pointer', fontFamily: "'Cinzel',serif", color: 'var(--gold)', fontSize: '0.85rem', letterSpacing: '0.05em', outline: 'none' }}>✦ Basis of This Reading</summary>
                    <div className="basis-content" style={{ marginTop: '12px', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                      <p><strong>Methodology:</strong> {activeProfile.basisOfReading.calculationMethod}</p>
                      <p><strong>Lagna Degree:</strong> {activeProfile.basisOfReading.lagnaDegree}</p>
                      <p><strong>Active Dasha Period:</strong> {activeProfile.basisOfReading.mahadasha} ({activeProfile.basisOfReading.antardasha})</p>
                      <p><strong>Astrological Placements Scanned:</strong> 10th Lord placements | 2nd &amp; 11th House Lord structures</p>
                    </div>
                  </details>
                  <div className="feedback-container" style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.85rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
                    <span>Was this prediction accurate?</span>
                    {feedbackSuccess['career'] ? (
                      <span style={{ color: 'var(--gold)' }}>Thank you for your feedback! (Rated: {feedbackSuccess['career'] === 'accurate' ? '👍 Yes' : '👎 No'})</span>
                    ) : (
                      <>
                        <button className="feedback-btn" onClick={() => submitFeedback('career', 'accurate')}>👍 Yes</button>
                        <button className="feedback-btn" onClick={() => submitFeedback('career', 'inaccurate')}>👎 No</button>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Health & Wellness Tab */}
              {currentTab === 'health' && (
                <div className="tab-content active" id="tab-health">
                  <div className="predictions-grid" id="health-grid">
                    {activeProfile.healthPreds.map((c, i) => (
                      <div className={`pred-card ${c.type}`} key={i}>
                        <div className="pred-header"><span className="pred-icon">{c.icon}</span><span className="pred-title">{c.title}</span></div>
                        <div className="pred-body" dangerouslySetInnerHTML={{ __html: c.body }} />
                        <div className="star-rating">
                          {'★'.repeat(c.stars)}{'☆'.repeat(5 - c.stars)}
                        </div>
                      </div>
                    ))}
                  </div>
                  <details className="basis-details" style={{ marginTop: '24px', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '12px', background: 'rgba(255,255,255,0.02)' }} open>
                    <summary style={{ cursor: 'pointer', fontFamily: "'Cinzel',serif", color: 'var(--gold)', fontSize: '0.85rem', letterSpacing: '0.05em', outline: 'none' }}>✦ Basis of This Reading</summary>
                    <div className="basis-content" style={{ marginTop: '12px', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                      <p><strong>Lagna Element:</strong> {RASHIS[activeProfile.lagna.rashi].element} | 6th house placements scanned</p>
                    </div>
                  </details>
                  <div className="feedback-container" style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.85rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
                    <span>Was this prediction accurate?</span>
                    {feedbackSuccess['health'] ? (
                      <span style={{ color: 'var(--gold)' }}>Thank you for your feedback! (Rated: {feedbackSuccess['health'] === 'accurate' ? '👍 Yes' : '👎 No'})</span>
                    ) : (
                      <>
                        <button className="feedback-btn" onClick={() => submitFeedback('health', 'accurate')}>👍 Yes</button>
                        <button className="feedback-btn" onClick={() => submitFeedback('health', 'inaccurate')}>👎 No</button>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Dasha Periods Tab */}
              {currentTab === 'dasha' && (
                <div className="tab-content active" id="tab-dasha">
                  <div className="glass-card">
                    <h3 style={{ fontFamily: "'Cinzel',serif", color: 'var(--gold)', marginBottom: '20px', fontSize: '1rem', letterSpacing: '.08em' }}>Vimshottari Mahadasha Periods</h3>
                    <div className="dasha-list">
                      {activeProfile.dashaTimeline.map((d, i) => {
                        const now = new Date();
                        const isCurrent = now >= new Date(d.start) && now < new Date(d.end);
                        const p = PLANETS.find(x => x.name === d.lord) || { icon: '⭐' };

                        return (
                          <div className="dasha-item-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }} key={i}>
                            <div className={`dasha-item ${isCurrent ? 'current' : ''}`}>
                              <span className="dasha-planet">{p.icon}</span>
                              <div style={{ flex: 1 }}>
                                <div className="dasha-name">{d.lord} Mahadasha <small style={{ color: 'var(--text-muted)' }}>({d.lord === 'Ketu' ? 7 : d.lord === 'Venus' ? 20 : d.lord === 'Sun' ? 6 : d.lord === 'Moon' ? 10 : d.lord === 'Mars' ? 7 : d.lord === 'Rahu' ? 18 : d.lord === 'Jupiter' ? 16 : d.lord === 'Saturn' ? 19 : 17} years)</small></div>
                                <div className="dasha-period">{new Date(d.start).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })} — {new Date(d.end).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}</div>
                              </div>
                              {isCurrent && <span className="dasha-badge">Current</span>}
                            </div>
                            {isCurrent && (
                              <div style={{ marginTop: '12px', paddingLeft: '24px', borderLeft: '1px dashed var(--gold-dim)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <h4 style={{ fontSize: '0.75rem', color: 'var(--gold-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current Sub Periods (Antardasha / Pratyantardasha)</h4>
                                {d.antardashas.map((ad, adIdx) => {
                                  const isAdCurrent = now >= new Date(ad.start) && now < new Date(ad.end);
                                  if (!isAdCurrent) return null;
                                  const activePd = ad.pratyantardashas.find(pd => now >= new Date(pd.start) && now < new Date(pd.end));
                                  return (
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }} key={adIdx}>
                                      🌙 <strong>{ad.lord} Antardasha:</strong> {new Date(ad.start).toLocaleDateString()} — {new Date(ad.end).toLocaleDateString()}
                                      {activePd && (
                                        <div style={{ paddingLeft: '12px', marginTop: '4px', color: 'var(--accent-teal)' }}>
                                          ✦ <strong>{activePd.lord} Pratyantardasha:</strong> active till {new Date(activePd.end).toLocaleDateString()}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Lucky Elements Tab */}
              {currentTab === 'lucky' && (
                <div className="tab-content active" id="tab-lucky">
                  <div className="predictions-grid" id="lucky-grid">
                    <div className="pred-card lucky">
                      <div className="pred-header"><span className="pred-icon">🍀</span><span className="pred-title">Lucky Numbers &amp; Days</span></div>
                      <div className="lucky-grid">
                        <div className="lucky-item"><div className="lucky-key">Lucky Numbers</div><div className="lucky-val">{activeProfile.luckyData.luckyNums}</div></div>
                        <div className="lucky-item"><div className="lucky-key">Lucky Day</div><div className="lucky-val">{activeProfile.luckyData.luckyDay}</div></div>
                        <div className="lucky-item"><div className="lucky-key">Lucky Color</div><div className="lucky-val">{activeProfile.luckyData.luckyColor}</div></div>
                        <div className="lucky-item"><div className="lucky-key">Lucky Metal</div><div className="lucky-val">{activeProfile.luckyData.metal}</div></div>
                      </div>
                    </div>
                    <div className="pred-card lucky">
                      <div className="pred-header"><span className="pred-icon">💎</span><span className="pred-title">Gemstone &amp; Yantra</span></div>
                      <div className="lucky-grid">
                        <div className="lucky-item"><div className="lucky-key">Primary Gemstone</div><div className="lucky-val">{activeProfile.luckyData.gem}</div></div>
                        <div className="lucky-item"><div className="lucky-key">Lucky Flower</div><div className="lucky-val">{activeProfile.luckyData.flower}</div></div>
                        <div className="lucky-item"><div className="lucky-key">Ruling Deity</div><div className="lucky-val">{activeProfile.luckyData.rulingGod}</div></div>
                        <div className="lucky-item"><div className="lucky-key">Yantra</div><div className="lucky-val">{activeProfile.luckyData.yantra}</div></div>
                      </div>
                    </div>
                    <div className="pred-card lucky" style={{ gridColumn: '1/-1' }}>
                      <div className="pred-header"><span className="pred-icon">🕉️</span><span className="pred-title">Mantra &amp; Spiritual Alignment</span></div>
                      <div className="pred-body">
                        <p><strong>Your Beej Mantra:</strong> <em style={{ color: 'var(--gold)', fontSize: '1.05rem' }}>{activeProfile.luckyData.mantra}</em></p>
                        <p style={{ marginTop: '12px' }}>Chant this mantra daily 108 times facing East to unlock positive vibrations in your chart.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Daily Horoscope Tab */}
              {currentTab === 'daily' && (
                <div className="tab-content active" id="tab-daily">
                  <div className="glass-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                      <h3 style={{ fontFamily: "'Cinzel',serif", color: 'var(--gold)', fontSize: '1rem', letterSpacing: '.08em' }}>Daily Transit Horoscope</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input 
                          type="date" 
                          id="daily-date-input" 
                          className="form-input" 
                          style={{ padding: '6px 12px', width: 'auto', fontSize: '0.85rem' }} 
                          value={dailyDate}
                          onChange={(e) => { setDailyDate(e.target.value); loadDailyHoroscope(activeProfile, e.target.value); }}
                        />
                        <button className="tab-btn" onClick={() => loadDailyHoroscope(activeProfile, dailyDate)} style={{ padding: '6px 14px', fontSize: '0.8rem' }}>🔄 Recalculate</button>
                      </div>
                    </div>

                    {dailyLoading && (
                      <div id="daily-loading" style={{ textAlign: 'center', padding: '30px' }}>
                        <div className="cosmic-spinner" style={{ width: '40px', height: '40px', margin: '0 auto 10px' }}></div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Consulting today's transits...</div>
                      </div>
                    )}

                    {!dailyLoading && dailyHoroscope && (
                      <div id="daily-content">
                        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', padding: '18px', borderRadius: '12px', marginBottom: '24px' }}>
                          <h4 style={{ fontFamily: "'Cinzel',serif", color: 'var(--accent-teal)', fontSize: '0.95rem', marginBottom: '8px' }}>Daily Alignment Summary</h4>
                          <p id="daily-summary-text" style={{ fontSize: '0.9rem', lineHeight: '1.6', color: 'var(--text-primary)' }}>{dailyHoroscope.horoscope.summary}</p>
                        </div>

                        {dailyHoroscope.horoscope.highlights && dailyHoroscope.horoscope.highlights.length > 0 && (
                          <div style={{ marginBottom: '24px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', padding: '16px', borderRadius: '12px' }}>
                            <h4 style={{ fontFamily: "'Cinzel',serif", color: 'var(--gold)', fontSize: '0.9rem', marginBottom: '10px', letterSpacing: '0.05em' }}>📈 Today's Transit Highlights (Ups &amp; Downs)</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                              {dailyHoroscope.horoscope.highlights.map((h, idx) => <div key={idx} style={{ lineHeight: '1.4' }}>{h.text}</div>)}
                            </div>
                          </div>
                        )}

                        {dailyHoroscope.horoscope.scores && (
                          <div style={{ marginBottom: '24px' }}>
                            <h4 style={{ fontFamily: "'Cinzel',serif", color: 'var(--gold)', fontSize: '0.9rem', marginBottom: '10px', letterSpacing: '0.05em' }}>🪐 Cosmic Index for Today</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
                              {Object.entries(dailyHoroscope.horoscope.scores).map(([name, val]) => {
                                let color = 'var(--accent-teal)';
                                if (val < 60) color = 'var(--accent-rose)';
                                else if (val >= 80) color = 'var(--gold)';
                                return (
                                  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', borderRadius: '10px', padding: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }} key={name}>
                                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600 }}>{name} Index</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      <div style={{ background: 'rgba(255,255,255,0.1)', flex: 1, height: '8px', borderRadius: '100px', overflow: 'hidden' }}>
                                        <div style={{ background: color, width: `${val}%`, height: '100%', borderRadius: '100px' }}></div>
                                      </div>
                                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: color }}>{val}%</span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        <div className="predictions-grid">
                          <div className="pred-card spiritual">
                            <div className="pred-header"><span className="pred-icon">🧠</span><span className="pred-title">General Mood</span></div>
                            <div className="pred-body" dangerouslySetInnerHTML={{ __html: dailyHoroscope.horoscope.breakdown.mood }} />
                          </div>
                          <div className="pred-card career">
                            <div className="pred-header"><span className="pred-icon">💼</span><span className="pred-title">Career &amp; Focus</span></div>
                            <div className="pred-body" dangerouslySetInnerHTML={{ __html: dailyHoroscope.horoscope.breakdown.career }} />
                          </div>
                          <div className="pred-card finance">
                            <div className="pred-header"><span className="pred-icon">💵</span><span className="pred-title">Money &amp; Spending</span></div>
                            <div className="pred-body" dangerouslySetInnerHTML={{ __html: dailyHoroscope.horoscope.breakdown.finance }} />
                          </div>
                          <div className="pred-card love">
                            <div className="pred-header"><span className="pred-icon">💞</span><span className="pred-title">Love &amp; Attraction</span></div>
                            <div className="pred-body" dangerouslySetInnerHTML={{ __html: dailyHoroscope.horoscope.breakdown.love }} />
                          </div>
                          <div className="pred-card health" style={{ gridColumn: '1 / -1' }}>
                            <div className="pred-header"><span className="pred-icon">🌿</span><span className="pred-title">Vitality &amp; Health</span></div>
                            <div className="pred-body" dangerouslySetInnerHTML={{ __html: dailyHoroscope.horoscope.breakdown.health }} />
                          </div>
                        </div>

                        <details className="basis-details" style={{ marginTop: '24px', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '12px', background: 'rgba(255,255,255,0.02)' }}>
                          <summary style={{ cursor: 'pointer', fontFamily: "'Cinzel',serif", color: 'var(--gold)', fontSize: '0.85rem', letterSpacing: '0.05em', outline: 'none' }}>✦ Daily Transit Factors</summary>
                          <div className="basis-content" style={{ marginTop: '12px', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                            <p><strong>Transit Date:</strong> {dailyHoroscope.date}</p>
                            <p><strong>Current Location:</strong> {dailyHoroscope.currentLocation}</p>
                            <p><strong>Transit Positions (Natal Houses):</strong> {Object.entries(dailyHoroscope.transitHouses).map(([name, p]) => `Transit ${name} in House ${p.house} (${RASHIS[p.rashi].name})`).join(' | ')}</p>
                          </div>
                        </details>

                        <div className="feedback-container" style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.85rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
                          <span>Was today's prediction accurate?</span>
                          {feedbackSuccess[`daily-${dailyDate}`] ? (
                            <span style={{ color: 'var(--gold)' }}>Thank you for your feedback!</span>
                          ) : (
                            <>
                              <button className="feedback-btn" onClick={() => submitFeedback(`daily-${dailyDate}`, 'accurate')}>👍 Yes</button>
                              <button className="feedback-btn" onClick={() => submitFeedback(`daily-${dailyDate}`, 'inaccurate')}>👎 No</button>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Palm Reading Tab (NEW VISUALS!) */}
              {currentTab === 'palm' && (
                <div className="tab-content active" id="tab-palm">
                  <PalmReadingPage userData={activeProfile} />
                </div>
              )}

              {/* Face Reading Tab (NEW VISUALS!) */}
              {currentTab === 'face' && (
                <div className="tab-content active" id="tab-face">
                  <FaceReadingPage userData={activeProfile} />
                </div>
              )}

              {/* My Journey (History) Tab */}
              {currentTab === 'journey' && (
                <div className="tab-content active" id="tab-journey">
                  <div className="glass-card">
                    <h3 style={{ fontFamily: "'Cinzel',serif", color: 'var(--gold)', marginBottom: '20px', fontSize: '1.1rem', letterSpacing: '.08em' }}>📖 My Journey (Horoscope History)</h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
                      View your previously calculated daily horoscopes and track their accuracy feedback logs.
                    </p>

                    {journeyLoading && (
                      <div style={{ textAlign: 'center', padding: '30px' }}>
                        <div className="cosmic-spinner" style={{ width: '40px', height: '40px', margin: '0 auto 10px' }}></div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Loading your record...</div>
                      </div>
                    )}

                    {!journeyLoading && (!journeyData || Object.keys(journeyData.dailyHoroscopes).length === 0) && (
                      <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        No daily horoscopes found. Check "Daily Horoscope" tab to start tracking!
                      </div>
                    )}

                    {!journeyLoading && journeyData && Object.keys(journeyData.dailyHoroscopes).length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div className="planet-table-wrapper">
                          <table className="planet-table" style={{ width: '100%' }}>
                            <thead>
                              <tr>
                                <th>Date</th>
                                <th>Location</th>
                                <th>Summary</th>
                                <th>Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {Object.keys(journeyData.dailyHoroscopes).map(d => {
                                const dayData = journeyData.dailyHoroscopes[d];
                                return (
                                  <tr key={d}>
                                    <td><strong style={{ color: 'var(--gold)' }}>{d.substring(0, 10)}</strong></td>
                                    <td>{dayData.currentLocation}</td>
                                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{dayData.horoscope.summary.substring(0, 80)}...</td>
                                    <td>
                                      <button className="tab-btn" onClick={() => setSelectedJourneyDate(d)} style={{ padding: '4px 10px', fontSize: '0.75rem' }}>View Detailed</button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>

                        {selectedJourneyDate && journeyData.dailyHoroscopes[selectedJourneyDate] && (
                          <div className="pred-card" style={{ borderColor: 'var(--gold)', marginTop: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                              <h4 style={{ fontFamily: "'Cinzel',serif", color: 'var(--gold)', fontSize: '1rem', margin: 0 }}>
                                Reading for Date: {selectedJourneyDate.substring(0,10)}
                              </h4>
                              <button className="tab-btn" onClick={() => setSelectedJourneyDate(null)} style={{ padding: '4px 10px', fontSize: '0.75rem' }}>✕ Close</button>
                            </div>
                            <div className="pred-body">
                              <p><strong>Overall Summary:</strong> {journeyData.dailyHoroscopes[selectedJourneyDate].horoscope.summary}</p>
                              <p><strong>🧠 General Mood:</strong> {journeyData.dailyHoroscopes[selectedJourneyDate].horoscope.breakdown.mood}</p>
                              <p><strong>💼 Career &amp; Work:</strong> {journeyData.dailyHoroscopes[selectedJourneyDate].horoscope.breakdown.career}</p>
                              <p><strong>💵 Finance &amp; Cashflow:</strong> {journeyData.dailyHoroscopes[selectedJourneyDate].horoscope.breakdown.finance}</p>
                              <p><strong>Relationships:</strong> {journeyData.dailyHoroscopes[selectedJourneyDate].horoscope.breakdown.love}</p>
                              <p><strong>Health &amp; Energy:</strong> {journeyData.dailyHoroscopes[selectedJourneyDate].horoscope.breakdown.health}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Future Prediction Tab (NEW VISUALS!) */}
              {currentTab === 'future' && (
                <div className="tab-content active" id="tab-future">
                  <FuturePredictionPage userData={activeProfile} />
                </div>
              )}

            </div>
          </section>
          </ErrorBoundary>
        )}

        <footer>
          <p>✦ CosmicSoul — Vedic Astrology &amp; Numerology ✦</p>
          <p style={{ marginTop: '6px' }}>For spiritual guidance only. Calculations based on Vedic (Sidereal) tradition.</p>
        </footer>

      </div>
    </div>
  );
}
