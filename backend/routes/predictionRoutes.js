const express = require('express');
const router = express.Router();
const crypto = require('crypto');

const Profile = require('../models/Profile');
const DailyReading = require('../models/DailyReading');

const { calculateBlueprint, calculateBlueprintData, getDailyHoroscope } = require('../features/astrologyEngine');
const { generateFuturePrediction } = require('../features/futurePrediction');

let groq = null;
try {
  groq = require('../config/groqClient');
} catch (err) {
  console.warn("Groq client not initialized for limits route:", err.message);
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

    // Save profile to MongoDB Atlas
    const userKey = getUserKey(name, dob, tob, pob);
    await Profile.findOneAndUpdate(
      { userKey },
      {
        userKey,
        name,
        dob,
        tob,
        pob,
        tz: result.tz,
        gender: gender || 'male',
        isBirthTimeApprox: approxBool,
        lagna: result.lagna,
        lastActive: new Date()
      },
      { upsert: true, returnDocument: 'after' }
    );

    res.json(result);
  } catch (error) {
    console.error('Error calculating blueprint:', error);
    res.status(500).json({ error: error.message || 'Internal server error during calculation' });
  }
});

// 2. POST /api/daily-analysis
router.post('/daily-analysis', async (req, res) => {
  try {
    const { name, dob, tob, pob, tz, gender, isBirthTimeApprox, currentLocation, dateStr } = req.body;
    console.log(`[PredictionRoute] Daily horoscope request received for: "${name}"`);

    if (!name || !dob || !tob || !pob || !currentLocation) {
      console.warn('[PredictionRoute] Validation failed: Missing required fields');
      return res.status(400).json({ error: 'Missing required fields for daily analysis' });
    }

    const todayStr = dateStr || new Date().toISOString().split('T')[0];
    const userKey = getUserKey(name, dob, tob, pob);
    const cacheKey = `${todayStr}-${currentLocation.toLowerCase().replace(/[^a-z0-9]/g, '')}`;

    // Check if daily horoscope is already calculated and cached in MongoDB
    const cachedDoc = await DailyReading.findOne({ userKey, cacheKey }).lean();
    if (cachedDoc) {
      console.log(`[PredictionRoute] Found cached daily horoscope in MongoDB for ${name}`);
      return res.json({
        date: cachedDoc.date,
        currentLocation: cachedDoc.currentLocation,
        transitHouses: cachedDoc.transitHouses,
        horoscope: cachedDoc.horoscope,
        isAIEnhanced: cachedDoc.isAIEnhanced
      });
    }

    console.log(`[PredictionRoute] Calculating blueprint data locally for ${name}...`);
    const approxBool = isBirthTimeApprox === true || isBirthTimeApprox === 'true';
    const blueprint = await calculateBlueprintData({
      name, dob, tob, pob, tz: tz ? parseFloat(tz) : NaN, gender, isBirthTimeApprox: approxBool
    });

    console.log(`[PredictionRoute] Computing daily horoscope and calling Groq API for ${name}...`);
    const dailyResult = await getDailyHoroscope({
      birthProfile: blueprint,
      currentLocation,
      dateStr: todayStr
    });

    // Cache the daily reading to MongoDB
    await DailyReading.findOneAndUpdate(
      { userKey, cacheKey },
      {
        userKey,
        cacheKey,
        date: dailyResult.date || todayStr,
        currentLocation: dailyResult.currentLocation || currentLocation,
        transitHouses: dailyResult.transitHouses || {},
        horoscope: dailyResult.horoscope || {},
        isAIEnhanced: !!dailyResult.isAIEnhanced
      },
      { upsert: true, returnDocument: 'after' }
    );
    console.log(`[PredictionRoute] Daily horoscope saved to MongoDB and sent to client.`);

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
