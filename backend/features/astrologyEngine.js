const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const tzlookup = require('tz-lookup');
const moment = require('moment-timezone');

// Helper to ensure logs directory exists
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

/* --- DATA TABLES --- */
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

const NAKSHATRAS = [
  { name: 'Ashwini', lord: 'Ketu', deity: 'Ashvins', symbol: '🐴', nature: 'Light, Swift', desc: 'Symbolizes quick healing, new beginnings, and pioneering spirit. Ashwini natives are fast movers with natural leadership abilities.' },
  { name: 'Bharani', lord: 'Venus', deity: 'Yama', symbol: '🔱', nature: 'Fierce', desc: 'Represents restraint, effort, and carrying burdens. Bharani natives are determined, responsible, and artistic.' },
  { name: 'Krittika', lord: 'Sun', deity: 'Agni', symbol: '🗡️', nature: 'Mixed', desc: 'Associated with fire and purification. Krittika natives are sharp, determined, and goal-oriented.' },
  { name: 'Rohini', lord: 'Moon', deity: 'Brahma', symbol: '🌸', nature: 'Fixed', desc: 'Represents fertility, beauty, and abundance. Rohini natives are creative, charismatic, and materially inclined.' },
  { name: 'Mrigashira', lord: 'Mars', deity: 'Soma', symbol: '🦌', nature: 'Soft', desc: 'Symbolizes searching, curiosity, and gentleness. Mrigashira natives are perceptive and communicative.' },
  { name: 'Ardra', lord: 'Rahu', deity: 'Rudra', symbol: '💎', nature: 'Sharp', desc: 'Represents storms and transformation. Ardra natives are intense, analytical, and intellectual.' },
  { name: 'Punarvasu', lord: 'Jupiter', deity: 'Aditi', symbol: '🏹', nature: 'Movable', desc: 'Symbolizes renewal and return of light. Punarvasu natives are benevolent, philosophical, and optimistic.' },
  { name: 'Pushya', lord: 'Saturn', deity: 'Brihaspati', symbol: '⚜️', nature: 'Light', desc: 'Most auspicious nakshatra. Pushya natives are nurturing, spiritual, and community-oriented.' },
  { name: 'Ashlesha', lord: 'Mercury', deity: 'Nagas', symbol: '🐍', nature: 'Sharp', desc: 'Represents wisdom and mystical powers. Ashlesha natives are perceptive, intense, and independent.' },
  { name: 'Magha', lord: 'Ketu', deity: 'Pitrs', symbol: '👑', nature: 'Fierce', desc: 'Symbolizes royal authority and ancestral pride. Magha natives are ambitious, noble, and traditional.' },
  { name: 'Purva Phalguni', lord: 'Venus', deity: 'Bhaga', symbol: '💑', nature: 'Fierce', desc: 'Represents pleasure, love, and creativity. Purva Phalguni natives are romantic, generous, and artistic.' },
  { name: 'Uttara Phalguni', lord: 'Sun', deity: 'Aryaman', symbol: '🌞', nature: 'Fixed', desc: 'Symbolizes patronage and benevolence. Uttara Phalguni natives are responsible, helpful, and popular.' },
  { name: 'Hasta', lord: 'Moon', deity: 'Savitar', symbol: '✋', nature: 'Light', desc: 'Represents skill, dexterity, and self-control. Hasta natives are practical, articulate, and resourceful.' },
  { name: 'Chitra', lord: 'Mars', deity: 'Vishwakarma', symbol: '💎', nature: 'Soft', desc: 'Symbolizes beauty and cosmic architecture. Chitra natives are artistic, adventurous, and magnetic.' },
  { name: 'Swati', lord: 'Rahu', deity: 'Vayu', symbol: '🌿', nature: 'Movable', desc: 'Represents independence and flexibility. Swati natives are diplomatic, business-minded, and adaptable.' },
  { name: 'Vishakha', lord: 'Jupiter', deity: 'Indra-Agni', symbol: '⚡', nature: 'Mixed', desc: 'Symbolizes purposeful achievement and ambition. Vishakha natives are goal-oriented and determined.' },
  { name: 'Anuradha', lord: 'Saturn', deity: 'Mitra', symbol: '🌸', nature: 'Soft', desc: 'Represents friendship and devotion. Anuradha natives are disciplined, spiritual, and loyal.' },
  { name: 'Jyeshtha', lord: 'Mercury', deity: 'Indra', symbol: '🔮', nature: 'Sharp', desc: 'Symbolizes seniority and protection. Jyeshtha natives are confident, authoritative, and protective.' },
  { name: 'Mula', lord: 'Ketu', deity: 'Nirrti', symbol: '🌀', nature: 'Sharp', desc: 'Represents rootedness and dissolution. Mula natives are philosophical, investigative, and transformative.' },
  { name: 'Purva Ashadha', lord: 'Venus', deity: 'Apas', symbol: '🌊', nature: 'Fierce', desc: 'Symbolizes invincibility and rejuvenation. Purva Ashadha natives are proud, creative, and philosophical.' },
  { name: 'Uttara Ashadha', lord: 'Sun', deity: 'Vishvadevas', symbol: '⚔️', nature: 'Fixed', desc: 'Represents absolute victory and inalienable authority. Uttara Ashadha natives are righteous and determined.' },
  { name: 'Shravana', lord: 'Moon', deity: 'Vishnu', symbol: '👂', nature: 'Movable', desc: 'Symbolizes listening, learning, and connection. Shravana natives are knowledgeable, perceptive, and wise.' },
  { name: 'Dhanishtha', lord: 'Mars', deity: 'Ashta Vasus', symbol: '🥁', nature: 'Movable', desc: 'Represents wealth and musical talent. Dhanishtha natives are ambitious, energetic, and generous.' },
  { name: 'Shatabhisha', lord: 'Rahu', deity: 'Varuna', symbol: '🌌', nature: 'Movable', desc: 'Symbolizes healing and mysterious knowledge. Shatabhisha natives are independent, original, and secretive.' },
  { name: 'Purva Bhadrapada', lord: 'Jupiter', deity: 'Aja Ekapada', symbol: '🔥', nature: 'Fierce', desc: 'Represents transformation through fire. Purva Bhadrapada natives are passionate, idealistic, and spiritually inclined.' },
  { name: 'Uttara Bhadrapada', lord: 'Saturn', deity: 'Ahir Budhnya', symbol: '🐍', nature: 'Fixed', desc: 'Symbolizes depth, wisdom, and renunciation. Uttara Bhadrapada natives are deep thinkers and philanthropists.' },
  { name: 'Revati', lord: 'Mercury', deity: 'Pushan', symbol: '🐟', nature: 'Soft', desc: 'Represents nourishment and safe journeys. Revati natives are compassionate, spiritual, and nurturing.' }
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

const DASHA_YEARS = { Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7, Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17 };
const DASHA_ORDER = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];

const MULANK_DATA = [
  {},
  { title: 'The Sun — Surya', traits: 'Ambitious, authoritative, natural leader, creative and proud', strength: 'Leadership, confidence, originality', challenge: 'Ego, stubbornness, need for approval', element: 'Fire', planet: 'Sun' },
  { title: 'The Moon — Chandra', traits: 'Intuitive, emotional, sensitive, nurturing and imaginative', strength: 'Emotional intelligence, creativity, diplomacy', challenge: 'Mood swings, over-sensitivity, indecision', element: 'Water', planet: 'Moon' },
  { title: 'Jupiter — Guru', traits: 'Optimistic, generous, intellectual and philosophical', strength: 'Expansion, wisdom, good fortune', challenge: 'Overconfidence, extravagance, restlessness', element: 'Fire', planet: 'Jupiter' },
  { title: 'Rahu — The Innovator', traits: 'Practical, stable, determined, hardworking and loyal', strength: 'Stability, patience, dependability', challenge: 'Rigidity, stubbornness, possessiveness', element: 'Earth', planet: 'Rahu' },
  { title: 'Mercury — Budha', traits: 'Dynamic, versatile, adventurous, witty and freedom-loving', strength: 'Communication, adaptability, quick mind', challenge: 'Inconsistency, restlessness, scatter-focus', element: 'Air', planet: 'Mercury' },
  { title: 'Venus — Shukra', traits: 'Romantic, artistic, harmonious, responsible and compassionate', strength: 'Love, beauty, balance, creativity', challenge: 'Indecision, dependence, jealousy', element: 'Earth', planet: 'Venus' },
  { title: 'Ketu — The Mystic', traits: 'Spiritual, introspective, analytical, wise and mysterious', strength: 'Wisdom, spirituality, analytical mind', challenge: 'Isolation, perfectionism, skepticism', element: 'Water', planet: 'Ketu' },
  { title: 'Saturn — Shani', traits: 'Hardworking, ambitious, materialistic, disciplined and powerful', strength: 'Ambition, organization, business acumen', challenge: 'Dominance, workaholism, emotional coldness', element: 'Earth', planet: 'Saturn' },
  { title: 'Mars — Mangal', traits: 'Humanitarian, compassionate, selfless, creative and universal', strength: 'Compassion, creativity, global vision', challenge: 'Martyrdom, possessiveness, impracticality', element: 'Fire', planet: 'Mars' }
];

