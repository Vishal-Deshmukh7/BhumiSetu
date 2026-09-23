const OpenAI = require('openai');

function getModel() {
 return process.env.OPENROUTER_MODEL || 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free';
}

function getClient() {
 if (!process.env.OPENROUTER_API_KEY) {
   const error = new Error('OPENROUTER_API_KEY is not configured.');
   error.status = 503;
   throw error;
 }

 return new OpenAI({
   baseURL: 'https://openrouter.ai/api/v1',
   apiKey: process.env.OPENROUTER_API_KEY,
 });
}

function getErrorDetails(error) {
 return {
   status: error?.status || error?.response?.status || 502,
   message: error?.error?.message || error?.message || 'OpenRouter request failed.'
 };
}

async function testOpenRouter() {
 const response = await getClient().chat.completions.create({
   model: getModel(),
   messages: [
     {
       role: 'user',
       content: 'Reply with exactly: OpenRouter connection successful.',
     },
   ],
 });

 return {
   model: response.model || getModel(),
   content: response.choices?.[0]?.message?.content || ''
 };
}

async function extractLandDocumentFields(text) {
 const response = await getClient().chat.completions.create({
   model: getModel(),
   messages: [
     {
       role: 'system',
       content: 'Extract only the requested fields from the supplied land document text. Return valid JSON only, with null for values that are not present.'
     },
     {
       role: 'user',
       content: `Extract these fields from the document text: ownerName, surveyNumber, village, district, landArea, documentType.

Return exactly this JSON shape:
{"ownerName":null,"surveyNumber":null,"village":null,"district":null,"landArea":null,"documentType":null}

Document text:
${text}`
     }
   ]
 });

 const content = response.choices?.[0]?.message?.content || '';
 const cleaned = String(content).replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
 let parsed = null;

 try {
   parsed = cleaned ? JSON.parse(cleaned) : null;
 } catch {
   parsed = null;
 }

 return {
   model: response.model || getModel(),
   content,
   parsed
 };
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

async function requestStructuredJson({ label, system, user, validate, maxTokens = 900 }) {
 let lastError;
 for (let attempt = 0; attempt < 2; attempt += 1) {
   const response = await getClient().chat.completions.create({
     model: getModel(),
     messages: [
       { role: 'system', content: `${system}\nReturn valid JSON only. Do not include markdown fences.` },
       { role: 'user', content: user }
     ],
     max_tokens: maxTokens,
     response_format: { type: 'json_object' }
   });
   const content = response.choices?.[0]?.message?.content || '';
   const parsed = parseStructuredContent(content);
   if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
     const preview = String(content || '').trim().slice(0, 240);
     lastError = new Error(`${label} returned invalid JSON.${preview ? ` Provider output: ${preview}` : ''}`);
     lastError.status = 502;
     continue;
   }
   if (typeof validate === 'function' && !validate(parsed)) {
     lastError = new Error(`${label} returned an unexpected response shape. Provider JSON: ${JSON.stringify(parsed).slice(0, 320)}`);
     lastError.status = 502;
     continue;
   }
   return { model: response.model || getModel(), content, parsed };
 }
 throw lastError;
}

module.exports = {
 testOpenRouter,
 extractLandDocumentFields,
 requestStructuredJson,
 parseStructuredContent,
 getErrorDetails
};