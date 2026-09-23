const assert = require('assert');
const service = require('../services/ai/adminService');

const document = service.selectDocument({ documentId: 'DOC-1801' });
assert.strictEqual(document.document.documentId, 'DOC-1801');
assert.strictEqual(document.provenance.mode, 'synthetic-demo');

const caseRecord = service.selectCase({ parcelId: 'PAR-1000' });
assert.strictEqual(caseRecord.parcel.parcelId, 'PAR-1000');

const conflict = service.selectConflict({ parcelId: 'PAR-1000' });
assert.ok(conflict.conflicts.length > 0);

const critical = service.selectCriticalParcels('KBLP-MP-UP');
assert.ok(critical.criticalParcels.length > 0);
assert.ok(critical.alternatives.every((item) => item.parcelId && item.coordinates));

assert.throws(() => service.assistantFilter('show me arbitrary database records'), (error) => error.code === 'UNSAFE_QUERY');
console.log('AI admin deterministic selector checks passed.');
