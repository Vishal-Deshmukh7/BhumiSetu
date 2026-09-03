function getConfiguredModels() {
  const configured = [
    process.env.GEMINI_MODEL,
    ...(process.env.GEMINI_FALLBACK_MODELS || '').split(',')
  ]
    .map((model) => String(model || '').trim())
    .filter(Boolean);

  return [...new Set(configured.length ? configured : ['gemini-1.5-flash'])];
}

function isRetryableStatus(status) {
  return [404, 429, 500, 502, 503, 504].includes(status);
}

async function requestGemini({ contents, label, timeoutMs = 8000 }) {
  if (!process.env.GEMINI_API_KEY || !global.fetch) {
    console.log('[Gemini] Fallback: GEMINI_API_KEY not configured or fetch unavailable.');
    return null;
  }

  const models = getConfiguredModels();
  for (let index = 0; index < models.length; index += 1) {
    const model = models[index];
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      console.log(`[Gemini] Attempting ${label} with model ${model}`);
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents }),
        signal: controller.signal
      });

      if (response.ok) {
        return { payload: await response.json(), model };
      }

      console.log(`[Gemini] API error for model ${model}: ${response.status} ${response.statusText}`);
      if (!isRetryableStatus(response.status) || index === models.length - 1) return null;
      console.log(`[Gemini] Switching to fallback model ${models[index + 1]}.`);
    } catch (error) {
      console.log(`[Gemini] Exception for model ${model}: ${error.message}`);
      if (index === models.length - 1) return null;
      console.log(`[Gemini] Switching to fallback model ${models[index + 1]}.`);
    } finally {
      clearTimeout(timeout);
    }
  }

  return null;
}

module.exports = { getConfiguredModels, requestGemini };
