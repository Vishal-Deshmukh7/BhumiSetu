const OpenAI = require('openai');

function getClient() {
  const key = process.env.LANDOWNER_OPENROUTER_API_KEY;
  if (!key) {
    const error = new Error('LANDOWNER_OPENROUTER_API_KEY is not configured.');
    error.status = 503;
    throw error;
  }
  return new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: key,
  });
}

function getModel() {
  const raw = process.env.LANDOWNER_OPENROUTER_MODEL || 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free,inclusionai/ling-3.0-flash-vl:free';
  const models = raw.split(',').map((m) => m.trim()).filter(Boolean);
  return models;
}

function parseStructuredContent(content) {
  const cleaned = String(content || '')
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
  if (!cleaned) return null;
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start < 0 || end <= start) return null;
    try {
      return JSON.parse(cleaned.slice(start, end + 1));
    } catch {
      return null;
    }
  }
}

function limitedText(value) {
  return String(value || '').trim().slice(0, 1200);
}

function limitedList(value) {
  return (Array.isArray(value) ? value : [])
    .filter((item) => typeof item === 'string')
    .slice(0, 6)
    .map((item) => limitedText(item));
}

function sanitizeAi(value) {
  const result = {};
  Object.keys(value).slice(0, 6).forEach((key) => {
    result[key] = Array.isArray(value[key]) ? limitedList(value[key]) : limitedText(value[key]);
  });
  return result;
}

async function requestStructuredJson({ label, system, user, validate, maxTokens = 800 }) {
  const models = getModel();
  let lastError;

  for (const model of models) {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        const response = await getClient().chat.completions.create({
          model,
          messages: [
            { role: 'system', content: `${system}\nReturn valid JSON only. Do not include markdown fences.` },
            { role: 'user', content: user },
          ],
          max_tokens: maxTokens,
          response_format: { type: 'json_object' },
        });
        const content = response.choices?.[0]?.message?.content || '';
        const parsed = parseStructuredContent(content);
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
          lastError = new Error(`${label} returned invalid JSON.`);
          lastError.status = 502;
          continue;
        }
        if (typeof validate === 'function' && !validate(parsed)) {
          lastError = new Error(`${label} returned an unexpected response shape.`);
          lastError.status = 502;
          continue;
        }
        return { model: response.model || model, content, parsed };
      } catch (err) {
        lastError = new Error(`${label} failed: ${err.message}`);
        lastError.status = err?.status || 502;
      }
    }
  }
  throw lastError;
}

async function explainProposal(proposal, parcel) {
  const valid = (v) => typeof v.explanation === 'string' && Array.isArray(v.keyPoints);
  const { model, parsed } = await requestStructuredJson({
    label: 'Landowner proposal explanation',
    system: `You are a calm, trustworthy land-acquisition assistant for Indian citizens. Your role is to explain government acquisition proposals in plain, jargon-free language.

RULES:
- Explain what the proposal means for the landowner personally
- Break down compensation: total amount, how it's split, when payments come
- Highlight what action (if any) the landowner needs to take
- Mention important deadlines or dates
- Use short sentences. Avoid legal jargon
- NEVER recommend choosing one proposal over another — stay strictly neutral
- NEVER invent facts, dates, amounts, or legal conclusions
- If compensation seems low or unclear, say "you may want to verify this amount"
- Mention that this is synthetic demo data when relevant
- Write as if speaking directly to the landowner in a helpful, respectful tone`,
    user: `Explain this acquisition proposal to the landowner.\n\nProposal: ${JSON.stringify(proposal)}\nParcel: ${JSON.stringify(parcel)}\n\nReturn exactly: {"explanation":"string (2-4 sentences, plain language)","keyPoints":["string (bullet point, max 5)"],"considerations":["string (things to keep in mind, max 3)"]}`,
    validate: valid,
  });
  return { ai: { model, ...sanitizeAi(parsed) } };
}