const RASHI_COMPAT = {
  0: [3, 7, 11], 1: [2, 5, 9], 2: [1, 5, 9], 3: [6, 10, 0], 4: [3, 7, 11], 5: [1, 4, 9],
  6: [3, 7, 11], 7: [4, 8, 0], 8: [7, 11, 3], 9: [1, 5, 2], 10: [1, 5, 9], 11: [8, 4, 0]
};

/* --- SWISS EPHEMERIS INITIALIZATION --- */
let swephInstance = null;
const swephPromise = (async () => {
  try {
    const { load, Constants } = await import('@fusionstrings/swiss-eph');
    // Ensure WASM is in the expected path
    const wasmSrc = path.join(__dirname, 'node_modules', '@fusionstrings', 'swiss-eph', 'wasm', 'swiss_eph.wasm');
    const wasmDestDir = path.join(__dirname, 'node_modules', '@fusionstrings', 'swiss-eph', 'lib', 'wasi');
    const wasmDest = path.join(wasmDestDir, 'swiss_eph.wasm');
    if (fs.existsSync(wasmSrc) && !fs.existsSync(wasmDest)) {
      fs.mkdirSync(wasmDestDir, { recursive: true });
      fs.copyFileSync(wasmSrc, wasmDest);
    }

    swephInstance = await load();
    swephInstance.swe_set_sid_mode(Constants.SE_SIDM_LAHIRI, 0, 0);
    return { sweph: swephInstance, Constants };
  } catch (err) {
    console.error("Failed to load Swiss Ephemeris module:", err);
    throw err;
  }
})();

async function getSwisseph() {
  return await swephPromise;
}

/* --- GROQ CLIENT INITIALIZATION --- */
const { callWithRetryAndFallback } = require('../handlers/rateLimitHandler');
let aiClient = !!process.env.GROQ_API_KEY;


/* --- AUDIT LOGGING --- */
function logAudit(type, input, structuredData, interpretation) {
  try {
    const timestamp = new Date().toISOString();
    const logFile = path.join(logsDir, 'astrology_audit.log');
    const logEntry = `
========================================
TIMESTAMP: ${timestamp}
TYPE: ${type}
INPUT: ${JSON.stringify(input)}
STRUCTURED DATA: ${JSON.stringify(structuredData)}
INTERPRETATION PREVIEW: ${interpretation.substring(0, 300)}...
========================================
\n`;
    fs.appendFileSync(logFile, logEntry);
  } catch (err) {
    console.error("Error writing audit log:", err);
  }
}

/* --- COORD DATABASE --- */
function guessCityCoords(place) {
  const db = {
    mumbai: [19.07, 72.87], delhi: [28.61, 77.23], bangalore: [12.97, 77.59],
    hyderabad: [17.38, 78.48], chennai: [13.08, 80.27], kolkata: [22.57, 88.36],
    pune: [18.52, 73.86], ahmedabad: [23.03, 72.59], jaipur: [26.91, 75.79],
    lucknow: [26.85, 80.92], surat: [21.17, 72.83], bhopal: [23.26, 77.40],
    patna: [25.59, 85.13], nagpur: [21.14, 79.09], indore: [22.72, 75.85],
    bhubaneswar: [20.30, 85.83], coimbatore: [11.01, 76.96], agra: [27.18, 78.01],
    varanasi: [25.33, 83.00], chandigarh: [30.73, 76.78], amritsar: [31.63, 74.87],
    london: [51.51, -0.13], dubai: [25.20, 55.27], paris: [48.85, 2.35],
    sydney: [-33.87, 151.21], toronto: [43.65, -79.38], singapore: [1.35, 103.82],
    tokyo: [35.69, 139.69], beijing: [39.90, 116.40], islamabad: [33.72, 73.06],
    karachi: [24.87, 67.00], dhaka: [23.72, 90.41], kathmandu: [27.70, 85.31],
    colombo: [6.93, 79.85], newyork: [40.71, -74.00], losangeles: [34.05, -118.24],
    chicago: [41.88, -87.63]
  };
  const clean = place.toLowerCase().replace(/[^a-z]/g, '');
  for (const [key, coords] of Object.entries(db)) {
    if (clean.includes(key)) return coords;
  }
  return [22.5, 78.0]; // Default center of India
}

