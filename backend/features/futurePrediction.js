const { callWithRetryAndFallback } = require('../handlers/rateLimitHandler');

/**
 * Generate a detailed future prediction based on birth details and an optional question.
 * 
 * @param {Object} details - { name, dob, tob, pob, gender, question }
 * @returns {Promise<Object>} - { prediction, modelUsed, isAIEnhanced }
 */
async function generateFuturePrediction(details) {
  const { name, dob, tob, pob, gender, question } = details;

  const systemPrompt = `You are a world-class astrologer, numerologist, and future predictor with 40 years of experience in Vedic and Western astrology.
When given birth details, you MUST return a highly detailed, mystical, and accurate future prediction in valid JSON format.
Do NOT wrap the response in markdown code blocks like \`\`\`json. Return ONLY raw JSON text.

The JSON response MUST strictly follow this schema:
{
  "overallScore": 91,
  "personalityType": "Cosmic Voyager",
  "summary": "Short 2-line summary here",
  "sunMoonSign": {
    "sunSign": "Sun Sign Name",
    "moonSign": "Moon Sign Name",
    "analysis": "Astrological analysis of sun/moon combination..."
  },
  "currentLifePhase": "Detailed analysis of current life phase based on transits & age milestones...",
  "luckyElements": {
    "numbers": [4, 8],
    "colors": ["Orange", "Violet"],
    "days": ["Tuesday", "Saturday"],
    "stones": ["Coral", "Amethyst"],
    "direction": "South"
  },
  "personalityRadar": {
    "intelligence": 85,
    "love": 90,
    "career": 92,
    "health": 80,
    "wealth": 88,
    "spirituality": 86
  },
  "strengths": ["Resilience", "Strategic Vision", "Passion"],
  "weaknesses": ["Impatience", "Over-extension"],
  "recommendations": [
    "Incorporate mindfulness practices",
    "Avoid impulsive financial decisions",
    "Seek mentorship in career steps"
  ],
  "futurePredictions": {
    "shortTerm": {
      "period": "Next 3 Months",
      "prediction": "Detailed short term prediction text...",
      "icon": "🚀"
    },
    "mediumTerm": {
      "period": "6-12 Months",
      "prediction": "Detailed medium term prediction text...",
      "icon": "📅"
    },
    "longTerm": {
      "period": "2-5 Years",
      "prediction": "Detailed long term prediction text...",
      "icon": "🔮"
    }
  },
  "categories": {
    "career": {
      "title": "Career Predictions",
      "prediction": "Detailed career forecasts for next 1 year...",
      "score": 92,
      "icon": "💼",
      "color": "#9B59B6"
    },
    "love": {
      "title": "Love and Relationship Predictions",
      "prediction": "Spouse characteristics, relationship timelines, and harmony periods...",
      "score": 90,
      "icon": "💞",
      "color": "#FF1493"
    },
    "health": {
      "title": "Health Insights",
      "prediction": "Vitality warnings, dietary/lifestyle suggestions...",
      "score": 80,
      "icon": "🌿",
      "color": "#4ECDC4"
    },
    "finance": {
      "title": "Financial Forecast",
      "prediction": "Wealth accumulation, periods of gain or expense...",
      "score": 88,
      "icon": "💵",
      "color": "#FFD700"
    },
    "spirituality": {
      "title": "Overall Life Path & Spiritual Mission",
      "prediction": "Long-term spiritual path, soul mission, and inner alignment...",
      "score": 86,
      "icon": "🕉️",
      "color": "#3498DB"
    }
  },
  "bestMonths": ["March", "October", "December"],
  "warnings": "Watch out for burnout during high-demand transit periods..."
}`;

  const userPrompt = `Please generate a comprehensive future prediction for:
Name: ${name}
Date of Birth: ${dob} (DD/MM/YYYY)
Time of Birth: ${tob}
Place of Birth: ${pob}
Gender: ${gender}
${question ? `Current Question or Concern: "${question}"` : 'Current Question or Concern: General Life Guidance'}

Provide a highly customized and structured reading matching the system JSON schema. Keep the analysis mystical, optimistic, and highly detailed.`;

  try {
    console.log(`[FuturePrediction] Requesting reading for ${name} from Groq...`);
    const response = await callWithRetryAndFallback({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 3000,
      temperature: 0.7,
      top_p: 0.9,
      response_format: { type: "json_object" }
    });

    let rawText = response.choices[0].message.content.trim();
    
    // Clean any potential markdown wrappers just in case
    if (rawText.startsWith('```')) {
      rawText = rawText.replace(/^```json\s*/, '').replace(/```$/, '').trim();
    }

    let parsedReading;
    try {
      parsedReading = JSON.parse(rawText);
    } catch (parseErr) {
      console.warn('[FuturePrediction] JSON parsing failed, trying to extract JSON substring:', parseErr.message);
      const startIdx = rawText.indexOf('{');
      const endIdx = rawText.lastIndexOf('}');
      if (startIdx !== -1 && endIdx !== -1) {
        parsedReading = JSON.parse(rawText.substring(startIdx, endIdx + 1));
      } else {
        throw parseErr;
      }
    }

    // Add disclaimer info to the JSON object
    parsedReading.disclaimer = "Astrology and future predictions are traditional belief systems. This analysis is reflective, motivational, and for personal entertainment purposes only.";

    return {
      prediction: parsedReading,
      modelUsed: response.model,
      isAIEnhanced: true
    };
  } catch (err) {
    console.error('[FuturePrediction] Failed to generate Groq future prediction:', err);
    throw err;
  }
}

module.exports = {
  generateFuturePrediction
};
