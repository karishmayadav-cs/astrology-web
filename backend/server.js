const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const crypto = require('crypto');

const connectDB = require('./config/db');
const Profile = require('./models/Profile');
const DailyReading = require('./models/DailyReading');
const Feedback = require('./models/Feedback');

// Import routes
const palmRoutes = require('./routes/palmRoutes');
const faceRoutes = require('./routes/faceRoutes');
const predictionRoutes = require('./routes/predictionRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB Atlas
connectDB().catch(err => {
  console.error("Initial MongoDB connection error:", err.message);
});

// CORS Policy Middleware
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
  : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (such as mobile apps, curl, or same-origin requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    // Fallback for local development
    if (process.env.NODE_ENV === 'development' && /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) {
      return callback(null, true);
    }
    console.warn(`[CORS Warning] Request from origin "${origin}" not explicitly in FRONTEND_URL allowed list:`, allowedOrigins);
    return callback(null, true); // Allow connection with log warning to avoid blocking deployment unexpectedly
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Serve static files from the frontend build output directory
app.use(express.static(path.join(__dirname, '..', 'frontend', 'dist')));

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
app.post('/api/feedback', async (req, res) => {
  try {
    const { name, dob, tob, pob, type, rating, detail, date } = req.body;
    if (!name || !dob || !tob || !pob || !type) {
      return res.status(400).json({ error: 'Missing required parameters for feedback' });
    }
    const userKey = getUserKey(name, dob, tob, pob);

    await Feedback.create({
      userKey,
      timestamp: new Date(),
      type,
      rating,
      detail: detail || '',
      date: date || null
    });

    res.json({ success: true, message: 'Feedback recorded successfully' });
  } catch (error) {
    console.error('Error saving feedback:', error);
    res.status(500).json({ error: 'Internal server error saving feedback' });
  }
});

// API Endpoint to retrieve history of readings and feedback
app.post('/api/journey-history', async (req, res) => {
  try {
    const { name, dob, tob, pob } = req.body;
    if (!name || !dob || !tob || !pob) {
      return res.status(400).json({ error: 'Missing birth parameters' });
    }
    const userKey = getUserKey(name, dob, tob, pob);

    const [profileDoc, readingsDocs, feedbackDocs] = await Promise.all([
      Profile.findOne({ userKey }).lean(),
      DailyReading.find({ userKey }).lean(),
      Feedback.find({ userKey }).sort({ timestamp: -1 }).lean()
    ]);

    const dailyHoroscopes = {};
    if (readingsDocs && readingsDocs.length > 0) {
      readingsDocs.forEach(r => {
        if (r.cacheKey) {
          dailyHoroscopes[r.cacheKey] = {
            date: r.date,
            currentLocation: r.currentLocation,
            transitHouses: r.transitHouses,
            horoscope: r.horoscope,
            isAIEnhanced: r.isAIEnhanced
          };
        }
      });
    }

    const history = {
      profile: profileDoc || null,
      dailyHoroscopes,
      feedback: feedbackDocs.map(f => ({
        timestamp: f.timestamp,
        type: f.type,
        rating: f.rating,
        detail: f.detail,
        date: f.date
      }))
    };

    res.json(history);
  } catch (error) {
    console.error('Error retrieving history:', error);
    res.status(500).json({ error: 'Internal server error loading history' });
  }
});

// Diagnostic check of logs directory
const logsDir = path.join(__dirname, 'logs');
try {
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
} catch (e) {
  // Ignore filesystem errors on serverless read-only environment
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

// Start Express Server when not in Vercel serverless mode
if (!process.env.VERCEL) {
  const server = app.listen(PORT, () => {
    console.log(`========================================`);
    console.log(`🚀 CosmicSoul Server Running on port ${PORT}`);
    console.log(`🌍 URL: http://localhost:${PORT}`);
    console.log(`🔗 Allowed Frontend (CORS): ${process.env.FRONTEND_URL || 'Default local origins'}`);
    console.log(`⚙️  Node Environment: ${process.env.NODE_ENV}`);
    console.log(`🤖 Groq Primary: ${process.env.GROQ_PRIMARY_MODEL}`);
    console.log(`🤖 Groq Backup: ${process.env.GROQ_BACKUP_MODEL}`);
    console.log(`👁️  Groq Vision: ${process.env.GROQ_VISION_MODEL}`);
    console.log(`========================================`);
  });

  server.setTimeout(180000);       // 3 min socket timeout
  server.keepAliveTimeout = 65000; // Must be > load balancer idle timeout
  server.headersTimeout = 66000;   // Must be > keepAliveTimeout
}

// Prevent server from silently dying on unhandled errors
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception (server kept alive):', err.message);
});
process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled Promise Rejection (server kept alive):', reason?.message || reason);
});

module.exports = app;