async function geocodePlace(place) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(place)}&format=json&limit=1`;
    const res = await fetch(url, { 
      headers: { 'User-Agent': 'CosmicSoulAstrology/1.0' },
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lon: parseFloat(data[0].lon),
          displayName: data[0].display_name
        };
      }
    }
  } catch (err) {
    console.warn("Nominatim Geocode failed, using local DB:", err.message);
  } finally {
    clearTimeout(timeoutId);
  }
  const coords = guessCityCoords(place);
  return { lat: coords[0], lon: coords[1], displayName: place };
}

/* --- MATH REDUCERS --- */
function reduceNum(n) {
  while (n > 9 && n !== 11 && n !== 22 && n !== 33) {
    n = String(n).split('').reduce((a, b) => a + parseInt(b), 0);
  }
  return n;
}
function calcMulank(day) { return reduceNum(day); }
function calcBhagyank(day, month, year) {
  const sum = `${day}${month}${year}`.split('').reduce((a, b) => a + parseInt(b), 0);
  return reduceNum(sum);
}
function calcNameank(name) {
  const pythagorean = {
    A:1,B:2,C:3,D:4,E:5,F:6,G:7,H:8,I:9,
    J:1,K:2,L:3,M:4,N:5,O:6,P:7,Q:8,R:9,
    S:1,T:2,U:3,V:4,W:5,X:6,Y:7,Z:8
  };
  const sum = name.toUpperCase().replace(/[^A-Z]/g,'').split('').reduce((a,c) => a + (pythagorean[c]||0), 0);
  return reduceNum(sum);
}

/* --- NAVAMSA D9 MATH --- */
function getNavamsaRashi(lon) {
  const rashi = Math.floor(lon / 30);
  const degInRashi = lon % 30;
  const navamsaPart = Math.floor(degInRashi / 3.33333333);
  let startRashi = 0;
  if (rashi === 0 || rashi === 4 || rashi === 8) startRashi = 0; // Fire
  else if (rashi === 1 || rashi === 5 || rashi === 9) startRashi = 9; // Earth
  else if (rashi === 2 || rashi === 6 || rashi === 10) startRashi = 6; // Air
  else if (rashi === 3 || rashi === 7 || rashi === 11) startRashi = 3; // Water
  return (startRashi + navamsaPart) % 12;
}

/* --- VEDIC ASPECTS & LORDS --- */
const SIGN_LORDS = ['Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter'];

function getLordOfSign(signIdx) {
  return SIGN_LORDS[signIdx];
}
function getLordOfHouse(houseNum, lagnaRashi) {
  return getLordOfSign((lagnaRashi + houseNum - 1) % 12);
}

function getVedicAspects(planetName, placementHouse) {
  const aspects = [((placementHouse + 6) % 12) || 12]; // All aspect 7th
  if (planetName === 'Jupiter' || planetName === 'Rahu' || planetName === 'Ketu') {
    aspects.push(((placementHouse + 4) % 12) || 12); // 5th
    aspects.push(((placementHouse + 8) % 12) || 12); // 9th
  } else if (planetName === 'Mars') {
    aspects.push(((placementHouse + 3) % 12) || 12); // 4th
    aspects.push(((placementHouse + 7) % 12) || 12); // 8th
  } else if (planetName === 'Saturn') {
    aspects.push(((placementHouse + 2) % 12) || 12); // 3rd
    aspects.push(((placementHouse + 9) % 12) || 12); // 10th
  }
  return aspects;
}

function getAspectsOnHouse(houseNum, planetHouses) {
  const aspecting = [];
  for (const [planetName, pdata] of Object.entries(planetHouses)) {
    const aspects = getVedicAspects(planetName, pdata.house);
    if (aspects.includes(houseNum)) {
      aspecting.push(planetName);
    }
  }
  return aspecting;
}

/* --- VIMSHOTTARI DASHA TIMELINE CALCULATOR --- */
function calculateDashaTimeline(moonLon, birthDate) {
  const nakIdx = Math.floor(moonLon / 13.33333333);
  const nakFraction = (moonLon % 13.33333333) / 13.33333333;
  const startLord = NAKSHATRAS[nakIdx].lord;
  const startLordIdx = DASHA_ORDER.indexOf(startLord);
  const totalYrs = DASHA_YEARS[startLord];
  const remainingYrs = (1 - nakFraction) * totalYrs;

  const elapsedYrs = totalYrs - remainingYrs;
  const dashaStart = new Date(birthDate);
  dashaStart.setMilliseconds(dashaStart.getMilliseconds() - elapsedYrs * 365.25 * 24 * 60 * 60 * 1000);

  const timeline = [];
  let currentStart = new Date(dashaStart);

  for (let i = 0; i < 9; i++) {
    const lord = DASHA_ORDER[(startLordIdx + i) % 9];
    const yrs = DASHA_YEARS[lord];
    const end = new Date(currentStart);
    end.setMilliseconds(end.getMilliseconds() + yrs * 365.25 * 24 * 60 * 60 * 1000);

    const antardashas = [];
    let adStart = new Date(currentStart);
    for (let j = 0; j < 9; j++) {
      const adLord = DASHA_ORDER[(DASHA_ORDER.indexOf(lord) + j) % 9];
      const adYrs = yrs * DASHA_YEARS[adLord] / 120;
      const adEnd = new Date(adStart);
      adEnd.setMilliseconds(adEnd.getMilliseconds() + adYrs * 365.25 * 24 * 60 * 60 * 1000);

      const pratyantardashas = [];
      let pdStart = new Date(adStart);
      for (let k = 0; k < 9; k++) {
        const pdLord = DASHA_ORDER[(DASHA_ORDER.indexOf(adLord) + k) % 9];
        const pdYrs = adYrs * DASHA_YEARS[pdLord] / 120;
        const pdEnd = new Date(pdStart);
        pdEnd.setMilliseconds(pdEnd.getMilliseconds() + pdYrs * 365.25 * 24 * 60 * 60 * 1000);

        pratyantardashas.push({
          lord: pdLord,
          start: pdStart.toISOString(),
          end: pdEnd.toISOString()
        });
        pdStart = new Date(pdEnd);
      }

      antardashas.push({
        lord: adLord,
        start: adStart.toISOString(),
        end: adEnd.toISOString(),
        pratyantardashas
      });
      adStart = new Date(adEnd);
    }

    timeline.push({
      lord,
      start: currentStart.toISOString(),
      end: end.toISOString(),
      antardashas
    });
    currentStart = new Date(end);
  }
  return timeline;
}

function findActiveDasha(timeline, targetDate = new Date()) {
  const targetTime = targetDate.getTime();
  let activeM = null, activeA = null, activeP = null;

  for (const m of timeline) {
    const mStart = new Date(m.start).getTime();
    const mEnd = new Date(m.end).getTime();
    if (targetTime >= mStart && targetTime < mEnd) {
      activeM = m;
      for (const a of m.antardashas) {
        const aStart = new Date(a.start).getTime();
        const aEnd = new Date(a.end).getTime();
        if (targetTime >= aStart && targetTime < aEnd) {
          activeA = a;
          for (const p of a.pratyantardashas) {
            const pStart = new Date(p.start).getTime();
            const pEnd = new Date(p.end).getTime();
            if (targetTime >= pStart && targetTime < pEnd) {
              activeP = p;
              break;
            }
          }
          break;
        }
      }
      break;
    }
  }

  return {
    mahadasha: activeM ? { lord: activeM.lord, start: activeM.start, end: activeM.end } : null,
    antardasha: activeA ? { lord: activeA.lord, start: activeA.start, end: activeA.end } : null,
    pratyantardasha: activeP ? { lord: activeP.lord, start: activeP.start, end: activeP.end } : null
  };
}

/* --- ASTROLOGICAL CALCULATOR --- */
async function calculateBlueprintData({ name, dob, tob, pob, tz, gender, isBirthTimeApprox }) {
  const { sweph, Constants } = await getSwisseph();

  const dobDate = new Date(dob);
  const [hours, mins] = tob.split(':').map(Number);
  const hourDecimal = hours + mins / 60;

  const day = dobDate.getDate();
  const month = dobDate.getMonth() + 1;
  const year = dobDate.getFullYear();

  // 1. Geocoding POB
  const birthCoords = await geocodePlace(pob);
  const lat = birthCoords.lat;
  const lon = birthCoords.lon;

  // 2. Timezone Offset
  let finalTz = parseFloat(tz);
  if (isNaN(finalTz)) {
    const tzName = tzlookup(lat, lon);
    const m = moment.tz(`${dob} ${tob}`, tzName);
    finalTz = m.utcOffset() / 60;
  }

  // 3. Julian Day
  const jd = sweph.swe_julday(year, month, day, hourDecimal - finalTz, Constants.SE_GREG_CAL);

  // 4. Planets Positions
  const planetsList = [
    { name: 'Sun', id: Constants.SE_SUN },
    { name: 'Moon', id: Constants.SE_MOON },
    { name: 'Mars', id: Constants.SE_MARS },
    { name: 'Mercury', id: Constants.SE_MERCURY },
    { name: 'Jupiter', id: Constants.SE_JUPITER },
    { name: 'Venus', id: Constants.SE_VENUS },
    { name: 'Saturn', id: Constants.SE_SATURN },
    { name: 'Rahu', id: Constants.SE_TRUE_NODE }
  ];

  const flags = Constants.SEFLG_SPEED | Constants.SEFLG_SIDEREAL | Constants.SEFLG_SWIEPH;
  const planetsData = {};

  for (const p of planetsList) {
    const calc = sweph.swe_calc_ut(jd, p.id, flags);
    const rawLon = calc.xx[0];
    const speed = calc.xx[3];
    planetsData[p.name] = {
      lon: rawLon,
      rashi: Math.floor(rawLon / 30),
      deg: rawLon % 30,
      retro: speed < 0
    };
  }

  // Ketu = Rahu + 180
  const rahuLon = planetsData['Rahu'].lon;
  const ketuLon = (rahuLon + 180) % 360;
  planetsData['Ketu'] = {
    lon: ketuLon,
    rashi: Math.floor(ketuLon / 30),
    deg: ketuLon % 30,
    retro: true
  };

  // 5. Lagna and Whole Sign Houses
  const housesCalc = sweph.swe_houses_ex(jd, flags, lat, lon, 'W'.charCodeAt(0));
  const lagnaLon = housesCalc.ascmc[0];
  const lagnaRashi = Math.floor(lagnaLon / 30);
  const lagnaDeg = lagnaLon % 30;

  // Set houses for all planets
  const planetHouses = {};
  for (const [pname, pdata] of Object.entries(planetsData)) {
    const house = ((pdata.rashi - lagnaRashi + 12) % 12) + 1;
    planetHouses[pname] = { ...pdata, house };
  }

  // 6. D9 Navamsa Chart
  const d9Chart = {};
  const lagnaD9Rashi = getNavamsaRashi(lagnaLon);
  d9Chart['Lagna'] = { rashi: lagnaD9Rashi, house: 1 };
  for (const [pname, pdata] of Object.entries(planetsData)) {
    const d9Rashi = getNavamsaRashi(pdata.lon);
    const d9House = ((d9Rashi - lagnaD9Rashi + 12) % 12) + 1;
    d9Chart[pname] = { rashi: d9Rashi, house: d9House };
  }

  // 7. Nakshatra
  const moonLon = planetsData.Moon.lon;
  const nakLen = 13.33333333;
  const nakIdx = Math.min(26, Math.floor(moonLon / nakLen));
  const posInNak = moonLon % nakLen;
  const pada = Math.min(4, Math.floor(posInNak / (nakLen / 4)) + 1);
  const nakshatra = { idx: nakIdx, pada, ...NAKSHATRAS[nakIdx] };

  // 8. Dasha Timeline
  const dashaTimeline = calculateDashaTimeline(moonLon, dobDate);
  const activeDasha = findActiveDasha(dashaTimeline, new Date());

  // 9. Numerology
  const mulank = calcMulank(day);
  const bhagyank = calcBhagyank(day, month, year);
  const nameank = calcNameank(name);

  return {
    name, dob, tob, pob, lat, lon, tz: finalTz, gender, isBirthTimeApprox,
    lagna: { lon: lagnaLon, rashi: lagnaRashi, deg: lagnaDeg },
    planetHouses,
    d9Chart,
    nakshatra,
    dashaTimeline,
    activeDasha,
    mulank,
    bhagyank,
    nameank
  };
}

/* --- FALLBACK TEXT HOROSCOPES --- */
function getOrdinal(num) {
  const s = ["th", "st", "nd", "rd"];
  const v = num % 100;
  return num + (s[(v - 20) % 10] || s[v] || s[0]);
}

function compileLocalMarriageReading(data) {
  const { planetHouses, d9Chart, lagna, gender, isBirthTimeApprox } = data;
  const venus = planetHouses.Venus;
  const mars = planetHouses.Mars;
  const jupiter = planetHouses.Jupiter;
  const seventhLord = getLordOfHouse(7, lagna.rashi);
  const seventhLordPlacement = planetHouses[seventhLord];
  const aspectsOn7th = getAspectsOnHouse(7, planetHouses);
  const in7th = Object.keys(planetHouses).filter(p => planetHouses[p].house === 7);

  // Kuja Dosha Check
  const kujaDosha = [1, 2, 4, 7, 8, 12].includes(mars.house);

  // D9 analysis
  const d9Venus = d9Chart.Venus;
  const d9seventhLord = d9Chart[seventhLord];

  // Calculate confidence score
  let score = 75;
  if (isBirthTimeApprox) score -= 15;
  if ([6, 8, 12].includes(seventhLordPlacement.house)) score -= 10;
  if (kujaDosha) score -= 5;
  if (in7th.includes('Jupiter') || aspectsOn7th.includes('Jupiter')) score += 10;
  if (in7th.includes('Venus') || aspectsOn7th.includes('Venus')) score += 5;
  score = Math.max(40, Math.min(95, score));

  // Exhaustive spouse description based on Venus house
  const venusHouseMeanings = {
    1: "indicates a partner who is attractive, confident, and plays a major role in shape-shifting your personality. The relationship is highly visible and central to your life.",
    2: "suggests a spouse from a wealthy or stable family background. The partner will contribute significantly to your savings, financial assets, and domestic harmony.",
    3: "points to a partner who is highly communicative, possibly involved in writing, media, or local travel. You will share many short trips and intellectual debates.",
    4: "reveals a spouse who brings deep emotional comfort, maternal affection, and happiness. They are closely connected to home life, properties, and your inner peace.",
    5: "indicates a highly creative, intelligent, and romantic spouse. The relationship is full of joy, and your partner will share a deep connection with children and education.",
    6: "suggests a partner met through service, daily work, or health sectors. You may need to navigate initial arguments or health concerns together, building mutual service.",
    7: "is one of the most auspicious positions, indicating a highly attractive, balanced, and devoted partner. Business partnership or public support often follows marriage.",
    8: "points to a partner with deep mystical, investigative, or research-oriented tendencies. The marriage will bring major life transformations and sudden financial inheritance.",
    9: "suggests a spouse met during higher travel, university, or spiritual retreats. They will act as a guide, guru, or philosophical anchor in your life.",
    10: "reveals a spouse who is highly career-oriented, public-facing, or authoritative. Marriage will elevate your social status and bring career coordination.",
    11: "indicates a spouse met through friends, social networks, or clubs. They will help fulfill your life desires, financial gains, and long-term ambitions.",
    12: "points to a spouse with a deep spiritual, artistic, or foreign connection. They may love isolation, meditation, or work in foreign lands."
  };

  // 7th Lord house meanings
  const lordHouseMeanings = {
    1: "spouse will be extremely self-oriented, highly devoted to you, and the marriage will closely shape your health and path in life.",
    2: "marriage will act as a powerful wealth accumulator. Your spouse will be very close to your family and support domestic gains.",
    3: "spouse will have close ties with siblings or neighbors, loving writing, communication, and short travels.",
    4: "partner brings real estate assets, home comfort, and a strong maternal relationship. They prioritize family roots.",
    5: "spouse is highly intellectual, religious, and shares a deep love for fine arts, speculative investments, and children.",
    6: "indicates potential disputes, debts, or health adjustments. Patience and routine cooperation are required to maintain long-term harmony.",
    7: "spouse is independent, a business partner, and the relationship is highly visible in your social life.",
    8: "marriage brings mystical secrets, occult research, or unexpected monetary windfalls, though requires managing emotional secrets.",
    9: "spouse will be righteous, deeply spiritual, and may come from a different cultural background, bringing wisdom and expansion.",
    10: "partner will assist in your professional advancement. They have a strong reputation and love executive leadership.",
    11: "partner brings substantial gains, fulfilling your wishes, and bringing a large circle of supportive friends.",
    12: "spouse is highly spiritual, connected to foreign countries, or involved in charities, hospitals, or private retreats."
  };

  let loveNature = `<p>Venus represents attraction and your aesthetic standard in relationships. Placed in the <strong>${getOrdinal(venus.house)} House</strong> in <strong>${RASHIS[venus.rashi].name}</strong>, this ${venusHouseMeanings[venus.house] || 'indicates deep romantic connections'}</p>`;
  
  let marriageDetails = `<p>Your 7th house of marriage starts in <strong>${RASHIS[(lagna.rashi + 6) % 12].name}</strong>. The 7th house lord, <strong>${seventhLord}</strong>, is positioned in the <strong>${getOrdinal(seventhLordPlacement.house)} House</strong> in your natal chart, indicating that your ${lordHouseMeanings[seventhLordPlacement.house] || 'spouse is closely connected to your life path.'}</p>`;
  
  if (in7th.length > 0) {
    marriageDetails += `<p>Planets placed in your 7th house include: <strong>${in7th.join(', ')}</strong>. This infuses the partnership with their specific energies, creating a ${in7th.includes('Saturn') ? 'disciplined, mature partnership with lessons in commitment' : in7th.includes('Jupiter') ? 'highly auspicious, wise, and prosperous bond' : 'highly dynamic, communicative relationship'}.</p>`;
  }
  if (aspectsOn7th.length > 0) {
    marriageDetails += `<p>The 7th house is aspected by <strong>${aspectsOn7th.join(', ')}</strong>, influencing the timeline and harmony of your relationships. ${aspectsOn7th.includes('Saturn') ? 'Saturn aspects indicate delay or mature commitment after age 28.' : ''} ${aspectsOn7th.includes('Jupiter') ? 'Jupiter aspects act as a protective shield, resolving relationship struggles.' : ''}</p>`;
  }

  let d9Analysis = `<p>In your Navamsa (D9) chart (which maps the inner soul dimension of marriage), Venus is in the <strong>${getOrdinal(d9Venus.house)} House</strong> in <strong>${RASHIS[d9Venus.rashi].name}</strong>. The 7th lord of the main chart in D9 goes to the <strong>${getOrdinal(d9seventhLord.house)} House</strong>, indicating a ${d9seventhLord.house <= 6 ? 'dynamic where mutual effort, routine adjustments, and daily compromise are key early in the marriage' : 'strong alignment of destiny, spiritual growth, and shared values in late marriage'}.</p>`;

  let doshaMsg = kujaDosha 
    ? `<p class="retrograde"><strong>Mangal Dosha / Kuja Dosha Detected:</strong> Mars is placed in the ${getOrdinal(mars.house)} house. This signifies high passion, energy, and strong opinions, which requires a partner with a matching planetary layout or Mars placement to balance the energetic drive. Remedies include Hanuman Chalisa chants, Kumbh Vivah, or marriage after age 28 when Mars matures.</p>`
    : `<p style="color:#66bb6a;"><strong>No major Mangal Dosha:</strong> Your Mars placement is harmonized, indicating a balanced flow of passion, physical energy, and drive in long-term relationships.</p>`;

  return [
    {
      icon: '💖',
      title: 'Spousal Character & Attraction',
      type: 'love',
      stars: venus.house === 7 || jupiter.house === 7 ? 5 : 4,
      body: loveNature + d9Analysis
    },
    {
      icon: '💍',
      title: 'Marriage Timing & Compatibility',
      type: 'love',
      stars: score >= 75 ? 5 : score >= 60 ? 4 : 3,
      body: marriageDetails + doshaMsg + `<p>Estimated marriage timing is active during dashas of the 7th lord <strong>(${seventhLord})</strong> or Venus. Check your current Dasha tab to see if these are activated.</p>`
    }
  ];
}

function compileLocalCareerReading(data) {
  const { planetHouses, lagna, mulank, bhagyank } = data;
  const sun = planetHouses.Sun;
  const saturn = planetHouses.Saturn;
  const jupiter = planetHouses.Jupiter;
  const tenthLord = getLordOfHouse(10, lagna.rashi);
  const tenthLordPlacement = planetHouses[tenthLord];
  const secondLord = getLordOfHouse(2, lagna.rashi);
  const eleventhLord = getLordOfHouse(11, lagna.rashi);

  const elementMap = {
    Fire: 'leadership, administrative roles, military, security, politics, or entrepreneurship',
    Earth: 'finance, banking, real estate, agriculture, operations, structure, or healthcare',
    Air: 'communication, technology, media, journalism, education, aviation, or consultancy',
    Water: 'creative arts, design, counseling, marine, social services, hospitality, or writing'
  };

  const tenthLordHouseMeanings = {
    1: "focuses heavily on self-employment, building a personal brand, and holding public authority. You prefer to lead and control your schedule.",
    2: "indicates financial management, banking, family business, speech-related careers, or luxury goods. You excel at asset accumulation.",
    3: "points to writing, local media, sales, communications, marketing, online businesses, or short travel coordination.",
    4: "reveals real estate, architecture, domestic products, education, agriculture, or vehicle-related businesses.",
    5: "suggests creative arts, teaching, political counseling, stock markets, speculation, entertainment, or child education.",
    6: "indicates legal services, service sectors, medical fields, conflict resolution, or dealing with debts and daily operations.",
    7: "points to partnerships, international trade, public relations, consulting, retail, or client-facing operations.",
    8: "suggests deep research, occult sciences, emergency medicine, tax departments, insurance, mining, or handling other people's wealth.",
    9: "reveals higher education, law, publishing, spiritual guidance, international travel, or acting as an advisor.",
    10: "is highly prestigious, indicating career success, political status, government contracts, corporate executive roles, or massive public fame.",
    11: "indicates large corporate networks, community organizations, massive financial gains, non-profit systems, or technology projects.",
    12: "points to foreign corporations, international travel, hospitals, laboratories, import-export, or isolated research retreats."
  };

  const careerPath = `<p>Your natal Lagna is in the <strong>${elementMap[RASHIS[lagna.rashi].element] || 'creative'}</strong> element sign of <strong>${RASHIS[lagna.rashi].name}</strong>, aligning your natural talents with these fields.</p>
  <p>The 10th Lord of career, <strong>${tenthLord}</strong>, is placed in the <strong>${getOrdinal(tenthLordPlacement.house)} House</strong>. This shows that your professional activities are centered around ${tenthLordHouseMeanings[tenthLordPlacement.house] || 'professional operations and leadership.'}</p>`;

  const financeReading = `<p>Your wealth houses are the 2nd (savings/assets) and 11th (gains/cash flow). The 2nd house lord is <strong>${secondLord}</strong> and the 11th house lord is <strong>${eleventhLord}</strong>. With Jupiter placed in the <strong>${getOrdinal(jupiter.house)} House</strong>, your financial success is ${jupiter.house <= 5 ? 'active early in life through creative endeavors, intelligent initiatives, and self-made ventures' : 'built steadily through professional networks, corporate partnerships, savings disciplines, and solid execution after the age of 30'}.</p>`;

  const timingReading = `<p>Saturn is currently transiting your chart, bringing structure, discipline, and focusing your efforts. Significant career milestones, promotions, and wealth expansions are indicated around the ages of ${mulank + 22}, ${bhagyank + 26}, or ${mulank + 32}.</p>`;

  return [
    {
      icon: '💼',
      title: 'Professional Destiny & Path',
      type: 'career',
      stars: sun.house === 10 || tenthLordPlacement.house === 10 ? 5 : 4,
      body: careerPath
    },
    {
      icon: '📈',
      title: 'Wealth & Income Channels',
      type: 'career',
      stars: jupiter.house === 2 || jupiter.house === 11 ? 5 : 4,
      body: financeReading + timingReading
    }
  ];
}

function compileLocalHealthReading(data) {
  const { planetHouses, lagna } = data;
  const mars = planetHouses.Mars;
  const saturn = planetHouses.Saturn;

  const elementHealth = {
    Fire: 'cardiovascular system, blood circulation, and heat levels. Manage stress levels.',
    Earth: 'bone density, joints, and metabolic/digestive system. Regular activity is key.',
    Air: 'nervous system, lungs, and breathing cycles. Mindful meditation is highly supportive.',
    Water: 'lymphatic system, fluid balances, and kidney functions. Stay properly hydrated.'
  };

  const general = `<p>With a ${RASHIS[lagna.rashi].element} Lagna, special attention should be paid to your <strong>${elementHealth[RASHIS[lagna.rashi].element]}</strong>.</p>
  <p>The 6th house of health and resistance contains <strong>${Object.keys(planetHouses).filter(p => planetHouses[p].house === 6).join(', ') || 'no malefic planets'}</strong>. This indicates a ${Object.keys(planetHouses).filter(p => planetHouses[p].house === 6).length > 0 ? 'need for regular checkups' : 'very strong natural resistance and physical constitution throughout life'}.</p>`;

  const vitality = `<p>Mars in the <strong>${getOrdinal(mars.house)} House</strong> grants you ${mars.house <= 6 ? 'high active recovery rate and good muscles' : 'need to avoid high physical risks and overexertion'}. Saturn in the <strong>${getOrdinal(saturn.house)} House</strong> advises ${saturn.house === 6 ? 'rigid health discipline' : 'regular skeletal and posture checks'}.</p>`;

  return [
    {
      icon: '🌿',
      title: 'Physical Vitality & Constitution',
      type: 'health',
      stars: 4,
      body: general + vitality
    }
  ];
}

function compileLocalLuckyElements(data) {
  const { mulank, bhagyank, lagna, moonRashi } = data;
  const luckyNums = {
    1: [1, 9, 10, 19], 2: [2, 11, 20, 29], 3: [3, 12, 21, 30], 4: [4, 13, 22, 31],
    5: [5, 14, 23, 32], 6: [6, 15, 24, 33], 7: [7, 16, 25, 34], 8: [8, 17, 26, 35], 9: [9, 18, 27, 36]
  };
  const luckyDays = {
    1: 'Sunday', 2: 'Monday', 3: 'Thursday', 4: 'Sunday',
    5: 'Wednesday', 6: 'Friday', 7: 'Monday', 8: 'Saturday', 9: 'Tuesday'
  };
  const luckyColors = {
    0: 'Red & Coral', 1: 'White & Pink', 2: 'Green & Yellow',
    3: 'Silver & White', 4: 'Gold & Orange', 5: 'Blue & Green',
    6: 'Pink & White', 7: 'Red & Maroon', 8: 'Yellow & Purple',
    9: 'Black & Blue', 10: 'Electric Blue', 11: 'Sea Green & Purple'
  };
  const gems = {
    1: 'Ruby', 2: 'Pearl', 3: 'Yellow Sapphire', 4: 'Hessonite (Gomed)',
    5: 'Emerald', 6: 'Diamond', 7: "Cat's Eye", 8: 'Blue Sapphire', 9: 'Red Coral'
  };
  const metals = { 1: 'Gold', 2: 'Silver', 3: 'Gold', 4: 'Silver', 5: 'Bronze', 6: 'Silver', 7: 'Gold', 8: 'Iron', 9: 'Copper' };

  return {
    luckyNums: (luckyNums[mulank] || [1, 2, 3]).join(', '),
    luckyDay: luckyDays[mulank] || 'Sunday',
    luckyColor: luckyColors[lagna.rashi] || 'Gold & Purple',
    gem: gems[bhagyank] || 'Pearl',
    metal: metals[mulank] || 'Gold',
    flower: ['Rose', 'Lotus', 'Marigold', 'Jasmine', 'Sunflower', 'Champa', 'Tulsi'][mulank % 7],
    mantra: ['Om Hreem Suryaya Namah', 'Om Somaya Namah', 'Om Brihaspataye Namah',
             'Om Rahave Namah', 'Om Budhaya Namah', 'Om Shukraya Namah',
             'Om Ketave Namah', 'Om Shanaishcharaya Namah', 'Om Angarakaya Namah'][mulank - 1] || 'Om Namah Shivaya',
    rulingGod: ['Lord Surya', 'Goddess Parvati', 'Lord Vishnu', 'Lord Ganesha',
                'Lord Krishna', 'Goddess Lakshmi', 'Lord Shiva', 'Lord Shani', 'Goddess Durga'][mulank - 1] || 'Lord Shiva',
    yantra: ['Surya Yantra', 'Chandra Yantra', 'Guru Yantra', 'Rahu Yantra',
             'Budha Yantra', 'Shukra Yantra', 'Ketu Yantra', 'Shani Yantra', 'Mangal Yantra'][mulank - 1] || 'Sri Yantra'
  };
}

function compileLocalDailyHoroscope(natalData, transitData) {
  const careerImpact = transitData.Jupiter.house === 10 || transitData.Saturn.house === 10 ? 'high focus' : 'moderate';
  const financeImpact = transitData.Venus.house === 2 || transitData.Jupiter.house === 2 ? 'excellent gains' : 'neutral';

  const moodDescriptions = {
    1: "With the transit Moon moving through your 1st house today, your focus is entirely on self-improvement, health, and personal goals. You feel highly sensitive but energetic.",
    2: "With the transit Moon in your 2nd house of assets today, you feel drawn to financial planning, luxury dining, and domestic conversations. Keep tabs on savings.",
    3: "With the transit Moon in your 3rd house today, communication, local meetings, and creative writing are highlighted. You feel highly active and self-willed.",
    4: "With the transit Moon in your 4th house today, you seek inner comfort, family conversations, and home decoration. A peaceful day to rest and meditate.",
    5: "With the transit Moon in your 5th house today, creative pursuits, romantic encounters, and children bring joy. Speculative choices are favored but stay logical.",
    6: "With the transit Moon in your 6th house today, your mind shifts to organizing tasks, daily chores, and health/diet planning. Avoid entering unnecessary disputes.",
    7: "With the transit Moon in your 7th house today, public relations, marriage conversations, and consulting are highly favored. You seek social engagement.",
    8: "With the transit Moon in your 8th house today, you feel deeply introspective. Secrets, mystical learning, or tax/financial planning are highlighted.",
    9: "With the transit Moon in your 9th house today, spiritual growth, long travel plans, and higher education studies bring mental expansion.",
    10: "With the transit Moon in your 10th house today, you feel emotionally aligned with career progress and public authority. A great day to meet bosses/clients.",
    11: "With the transit Moon in your 11th house today, friends, social groups, and long-term ambitions bring gains and happiness. A highly social day.",
    12: "With the transit Moon in your 12th house today, your energy is introspective. You seek isolation, sound sleep, spiritual meditation, or foreign dreams."
  };

  const summary = `Today's transits spotlight your ${getOrdinal(transitData.Moon.house)} house, driving shifts in your ${transitData.Moon.house === 1 || transitData.Moon.house === 10 ? 'professional activity and personal drive' : transitData.Moon.house === 2 || transitData.Moon.house === 11 ? 'financial savings and social gains' : 'inner emotional peace and relationship networks'}.`;

  // Calculate Cosmic Index Scores (0-100)
  let moodScore = 70;
  if ([6, 8, 12].includes(transitData.Moon.house)) moodScore -= 15;
  if ([1, 5, 9].includes(transitData.Moon.house)) moodScore += 15;

  let careerScore = 70;
  if ([10, 12].includes(transitData.Saturn.house)) careerScore -= 10;
  if ([10, 11].includes(transitData.Jupiter.house)) careerScore += 20;

  let loveScore = 70;
  if ([5, 7, 11].includes(transitData.Venus.house)) loveScore += 20;
  if (transitData.Mars.house === 7) loveScore -= 15;

  let financeScore = 70;
  if ([2, 11].includes(transitData.Jupiter.house)) financeScore += 20;
  if ([2, 11].includes(transitData.Venus.house)) financeScore += 10;
  if ([2, 11].includes(transitData.Saturn.house)) financeScore -= 10;

  let healthScore = 75;
  if ([6, 8].includes(transitData.Mars.house)) healthScore -= 15;
  if ([6, 8].includes(transitData.Saturn.house)) healthScore -= 10;

  // Generate Ups & Downs highlights
  const highlights = [];
  
  // Jupiter
  if ([1, 2, 5, 9, 10, 11].includes(transitData.Jupiter.house)) {
    highlights.push({ type: 'up', text: `🟢 Jupiter in ${getOrdinal(transitData.Jupiter.house)} House: Excellent period for wisdom, wealth gains, and new career networks.` });
  } else {
    highlights.push({ type: 'up', text: `🟢 Jupiter in ${getOrdinal(transitData.Jupiter.house)} House: Supports internal meditation, spiritual growth, and personal harmony.` });
  }

  // Saturn
  if ([6, 8, 10, 12].includes(transitData.Saturn.house)) {
    highlights.push({ type: 'down', text: `🔴 Saturn in ${getOrdinal(transitData.Saturn.house)} House: High pressure at work. Demands patience, hard work, and discipline.` });
  } else {
    highlights.push({ type: 'up', text: `🟢 Saturn in ${getOrdinal(transitData.Saturn.house)} House: Promotes steady build-up of assets and long-term career foundation.` });
  }

  // Mars
  if ([6, 8, 12].includes(transitData.Mars.house)) {
    highlights.push({ type: 'down', text: `🔴 Mars in ${getOrdinal(transitData.Mars.house)} House: High stress or fatigue. Avoid heavy physical risks and keep hydrated.` });
  } else {
    highlights.push({ type: 'up', text: `🟢 Mars in ${getOrdinal(transitData.Mars.house)} House: Inspires high motivation, personal drive, and active project execution.` });
  }

  // Venus
  if ([5, 7, 11].includes(transitData.Venus.house)) {
    highlights.push({ type: 'up', text: `🟢 Venus in ${getOrdinal(transitData.Venus.house)} House: Very favorable transit for romance, marriage harmony, and social outings.` });
  }

  return {
    summary: summary,
    scores: {
      mood: moodScore,
      career: careerScore,
      love: loveScore,
      finance: financeScore,
      health: healthScore
    },
    highlights: highlights,
    breakdown: {
      mood: moodDescriptions[transitData.Moon.house] || `With the transit Moon currently moving through your natal ${getOrdinal(transitData.Moon.house)} house, your emotional focus shifts here, promoting ${transitData.Moon.house % 2 === 0 ? 'active, analytical, and highly organized' : 'introspective, creative, and intuitive'} thoughts.`,
      career: `Transit Saturn in your ${getOrdinal(transitData.Saturn.house)} house suggests ${careerImpact === 'high focus' ? 'critical opportunities and tasks require your complete discipline and focus' : 'steady progress, keep organizing your long-term career systems'}.`,
      finance: `Jupiter is currently transiting your ${getOrdinal(transitData.Jupiter.house)} house, suggesting ${financeImpact === 'excellent gains' ? 'lucrative periods for financial expansion, salary negotiation, or budgeting' : 'stabilized savings, avoid speculative investments today and track expenses'}.`,
      love: `Venus transiting your ${getOrdinal(transitData.Venus.house)} house indicates ${transitData.Venus.house === 7 || transitData.Venus.house === 5 ? 'highly active romantic energy, perfect for communication, dating, and mutual appreciation' : 'joyful discussions within your home or family domain'}.`,
      health: `Transit Mars in your ${getOrdinal(transitData.Mars.house)} house warns against ${transitData.Mars.house === 6 || transitData.Mars.house === 8 ? 'minor physical risks, sudden fatigue, or muscle cramps. Protect your body and hydrate' : 'overworking. Get sound sleep tonight to recover your vitality'}.`
    }
  };
}

