const crypto = require('crypto');
const { normalizeExtraction } = require('../engines/extractionNormalizer');
const { buildFieldComparisons, assessInternalConsistency } = require('../engines/consistencyEngine');
const { classifyConflicts } = require('../engines/conflictEngine');
const { buildClaimGraph } = require('../engines/graphEngine');
const { buildReport } = require('../engines/reportEngine');
const { saveClaimVerification, getClaimVerification, persistenceStatus } = require('../stores/claimStore');

function createClaimId() {
  return `CLM-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}

async function verifyClaim({ body, files }) {
  const claimId = createClaimId();
  const extraction = await normalizeExtraction({ body, files });
  const fieldComparisons = buildFieldComparisons(extraction.claimFields, extraction.record);
  const internalConsistency = assessInternalConsistency(extraction.extractedDocuments);
  const conflicts = classifyConflicts({
    claim: extraction.claimFields,
    record: extraction.record,
    fieldComparisons,
    internalConsistency,
    demoCase: extraction.demoCase
  });
  const graph = buildClaimGraph({
    claimId,
    claim: extraction.claimFields,
    record: extraction.record,
    conflicts
  });
  const { report, workflowStatus } = buildReport({
    claimId,
    claim: extraction.claimFields,
    record: extraction.record,
    extractedDocuments: extraction.extractedDocuments,
    fieldComparisons,
    conflicts,
    internalConsistency,
    graph,
    persistence: persistenceStatus()
  });
  const saved = await saveClaimVerification({
    claimId,
    claim: extraction.claimFields,
    documents: extraction.extractedDocuments.map(({ fileName, source }) => ({ fileName, source })),
    report,
    workflowStatus
  });
  report.persistence = saved.persistence;
  report.workflowStatus = workflowStatus;

  return {
    claimId,
    persistence: saved.persistence,
    workflowStatus,
    conflicts,
    fieldComparisons,
    integrityIndicators: report.integrityIndicators,
    graph,
    report
  };
}

module.exports = { verifyClaim, getClaimVerification };
