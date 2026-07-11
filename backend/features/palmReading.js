const { callWithRetryAndFallback } = require('../handlers/rateLimitHandler');

/**
 * Perform a palm reading based on a description or a photo.
 * 
 * @param {Object} input - { image, mimeType, description }
 * @returns {Promise<Object>} - { reading, modelUsed, isAIEnhanced }
 */
async function performPalmReading(input) {
  let description = '';

  // 1. If an image is provided, analyze it using the Groq multimodal vision model first.
  if (input.image) {
    const cleanBase64 = input.image.includes('base64,') ? input.image.split('base64,')[1] : input.image;
    const mimeType = input.mimeType || 'image/jpeg';
    const imageUrl = `data:${mimeType};base64,${cleanBase64}`;

    console.log('[PalmReading] Uploaded image detected. Generating visual description using llama-4-scout vision...');
    try {
      const visionResponse = await callWithRetryAndFallback({
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this palm photo in detail for palmistry. Describe the major lines (Life Line, Heart Line, Head Line, Fate Line) including their length, clarity, depth, breaks, and forks. Also describe the mounts (Venus, Jupiter, Saturn, Sun, Mercury) and any notable markings.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl
                }
              }
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0.5
      }, process.env.GROQ_VISION_MODEL || 'meta-llama/llama-4-scout-17b-16e-instruct', process.env.GROQ_VISION_MODEL || 'meta-llama/llama-4-scout-17b-16e-instruct');

      description = visionResponse.choices[0].message.content;
      console.log('[PalmReading] Vision description generated successfully.');
    } catch (err) {
      console.warn('[PalmReading] Vision analysis failed, falling back to simulated description:', err.message);
      description = 'A palm with a robust, wide-arching Life Line, a long straight Head Line, a clear Heart Line ending near the Mount of Jupiter, and a distinct Fate Line rising from the base towards the Saturn finger.';
    }
  } else {
    description = input.description || input;
  }

  // 2. Feed the detailed description to llama-3.3-70b-versatile with the expert palmistry prompt.
  const systemPrompt = `You are an expert palm reader with 30 years of experience.
You analyze palm lines with deep spiritual and astrological knowledge.
When given details about someone's palm, you MUST return a detailed, mystical, and accurate palm reading in valid JSON format.
Do NOT wrap the response in markdown code blocks like \`\`\`json. Return ONLY raw JSON text.

The JSON response MUST strictly follow this schema:
{
  "overallScore": 87,
  "personalityType": "The Visionary Leader",
  "summary": "Short 2-line summary here",
  "lines": {
    "lifeLine": {
      "score": 85,
      "shortDescription": "Strong vitality and adventure",
      "fullReading": "Full detailed reading here...",
      "traits": ["Courageous", "Independent", "Adventurous"],
      "color": "#FF6B6B"
    },
    "heartLine": {
      "score": 92,
      "shortDescription": "Deep emotional intelligence",
      "fullReading": "Full detailed reading here...",
      "traits": ["Compassionate", "Romantic", "Empathetic"],
      "color": "#FF1493"
    },
    "headLine": {
      "score": 88,
      "shortDescription": "Sharp intellect and analytical mind",
      "fullReading": "Full detailed reading here...",
      "traits": ["Analytical", "Focused", "Disciplined"],
      "color": "#4ECDC4"
    },
    "fateLine": {
      "score": 90,
      "shortDescription": "Strong life purpose",
      "fullReading": "Full detailed reading here...",
      "traits": ["Ambitious", "Reliable", "Driven"],
      "color": "#9B59B6"
    }
  },
  "personalityRadar": {
    "intelligence": 90,
    "love": 85,
    "career": 88,
    "health": 75,
    "wealth": 82,
    "spirituality": 78
  },
  "luckyElements": {
    "numbers": [3, 6, 9, 12],
    "colors": ["Green", "Gold"],
    "days": ["Thursday", "Sunday"],
    "stones": ["Emerald", "Yellow Sapphire"],
    "direction": "North-East"
  },
  "futurePredictions": {
    "shortTerm": {
      "period": "Next 3 Months",
      "prediction": "Career growth expected...",
      "icon": "🎯"
    },
    "mediumTerm": {
      "period": "6-12 Months",
      "prediction": "Stability and new relationships...",
      "icon": "📅"
    },
    "longTerm": {
      "period": "2-5 Years",
      "prediction": "Major life achievements...",
      "icon": "🌟"
    }
  },
  "strengths": ["Leadership", "Creativity", "Intelligence"],
  "weaknesses": ["Overthinking", "Stubborn"],
  "recommendations": [
    "Practice meditation daily",
    "Focus on health and diet",
    "Take calculated risks"
  ]
}`;

  const userPrompt = `Here is the palm description/analysis:
${description}

Please analyze this palm and output a valid JSON reading according to the system schema. Keep the analysis mystical, optimistic, and highly detailed.`;

  try {
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
      console.warn('[PalmReading] JSON parsing failed, trying to extract JSON substring:', parseErr.message);
      const startIdx = rawText.indexOf('{');
      const endIdx = rawText.lastIndexOf('}');
      if (startIdx !== -1 && endIdx !== -1) {
        parsedReading = JSON.parse(rawText.substring(startIdx, endIdx + 1));
      } else {
        throw parseErr;
      }
    }

    // Add disclaimer info to the JSON object
    parsedReading.disclaimer = "Palmistry is a traditional and cultural belief system, not scientifically validated. Please treat this analysis as reflective, historical, and for entertainment purposes only.";

    return {
      reading: parsedReading,
      modelUsed: response.model,
      isAIEnhanced: true
    };
  } catch (err) {
    console.error('[PalmReading] Failed to generate Groq palm reading:', err);
    throw err;
  }
}

module.exports = {
  performPalmReading
};
