const { requestGemini } = require('../../geminiService');

function parseJsonText(text) {
  const cleaned = String(text || '')
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
  if (!cleaned) return null;

  try {
    return JSON.parse(cleaned);
  } catch {
    const objectStart = cleaned.indexOf('{');
    const objectEnd = cleaned.lastIndexOf('}');
    if (objectStart < 0 || objectEnd <= objectStart) return null;
    try {
      return JSON.parse(cleaned.slice(objectStart, objectEnd + 1));
    } catch {
      return null;
    }
  }
}

async function requestWithProvider({ messages, label, timeoutMs = 30000, parameters }) {
  try {
    const result = await requestGemini({
      label,
      timeoutMs,
      contents: [{ parts: messagesToGeminiParts(messages) }],
    });
    if (!result) throw new Error('Gemini returned no response.');

    const text = result.payload?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const parsed = parseJsonText(text);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error(text ? 'Gemini returned non-JSON output.' : 'Gemini returned empty output.');
    }

    return {
      provider: 'gemini',
      model: result.model,
      payload: result.payload,
      text,
      parsed,
      providerAttempts: [{ provider: 'gemini', status: 'succeeded' }],
    };
  } catch (error) {
    const providerAttempts = [{ provider: 'gemini', status: 'failed', message: error.message }];
    console.warn(`[AI] ${label}: Gemini failed: ${error.message}`);
    const failure = new Error(`${label} failed for the configured Gemini provider. ${error.message}`);
    failure.code = 'AI_PROVIDER_UNAVAILABLE';
    failure.providerAttempts = providerAttempts;
    throw failure;
  }
}

function messagesToGeminiParts(messages) {
  return messages.map((message) => {
    if (message.role === 'user' || message.role === 'system') {
      return { text: String(message.content || '') };
    }
    return { text: String(message.content || '') };
  });
}

module.exports = { requestWithProvider, parseJsonText };
