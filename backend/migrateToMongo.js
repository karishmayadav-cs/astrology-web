const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const connectDB = require('./config/db');
const Profile = require('./models/Profile');
const DailyReading = require('./models/DailyReading');
const Feedback = require('./models/Feedback');

async function migrate() {
  try {
    console.log('🚀 Starting Data Migration to MongoDB Atlas...');
    await connectDB();

    const dbPath = path.join(__dirname, 'database.json');
    if (!fs.existsSync(dbPath)) {
      console.log('⚠️  No database.json file found. Nothing to migrate.');
      process.exit(0);
    }

    const fileContent = fs.readFileSync(dbPath, 'utf8');
    const dbData = JSON.parse(fileContent);

    let profilesCount = 0;
    let readingsCount = 0;
    let feedbackCount = 0;

    // 1. Migrate Profiles
    if (dbData.profiles) {
      for (const [userKey, profile] of Object.entries(dbData.profiles)) {
        await Profile.findOneAndUpdate(
          { userKey },
          { userKey, ...profile },
          { upsert: true, new: true }
        );
        profilesCount++;
      }
    }

    // 2. Migrate Daily Readings
    if (dbData.dailyReadings) {
      for (const [userKey, readingsMap] of Object.entries(dbData.dailyReadings)) {
        for (const [cacheKey, reading] of Object.entries(readingsMap)) {
          if (!reading || typeof reading !== 'object') continue;
          await DailyReading.findOneAndUpdate(
            { userKey, cacheKey },
            {
              userKey,
              cacheKey,
              date: reading.date || cacheKey.substring(0, 10),
              currentLocation: reading.currentLocation || '',
              transitHouses: reading.transitHouses || {},
              horoscope: reading.horoscope || {},
              isAIEnhanced: !!reading.isAIEnhanced
            },
            { upsert: true, new: true }
          );
          readingsCount++;
        }
      }
    }

    // 3. Migrate Feedback
    if (dbData.feedback) {
      for (const [userKey, feedbackList] of Object.entries(dbData.feedback)) {
        if (!Array.isArray(feedbackList)) continue;
        for (const fb of feedbackList) {
          const timestamp = fb.timestamp ? new Date(fb.timestamp) : new Date();
          const existing = await Feedback.findOne({
            userKey,
            type: fb.type,
            timestamp
          });
          if (!existing) {
            await Feedback.create({
              userKey,
              timestamp,
              type: fb.type,
              rating: fb.rating,
              detail: fb.detail || '',
              date: fb.date || null
            });
            feedbackCount++;
          }
        }
      }
    }

    console.log(`========================================`);
    console.log(`✅ Migration Completed Successfully!`);
    console.log(`👤 Profiles Migrated: ${profilesCount}`);
    console.log(`🔮 Daily Readings Migrated: ${readingsCount}`);
    console.log(`💬 Feedback Items Migrated: ${feedbackCount}`);
    console.log(`========================================`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Data Migration Failed:', err);
    process.exit(1);
  }
}

migrate();
