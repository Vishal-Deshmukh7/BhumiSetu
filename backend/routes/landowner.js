const express = require('express');
const {
  landownerProfiles,
  allParcels,
  allProposals,
  allDisputes,
  allHearings,
  allDocuments,
  contacts,
  LANDOWNER_PROVENANCE,
} = require('../data/landownerData');
const {
  explainProposal,
  explainHearing,
  summarizeCase,
  explainDocument,
} = require('../services/ai/landownerAiService');

const router = express.Router();

function handle(fn) {
  return async (req, res) => {
    try {
      return res.json(await fn(req));
    } catch (error) {
      const status = error.status || 500;
      return res.status(status).json({ success: false, error: error.message });
    }
  };
}

const DEFAULT_LANDOWNER_ID = 'LO-001';

function setDefaultLandowner(req, res, next) {
  const account = landownerProfiles[DEFAULT_LANDOWNER_ID];
  req.loUser = account;
  req.loParcelIds = account.parcelIds || [];
  next();
}

router.use(setDefaultLandowner);

function filterByParcels(items, parcelIds) {
  return items.filter((item) => parcelIds.includes(item.parcelId));
}

router.get('/dashboard', (req, res) => {
  const profile = req.loUser;
  const parcels = allParcels.filter((p) => req.loParcelIds.includes(p.parcelId));
  const proposals = filterByParcels(allProposals, req.loParcelIds);
  const disputes = allDisputes.filter((d) => req.loParcelIds.includes(d.parcelId));
  const hearings = allHearings.filter((h) => disputes.some((d) => d.disputeId === h.disputeId));
  const activeProposals = proposals.filter((p) => p.acquisitionStage !== 'Completed');
  const activeDisputes = disputes.filter((d) => d.status === 'Active');
  const upcomingHearings = hearings.filter((h) => h.status === 'Upcoming' || h.status === 'Scheduled');
  const profileNotifications = (profile.notifications || []).filter((n) => !n.read);

  res.json({
    profile,
    parcels,
    activeProposalCount: activeProposals.length,
    activeDisputeCount: activeDisputes.length,
    upcomingHearingCount: upcomingHearings.length,
    nextHearing: upcomingHearings[0] || null,
    notifications: profileNotifications,
    recentNotifications: (profile.notifications || []).slice(0, 5),
    provenance: LANDOWNER_PROVENANCE,
  });
});

router.get('/parcels', (req, res) => {
  const parcels = allParcels.filter((p) => req.loParcelIds.includes(p.parcelId));
  res.json({ parcels, provenance: LANDOWNER_PROVENANCE });
});

router.get('/parcels/:parcelId', (req, res) => {
  if (!req.loParcelIds.includes(req.params.parcelId)) {
    return res.status(404).json({ error: 'Parcel not found.' });
  }
  const parcel = allParcels.find((p) => p.parcelId === req.params.parcelId);
  if (!parcel) return res.status(404).json({ error: 'Parcel not found.' });
  const parcelProposals = allProposals.filter((p) => p.parcelId === parcel.parcelId);
  const parcelDisputes = allDisputes.filter((d) => d.parcelId === parcel.parcelId);
  res.json({ parcel, proposals: parcelProposals, disputes: parcelDisputes, provenance: LANDOWNER_PROVENANCE });
});

router.get('/proposals', (req, res) => {
  const proposals = filterByParcels(allProposals, req.loParcelIds);
  res.json({ proposals, provenance: LANDOWNER_PROVENANCE });
});

router.get('/proposals/compare', (req, res) => {
  const parcelId = req.query.parcelId || req.loParcelIds[0];
  if (!req.loParcelIds.includes(parcelId)) {
    return res.status(404).json({ error: 'Parcel not found.' });
  }
  const matching = allProposals.filter((p) => p.parcelId === parcelId);
  const parcel = allParcels.find((p) => p.parcelId === parcelId);
  res.json({ parcel, proposals: matching, provenance: LANDOWNER_PROVENANCE });
});

router.get('/disputes', (req, res) => {
  const disputes = allDisputes.filter((d) => req.loParcelIds.includes(d.parcelId));
  res.json({ disputes, provenance: LANDOWNER_PROVENANCE });
});

