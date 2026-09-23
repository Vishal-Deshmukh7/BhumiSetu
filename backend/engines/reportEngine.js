function buildWorkflowStatus(conflicts, internalConsistency) {
  const reviewRequired = conflicts.length > 0 || internalConsistency.status === 'inconsistent';
  const highRisk = conflicts.some((item) => item.severity === 'high' || item.type === 'duplicate-acquisition' || item.type === 'internal-inconsistency');
  const onlyPartial = conflicts.length > 0 && !highRisk && conflicts.every((item) => ['partial-conflict', 'area-mismatch', 'mutation-mismatch', 'registration-mismatch', 'spatial-conflict'].includes(item.type));
  const overall = !reviewRequired
    ? 'VERIFIED'
    : highRisk
      ? 'HIGH RISK'
      : onlyPartial
        ? 'PARTIALLY VERIFIED'
        : 'CONFLICT DETECTED';
  return {
    overall,
    statusCode: reviewRequired ? 'requires-authority-verification' : 'verified',
    currentStep: reviewRequired ? 6 : 8,
    completedSteps: reviewRequired ? 5 : 8,
    totalSteps: 8,
    nextAction: reviewRequired
      ? (highRisk ? 'Acquisition workflow on hold; authority verification required.' : 'Request additional verification from an authorised record custodian.')
      : 'Continue acquisition workflow subject to authorised record review.'
  };
}

function buildReport({ claimId, claim, record, extractedDocuments, fieldComparisons, conflicts, internalConsistency, graph, persistence }) {
  const matchedFields = fieldComparisons.filter((field) => field.status === 'matched').length;
  const missingFields = fieldComparisons.filter((field) => field.status === 'missing').length;
  const workflowStatus = buildWorkflowStatus(conflicts, internalConsistency);
  const extractionSources = [...new Set(extractedDocuments.map((item) => item.source))];
  const integrityIndicators = {
    recordMatch: record ? 'matched-to-synthetic-record' : 'unresolved',
    fieldMatchRate: fieldComparisons.length ? Number((matchedFields / fieldComparisons.length).toFixed(2)) : 0,
    missingFieldCount: missingFields,
    internalConsistency: internalConsistency.status,
    extractionSources,
    duplicateSignal: conflicts.some((item) => item.type === 'duplicate-acquisition') ? 'flagged' : 'not-observed',
    syntheticDataNotice: 'All prototype records are synthetic and require authorised source confirmation.'
  };

  const report = {
    title: 'Multilayer Land Claim Verification Report',
    claimId,
    generatedAt: new Date().toISOString(),
    disclaimer: 'This decision-support report identifies data relationships and review signals. It does not establish legal ownership, forgery, or entitlement.',
    summary: conflicts.length
      ? `${conflicts.length} review signal${conflicts.length === 1 ? '' : 's'} detected across document, record, and consistency layers.`
      : 'No synthetic comparison conflicts were detected across the submitted fields.',
    documentAnalysis: {
      documentsAnalysed: extractedDocuments.length,
      sources: extractedDocuments.map(({ fileName, source }) => ({ fileName, source })),
      extractedFields: extractedDocuments.map(({ fileName, fields }) => ({ fileName, fields }))
    },
    recordVerification: {
      matchedParcel: record,
      fieldComparisons
    },
    consistencyAnalysis: internalConsistency,
    conflictClassification: conflicts,
    integrityIndicators,
    claimGraph: graph,
    workflowStatus,
    persistence
  };
  return { report, workflowStatus };
}

module.exports = { buildReport };
