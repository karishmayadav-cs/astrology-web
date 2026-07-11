const groq = require('../config/groqClient');

/**
 * Executes a Groq API call with auto-retry on 429 Rate Limit errors,
 * exponential backoff, and fallback to a backup model.
 */
async function callWithRetryAndFallback(params, overridePrimary, overrideBackup) {
  const primaryModel = overridePrimary || process.env.GROQ_PRIMARY_MODEL || 'llama-3.3-70b-versatile';
  const backupModel  = overrideBackup  || process.env.GROQ_BACKUP_MODEL  || 'llama-3.1-8b-instant';

  // Try each model in order: primary first, then backup
  const models = [primaryModel, backupModel];

  for (const model of models) {
    const maxAttempts = 2;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(`[RateLimitHandler] Sending request to Groq using model: ${model} (attempt ${attempt}/${maxAttempts})`);
        const response = await groq.chat.completions.create({ ...params, model });
        return response; // success — return immediately
      } catch (error) {
        const isRateLimit =
          error.status === 429 ||
          (error.message && error.message.toLowerCase().includes('rate limit')) ||
          error.name === 'RateLimitError';

        if (isRateLimit) {
          if (attempt < maxAttempts) {
            // Exponential backoff: 5s, 10s
            const waitMs = attempt * 5000;
            console.warn(`[RateLimitHandler] Rate limit (429) on model ${model}, attempt ${attempt}. Waiting ${waitMs / 1000}s...`);
            await new Promise(r => setTimeout(r, waitMs));
          } else {
            console.warn(`[RateLimitHandler] Model ${model} exhausted after ${maxAttempts} attempts. Trying next model...`);
          }
        } else {
          // Non-rate-limit error — fail fast, don't retry
          console.error(`[RateLimitHandler] Non-rate-limit error on model ${model}:`, error.message);
          throw error;
        }
      }
    }
  }

  // All models exhausted
  console.error('[RateLimitHandler] All models failed due to rate limits.');
  throw new Error('AI service is temporarily overloaded. Your reading has been calculated using our local system. Please try again in a minute for AI-enhanced insights.');
}

module.exports = { callWithRetryAndFallback };
