const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const { calculateBlueprint, getDailyHoroscope } = require('../features/astrologyEngine');
const { generateFuturePrediction } = require('../features/futurePrediction');

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

    if (!name || !dob || !tob || !pob || !currentLocation) {
      return res.status(400).json({ error: 'Missing required fields for daily analysis' });
    }

    const todayStr = dateStr || new Date().toISOString().split('T')[0];
    const userKey = getUserKey(name, dob, tob, pob);
    const cacheKey = `${todayStr}-${currentLocation.toLowerCase().replace(/[^a-z0-9]/g, '')}`;

    const db = loadDB();

    // Check if daily horoscope is already calculated and cached
    if (db.dailyReadings[userKey] && db.dailyReadings[userKey][cacheKey]) {
      return res.json(db.dailyReadings[userKey][cacheKey]);
    }

    // Load full birth profile data first
    const approxBool = isBirthTimeApprox === true || isBirthTimeApprox === 'true';
    const blueprint = await calculateBlueprint({
      name, dob, tob, pob, tz: tz ? parseFloat(tz) : NaN, gender, isBirthTimeApprox: approxBool
    });

    // Calculate daily horoscope
    const dailyResult = await getDailyHoroscope({
      birthProfile: blueprint,
      currentLocation,
      dateStr: todayStr
    });

    // Cache the daily reading
    if (!db.dailyReadings[userKey]) {
      db.dailyReadings[userKey] = {};
    }
    db.dailyReadings[userKey][cacheKey] = dailyResult;
    saveDB(db);

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

module.exports = router;
