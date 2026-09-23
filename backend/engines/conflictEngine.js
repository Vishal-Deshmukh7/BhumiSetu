function classifyConflicts({ claim, record, fieldComparisons, internalConsistency, demoCase }) {
  const conflicts = [];
  const discrepancy = (field) => fieldComparisons.find((item) => item.field === field)?.status === 'discrepancy';

  if (discrepancy('Owner / claimant name')) {
    conflicts.push({
      type: 'owner-mismatch',
      severity: 'high',
      status: 'review',
      message: 'Submitted claimant name differs from the synthetic record snapshot; route to authorised human review.'
    });
  }
  if (discrepancy('Land area')) {
    conflicts.push({
      type: 'area-mismatch',
      severity: 'medium',
      status: 'review',
      message: 'Submitted land area differs from the synthetic parcel record.'
    });
  }
  if (discrepancy('Mutation status')) {
    conflicts.push({
      type: 'mutation-mismatch',
      severity: 'medium',
      status: 'review',
      message: 'Submitted mutation status differs from the synthetic mutation register snapshot.'
    });
  }
  if (discrepancy('Registration number') || discrepancy('Registration date')) {
    conflicts.push({
      type: 'registration-mismatch',
      severity: 'medium',
      status: 'review',
      message: 'Submitted registration details differ from the synthetic registration snapshot.'
    });
  }
  if (discrepancy('Spatial parcel')) {
    conflicts.push({
      type: 'spatial-conflict',
      severity: 'medium',
      status: 'review',
      message: 'The submitted parcel identifier could not be reconciled with available synthetic spatial data.'
    });
  }
  if (internalConsistency.status === 'inconsistent') {
    conflicts.push({
      type: 'internal-inconsistency',
      severity: 'high',
      status: 'review',
      message: 'Documents contain conflicting extracted fields and require document-level reconciliation.',
      fields: internalConsistency.conflicts
    });
  }
  if (demoCase === 'duplicate-acquisition' || claim.duplicateAcquisitionReference) {
    conflicts.push({
      type: 'duplicate-acquisition',
      severity: 'high',
      status: 'review',
      message: `A synthetic duplicate acquisition reference was detected for ${record.parcelId}; confirm against authorised registers.`,
      reference: claim.duplicateAcquisitionReference || `SYN-DUP-${record.parcelId}`
    });
  }

  const fieldDiscrepancies = fieldComparisons.filter((field) => field.status === 'discrepancy');
  if (fieldDiscrepancies.length > 0 && !conflicts.some((item) => item.type === 'owner-mismatch' || item.type === 'area-mismatch' || item.type === 'mutation-mismatch' || item.type === 'registration-mismatch' || item.type === 'spatial-conflict')) {
    conflicts.push({
      type: 'document-conflict',
      severity: 'medium',
      status: 'review',
      message: 'Submitted document fields conflict with the available record snapshot.'
    });
  }

  if (fieldDiscrepancies.length > 0 && fieldDiscrepancies.length < fieldComparisons.length && !conflicts.some((item) => item.type === 'partial-conflict')) {
    conflicts.push({
      type: 'partial-conflict',
      severity: 'medium',
      status: 'review',
      message: 'Some claim fields match while one or more important fields require reconciliation.'
    });
  }

  return conflicts;
}

module.exports = { classifyConflicts };
