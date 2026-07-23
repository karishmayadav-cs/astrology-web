const API_BASE_URL = (typeof window !== 'undefined' && window.VITE_BACKEND_URL) || '';
function getApiUrl(path) {
  const cleanBase = API_BASE_URL.replace(/\/+$/, '');
  const cleanPath = path.startsWith('/') ? path : '/' + path;
  return cleanBase ? cleanBase + cleanPath : cleanPath;
}

/* ============================================================
   PART 1 — ANIMATED STARFIELD CANVAS
   ============================================================ */
(function () {
  const canvas = document.getElementById('cosmos-canvas');
  const ctx = canvas.getContext('2d');
  let W, H, stars = [], shooters = [];

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function Star(x, y, r, speed, brightness) {
    this.x = x ?? Math.random() * W;
    this.y = y ?? Math.random() * H;
    this.r = r ?? Math.random() * 1.6 + 0.2;
    this.speed = speed ?? Math.random() * 0.6 + 0.1;
    this.brightness = brightness ?? Math.random();
    this.maxBrightness = Math.random() * 0.8 + 0.2;
    this.minBrightness = Math.random() * 0.1;
    this.direction = Math.random() > 0.5 ? 1 : -1;
    this.hue = Math.random() < 0.1 ? Math.random() * 60 + 180 : 0;
  }

  function initStars() {
    stars = [];
    const count = Math.floor((W * H) / 2000);
    for (let i = 0; i < count; i++) stars.push(new Star());
  }

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

  function drawStars(ts) {
    ctx.clearRect(0, 0, W, H);

    const bg = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, Math.max(W,H)*0.8);
    bg.addColorStop(0, '#06040f');
    bg.addColorStop(0.5, '#03020a');
    bg.addColorStop(1, '#000005');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    stars.forEach(s => {
      s.brightness += s.speed * s.direction * 0.015;
      if (s.brightness >= s.maxBrightness) { s.brightness = s.maxBrightness; s.direction = -1; }
      if (s.brightness <= s.minBrightness) { s.brightness = s.minBrightness; s.direction = 1; }

      // Time-based twinkling formula using timestamp (ts) and sine waves
      const sparkle = Math.sin((ts || 0) / 180 + s.x) * 0.22;
      const a = Math.max(0, Math.min(1, s.brightness + sparkle));

      if (s.hue) {
        ctx.fillStyle = `hsla(${s.hue}, 80%, 80%, ${a})`;
      } else {
        ctx.fillStyle = `rgba(220, 230, 255, ${a})`;
      }

      if (s.r > 1.2 && a > 0.4) {
        ctx.shadowBlur = s.r * 6;
        ctx.shadowColor = s.hue ? `hsla(${s.hue},80%,80%,0.6)` : 'rgba(200,216,255,0.6)';
        
        // Premium star cross-flares
        ctx.strokeStyle = s.hue ? `hsla(${s.hue}, 80%, 80%, ${a * 0.6})` : `rgba(220, 230, 255, ${a * 0.6})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(s.x - s.r * 4, s.y);
        ctx.lineTo(s.x + s.r * 4, s.y);
        ctx.moveTo(s.x, s.y - s.r * 4);
        ctx.lineTo(s.x, s.y + s.r * 4);
        ctx.stroke();
      } else {
        ctx.shadowBlur = 0;
      }

      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.shadowBlur = 0;

    shooters.forEach((sh, i) => {
      const grd = ctx.createLinearGradient(sh.x, sh.y, sh.x - sh.vx * sh.len / sh.speed / 4, sh.y - sh.vy * sh.len / sh.speed / 4);
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
    });

    if (Math.random() < 0.004) spawnShooter();
    requestAnimationFrame(drawStars);
  }

  window.addEventListener('resize', () => { resize(); initStars(); });
  resize();
  initStars();
  requestAnimationFrame(drawStars);
})();

/* ============================================================
   PART 2 — DATA TABLES
   ============================================================ */
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

/* ============================================================
   PART 3 — STATE & EVENTS
   ============================================================ */
let activeProfile = null;
let currentTab = 'planets';

// Set current date input default
document.getElementById('daily-date-input').value = new Date().toISOString().split('T')[0];

// Tab Navigator
document.getElementById('tabs-nav').addEventListener('click', e => {
  const btn = e.target.closest('.tab-btn');
  if (!btn) return;
  const tab = btn.dataset.tab;
  switchTab(tab);
});

function switchTab(tab) {
  currentTab = tab;
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  
  const activeBtn = document.querySelector(`.tab-btn[data-tab="${tab}"]`);
  if (activeBtn) activeBtn.classList.add('active');
  
  const content = document.getElementById(`tab-${tab}`);
  if (content) content.classList.add('active');

  // Trigger loads for specific tabs if profile is loaded
  if (activeProfile) {
    if (tab === 'daily') {
      loadDailyHoroscope();
    } else if (tab === 'journey') {
      loadJourneyHistory();
    }
  }
}

// Reveal My Cosmic Blueprint Submission
document.getElementById('astro-form').addEventListener('submit', async function (e) {
  e.preventDefault();
  const name = document.getElementById('fullname').value.trim();
  const dob = document.getElementById('dob').value;
  const tob = document.getElementById('tob').value;
  const pob = document.getElementById('pob').value.trim();
  const gender = document.getElementById('gender').value;
  const timezone = document.getElementById('timezone').value;
  const isBirthTimeApprox = document.getElementById('approx-time').checked;
  const currentLocation = document.getElementById('current-location').value.trim();

  const errEl = document.getElementById('form-error');
  if (!name || !dob || !tob || !pob || !currentLocation) {
    errEl.classList.add('show');
    return;
  }
  errEl.classList.remove('show');

  document.getElementById('loading-overlay').classList.add('active');

  try {
    const payload = {
      name, dob, tob, pob, gender, isBirthTimeApprox, currentLocation,
      tz: timezone === 'auto' ? '' : timezone
    };

    const response = await fetch(getApiUrl('/api/astrology/calculate'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error('Astrology calculation failed');

    const data = await response.json();
    activeProfile = data;

    // Render results
    renderResults(data);

    // If approximate birth time checked, show warning banner
    if (data.isBirthTimeApprox) {
      document.getElementById('confidence-banner').classList.add('show');
    } else {
      document.getElementById('confidence-banner').classList.remove('show');
    }

    document.getElementById('loading-overlay').classList.remove('active');

    const resultsEl = document.getElementById('results-section');
    resultsEl.classList.add('show');
    setTimeout(() => { resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 100);
    setTimeout(initReveal, 300);

    // Switch tab to Planets
    switchTab('planets');

  } catch (err) {
    console.error(err);
    document.getElementById('loading-overlay').classList.remove('active');
    alert('Failed to connect to the server or compute details. Verify server is running.');
  }
});

/* ============================================================
   PART 4 — RENDERING INTERFACES
   ============================================================ */
function renderResults(data) {
  const dobDate = new Date(data.dob);
  document.getElementById('greeting-text').innerHTML = `🌟 Cosmic Blueprint of <strong>${data.name}</strong>`;
  document.getElementById('subtitle-text').innerHTML = `Born on ${dobDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at ${data.tob} in ${data.pob}`;

  const moonRashi = data.moonRashi !== undefined ? data.moonRashi : (data.planetHouses?.Moon?.rashi ?? 0);
  renderNumCards(data);
  renderNakshatra(data.nakshatra, moonRashi);
  renderPlanetTable(data.planetHouses, data.d9Chart, data.lagna.rashi);
  renderPredCards('love-grid', data.lovePreds);
  renderPredCards('career-grid', data.careerPreds);
  renderPredCards('health-grid', data.healthPreds);
  renderDasha(data.dashaTimeline);
  renderLucky(data.luckyData, data.mulank, data.bhagyank);
  
  // Fill Basis Details
  fillBasisOfReading(data);
}

function renderNumCards(data) {
  const moonRashi = data.moonRashi !== undefined ? data.moonRashi : (data.planetHouses?.Moon?.rashi ?? 0);
  const cards = [
    { val: data.mulank, label: 'Mulank', desc: `Root Number — ${MULANK_DATA[data.mulank]?.title || ''}` },
    { val: data.bhagyank, label: 'Bhagyank', desc: 'Destiny Number — Your life path & fortune' },
    { val: data.nameank, label: 'Namank', desc: 'Name Number — Vibration of your identity' },
    { val: data.lagna.rashi + 1, label: 'Lagna House', desc: `Ascendant: ${RASHIS[data.lagna.rashi].name}` },
    { val: moonRashi + 1, label: 'Rashi No.', desc: `Moon Sign: ${RASHIS[moonRashi].name}` },
    { val: data.nakshatra.pada, label: 'Nakshatra Pada', desc: `${data.nakshatra.name} Nakshatra` }
  ];
  document.getElementById('num-grid').innerHTML = cards.map(c => `
    <div class="num-card">
      <div class="num-value">${c.val}</div>
      <div class="num-label">${c.label}</div>
      <div class="num-desc">${c.desc}</div>
    </div>
  `).join('');
}

function renderNakshatra(nak, moonRashi) {
  document.getElementById('nakshatra-card').innerHTML = `
    <div class="nakshatra-symbol">${nak.symbol}</div>
    <div class="nakshatra-info">
      <h3>🌟 ${nak.name} Nakshatra — Pada ${nak.pada}</h3>
      <p><strong>Moon Sign:</strong> ${RASHIS[moonRashi].name} &nbsp;|&nbsp; <strong>Lord:</strong> ${nak.lord} &nbsp;|&nbsp; <strong>Deity:</strong> ${nak.deity} &nbsp;|&nbsp; <strong>Nature:</strong> ${nak.nature}</p>
      <p style="margin-top:10px;">${nak.desc}</p>
    </div>
  `;
}

function renderPlanetTable(planetHouses, d9Chart, lagnaRashi) {
  const tbody = document.getElementById('planet-tbody');
  
  tbody.innerHTML = Object.entries(planetHouses).map(([name, data]) => {
    const p = PLANETS.find(x => x.name === name);
    const rashi = RASHIS[data.rashi];
    const d9Data = d9Chart[name];
    const d9Rashi = RASHIS[d9Data.rashi];
    return `
      <tr>
        <td><span class="planet-icon">${p.icon}</span><span class="planet-name">${name}</span></td>
        <td><span class="rashi-badge">${rashi.symbol} ${rashi.name}</span></td>
        <td><span class="house-num">House ${data.house}</span></td>
        <td><span class="rashi-badge" style="border-color:var(--accent-pink);color:#f0aaff;">${d9Rashi.symbol} ${d9Rashi.name}</span></td>
        <td><span class="house-num" style="color:var(--accent-pink);">House ${d9Data.house}</span></td>
        <td>${data.deg.toFixed(1)}°</td>
        <td>${data.retro ? '<span class="retrograde">℞ Retrograde</span>' : '<span style="color:#66bb6a;font-size:.8rem;font-weight:600;">Direct</span>'}</td>
      </tr>
    `;
  }).join('');

  // Lagna Row
  const lagnaRashiData = RASHIS[lagnaRashi];
  const lagnaD9Rashi = RASHIS[d9Chart.Lagna.rashi];
  tbody.innerHTML = `
    <tr style="background:rgba(240,192,64,0.05);">
      <td><span class="planet-icon">⬆️</span><span class="planet-name" style="color:var(--gold);">Lagna (Ascendant)</span></td>
      <td><span class="rashi-badge" style="border-color:var(--gold);color:var(--gold);">${lagnaRashiData.symbol} ${lagnaRashiData.name}</span></td>
      <td><span class="house-num">House 1</span></td>
      <td><span class="rashi-badge" style="border-color:var(--gold);color:var(--gold);">${lagnaD9Rashi.symbol} ${lagnaD9Rashi.name}</span></td>
      <td><span class="house-num" style="color:var(--gold);">House 1</span></td>
      <td>${activeProfile.lagna.deg.toFixed(1)}°</td>
      <td><span style="color:#66bb6a;font-size:.8rem;font-weight:600;">Fixed</span></td>
    </tr>
  ` + tbody.innerHTML;
}

function renderPredCards(containerId, cards) {
  const grid = document.getElementById(containerId);
  grid.innerHTML = cards.map(c => `
    <div class="pred-card ${c.type}">
      <div class="pred-header">
        <span class="pred-icon">${c.icon}</span>
        <span class="pred-title">${c.title}</span>
      </div>
      <div class="pred-body">${c.body}</div>
      <div class="star-rating">${'<span class="star">★</span>'.repeat(c.stars)}${'<span class="star empty">★</span>'.repeat(5-c.stars)}</div>
    </div>
  `).join('');
}

function renderDasha(dashaTimeline) {
  const list = document.getElementById('dasha-list');
  const now = new Date();

  list.innerHTML = dashaTimeline.map(d => {
    const isCurrent = now >= new Date(d.start) && now < new Date(d.end);
    const p = PLANETS.find(x => x.name === d.lord) || { icon: '⭐' };
    
    // Antardashas details
    let adList = '';
    if (isCurrent) {
      adList = `
        <div style="margin-top:12px;padding-left:24px;border-left:1px dashed var(--gold-dim);display:flex;flex-direction:column;gap:8px;">
          <h4 style="font-size:0.75rem;color:var(--gold-light);text-transform:uppercase;letter-spacing:0.05em;">Current Sub Periods (Antardasha / Pratyantardasha)</h4>
          ${d.antardashas.map(ad => {
            const isAdCurrent = now >= new Date(ad.start) && now < new Date(ad.end);
            if (!isAdCurrent) return '';
            
            // Current Pratyantardasha
            const activePd = ad.pratyantardashas.find(pd => now >= new Date(pd.start) && now < new Date(pd.end));
            return `
              <div style="font-size:0.8rem;color:var(--text-secondary);">
                🌙 <strong>${ad.lord} Antardasha:</strong> ${new Date(ad.start).toLocaleDateString()} — ${new Date(ad.end).toLocaleDateString()}
                ${activePd ? `<div style="padding-left:12px;margin-top:4px;color:var(--accent-teal);">✦ <strong>${activePd.lord} Pratyantardasha:</strong> active till ${new Date(activePd.end).toLocaleDateString()}</div>` : ''}
              </div>
            `;
          }).join('')}
        </div>
      `;
    }

    return `
      <div class="dasha-item-wrapper" style="display:flex;flex-direction:column;gap:4px;">
        <div class="dasha-item ${isCurrent ? 'current' : ''}">
          <span class="dasha-planet">${p.icon}</span>
          <div style="flex:1;">
            <div class="dasha-name">${d.lord} Mahadasha <small style="color:var(--text-muted);">(${d.lord === 'Ketu' ? 7 : d.lord === 'Venus' ? 20 : d.lord === 'Sun' ? 6 : d.lord === 'Moon' ? 10 : d.lord === 'Mars' ? 7 : d.lord === 'Rahu' ? 18 : d.lord === 'Jupiter' ? 16 : d.lord === 'Saturn' ? 19 : 17} years)</small></div>
            <div class="dasha-period">${new Date(d.start).toLocaleDateString(undefined, {year:'numeric',month:'short'})} — ${new Date(d.end).toLocaleDateString(undefined, {year:'numeric',month:'short'})}</div>
          </div>
          ${isCurrent ? '<span class="dasha-badge">Current</span>' : ''}
        </div>
        ${adList}
      </div>
    `;
  }).join('');
}

function renderLucky(luckyData, mulank, bhagyank) {
  const grid = document.getElementById('lucky-grid');
  grid.innerHTML = `
    <div class="pred-card lucky">
      <div class="pred-header"><span class="pred-icon">🍀</span><span class="pred-title">Lucky Numbers &amp; Days</span></div>
      <div class="lucky-grid">
        <div class="lucky-item"><div class="lucky-key">Lucky Numbers</div><div class="lucky-val">${luckyData.luckyNums}</div></div>
        <div class="lucky-item"><div class="lucky-key">Lucky Day</div><div class="lucky-val">${luckyData.luckyDay}</div></div>
        <div class="lucky-item"><div class="lucky-key">Lucky Color</div><div class="lucky-val">${luckyData.luckyColor}</div></div>
        <div class="lucky-item"><div class="lucky-key">Lucky Metal</div><div class="lucky-val">${luckyData.metal}</div></div>
      </div>
    </div>
    <div class="pred-card lucky">
      <div class="pred-header"><span class="pred-icon">💎</span><span class="pred-title">Gemstone &amp; Yantra</span></div>
      <div class="lucky-grid">
        <div class="lucky-item"><div class="lucky-key">Primary Gemstone</div><div class="lucky-val">${luckyData.gem}</div></div>
        <div class="lucky-item"><div class="lucky-key">Lucky Flower</div><div class="lucky-val">${luckyData.flower}</div></div>
        <div class="lucky-item"><div class="lucky-key">Ruling Deity</div><div class="lucky-val">${luckyData.rulingGod}</div></div>
        <div class="lucky-item"><div class="lucky-key">Yantra</div><div class="lucky-val">${luckyData.yantra}</div></div>
      </div>
    </div>
    <div class="pred-card lucky" style="grid-column:1/-1;">
      <div class="pred-header"><span class="pred-icon">🕉️</span><span class="pred-title">Mantra &amp; Spiritual Alignment</span></div>
      <div class="pred-body">
        <p><strong>Your Beej Mantra:</strong> <em style="color:var(--gold);font-size:1.05rem;">${luckyData.mantra}</em></p>
        <p style="margin-top:12px;">Chant this mantra daily 108 times facing East to unlock positive vibrations in your chart.</p>
      </div>
    </div>
  `;
}

function fillBasisOfReading(data) {
  const elements = [
    { id: 'love-basis-content', desc: `7th Lord: ${data.basisOfReading.mahadasha} | Venus Placed in House ${data.planetHouses.Venus.house} (${RASHIS[data.planetHouses.Venus.rashi].name}) | Navamsa D9 Lord: House ${data.d9Chart[RASHIS[(data.lagna.rashi + 6)%12].lord]?.house || '1'}` },
    { id: 'career-basis-content', desc: `10th Lord: ${data.planetHouses[RASHIS[(data.lagna.rashi + 9)%12].lord]?.house} | 2nd & 11th Lords: Placements in House ${data.planetHouses[RASHIS[(data.lagna.rashi + 1)%12].lord]?.house} & House ${data.planetHouses[RASHIS[(data.lagna.rashi + 10)%12].lord]?.house}` },
    { id: 'health-basis-content', desc: `Lagna Element: ${RASHIS[data.lagna.rashi].element} | 6th house planet triggers | Moon house placement: ${data.planetHouses.Moon.house}` }
  ];
  elements.forEach(el => {
    const box = document.getElementById(el.id);
    if (box) {
      box.innerHTML = `
        <p><strong>Methodology:</strong> ${data.basisOfReading.calculationMethod}</p>
        <p><strong>Lagna Degree:</strong> ${data.basisOfReading.lagnaDegree}</p>
        <p><strong>Moon Nakshatra:</strong> ${data.basisOfReading.moonNakshatra}</p>
        <p><strong>Active Dasha Period:</strong> ${data.basisOfReading.mahadasha} (${data.basisOfReading.antardasha})</p>
        <p><strong>Factors Scanned:</strong> ${el.desc}</p>
      `;
    }
  });
}

/* ============================================================
   PART 5 — DAILY TRANSITS
   ============================================================ */
document.getElementById('refresh-daily-btn').addEventListener('click', loadDailyHoroscope);
document.getElementById('daily-date-input').addEventListener('change', loadDailyHoroscope);

async function loadDailyHoroscope() {
  if (!activeProfile) return;
  const dateStr = document.getElementById('daily-date-input').value;
  const dailyLoading = document.getElementById('daily-loading');
  const dailyContent = document.getElementById('daily-content');

  dailyLoading.style.display = 'block';
  dailyContent.style.display = 'none';

  try {
    const payload = {
      name: activeProfile.name,
      dob: activeProfile.dob,
      tob: activeProfile.tob,
      pob: activeProfile.pob,
      tz: activeProfile.tz,
      gender: activeProfile.gender,
      isBirthTimeApprox: activeProfile.isBirthTimeApprox,
      currentLocation: document.getElementById('current-location').value.trim() || activeProfile.pob,
      dateStr
    };

    const res = await fetch(getApiUrl('/api/daily-analysis'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error("Failed daily horoscope retrieval");

    const daily = await res.json();
    
    // Render Daily Horoscope
    document.getElementById('daily-summary-text').innerText = daily.horoscope.summary;
    document.getElementById('daily-mood-body').innerHTML = daily.horoscope.breakdown.mood;
    document.getElementById('daily-career-body').innerHTML = daily.horoscope.breakdown.career;
    document.getElementById('daily-finance-body').innerHTML = daily.horoscope.breakdown.finance;
    document.getElementById('daily-love-body').innerHTML = daily.horoscope.breakdown.love;
    document.getElementById('daily-health-body').innerHTML = daily.horoscope.breakdown.health;

    // Render Highlights
    const highlights = daily.horoscope.highlights || [];
    const highlightsContainer = document.getElementById('daily-highlights-container');
    const highlightsList = document.getElementById('daily-highlights-list');
    if (highlights.length > 0) {
      highlightsList.innerHTML = highlights.map(h => `<div style="line-height:1.4;">${h.text}</div>`).join('');
      highlightsContainer.style.display = 'block';
    } else {
      highlightsContainer.style.display = 'none';
    }

    // Render Scores
    const scores = daily.horoscope.scores || null;
    const scoresContainer = document.getElementById('daily-scores-container');
    const scoresGrid = document.getElementById('daily-scores-grid');
    if (scores) {
      scoresGrid.innerHTML = Object.entries(scores).map(([name, val]) => {
        let color = 'var(--accent-teal)';
        if (val < 60) color = 'var(--accent-rose)';
        else if (val >= 80) color = 'var(--gold)';
        
        return `
          <div style="background:rgba(255,255,255,0.03); border:1px solid var(--glass-border); border-radius:10px; padding:10px; display:flex; flex-direction:column; gap:4px;">
            <span style="font-size:0.75rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600;">${name} Index</span>
            <div style="display:flex; align-items:center; gap:8px;">
              <div style="background:rgba(255,255,255,0.1); flex:1; height:8px; border-radius:100px; overflow:hidden;">
                <div style="background:${color}; width:${val}%; height:100%; border-radius:100px;"></div>
              </div>
              <span style="font-size:0.8rem; font-weight:700; color:${color};">${val}%</span>
            </div>
          </div>
        `;
      }).join('');
      scoresContainer.style.display = 'block';
    } else {
      scoresContainer.style.display = 'none';
    }

    // Fill Daily Basis
    const basisBox = document.getElementById('daily-basis-content');
    basisBox.innerHTML = `
      <p><strong>Transit Date:</strong> ${daily.date}</p>
      <p><strong>Current Location:</strong> ${daily.currentLocation}</p>
      <p><strong>Transit Positions (Natal Houses):</strong> 
        ${Object.entries(daily.transitHouses).map(([name, p]) => `Transit ${name} in House ${p.house} (${RASHIS[p.rashi].name})`).join(' | ')}
      </p>
      <p style="margin-top:6px;">Calculated using exact ephemeris for date ${daily.date}. served dynamically via ${daily.isAIEnhanced ? 'Gemini AI' : 'Rules Engine'}.</p>
    `;

    dailyLoading.style.display = 'none';
    dailyContent.style.display = 'block';
  } catch (err) {
    console.error(err);
    dailyLoading.style.display = 'none';
    alert("Failed to fetch daily transit horoscope.");
  }
}

/* ============================================================
   PART 6 — PALM & FACE UPLOADS
   ============================================================ */
setupImageUpload('palm');
setupImageUpload('face');

function setupImageUpload(section) {
  const zone = document.getElementById(`${section}-upload-zone`);
  const fileInput = document.getElementById(`${section}-file-input`);
  const promptView = document.getElementById(`${section}-prompt-view`);
  const previewView = document.getElementById(`${section}-preview-view`);
  const previewImg = document.getElementById(`${section}-preview-img`);
  const submitBtn = document.getElementById(`${section}-submit-btn`);
  const removeBtn = document.getElementById(`${section}-remove-btn`);
  const loading = document.getElementById(`${section}-loading`);
  const resultCard = document.getElementById(`${section}-result-card`);
  const resultText = document.getElementById(`${section}-result-text`);

  let base64Image = '';

  promptView.addEventListener('click', () => fileInput.click());

  // Handle Drag & Drop
  zone.addEventListener('dragover', e => { e.preventDefault(); zone.style.borderColor = 'var(--gold)'; });
  zone.addEventListener('dragleave', () => { zone.style.borderColor = 'var(--glass-border)'; });
  zone.addEventListener('drop', e => {
    e.preventDefault();
    zone.style.borderColor = 'var(--glass-border)';
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  });

  fileInput.addEventListener('change', e => {
    const file = e.target.files[0];
    if (file) handleFile(file);
  });

  function handleFile(file) {
    const reader = new FileReader();
    reader.onload = function (evt) {
      base64Image = evt.target.result;
      previewImg.src = base64Image;
      promptView.style.display = 'none';
      previewView.style.display = 'block';
      submitBtn.style.display = 'inline-block';
    };
    reader.readAsDataURL(file);
  }

  removeBtn.addEventListener('click', () => {
    base64Image = '';
    previewImg.src = '';
    previewView.style.display = 'none';
    promptView.style.display = 'flex';
    submitBtn.style.display = 'none';
    resultCard.style.display = 'none';
  });

  submitBtn.addEventListener('click', async () => {
    submitBtn.style.display = 'none';
    loading.style.display = 'block';
    resultCard.style.display = 'none';
    zone.classList.add('scanning');

    try {
      const response = await fetch(getApiUrl(`/api/${section}-reading`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Image, mimeType: 'image/jpeg' })
      });

      if (!response.ok) throw new Error('Image analysis failed');

      const data = await response.json();
      resultText.innerHTML = data.reading;

      zone.classList.remove('scanning');
      loading.style.display = 'none';
      resultCard.style.display = 'block';
      submitBtn.style.display = 'none';
    } catch (err) {
      console.error(err);
      zone.classList.remove('scanning');
      loading.style.display = 'none';
      submitBtn.style.display = 'inline-block';
      alert(`Error reading ${section}. Try again.`);
    }
  });
}

/* ============================================================
   PART 7 — HISTORY & FEEDBACK
   ============================================================ */
async function loadJourneyHistory() {
  if (!activeProfile) return;
  const loadEl = document.getElementById('journey-loading');
  const emptyEl = document.getElementById('journey-empty');
  const contentEl = document.getElementById('journey-content');
  const tbody = document.getElementById('journey-tbody');

  loadEl.style.display = 'block';
  emptyEl.style.display = 'none';
  contentEl.style.display = 'none';

  try {
    const res = await fetch(getApiUrl('/api/journey-history'), {
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
    const dates = Object.keys(journey.dailyHoroscopes);

    if (dates.length === 0) {
      loadEl.style.display = 'none';
      emptyEl.style.display = 'block';
      return;
    }

    tbody.innerHTML = dates.map(d => {
      const dayData = journey.dailyHoroscopes[d];
      const displayDate = d.substring(0, 10);
      return `
        <tr>
          <td><strong style="color:var(--gold);">${displayDate}</strong></td>
          <td>${dayData.currentLocation}</td>
          <td style="font-size:0.85rem;color:var(--text-muted);">${dayData.horoscope.summary.substring(0, 80)}...</td>
          <td><button class="tab-btn" onclick="viewHistoryDetails('${d}')" style="padding:4px 10px;font-size:0.75rem;">View Detailed</button></td>
        </tr>
      `;
    }).join('');

    loadEl.style.display = 'none';
    contentEl.style.display = 'flex';

    // Store daily readings locally in window for detail retrieval
    window.journeyDailyReadings = journey.dailyHoroscopes;

  } catch (err) {
    console.error(err);
    loadEl.style.display = 'none';
    emptyEl.style.display = 'block';
  }
}

function viewHistoryDetails(dateStr) {
  const readings = window.journeyDailyReadings;
  if (!readings || !readings[dateStr]) return;
  const item = readings[dateStr];

  const detailBox = document.getElementById('journey-history-details');
  const dateTitle = document.getElementById('journey-details-date');
  const bodyBox = document.getElementById('journey-details-body');

  const displayDate = dateStr.substring(0, 10);
  dateTitle.innerText = `Daily Horoscope for Date: ${displayDate} (${item.currentLocation})`;

  const scores = item.horoscope.scores || { mood: 70, career: 70, love: 70, finance: 70, health: 70 };
  const highlights = item.horoscope.highlights || [];

  // Generate Cosmic Index progress bars
  const scoreBars = Object.entries(scores).map(([name, val]) => {
    let color = 'var(--accent-teal)';
    if (val < 60) color = 'var(--accent-rose)';
    else if (val >= 80) color = 'var(--gold)';
    
    return `
      <div style="background:rgba(255,255,255,0.03); border:1px solid var(--glass-border); border-radius:10px; padding:10px; display:flex; flex-direction:column; gap:4px;">
        <span style="font-size:0.75rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600;">${name} Index</span>
        <div style="display:flex; align-items:center; gap:8px;">
          <div style="background:rgba(255,255,255,0.1); flex:1; height:8px; border-radius:100px; overflow:hidden;">
            <div style="background:${color}; width:${val}%; height:100%; border-radius:100px;"></div>
          </div>
          <span style="font-size:0.8rem; font-weight:700; color:${color};">${val}%</span>
        </div>
      </div>
    `;
  }).join('');

  // Generate Ups & Downs highlights
  let highlightsHTML = '';
  if (highlights.length > 0) {
    highlightsHTML = `
      <div style="margin-bottom:20px; background:rgba(255,255,255,0.02); border:1px solid var(--glass-border); padding:16px; border-radius:12px;">
        <h4 style="font-family:'Cinzel',serif; color:var(--gold); font-size:0.9rem; margin-bottom:10px; letter-spacing:0.05em;">📈 Vedic Transit Highlights (Ups & Downs)</h4>
        <div style="display:flex; flex-direction:column; gap:8px; font-size:0.85rem;">
          ${highlights.map(h => `<div style="line-height:1.4;">${h.text}</div>`).join('')}
        </div>
      </div>
    `;
  }

  bodyBox.innerHTML = `
    ${highlightsHTML}

    <div style="margin-bottom:20px;">
      <h4 style="font-family:'Cinzel',serif; color:var(--gold); font-size:0.9rem; margin-bottom:10px; letter-spacing:0.05em;">🪐 Cosmic Index</h4>
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(140px, 1fr)); gap:10px;">
        ${scoreBars}
      </div>
    </div>

    <div style="background:rgba(255,255,255,0.02); padding:16px; border-radius:12px; margin-bottom:15px; border:1px solid var(--glass-border);">
      <strong style="color:var(--accent-teal);">Overall Summary:</strong> ${item.horoscope.summary}
    </div>
    <p><strong>🧠 General Mood:</strong> ${item.horoscope.breakdown.mood}</p>
    <p><strong>💼 Career &amp; Work:</strong> ${item.horoscope.breakdown.career}</p>
    <p><strong>💵 Finance &amp; Cashflow:</strong> ${item.horoscope.breakdown.finance}</p>
    <p><strong>💞 Relationships:</strong> ${item.horoscope.breakdown.love}</p>
    <p><strong>🌿 Health &amp; Energy:</strong> ${item.horoscope.breakdown.health}</p>
  `;

  detailBox.style.display = 'block';
  detailBox.scrollIntoView({ behavior: 'smooth', block: 'end' });
}

async function submitFeedback(type, rating, btn) {
  if (!activeProfile) return;
  
  // Highlight clicked button
  const row = btn.parentNode;
  row.querySelectorAll('.feedback-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  try {
    const dateInput = document.getElementById('daily-date-input').value;
    const res = await fetch(getApiUrl('/api/feedback'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: activeProfile.name,
        dob: activeProfile.dob,
        tob: activeProfile.tob,
        pob: activeProfile.pob,
        type,
        rating,
        date: type === 'daily' ? dateInput : null
      })
    });
    if (res.ok) {
      console.log("Feedback logged.");
    }
  } catch (err) {
    console.error("Failed logging feedback:", err);
  }
}

/* ============================================================
   PART 8 — SCROLL REVEAL & INIT
   ============================================================ */
function initReveal() {
  const els = document.querySelectorAll('.reveal');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('revealed'); obs.unobserve(e.target); } });
  }, { threshold: 0.1 });
  els.forEach(el => obs.observe(el));
}

// Future Prediction Oracle submit handler
document.getElementById('future-submit-btn').addEventListener('click', async () => {
  if (!activeProfile) {
    alert("Please submit your birth details first at the top of the page!");
    return;
  }
  
  const question = document.getElementById('future-question').value.trim();
  const loading = document.getElementById('future-loading');
  const submitBtn = document.getElementById('future-submit-btn');
  const resultCard = document.getElementById('future-result-card');
  const resultText = document.getElementById('future-result-text');
  
  submitBtn.style.display = 'none';
  loading.style.display = 'block';
  resultCard.style.display = 'none';
  
  try {
    const response = await fetch(getApiUrl('/api/future-prediction'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: activeProfile.name,
        dob: activeProfile.dob,
        tob: activeProfile.tob,
        pob: activeProfile.pob,
        gender: activeProfile.gender,
        question: question
      })
    });
    
    if (!response.ok) throw new Error('Future prediction failed');
    
    const data = await response.json();
    resultText.innerHTML = data.prediction;
    
    loading.style.display = 'none';
    resultCard.style.display = 'block';
    submitBtn.style.display = 'inline-block';
  } catch (err) {
    console.error(err);
    loading.style.display = 'none';
    submitBtn.style.display = 'inline-block';
    alert('Error consulting the Future Prediction Oracle. Please try again.');
  }
});