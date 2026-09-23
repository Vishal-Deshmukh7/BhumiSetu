const { projects, parcels, documents } = require('../../data/mockData');
const { requestStructuredJson } = require('./openrouter');

const PROVENANCE = {
  mode: 'synthetic-demo',
  source: 'backend/data/mockData.js',
  note: 'Synthetic demonstration data only. Verify against authorised land records before administrative action.'
};
const MAX_TEXT = 1600;
const MAX_ITEMS = 8;

function fail(code, message, status = 400) {
  const error = new Error(message);
  error.code = code;
  error.status = status;
  throw error;
}

function projectFor(id) {
  return projects.find((project) => project.id === id || project.projectId === id) || null;
}

function parcelFor(id) {
  return parcels.find((parcel) => parcel.id === id || parcel.parcelId === id) || null;
}

function projectParcels(projectId) {
  return parcels.filter((parcel) => parcel.projectId === projectId);
}

function safeParcel(parcel) {
  if (!parcel) return null;
  return {
    parcelId: parcel.parcelId || parcel.id,
    projectId: parcel.projectId,
    surveyNumber: parcel.surveyNumber,
    village: parcel.village,
    district: parcel.district,
    area: parcel.area,
    landType: parcel.landType,
    acquisitionStatus: parcel.acquisitionStatus,
    compensationStatus: parcel.compensationStatus,
    possessionStatus: parcel.possessionStatus,
    validation: parcel.validation,
    rrRequired: parcel.rrRequired,
    coordinates: parcel.coordinates,
    isSynthetic: parcel.isSynthetic === true
  };
}

function safeProject(project) {
  if (!project) return null;
  return {
    projectId: project.id,
    name: project.name,
    district: project.district,
    implementingAgency: project.implementingAgency,
    status: project.status,
    progress: project.progress,
    landPending: project.landPending,
    compensationProgress: project.compensationProgress,
    possession: project.possession,
    riskScore: project.riskScore,
    risk: project.risk,
    alerts: project.alerts,
    isSynthetic: true
  };
}

function safeDocument(document) {
  return document && {
    documentId: document.id,
    name: document.name,
    projectId: document.projectId,
    status: document.status,
    extractedFields: document.extractedFields,
    isSynthetic: true
  };
}

function sourceRecord(record) {
  return { ...record, provenance: PROVENANCE };
}

function selectDocument({ documentId, parcelId }) {
  if (!documentId && !parcelId) fail('INVALID_INPUT', 'Provide documentId or parcelId.');
  let parcel = parcelId ? parcelFor(parcelId) : null;
  if (parcelId && !parcel) fail('NOT_FOUND', 'Parcel not found.', 404);
  let document = documentId ? documents.find((item) => item.id === documentId) : null;
  if (documentId && !document) fail('NOT_FOUND', 'Document not found.', 404);
  if (!document) {
    const candidates = documents.filter((item) => item.projectId === parcel.projectId);
    document = candidates.find((item) => item.name.includes(parcel.parcelId)) || candidates[0];
  }
  if (!document) fail('NOT_FOUND', 'No synthetic document is linked to the supplied parcel.', 404);
  if (!parcel) parcel = parcelFor((document.name.match(/PAR-\d+/) || [])[0]);
  return sourceRecord({ document: safeDocument(document), parcel: safeParcel(parcel), project: safeProject(projectFor(document.projectId)) });
}

function selectCase({ projectId, parcelId }) {
  if (!projectId && !parcelId) fail('INVALID_INPUT', 'Provide projectId or parcelId.');
  const parcel = parcelId ? parcelFor(parcelId) : null;
  if (parcelId && !parcel) fail('NOT_FOUND', 'Parcel not found.', 404);
  const project = projectFor(projectId || parcel.projectId);
  if (!project) fail('NOT_FOUND', 'Project not found.', 404);
  return sourceRecord({ project: safeProject(project), parcel: safeParcel(parcel), parcels: projectParcels(project.id).slice(0, MAX_ITEMS).map(safeParcel) });
}

