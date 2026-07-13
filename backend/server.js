const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const crypto = require('crypto');

// Import routes
const palmRoutes = require('./routes/palmRoutes');
const faceRoutes = require('./routes/faceRoutes');
const predictionRoutes = require('./routes/predictionRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Serve static files from the frontend build output directory
app.use(express.static(path.join(__dirname, '..', 'frontend', 'dist')));

// JSON Database Helper (shared path at root)
const dbPath = path.join(__dirname, 'database.json');
function loadDB() {
  try {
    if (fs.existsSync(dbPath)) {
      return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    }
  } catch (err) {
    console.error("Database load error in server:", err);
  }
  return { dailyReadings: {}, feedback: {}, profiles: {} };
}

function saveDB(db) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
  } catch (err) {
    console.error("Database save error in server:", err);
  }
}

// User unique identifier helper
function getUserKey(name, dob, tob, pob) {
  const raw = `${name}_${dob}_${tob}_${pob}`.toLowerCase().replace(/[^a-z0-9_]/g, '');
  return crypto.createHash('md5').update(raw).digest('hex');
}

// Mount feature-specific routes
app.use('/api', palmRoutes);
app.use('/api', faceRoutes);
app.use('/api', predictionRoutes);

// API Endpoint to record feedback
app.post('/api/feedback', (req, res) => {
  try {
    const { name, dob, tob, pob, type, rating, detail, date } = req.body;
    if (!name || !dob || !tob || !pob || !type) {
      return res.status(400).json({ error: 'Missing required parameters for feedback' });
    }
    const userKey = getUserKey(name, dob, tob, pob);
    const db = loadDB();

    if (!db.feedback[userKey]) {
      db.feedback[userKey] = [];
    }

    db.feedback[userKey].push({
      timestamp: new Date().toISOString(),
      type,
      rating,
      detail: detail || '',
      date: date || null
    });
    saveDB(db);

    res.json({ success: true, message: 'Feedback recorded successfully' });
  } catch (error) {
    console.error('Error saving feedback:', error);
    res.status(500).json({ error: 'Internal server error saving feedback' });
  }
});

// API Endpoint to retrieve history of readings and feedback
app.post('/api/journey-history', (req, res) => {
  try {
    const { name, dob, tob, pob } = req.body;
    if (!name || !dob || !tob || !pob) {
      return res.status(400).json({ error: 'Missing birth parameters' });
    }
    const userKey = getUserKey(name, dob, tob, pob);
    const db = loadDB();

    const history = {
      profile: db.profiles[userKey] || null,
      dailyHoroscopes: db.dailyReadings[userKey] || {},
      feedback: db.feedback[userKey] || []
    };

    res.json(history);
  } catch (error) {
    console.error('Error retrieving history:', error);
    res.status(500).json({ error: 'Internal server error loading history' });
  }
});

// Diagnostic check of logs directory
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Fallback index.html router for SPA behavior
app.get('/*splat', (req, res) => {
  const indexPath = path.join(__dirname, '..', 'frontend', 'dist', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Frontend build not found. Please run "npm run build" in the frontend directory.');
  }
});

// Start Express Server
const server = app.listen(PORT, () => {
  console.log(`========================================`);
  console.log(`🚀 CosmicSoul Server Running on port ${PORT}`);
  console.log(`🌍 URL: http://localhost:${PORT}`);
  console.log(`⚙️  Node Environment: ${process.env.NODE_ENV}`);
  console.log(`🤖 Groq Primary: ${process.env.GROQ_PRIMARY_MODEL}`);
  console.log(`🤖 Groq Backup: ${process.env.GROQ_BACKUP_MODEL}`);
  console.log(`👁️  Groq Vision: ${process.env.GROQ_VISION_MODEL}`);
  console.log(`========================================`);
});

// Increase socket timeout to 3 minutes to prevent ECONNRESET
// during long-running Groq API calls (daily-analysis can take 30-60s)
server.setTimeout(180000);       // 3 min socket timeout
server.keepAliveTimeout = 65000; // Must be > load balancer idle timeout
server.headersTimeout = 66000;   // Must be > keepAliveTimeout

// Prevent server from silently dying on unhandled errors
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception (server kept alive):', err.message);
});
process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled Promise Rejection (server kept alive):', reason?.message || reason);
});
