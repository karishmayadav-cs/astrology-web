const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const { calculateBlueprint, calculateBlueprintData, getDailyHoroscope } = require('../features/astrologyEngine');
const { generateFuturePrediction } = require('../features/futurePrediction');

let groq = null;
try {
  groq = require('../config/groqClient');
} catch (err) {
  console.warn("Groq client not initialized for limits route:", err.message);
}

// JSON Database Helper
const dbPath = path.join(__dirname, '../database.json');
function loadDB() {
  try {
    if (fs.existsSync(dbPath)) {
      return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    }
  } catch (err) {
    console.error("Database load error in routes:", err);
  }
  return { dailyReadings: {}, feedback: {}, profiles: {} };
}

function saveDB(db) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
  } catch (err) {
    console.error("Database save error in routes:", err);
  }
}

// User unique identifier helper
function getUserKey(name, dob, tob, pob) {
  const raw = `${name}_${dob}_${tob}_${pob}`.toLowerCase().replace(/[^a-z0-9_]/g, '');
  return crypto.createHash('md5').update(raw).digest('hex');
}

// 1. POST /api/astrology/calculate
router.post('/astrology/calculate', async (req, res) => {
  try {
    const { name, dob, tob, pob, tz, gender, isBirthTimeApprox } = req.body;

    if (!name || !dob || !tob || !pob) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const approxBool = isBirthTimeApprox === true || isBirthTimeApprox === 'true';

    const result = await calculateBlueprint({
      name,
      dob,
      tob,
      pob,
      tz: tz ? parseFloat(tz) : NaN,
      gender: gender || 'male',
      isBirthTimeApprox: approxBool
    });

    // Save profile to database
    const userKey = getUserKey(name, dob, tob, pob);
    const db = loadDB();
    db.profiles[userKey] = {
      name, dob, tob, pob, tz: result.tz, gender, isBirthTimeApprox: approxBool,
      lagna: result.lagna,
      lastActive: new Date().toISOString()
    };
    saveDB(db);

    res.json(result);
  } catch (error) {
    console.error('Error calculating blueprint:', error);
    res.status(500).json({ error: 'Internal server error during calculation' });
  }
});

// 2. POST /api/daily-analysis
router.post('/daily-analysis', async (req, res) => {
  try {
    const { name, dob, tob, pob, tz, gender, isBirthTimeApprox, currentLocation, dateStr } = req.body;
    console.log(`[PredictionRoute] Daily horoscope request received for: "${name}"`);
    console.log(`[PredictionRoute] Input parameters: DOB="${dob}", TOB="${tob}", POB="${pob}", TZ="${tz}", Gender="${gender}", IsApprox="${isBirthTimeApprox}", CurrentLocation="${currentLocation}", DateStr="${dateStr}"`);

    if (!name || !dob || !tob || !pob || !currentLocation) {
      console.warn('[PredictionRoute] Validation failed: Missing required fields');
      return res.status(400).json({ error: 'Missing required fields for daily analysis' });
    }

    const todayStr = dateStr || new Date().toISOString().split('T')[0];
    const userKey = getUserKey(name, dob, tob, pob);
    const cacheKey = `${todayStr}-${currentLocation.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
    console.log(`[PredictionRoute] User key: "${userKey}", Cache key: "${cacheKey}"`);

    const db = loadDB();

    // Check if daily horoscope is already calculated and cached
    if (db.dailyReadings[userKey] && db.dailyReadings[userKey][cacheKey]) {
      console.log(`[PredictionRoute] Found cached daily horoscope for ${name}`);
      return res.json(db.dailyReadings[userKey][cacheKey]);
    }

    console.log(`[PredictionRoute] Calculating blueprint data locally for ${name}...`);
    // Load birth profile calculation data (local/offline calculations only, skip AI predictions)
    const approxBool = isBirthTimeApprox === true || isBirthTimeApprox === 'true';
    const blueprint = await calculateBlueprintData({
      name, dob, tob, pob, tz: tz ? parseFloat(tz) : NaN, gender, isBirthTimeApprox: approxBool
    });
    console.log(`[PredictionRoute] Local blueprint calculated successfully. Lagna: ${blueprint.lagna.rashi}`);

    console.log(`[PredictionRoute] Computing daily horoscope and calling Groq API for ${name}...`);
    // Calculate daily horoscope
    const dailyResult = await getDailyHoroscope({
      birthProfile: blueprint,
      currentLocation,
      dateStr: todayStr
    });
    console.log(`[PredictionRoute] Daily horoscope computed successfully (AIEnhanced: ${dailyResult.isAIEnhanced})`);

    // Cache the daily reading
    if (!db.dailyReadings[userKey]) {
      db.dailyReadings[userKey] = {};
    }
    db.dailyReadings[userKey][cacheKey] = dailyResult;
    saveDB(db);
    console.log(`[PredictionRoute] Daily horoscope saved to database and sent to client.`);

    res.json(dailyResult);
  } catch (error) {
    console.error('Error calculating daily horoscope:', error);
    res.status(500).json({ error: 'Internal server error during daily calculation' });
  }
});

// 3. POST /api/future-prediction
router.post('/future-prediction', async (req, res) => {
  try {
    const { name, dob, tob, pob, gender, question } = req.body;

    if (!name || !dob || !tob || !pob) {
      return res.status(400).json({ error: 'Missing required birth details (Name, Date, Time, Place of birth).' });
    }

    console.log(`[PredictionRoute] Generating custom future prediction for: ${name}`);
    const result = await generateFuturePrediction({
      name,
      dob,
      tob,
      pob,
      gender: gender || 'male',
      question: question || ''
    });

    res.json(result);
  } catch (error) {
    console.error('Error during future prediction routing:', error);
    res.status(500).json({ error: error.message || 'Failed to generate future prediction.' });
  }
});

// 4. GET /api/ai-limits
router.get('/ai-limits', async (req, res) => {
  if (!groq) {
    return res.status(503).json({ error: 'Groq API client is not configured. Please set GROQ_API_KEY in the backend .env file.' });
  }
  try {
    console.log('[PredictionRoute] Fetching Groq API rate limits...');
    // Send a tiny chat completion request to fetch current limits via response headers
    const { response } = await groq.chat.completions.create({
      messages: [{ role: 'user', content: 'Ping' }],
      model: process.env.GROQ_PRIMARY_MODEL || 'llama-3.3-70b-versatile',
      max_tokens: 1
    }).withResponse();

    const headers = response.headers;
    const limits = {
      requests: {
        limit: headers.get('x-ratelimit-limit-requests'),
        remaining: headers.get('x-ratelimit-remaining-requests'),
        reset: headers.get('x-ratelimit-reset-requests')
      },
      tokens: {
        limit: headers.get('x-ratelimit-limit-tokens'),
        remaining: headers.get('x-ratelimit-remaining-tokens'),
        reset: headers.get('x-ratelimit-reset-tokens')
      }
    };

    res.json({ success: true, limits });
  } catch (error) {
    console.error('Error fetching Groq rate limits:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch AI rate limits.' });
  }
});

module.exports = router;