async function explainHearing(hearing) {
  const valid = (v) => typeof v.summary === 'string';
  const { model, parsed } = await requestStructuredJson({
    label: 'Landowner hearing explanation',
    system: `You are a calm, plain-language legal assistant for Indian citizens involved in land acquisition disputes. Your role is to explain court hearing records in simple, reassuring language.

RULES:
- Explain what happened at the hearing in everyday words
- Describe what was discussed without legal jargon
- Mention what documents or evidence were involved
- Explain what the next step is and when it might happen
- If the outcome is reserved (judge hasn't decided yet), say so clearly
- NEVER invent verdicts, court orders, legal findings, or dates
- If no hearing record exists, say "Official hearing details are not available"
- Use phrases like "AI summary" and "Recorded outcome" to distinguish from official records
- Write as if explaining to a concerned family member
- Mention synthetic demo data when relevant`,
    user: `Explain this hearing record to the landowner.\n\nHearing: ${JSON.stringify(hearing)}\n\nReturn exactly: {"summary":"string (2-3 sentences, plain language)","nextSteps":"string (what happens next)","plainLanguage":"string (very simple explanation, like talking to a neighbor)"}`,
    validate: valid,
  });
  return { ai: { model, ...sanitizeAi(parsed) } };
}

async function summarizeCase(parcels, proposals, disputes) {
  const valid = (v) => typeof v.summary === 'string' && Array.isArray(v.keyUpdates);
  const { model, parsed } = await requestStructuredJson({
    label: 'Landowner case summary',
    system: `You are a calm, trustworthy land-acquisition assistant for Indian citizens. Summarize the landowner's overall case in simple, reassuring language.

RULES:
- Start with a one-line overview of the landowner's situation
- List the most important things happening right now
- Highlight any actions the landowner needs to take
- Mention upcoming deadlines or hearings
- If there are disputes, explain them simply without legal jargon
- NEVER invent facts, amounts, dates, or legal conclusions
- Write as if giving a brief update to a family member
- Keep it concise — the landowner wants clarity, not complexity
- Mention synthetic demo data when relevant`,
    user: `Summarize this landowner's acquisition case.\n\nParcels: ${JSON.stringify(parcels)}\nProposals: ${JSON.stringify(proposals)}\nDisputes: ${JSON.stringify(disputes)}\n\nReturn exactly: {"summary":"string (2-3 sentences, plain language overview)","keyUpdates":["string (max 4, most important updates)"],"actionItems":["string (max 3, things the landowner should do)"]}`,
    validate: valid,
  });
  return { ai: { model, ...sanitizeAi(parsed) } };
}

async function explainDocument(document) {
  const valid = (v) => typeof v.explanation === 'string';
  const { model, parsed } = await requestStructuredJson({
    label: 'Landowner document explanation',
    system: `You are a calm, plain-language assistant for Indian citizens involved in land acquisition. Explain why a document matters and what it means for the landowner.

RULES:
- Explain the document's purpose in simple words
- Describe why this document is important for the landowner's case
- If the document is authoritative (from a government office), say so
- If it's a reference document, clarify that it's not an official record
- Mention if any action is needed (submit, verify, sign, etc.)
- NEVER invent document authenticity or legal conclusions
- Use phrases like "This document shows..." rather than legal terminology
- Write as if explaining paperwork to a family member
- Mention synthetic demo data when relevant`,
    user: `Explain this document to the landowner.\n\nDocument: ${JSON.stringify(document)}\n\nReturn exactly: {"explanation":"string (2-3 sentences, plain language)","relevance":"string (why this matters for the landowner)","actionNeeded":"string (what to do, or 'No action needed')"} `,
    validate: valid,
  });
  return { ai: { model, ...sanitizeAi(parsed) } };
}

module.exports = {
  explainProposal,
  explainHearing,
  summarizeCase,
  explainDocument,
};