router.get('/disputes/:disputeId', (req, res) => {
  const dispute = allDisputes.find((d) => d.disputeId === req.params.disputeId);
  if (!dispute || !req.loParcelIds.includes(dispute.parcelId)) {
    return res.status(404).json({ error: 'Dispute not found.' });
  }
  const disputeHearings = allHearings.filter((h) => h.disputeId === dispute.disputeId);
  res.json({ dispute, hearings: disputeHearings, provenance: LANDOWNER_PROVENANCE });
});

router.get('/disputes/:disputeId/hearings', (req, res) => {
  const dispute = allDisputes.find((d) => d.disputeId === req.params.disputeId);
  if (!dispute || !req.loParcelIds.includes(dispute.parcelId)) {
    return res.status(404).json({ error: 'Dispute not found.' });
  }
  const disputeHearings = allHearings.filter((h) => h.disputeId === req.params.disputeId);
  res.json({ hearings: disputeHearings, provenance: LANDOWNER_PROVENANCE });
});

router.get('/documents', (req, res) => {
  const docs = allDocuments.filter((d) => req.loParcelIds.includes(d.parcelId));
  res.json({ documents: docs, provenance: LANDOWNER_PROVENANCE });
});

router.get('/documents/:documentId', (req, res) => {
  const doc = allDocuments.find((d) => d.documentId === req.params.documentId);
  if (!doc || !req.loParcelIds.includes(doc.parcelId)) {
    return res.status(404).json({ error: 'Document not found.' });
  }
  res.json({ document: doc, provenance: LANDOWNER_PROVENANCE });
});

router.get('/contacts', (req, res) => {
  res.json({ contacts, provenance: LANDOWNER_PROVENANCE });
});

router.get('/notifications', (req, res) => {
  const notifications = req.loUser.notifications || [];
  res.json({ notifications, provenance: LANDOWNER_PROVENANCE });
});

router.post('/ai/proposal-explain', handle(async (req) => {
  const { proposalId, parcelId } = req.body || {};
  if (!proposalId) return (() => { const e = new Error('proposalId is required.'); e.status = 422; throw e; })();
  const proposal = allProposals.find((p) => p.proposalId === proposalId);
  if (!proposal || !req.loParcelIds.includes(proposal.parcelId)) {
    return (() => { const e = new Error('Proposal not found.'); e.status = 404; throw e; })();
  }
  const parcel = allParcels.find((p) => p.parcelId === (parcelId || proposal.parcelId));
  const result = await explainProposal(proposal, parcel);
  return { ...result, provenance: LANDOWNER_PROVENANCE };
}));

router.post('/ai/hearing-explain', handle(async (req) => {
  const { hearingId } = req.body || {};
  if (!hearingId) return (() => { const e = new Error('hearingId is required.'); e.status = 422; throw e; })();
  const hearing = allHearings.find((h) => h.hearingId === hearingId);
  if (!hearing) return (() => { const e = new Error('Hearing not found.'); e.status = 404; throw e; })();
  const result = await explainHearing(hearing);
  return { ...result, hearing, provenance: LANDOWNER_PROVENANCE };
}));

router.post('/ai/case-summary', handle(async (req) => {
  const parcels = allParcels.filter((p) => req.loParcelIds.includes(p.parcelId));
  const proposals = filterByParcels(allProposals, req.loParcelIds);
  const disputes = allDisputes.filter((d) => req.loParcelIds.includes(d.parcelId));
  const result = await summarizeCase(parcels, proposals, disputes);
  return { ...result, provenance: LANDOWNER_PROVENANCE };
}));

router.post('/ai/document-explain', handle(async (req) => {
  const { documentId } = req.body || {};
  if (!documentId) return (() => { const e = new Error('documentId is required.'); e.status = 422; throw e; })();
  const doc = allDocuments.find((d) => d.documentId === documentId);
  if (!doc || !req.loParcelIds.includes(doc.parcelId)) {
    return (() => { const e = new Error('Document not found.'); e.status = 404; throw e; })();
  }
  const result = await explainDocument(doc);
  return { ...result, document: doc, provenance: LANDOWNER_PROVENANCE };
}));

module.exports = router;
