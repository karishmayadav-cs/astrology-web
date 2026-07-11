// groqClient.js
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const Groq = require('groq-sdk');

// Check if API key exists
if (!process.env.GROQ_API_KEY) {
  throw new Error('GROQ_API_KEY is missing in .env file!');
}

// Create Groq Client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

module.exports = groq;
