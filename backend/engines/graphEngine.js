function buildClaimGraph({ claimId, claim, record, conflicts }) {
  const nodes = [
    { id: 'claim', type: 'claim', label: `Claim ${claimId}`, status: 'submitted' },
    { id: 'documents', type: 'documents', label: 'Uploaded documents', status: 'analysed' },
    { id: 'parcel', type: 'parcel', label: record?.parcelId || claim.parcelId || 'Unresolved parcel', status: record ? 'matched' : 'unresolved' },
    { id: 'record', type: 'record', label: 'Synthetic land record', status: record ? 'available' : 'unavailable' },
    { id: 'review', type: 'workflow', label: conflicts.length ? 'Manual review queue' : 'Verification review', status: conflicts.length ? 'required' : 'ready' }
  ];
  const edges = [
    { id: 'claim-documents', source: 'claim', target: 'documents', label: 'contains' },
    { id: 'documents-parcel', source: 'documents', target: 'parcel', label: 'identifies' },
    { id: 'parcel-record', source: 'parcel', target: 'record', label: 'reconciles with' },
    { id: 'record-review', source: 'record', target: 'review', label: 'routes to' }
  ];
  conflicts.forEach((conflict, index) => {
    const id = `conflict-${index + 1}`;
    nodes.push({ id, type: 'conflict', label: conflict.type.replace(/-/g, ' '), status: 'review' });
    edges.push({ id: `record-${id}`, source: 'record', target: id, label: 'signals' });
  });
  return { nodes, edges };
}

module.exports = { buildClaimGraph };