/* --- GROQ API DYNAMIC GENERATORS --- */
async function generateAIEnhancedLove(data) {
  if (!aiClient) return null;
  const prompt = `
Generate a deeply personalized, professional Vedic marriage and relationship reading.
User Details:
Name: ${data.name}
Gender: ${data.gender}
Lagna (Ascendant): ${RASHIS[data.lagna.rashi].name} at ${data.lagna.deg.toFixed(1)}°
Planetary Placements in D1 Chart (Whole Sign Houses):
${Object.entries(data.planetHouses).map(([k,v]) => `- ${k}: Sign ${RASHIS[v.rashi].name}, House ${v.house}, Deg ${v.deg.toFixed(1)}°${v.retro ? ' (Retrograde)' : ''}`).join('\n')}

Navamsa (D9) Chart Placements:
${Object.entries(data.d9Chart).map(([k,v]) => `- ${k}: Sign ${RASHIS[v.rashi].name}, House ${v.house}`).join('\n')}

Active Mahadasha: ${data.activeDasha.mahadasha?.lord || 'N/A'}, Antardasha: ${data.activeDasha.antardasha?.lord || 'N/A'}

Rules & Specific focus:
- Analyze the 7th house lord, its placement, and aspects/conjunctions.
- Venus and Mars placement and strength (for love, attraction, spouse indicators).
- Navamsa (D9) chart analysis and its impact on marriage longevity/compatibility.
- Dasha/transit timing to estimate probable marriage period.
- Check Mangal Dosha (Mars in 1st, 2nd, 4th, 7th, 8th, or 12th house).
- Note: Birth time is ${data.isBirthTimeApprox ? 'APPROXIMATE (Confidence of house-based/Dasha predictions is lowered)' : 'EXACT'}.

Output format: Return JSON with exactly these two fields:
{
  "spousalCharacter": "HTML string containing the reading of spousal attraction, Navamsa details, Venus/Mars strength, and Mangal Dosha",
  "marriageTiming": "HTML string detailing the probable timeline, dasha connection, transits, confidence score discussion"
}
`;

  try {
    const res = await callWithRetryAndFallback({
      messages: [
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
      max_tokens: 3000,
      temperature: 0.8
    });
    const result = JSON.parse(res.choices[0].message.content);
    return [
      {
        icon: '💖',
        title: 'Spousal Character & Attraction',
        type: 'love',
        stars: 4,
        body: result.spousalCharacter
      },
      {
        icon: '💍',
        title: 'Marriage Timing & Compatibility',
        type: 'love',
        stars: data.isBirthTimeApprox ? 3 : 5,
        body: result.marriageTiming
      }
    ];
  } catch (err) {
    console.error("Groq Marriage read failed, falling back:", err);
    return null;
  }
}

async function generateAIEnhancedCareer(data) {
  if (!aiClient) return null;
  const prompt = `
Generate a deeply personalized, professional Vedic career and finance reading.
User Details:
Name: ${data.name}
Lagna (Ascendant): ${RASHIS[data.lagna.rashi].name} at ${data.lagna.deg.toFixed(1)}°
Planetary Placements in D1 Chart (Whole Sign Houses):
${Object.entries(data.planetHouses).map(([k,v]) => `- ${k}: Sign ${RASHIS[v.rashi].name}, House ${v.house}, Deg ${v.deg.toFixed(1)}°`).join('\n')}

Active Mahadasha: ${data.activeDasha.mahadasha?.lord || 'N/A'}, Antardasha: ${data.activeDasha.antardasha?.lord || 'N/A'}
Numerology: Mulank ${data.mulank}, Bhagyank ${data.bhagyank}

Rules & Specific focus:
- Analyze 10th house lord and placement.
- Analyze 2nd and 11th houses (wealth and gains).
- Link current Dasha/Antardasha lord's relationship to these career/wealth houses.
- Incorporate current transits (e.g. Saturn transit over natal houses).
- Note: Birth time is ${data.isBirthTimeApprox ? 'APPROXIMATE (Confidence of house-based/Dasha predictions is lowered)' : 'EXACT'}.

Output format: Return JSON with exactly these two fields:
{
  "careerPath": "HTML string analyzing career destiny, professional fields, 10th lord details",
  "wealthTiming": "HTML string analyzing 2nd and 11th houses, Jupiter placement, Dasha timing, and Saturn/Jupiter transits activation"
}
`;

  try {
    const res = await callWithRetryAndFallback({
      messages: [
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
      max_tokens: 3000,
      temperature: 0.8
    });
    const result = JSON.parse(res.choices[0].message.content);
    return [
      {
        icon: '💼',
        title: 'Professional Destiny & Path',
        type: 'career',
        stars: 5,
        body: result.careerPath
      },
      {
        icon: '📈',
        title: 'Wealth & Income Channels',
        type: 'career',
        stars: data.isBirthTimeApprox ? 3 : 5,
        body: result.wealthTiming
      }
    ];
  } catch (err) {
    console.error("Groq Career read failed, falling back:", err);
    return null;
  }
}

async function generateAIEnhancedDaily(natalData, transitData, dateStr) {
  if (!aiClient) return null;
  const prompt = `
Generate a personalized Daily Horoscope for ${natalData.name} for date ${dateStr}.
User Natal Details:
Lagna: ${RASHIS[natalData.lagna.rashi].name}
Planets Placement: ${Object.entries(natalData.planetHouses).map(([k,v]) => `${k} in house ${v.house} (${RASHIS[v.rashi].name})`).join(', ')}

Today's Transit Positions (relative to User's Natal Lagna):
${Object.entries(transitData).map(([k,v]) => `${k} is transiting through house ${v.house} (${RASHIS[v.rashi].name})`).join(', ')}

Write a highly personalized horoscope. Return a JSON object strictly adhering to this structure:
{
  "summary": "Short 1-2 sentence overall summary of the day",
  "scores": {
    "mood": 85,
    "career": 90,
    "love": 75,
    "finance": 80,
    "health": 85
  },
  "highlights": [
    { "type": "up", "text": "🟢 Jupiter in 1st House: Excellent period for wisdom, wealth gains, and new career networks." },
    { "type": "down", "text": "🔴 Saturn in 12th House: High pressure at work. Demands patience, hard work, and discipline." }
  ],
  "breakdown": {
    "mood": "Short HTML paragraph for mood & feelings",
    "career": "Short HTML paragraph for work & tasks",
    "finance": "Short HTML paragraph for wealth & expenses",
    "love": "Short HTML paragraph for relationships & affection",
    "health": "Short HTML paragraph for energy & health advice"
  }
}
`;

  try {
    const res = await callWithRetryAndFallback({
      messages: [
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
      max_tokens: 3000,
      temperature: 0.8
    });
    return JSON.parse(res.choices[0].message.content);
  } catch (err) {
    console.error("Groq Daily read failed, falling back:", err);
    return null;
  }
}


/* --- EXPORTED CORE API FUNCTIONS --- */
async function calculateBlueprint(reqData) {
  const data = await calculateBlueprintData(reqData);

  // Re-generate predictions using Gemini or Fallback
  let isAIEnhanced = false;
  let lovePreds = null;
  let careerPreds = null;

  if (aiClient) {
    lovePreds = await generateAIEnhancedLove(data);
    careerPreds = await generateAIEnhancedCareer(data);
    if (lovePreds && careerPreds) {
      isAIEnhanced = true;
    }
  }

  // Fallback if AI fails or key is missing
  if (!lovePreds) {
    lovePreds = compileLocalMarriageReading(data);
  }
  if (!careerPreds) {
    careerPreds = compileLocalCareerReading(data);
  }

  const healthPreds = compileLocalHealthReading(data);
  const luckyData = compileLocalLuckyElements(data);

  const basisOfReading = {
    lagnaDegree: `${data.lagna.deg.toFixed(2)}° in ${RASHIS[data.lagna.rashi].name}`,
    moonNakshatra: `${data.nakshatra.name} (Pada ${data.nakshatra.pada})`,
    mahadasha: `${data.activeDasha.mahadasha?.lord || 'None'} Mahadasha active`,
    antardasha: `${data.activeDasha.antardasha?.lord || 'None'} Antardasha active`,
    pratyantardasha: `${data.activeDasha.pratyantardasha?.lord || 'None'} Pratyantardasha active`,
    calculationMethod: "Swiss Ephemeris (Sidereal Zodiac / Lahiri Ayanamsha)"
  };

  const payload = {
    ...data,
    moonRashi: data.planetHouses.Moon.rashi,
    lagnaRashi: data.lagna.rashi,
    lovePreds,
    careerPreds,
    healthPreds,
    luckyData,
    isAIEnhanced,
    basisOfReading
  };

  // Logging for QA audit
  logAudit(
    "BIRTH_READING",
    { name: reqData.name, dob: reqData.dob, tob: reqData.tob, pob: reqData.pob },
    {
      lagna: data.lagna,
      planets: data.planetHouses,
      nakshatra: data.nakshatra,
      dasha: data.activeDasha
    },
    JSON.stringify(lovePreds)
  );

  return payload;
}

async function getTransitData(dateStr, lat, lon, finalTz) {
  const { sweph, Constants } = await getSwisseph();
  
  const d = new Date(dateStr);
  const day = d.getDate();
  const month = d.getMonth() + 1;
  const year = d.getFullYear();
  // Assume noon local time for transit positions
  const jd = sweph.swe_julday(year, month, day, 12.0 - finalTz, Constants.SE_GREG_CAL);

  const planetsList = [
    { name: 'Sun', id: Constants.SE_SUN },
    { name: 'Moon', id: Constants.SE_MOON },
    { name: 'Mars', id: Constants.SE_MARS },
    { name: 'Mercury', id: Constants.SE_MERCURY },
    { name: 'Jupiter', id: Constants.SE_JUPITER },
    { name: 'Venus',   id: Constants.SE_VENUS },
    { name: 'Saturn',  id: Constants.SE_SATURN }
  ];

  const flags = Constants.SEFLG_SPEED | Constants.SEFLG_SIDEREAL | Constants.SEFLG_SWIEPH;
  const transitData = {};

  for (const p of planetsList) {
    const calc = sweph.swe_calc_ut(jd, p.id, flags);
    const rawLon = calc.xx[0];
    transitData[p.name] = {
      lon: rawLon,
      rashi: Math.floor(rawLon / 30),
      deg: rawLon % 30
    };
  }

  return transitData;
}

async function getDailyHoroscope({ birthProfile, currentLocation, dateStr }) {
  // 1. Geocode current location
  const locCoords = await geocodePlace(currentLocation);
  
  // 2. Fetch daily transit positions
  const transitsRaw = await getTransitData(dateStr, locCoords.lat, locCoords.lon, birthProfile.tz);

  // 3. Map transit positions to natal Lagna
  const transitHouses = {};
  for (const [pname, pdata] of Object.entries(transitsRaw)) {
    const house = ((pdata.rashi - birthProfile.lagna.rashi + 12) % 12) + 1;
    transitHouses[pname] = { ...pdata, house };
  }

  // 4. Generate horoscope (AI or Fallback)
  let horoscope = null;
  let isAIEnhanced = false;

  if (aiClient) {
    horoscope = await generateAIEnhancedDaily(birthProfile, transitHouses, dateStr);
    if (horoscope) isAIEnhanced = true;
  }

  if (!horoscope) {
    horoscope = compileLocalDailyHoroscope(birthProfile, transitHouses);
  }

  const result = {
    date: dateStr,
    currentLocation,
    transitHouses,
    horoscope,
    isAIEnhanced
  };

  logAudit("DAILY_HOROSCOPE", { name: birthProfile.name, dateStr, currentLocation }, transitHouses, JSON.stringify(horoscope));

  return result;
}

async function generateAIImageAnalysis(imageBase64, mimeType, prompt) {
  if (!aiClient) return null;
  try {
    const res = await aiClient.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [
        {
          inlineData: {
            mimeType: mimeType,
            data: imageBase64
          }
        },
        prompt
      ]
    });
    return res.text;
  } catch (err) {
    console.error("Gemini Image Analysis failed:", err);
    throw err;
  }
}

async function calculatePalmReading(imageBase64, mimeType) {
  const disclaimer = `
<div class="disclaimer-card" style="margin-top:16px;font-size:0.8rem;color:var(--text-muted);border:1px solid var(--glass-border);padding:12px;border-radius:8px;background:rgba(255,255,255,0.02);">
  ⚠️ <strong>Disclaimer:</strong> Palmistry is a traditional and cultural belief system, not scientifically validated. Please treat this analysis as reflective, historical, and for entertainment purposes only.
</div>`;

  const offlineReadingContent = `
    <h3>✋ Offline Palm Reading Interpretation</h3>
    <p><strong>Running in offline/simulation mode.</strong> To enable real vision-based palm analysis, please configure a valid, active <code>GEMINI_API_KEY</code> in the backend <code>.env</code> file.</p>
    <hr style="border-color:var(--glass-border);margin:12px 0;">
    
    <p><strong>Success & Career Path:</strong> Your Fate Line is present and rises steadily from the base of the palm towards the Mount of Saturn, indicating a strong career focus and self-reliance beginning around age 28. A visible <strong>Money Triangle</strong> formed between the Head Line, Life Line, and Fate Line signifies excellent wealth-saving capacity, financial intelligence, and professional growth in mature age.</p>
    
    <p><strong>Property & Own House:</strong> The Mount of Mars (inner/outer) is firm and well-developed, indicating substantial courage, determination, and strong indicators for real estate acquisitions or land ownership. A clear, branching line from the Life Line reaching towards the Mount of Venus suggests that you will own your own residential property or house, bringing domestic security and family stability.</p>
    
    <p><strong>Foreign Travel & Spiritual Voyages:</strong> Detailed travel lines are visible on the lower Mount of Luna (Moon). These horizontal lines indicate short-term travel, foreign trade opportunities, or a major international journey in your early 30s. A strong Moon mount also brings high creativity, active intuition, and an affinity for natural water bodies.</p>
    
    <p><strong>Life Energy & Vitality:</strong> The Life Line is deep, clear, and sweeps in a wide arch around the thumb, indicating excellent physical vitality, high recovery rate, and long life. The absence of deep breaks or cross-bars signifies a smooth flow of life force, with key milestone ages showing robust physical energy.</p>

    <p><strong>Mind & Heart Alignment:</strong> The Head Line is straight and long, traversing the palm, reflecting strong logical capabilities, analytical thinking, and focus. The Heart Line curves gracefully towards the Mount of Jupiter, indicating a warm, passionate, and emotionally expressive nature, with a deep capacity for relationships and empathy.</p>
  `;

  if (!aiClient) {
    return {
      isAIEnhanced: false,
      reading: offlineReadingContent + disclaimer
    };
  }

  const prompt = `
Analyze the uploaded image of a human palm. Use traditional palmistry guidelines.
1. Trace the major lines: Life Line, Head Line, Heart Line, Fate Line. Detail their length, depth, breaks, and forks.
2. Identify and analyze key mounts (Venus, Jupiter, Saturn, Sun, Mercury).
3. Provide a written interpretation for each line and mount.
4. Output your analysis in clean HTML formatting (using h3, p, strong, and lists where relevant). Do not include any HTML markdown wrappers like \`\`\`html.
`;

  try {
    const res = await generateAIImageAnalysis(imageBase64, mimeType, prompt);
    return {
      isAIEnhanced: true,
      reading: res + disclaimer
    };
  } catch (err) {
    console.warn("Palm reading AI call failed (likely quota limit), falling back to offline simulation:", err.message);
    const notice = `<div style="background:rgba(240,192,64,0.08);border:1px solid rgba(240,192,64,0.3);border-radius:8px;padding:12px;margin-bottom:16px;font-size:0.88rem;color:var(--gold-light);">⚠️ <strong>Notice:</strong> The Gemini API returned a quota limit / rate limit error (429). We have loaded the offline simulation instead. Check your Gemini API billing details or request limits.</div>`;
    return {
      isAIEnhanced: false,
      reading: notice + offlineReadingContent + disclaimer
    };
  }
}

async function calculateFaceReading(imageBase64, mimeType) {
  const disclaimer = `
<div class="disclaimer-card" style="margin-top:16px;font-size:0.8rem;color:var(--text-muted);border:1px solid var(--glass-border);padding:12px;border-radius:8px;background:rgba(255,255,255,0.02);">
  ⚠️ <strong>Disclaimer:</strong> Face reading (Physiognomy) is a traditional cultural belief system (Chinese Mian Xiang / Samudrik Shastra), not scientifically validated. Please treat this analysis as reflective insight rather than deterministic fact.
</div>`;

  const offlineReadingContent = `
    <h3>👤 Offline Face Reading Interpretation</h3>
    <p><strong>Running in offline/simulation mode.</strong> To enable real vision-based face analysis, please configure a valid, active <code>GEMINI_API_KEY</code> in the backend <code>.env</code> file.</p>
    <hr style="border-color:var(--glass-border);margin:12px 0;">
    <p><strong>System Used:</strong> Chinese Mian Xiang (Traditional Face Reading)</p>
    <p><strong>Forehead (Heaven Region):</strong> Broad, smooth, and slightly high. Reflects strong curiosity, high intellectual capacity, active planning, and favorable career prospects in early adulthood (ages 15–30).</p>
    <p><strong>Eyes & Eyebrows (Human Region):</strong> Symmetrical, clear-sighted, and vibrant. Eyebrows are thick and rise gently, indicating high emotional intelligence, mental focus, strong focus in work, and protective relationships.</p>
    <p><strong>Nose (Wealth Mount):</strong> Well-proportioned, straight bridge, and rounded tip. Signifies strong execution skills, leadership drive, professional ambition, and a good capacity for wealth accumulation and saving.</p>
    <p><strong>Lips & Chin (Earth Region):</strong> Strong jawline, distinct chin, and full lips. Reflects stability, determined willpower, sound leadership in mature age, and a supportive social network.</p>
  `;

  if (!aiClient) {
    return {
      isAIEnhanced: false,
      reading: offlineReadingContent + disclaimer
    };
  }

  const prompt = `
Analyze the uploaded front-facing facial photo. Use the traditional Chinese Mian Xiang face-reading system.
1. Divide the face into the Three Regions (Heaven: forehead, Human: eyes/nose, Earth: lips/chin/jaw).
2. Trace key features: forehead shape, eyebrows, eye vibrancy, nose proportion, mouth fullness, and chin structure.
3. Generate detailed interpretations for each feature based on Mian Xiang principles.
4. Output your analysis in clean HTML formatting (using h3, p, strong, and lists where relevant). Do not include any HTML markdown wrappers like \`\`\`html.
5. Respect user privacy: remind the user that this photo is processed in memory and immediately discarded.
`;

  try {
    const res = await generateAIImageAnalysis(imageBase64, mimeType, prompt);
    return {
      isAIEnhanced: true,
      reading: res + disclaimer
    };
  } catch (err) {
    console.warn("Face reading AI call failed (likely quota limit), falling back to offline simulation:", err.message);
    const notice = `<div style="background:rgba(240,192,64,0.08);border:1px solid rgba(240,192,64,0.3);border-radius:8px;padding:12px;margin-bottom:16px;font-size:0.88rem;color:var(--gold-light);">⚠️ <strong>Notice:</strong> The Gemini API returned a quota limit / rate limit error (429). We have loaded the offline simulation instead. Check your Gemini API billing details or request limits.</div>`;
    return {
      isAIEnhanced: false,
      reading: notice + offlineReadingContent + disclaimer
    };
  }
}

module.exports = {
  calculateBlueprint,
  calculateBlueprintData,
  getDailyHoroscope,
  calculatePalmReading,
  calculateFaceReading
};