function conflictFor(parcel) {
  const reasons = [];
  if (parcel.validation && parcel.validation !== 'Verified') reasons.push(`Validation status is ${parcel.validation}.`);
  if (parcel.paymentStatus && parcel.paymentStatus !== 'Paid') reasons.push(`Payment status is ${parcel.paymentStatus}.`);
  if (parcel.possessionStatus === 'In Progress' && parcel.compensationStatus !== 'Paid') reasons.push('Possession is in progress while compensation is not marked Paid.');
  if (parcel.rrRequired) reasons.push('R&R review is required for this parcel.');
  return {
    parcelId: parcel.parcelId,
    projectId: parcel.projectId,
    conflict: reasons.length > 0,
    severity: parcel.validation === 'Mismatch Detected' ? 'high' : reasons.length > 1 ? 'medium' : reasons.length ? 'low' : 'none',
    reasons,
    fields: { validation: parcel.validation, paymentStatus: parcel.paymentStatus, possessionStatus: parcel.possessionStatus, compensationStatus: parcel.compensationStatus, rrRequired: parcel.rrRequired }
  };
}

function selectConflict({ projectId, parcelId }) {
  if (!projectId && !parcelId) fail('INVALID_INPUT', 'Provide parcelId or projectId.');
  const parcel = parcelId ? parcelFor(parcelId) : null;
  if (parcelId && !parcel) fail('NOT_FOUND', 'Parcel not found.', 404);
  const project = projectFor(projectId || parcel.projectId);
  if (!project) fail('NOT_FOUND', 'Project not found.', 404);
  const records = (parcel ? [parcel] : projectParcels(project.id))
    .map(conflictFor)
    .filter((item) => item.conflict)
    .sort((a, b) => ({ high: 3, medium: 2, low: 1 }[b.severity] - ({ high: 3, medium: 2, low: 1 }[a.severity])));
  if (!records.length) fail('NOT_FOUND', 'No deterministic conflict was found for the supplied scope.', 404);
  return sourceRecord({ project: safeProject(project), conflicts: records.slice(0, MAX_ITEMS) });
}

function criticalScore(parcel) {
  const project = projectFor(parcel.projectId);
  return (project?.riskScore || 0) + (parcel.validation === 'Mismatch Detected' ? 20 : parcel.validation !== 'Verified' ? 10 : 0)
    + (parcel.paymentStatus !== 'Paid' ? 5 : 0) + (parcel.possessionStatus === 'In Progress' ? 3 : 0);
}

function selectCriticalParcels(projectId) {
  if (projectId && !projectFor(projectId)) fail('NOT_FOUND', 'Project not found.', 404);
  const scoped = (projectId ? projectParcels(projectId) : parcels).map((parcel) => ({ ...safeParcel(parcel), criticalityScore: criticalScore(parcel) }));
  const critical = scoped.filter((parcel) => parcel.criticalityScore >= 70).sort((a, b) => b.criticalityScore - a.criticalityScore).slice(0, MAX_ITEMS);
  let alternatives = scoped.filter((parcel) => !critical.some((item) => item.parcelId === parcel.parcelId))
    .sort((a, b) => a.criticalityScore - b.criticalityScore).slice(0, 3)
    .map((parcel) => ({ parcelId: parcel.parcelId, projectId: parcel.projectId, coordinates: parcel.coordinates, reason: 'Lower deterministic risk score in synthetic dataset.' }));
  if (alternatives.length < 3 && projectId) {
    const existing = new Set(alternatives.map((item) => item.parcelId));
    const fallback = parcels
      .filter((parcel) => parcel.projectId !== projectId && !critical.some((item) => item.parcelId === parcel.parcelId) && !existing.has(parcel.parcelId))
      .sort((a, b) => criticalScore(a) - criticalScore(b))
      .slice(0, 3 - alternatives.length)
      .map((parcel) => ({ parcelId: parcel.parcelId, projectId: parcel.projectId, coordinates: parcel.coordinates, reason: 'Lower deterministic risk score in synthetic dataset.' }));
    alternatives = alternatives.concat(fallback);
  }
  return sourceRecord({ project: projectId ? safeProject(projectFor(projectId)) : null, criticalParcels: critical, alternatives });
}

