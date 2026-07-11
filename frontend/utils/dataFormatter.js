/**
 * Utility functions to format and sanitize astrology, palm, and face reading data.
 */

/**
 * Clean model output string of markdown code blocks or wrapper markers.
 * @param {string} rawText 
 * @returns {string}
 */
export function cleanRawResponse(rawText) {
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/```$/, '').trim();
  }
  return cleaned;
}

/**
 * Adapter to safely format legacy/historical HTML text readings into the new JSON schema structure.
 * This prevents app crashes when loading database entries created prior to the visual upgrade.
 * @param {string|Object} readingData - Raw response from backend
 * @param {'palm'|'face'|'future'} type 
 * @returns {Object} Structured JSON following the new visual schema
 */
export function safeFormatReading(readingData, type = 'palm') {
  if (!readingData) return null;

  // If already structured JSON, return directly
  if (typeof readingData === 'object' && readingData.overallScore !== undefined) {
    return readingData;
  }

  // If it's a string (legacy HTML/text), convert to the fallback structure
  if (typeof readingData === 'string') {
    const rawHTML = readingData;
    
    // Create base fallback object
    const fallback = {
      overallScore: 80,
      personalityType: 'Cosmic Seeker',
      summary: 'Historical detailed text reading loaded from journey archive.',
      personalityRadar: {
        intelligence: 80,
        love: 80,
        career: 80,
        health: 80,
        wealth: 80,
        spirituality: 80
      },
      luckyElements: {
        numbers: [7],
        colors: ['Gold'],
        days: ['Thursday'],
        stones: ['Yellow Sapphire'],
        direction: 'East'
      },
      strengths: ['Intuition', 'Resilience', 'Insight'],
      weaknesses: ['Vulnerability', 'Indecision'],
      recommendations: ['Meditate on the light', 'Engage in creative expression'],
      disclaimer: 'Legacy reading. Content matches historical database entry.',
      isLegacy: true
    };

    if (type === 'palm') {
      fallback.lines = {
        lifeLine: {
          score: 80,
          shortDescription: 'Trace reading in archive',
          fullReading: rawHTML,
          traits: ['Vibrant', 'Intuitive'],
          color: '#FF6B6B'
        },
        heartLine: {
          score: 80,
          shortDescription: 'Trace reading in archive',
          fullReading: 'Please refer to the overall Life Line card to read your historical detailed text reading.',
          traits: ['Sensitive', 'Loyal'],
          color: '#FF1493'
        },
        headLine: {
          score: 80,
          shortDescription: 'Trace reading in archive',
          fullReading: 'Please refer to the overall Life Line card to read your historical detailed text reading.',
          traits: ['Analytical', 'Thoughtful'],
          color: '#4ECDC4'
        },
        fateLine: {
          score: 80,
          shortDescription: 'Trace reading in archive',
          fullReading: 'Please refer to the overall Life Line card to read your historical detailed text reading.',
          traits: ['Ambitious', 'Determined'],
          color: '#9B59B6'
        }
      };
      fallback.futurePredictions = {
        shortTerm: { period: 'Next 3 Months', prediction: 'Look to detailed text for insights.', icon: '🚀' },
        mediumTerm: { period: '6-12 Months', prediction: 'Look to detailed text for insights.', icon: '📅' },
        longTerm: { period: '2-5 Years', prediction: 'Look to detailed text for insights.', icon: '🔮' }
      };
    } else if (type === 'face') {
      fallback.lines = {
        forehead: {
          score: 80,
          shortDescription: 'Trace reading in archive',
          fullReading: rawHTML,
          traits: ['Wise', 'Focused'],
          color: '#4ECDC4'
        },
        eyes: {
          score: 80,
          shortDescription: 'Trace reading in archive',
          fullReading: 'Please refer to the Forehead card to read your historical detailed face reading.',
          traits: ['Expressive', 'Deep'],
          color: '#FF1493'
        },
        nose: {
          score: 80,
          shortDescription: 'Trace reading in archive',
          fullReading: 'Please refer to the Forehead card to read your historical detailed face reading.',
          traits: ['Fortunate', 'Driven'],
          color: '#FFD700'
        },
        lips: {
          score: 80,
          shortDescription: 'Trace reading in archive',
          fullReading: 'Please refer to the Forehead card to read your historical detailed face reading.',
          traits: ['Warm', 'Eloquent'],
          color: '#9B59B6'
        },
        chin: {
          score: 80,
          shortDescription: 'Trace reading in archive',
          fullReading: 'Please refer to the Forehead card to read your historical detailed face reading.',
          traits: ['Strong', 'Patient'],
          color: '#FF6B6B'
        }
      };
      fallback.futurePredictions = {
        shortTerm: { period: 'Next 3 Months', prediction: 'Refer to full text.', icon: '🚀' },
        mediumTerm: { period: '6-12 Months', prediction: 'Refer to full text.', icon: '📅' },
        longTerm: { period: '2-5 Years', prediction: 'Refer to full text.', icon: '🔮' }
      };
    } else if (type === 'future') {
      fallback.categories = {
        spirituality: {
          title: 'General Astrological Forecast',
          prediction: rawHTML,
          score: 80,
          icon: '🕉️',
          color: '#3498DB'
        }
      };
      fallback.futurePredictions = {
        shortTerm: { period: 'Next 3 Months', prediction: 'Refer to detailed text.', icon: '🚀' },
        mediumTerm: { period: '6-12 Months', prediction: 'Refer to detailed text.', icon: '📅' },
        longTerm: { period: '2-5 Years', prediction: 'Refer to detailed text.', icon: '🔮' }
      };
    }

    return fallback;
  }

  return readingData;
}
