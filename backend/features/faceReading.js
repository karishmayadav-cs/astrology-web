const { callWithRetryAndFallback } = require('../handlers/rateLimitHandler');

/**
 * Perform a face reading based on a description or a photo.
 * 
 * @param {Object} input - { image, mimeType, description }
 * @returns {Promise<Object>} - { reading, modelUsed, isAIEnhanced }
 */
async function performFaceReading(input) {
  let description = '';

  // 1. If an image is provided, analyze it using the Groq multimodal vision model first.
  if (input.image) {
    const cleanBase64 = input.image.includes('base64,') ? input.image.split('base64,')[1] : input.image;
    const mimeType = input.mimeType || 'image/jpeg';
    const imageUrl = `data:${mimeType};base64,${cleanBase64}`;

    console.log('[FaceReading] Uploaded image detected. Generating visual description using llama-4-scout vision...');
    try {
      const visionResponse = await callWithRetryAndFallback({
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this front-facing face photo for face reading (physiognomy). Describe the forehead (shape, lines, heights), eyes (size, brightness, expression), nose (bridge, size, nostrils), lips (shape, fullness, corners), and chin/jaw structure (willpower, definition).'
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
      console.log('[FaceReading] Vision description generated successfully.');
    } catch (err) {
      console.warn('[FaceReading] Vision analysis failed, falling back to simulated description:', err.message);
      description = 'A face with a high and smooth forehead, bright symmetric eyes, a straight well-proportioned nose bridge, full and balanced lips, and a strong, defined jaw and chin.';
    }
  } else {
    description = input.description || input;
  }

  // 2. Feed the detailed description to llama-3.3-70b-versatile with the expert face reading prompt.
  const systemPrompt = `You are an expert face reader and physiognomist with 30 years of experience in Chinese Mian Xiang and Indian Samudrik Shastra traditions.
Analyze the facial features provided and you MUST return a detailed, mystical, and accurate face reading in valid JSON format.
Do NOT wrap the response in markdown code blocks like \`\`\`json. Return ONLY raw JSON text.

The JSON response MUST strictly follow this schema:
{
  "overallScore": 88,
  "personalityType": "The Natural Philosopher",
  "summary": "Short 2-line summary here",
  "lines": {
    "forehead": {
      "score": 85,
      "shortDescription": "High and wide forehead indicating sharp intelligence",
      "fullReading": "Full detailed reading here...",
      "traits": ["Intellectual", "Intuitive", "Analytical"],
      "color": "#4ECDC4"
    },
    "eyes": {
      "score": 92,
      "shortDescription": "Clear, deep-set eyes reflecting wisdom",
      "fullReading": "Full detailed reading here...",
      "traits": ["Empathetic", "Expressive", "Discerning"],
      "color": "#FF1493"
    },
    "nose": {
      "score": 88,
      "shortDescription": "Straight, well-proportioned nose bridge showing strong financial luck",
      "fullReading": "Full detailed reading here...",
      "traits": ["Ambitious", "Wealthy-minded", "Focused"],
      "color": "#FFD700"
    },
    "lips": {
      "score": 90,
      "shortDescription": "Full, symmetric lips representing excellent communication skill",
      "fullReading": "Full detailed reading here...",
      "traits": ["Eloquent", "Affectionate", "Warm"],
      "color": "#9B59B6"
    },
    "chin": {
      "score": 84,
      "shortDescription": "Defined chin structure indicating solid willpower",
      "fullReading": "Full detailed reading here...",
      "traits": ["Resilient", "Determined", "Patient"],
      "color": "#FF6B6B"
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
    "numbers": [1, 5, 7],
    "colors": ["Blue", "Silver"],
    "days": ["Wednesday", "Friday"],
    "stones": ["Blue Sapphire", "Pearl"],
    "direction": "East"
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

  const userPrompt = `Here is the facial feature description/analysis:
${description}

Please analyze these facial features and output a valid JSON reading according to the system schema. Keep the analysis mystical, optimistic, and highly detailed.`;

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
      console.warn('[FaceReading] JSON parsing failed, trying to extract JSON substring:', parseErr.message);
      const startIdx = rawText.indexOf('{');
      const endIdx = rawText.lastIndexOf('}');
      if (startIdx !== -1 && endIdx !== -1) {
        parsedReading = JSON.parse(rawText.substring(startIdx, endIdx + 1));
      } else {
        throw parseErr;
      }
    }

    // Add disclaimer info to the JSON object
    parsedReading.disclaimer = "Face reading (Physiognomy) is a traditional cultural belief system (Chinese Mian Xiang / Samudrik Shastra), not scientifically validated. Please treat this analysis as reflective insight rather than deterministic fact.";

    return {
      reading: parsedReading,
      modelUsed: response.model,
      isAIEnhanced: true
    };
  } catch (err) {
    console.error('[FaceReading] Failed to generate Groq face reading:', err);
    throw err;
  }
}

module.exports = {
  performFaceReading
};