function assistantFilter(question) {
  const text = String(question || '').trim();
  if (!text || text.length > 500) fail('INVALID_INPUT', 'question is required and must be at most 500 characters.');
  const lower = text.toLowerCase();
  if (!/(critical|risk|conflict|exception|parcel|project|compensation|possession|verification|delayed|pending)/.test(lower)) {
    fail('UNSAFE_QUERY', 'Only predefined land-administration filters are supported.');
  }
  let result;
  if (lower.includes('critical') || lower.includes('risk')) result = selectCriticalParcels();
  else if (lower.includes('conflict') || lower.includes('exception') || lower.includes('verification')) result = selectConflict({ projectId: projects.find((p) => p.riskScore >= 70)?.id });
  else if (lower.includes('project')) result = { projects: projects.slice(0, MAX_ITEMS).map(safeProject), provenance: PROVENANCE };
  else result = { parcels: parcels.filter((parcel) => parcel.paymentStatus !== 'Paid' || parcel.possessionStatus !== 'Completed').slice(0, MAX_ITEMS).map(safeParcel), provenance: PROVENANCE };
  return sourceRecord({ question: text, filter: 'predefined-keyword-filter', result });
}

function validExplanation(value) {
  return typeof value.explanation === 'string' && Array.isArray(value.keyPoints) && Array.isArray(value.recommendedActions);
}
function validSummary(value) { return typeof value.summary === 'string' && Array.isArray(value.keyRisks) && Array.isArray(value.nextActions); }
function validAnswer(value) { return typeof value.answer === 'string' && Array.isArray(value.actions); }

function limitedText(value) {
  return String(value || '').trim().slice(0, MAX_TEXT);
}

function limitedList(value) {
  return (Array.isArray(value) ? value : []).filter((item) => typeof item === 'string')
    .slice(0, MAX_ITEMS).map((item) => limitedText(item));
}

function sanitizeAi(value) {
  const result = {};
  Object.keys(value).slice(0, 6).forEach((key) => {
    result[key] = Array.isArray(value[key]) ? limitedList(value[key]) : limitedText(value[key]);
  });
  return result;
}

async function explain(kind, record, validator, prompt) {
  const outputShape = kind === 'case summary'
    ? '{"summary":"string","keyRisks":["string"],"nextActions":["string"]}'
    : kind === 'assistant query'
      ? '{"answer":"string","actions":["string"]}'
      : '{"explanation":"string","keyPoints":["string"],"recommendedActions":["string"]}';
  const ai = await requestStructuredJson({
    label: `Land Administrator ${kind}`,
    system: 'You are an administrative assistant explaining a synthetic land-acquisition record. Do not invent facts, legal conclusions, owners, amounts, or dates. State that the record is synthetic when relevant.',
    user: `${prompt}
Return exactly this JSON shape and no other top-level fields:
${outputShape}
Use concise strings and arrays. Do not copy the authoritative record as the response.
Authoritative deterministic record (use only these fields):
${JSON.stringify(record)}`,
    validate: validator
  });
  return { ai: { model: ai.model, ...sanitizeAi(ai.parsed) }, provenance: PROVENANCE };
}

async function explainDocument(input) { const record = selectDocument(input); return { ...record, ...(await explain('document explanation', record, validExplanation, 'Explain the document status and its relationship to the parcel/project.')) }; }
async function summarizeCase(input) { const record = selectCase(input); return { ...record, ...(await explain('case summary', record, validSummary, 'Summarize the acquisition case status, dependencies, and risks.')) }; }
async function explainConflict(input) { const record = selectConflict(input); return { ...record, ...(await explain('conflict explanation', record, validExplanation, 'Explain the deterministic conflicts and the operational significance without changing the source fields.')) }; }
async function interpretAdminQuery(question) { const record = assistantFilter(question); return { ...record, ...(await explain('assistant query', record, validAnswer, 'Answer the administrator question using only the filtered records.')) }; }
async function explainAlternatives(input) { const record = selectCriticalParcels(input?.projectId); return { ...record, ...(await explain('critical parcel alternatives', record, validExplanation, 'Explain why parcels are critical and how the listed deterministic alternatives differ.')) }; }

module.exports = {
  PROVENANCE, selectDocument, selectCase, selectConflict, selectCriticalParcels,
  assistantFilter, explainDocument, summarizeCase, explainConflict, interpretAdminQuery, explainAlternatives
};
