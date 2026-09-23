const { requestGemini } = require('../geminiService');
const { findDefaultParcel, findParcel, getRecordSnapshot } = require('./recordAdapter');

const CASE_ALIASES = {
  matching: 'matching',
  'owner-mismatch': 'owner-mismatch',
  ownermismatch: 'owner-mismatch',
  'area-mutation-mismatch': 'area-mutation-mismatch',
  'area+mutation-mismatch': 'area-mutation-mismatch',
  areamutationmismatch: 'area-mutation-mismatch',
  'internal-inconsistency': 'internal-inconsistency',
  internalinconsistency: 'internal-inconsistency',
  'duplicate-acquisition': 'duplicate-acquisition',
  duplicateacquisition: 'duplicate-acquisition'
};

function text(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function number(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeDemoCase(value) {
  const key = text(value).toLowerCase().replace(/_/g, '-');
  return CASE_ALIASES[key] || 'matching';
}

function parseClaimField(body = {}) {
  if (body.claim && typeof body.claim === 'string') {
    try {
      return JSON.parse(body.claim);
    } catch {
      return {};
    }
  }
  if (body.claim && typeof body.claim === 'object') return body.claim;
  return body;
}

function extractCaseFromNames(files = []) {
  const names = files.map((file) => text(file.originalname).toLowerCase()).join(' ');
  const caseName = Object.keys(CASE_ALIASES).find((key) => names.includes(key));
  return normalizeDemoCase(caseName || 'matching');
}

function baseExtraction(parcel) {
  const record = getRecordSnapshot(parcel);
  return {
    parcelId: record.parcelId,
    surveyNumber: record.surveyNumber,
    projectId: record.projectId,
    projectName: record.projectName,
    district: record.district,
    village: record.village,
    owner: record.owner,
    landArea: record.landArea,
    mutationStatus: record.mutationStatus,
    registrationNumber: record.registrationNumber,
    registrationDate: record.registrationDate,
    acquisitionStatus: record.acquisitionStatus,
    compensation: record.compensation,
    awardDate: record.awardDate,
    spatialStatus: record.spatialStatus
  };
}

function applyDemoCase(extraction, record, demoCase) {
  const value = { ...extraction };
  if (demoCase === 'owner-mismatch') value.owner = 'Synthetic Owner Not On Record';
  if (demoCase === 'area-mutation-mismatch') {
    value.landArea = Number((record.landArea + 1).toFixed(1));
    value.mutationStatus = 'Mutation entry pending (synthetic discrepancy)';
  }
  if (demoCase === 'duplicate-acquisition') value.duplicateAcquisitionReference = `SYN-DUP-${record.parcelId}`;
  return value;
}

function safeGeminiObject(payload) {
  const textContent = payload?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const cleaned = String(textContent).replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
  if (!cleaned) return null;
  try {
    const parsed = JSON.parse(cleaned);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

async function extractWithGemini(file, hint) {
  if (!file?.buffer) return null;
  const result = await requestGemini({
    label: 'land claim field extraction',
    timeoutMs: 7000,
    contents: [{
      parts: [
        {
          text: `Extract only JSON fields from this synthetic land claim document. Use null for missing values. Never make legal ownership or forgery findings. Hint: ${hint}. Return keys parcelId, surveyNumber, projectId, owner, landArea, mutationStatus, registrationNumber, registrationDate, acquisitionStatus, awardDate, compensation, spatialStatus.`
        },
        { inlineData: { mimeType: file.mimetype || 'application/pdf', data: file.buffer.toString('base64') } }
      ]
    }]
  });
  return safeGeminiObject(result?.payload);
}

async function normalizeExtraction({ body = {}, files = [] }) {
  const input = parseClaimField(body);
  const explicitDemoCase = text(input.demoCase || body.demoCase);
  const demoCase = normalizeDemoCase(input.demoCase || body.demoCase || extractCaseFromNames(files));
  const requested = {
    parcelId: text(input.parcelId || body.parcelId),
    surveyNumber: text(input.surveyNumber || body.surveyNumber)
  };
  const parcel = findParcel(requested) || findDefaultParcel();
  const record = getRecordSnapshot(parcel);
  const fallback = applyDemoCase(baseExtraction(parcel), record, demoCase);
  const extractedDocuments = [];

  for (const file of files) {
    const live = await extractWithGemini(file, demoCase);
    const normalizedLive = live ? { ...fallback, ...live } : fallback;
    extractedDocuments.push({
      fileName: file.originalname,
      source: live ? 'Gemini extraction' : 'Deterministic synthetic adapter',
      fields: normalizedLive
    });
  }

  if (!extractedDocuments.length) {
    extractedDocuments.push({ fileName: 'claim-fields', source: 'Claim form', fields: fallback });
  }

  const extractedFields = extractedDocuments[0]?.fields || {};
  const claimFields = {
    ...fallback,
    ...(explicitDemoCase ? {} : extractedFields),
    ...input,
    parcelId: text(input.parcelId || fallback.parcelId),
    surveyNumber: text(input.surveyNumber || fallback.surveyNumber),
    owner: text(input.owner || input.ownerName || fallback.owner),
    landArea: number(input.landArea ?? fallback.landArea),
    mutationStatus: text(input.mutationStatus || fallback.mutationStatus),
    demoCase
  };

  if (demoCase === 'owner-mismatch') claimFields.owner = 'Synthetic Owner Not On Record';
  if (demoCase === 'area-mutation-mismatch') {
    claimFields.landArea = Number((record.landArea + 1).toFixed(1));
    claimFields.mutationStatus = 'Mutation entry pending (synthetic discrepancy)';
  }
  if (demoCase === 'internal-inconsistency' && extractedDocuments.length < 2) {
    extractedDocuments.push({
      fileName: 'synthetic-second-document',
      source: 'Deterministic synthetic adapter',
      fields: { ...fallback, owner: 'Synthetic Owner Document B' }
    });
  }
  if (demoCase === 'internal-inconsistency' && extractedDocuments.length >= 2) {
    extractedDocuments[0].fields = { ...extractedDocuments[0].fields, owner: 'Synthetic Owner Document A' };
    extractedDocuments[1].fields = { ...extractedDocuments[1].fields, owner: 'Synthetic Owner Document B' };
  }

  return { claimFields, record, extractedDocuments, demoCase };
}

module.exports = { normalizeExtraction, normalizeDemoCase };
