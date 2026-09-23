function normal(value) {
  return String(value ?? '').trim().toLowerCase();
}

function compare(label, claimValue, recordValue, formatter = (value) => value) {
  const missing = claimValue === undefined || claimValue === null || claimValue === '';
  const matched = !missing && normal(claimValue) === normal(recordValue);
  return {
    field: label,
    status: missing ? 'missing' : matched ? 'matched' : 'discrepancy',
    submitted: missing ? 'Not found' : formatter(claimValue),
    registered: formatter(recordValue)
  };
}

function buildFieldComparisons(claim, record) {
  return [
    compare('Parcel identifier', claim.parcelId, record.parcelId),
    compare('Survey number', claim.surveyNumber, record.surveyNumber),
    compare('Project identifier', claim.projectId, record.projectId),
    compare('Owner / claimant name', claim.owner, record.owner),
    compare('Village', claim.village, record.village),
    compare('District', claim.district, record.district),
    compare('Land area', claim.landArea, record.landArea, (value) => `${value} ha`),
    compare('Mutation status', claim.mutationStatus, record.mutationStatus),
    compare('Registration number', claim.registrationNumber, record.registrationNumber),
    compare('Registration date', claim.registrationDate, record.registrationDate),
    compare('Acquisition status', claim.acquisitionStatus, record.acquisitionStatus),
    compare('Award date', claim.awardDate, record.awardDate),
    {
      field: 'Spatial parcel',
      status: record.spatialStatus === 'available' && claim.parcelId && claim.parcelId === record.parcelId ? 'matched' : record.spatialStatus === 'available' ? 'missing' : 'missing',
      submitted: claim.parcelId || 'Not found',
      registered: record.spatialStatus === 'available' ? record.parcelId : 'Not available'
    }
  ];
}

function assessInternalConsistency(extractedDocuments) {
  const comparable = extractedDocuments.filter((item) => item?.fields);
  if (comparable.length < 2) {
    return { status: 'not-tested', score: 0.8, conflicts: [] };
  }

  const fields = ['parcelId', 'surveyNumber', 'projectId', 'owner', 'landArea', 'mutationStatus'];
  const conflicts = [];
  fields.forEach((field) => {
    const values = [...new Set(comparable.map((item) => String(item.fields[field] ?? '').trim().toLowerCase()).filter(Boolean))];
    if (values.length > 1) conflicts.push({ field, values });
  });

  return {
    status: conflicts.length ? 'inconsistent' : 'consistent',
    score: conflicts.length ? 0.35 : 0.95,
    conflicts
  };
}

module.exports = { buildFieldComparisons, assessInternalConsistency };
