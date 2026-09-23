const Claim = require('../models/Claim');
const VerificationResult = require('../models/VerificationResult');
const { getMongoState } = require('../mongo');

const memoryClaims = new Map();

function persistenceStatus() {
  const mongo = getMongoState();
  return {
    mode: mongo.connected ? 'mongodb' : 'in-memory',
    configured: mongo.configured,
    available: mongo.connected,
    message: mongo.connected
      ? 'Verification result persisted in MongoDB.'
      : 'MongoDB is unavailable or not configured; verification result is held in in-memory fallback mode.'
  };
}

async function saveClaimVerification({ claimId, claim, documents, report, workflowStatus }) {
  const status = persistenceStatus();
  const record = {
    claimId,
    claim,
    documents,
    report,
    workflowStatus,
    persistence: status,
    createdAt: new Date().toISOString()
  };

  if (status.available) {
    try {
      await Claim.create({ claimId, claim, documents });
      await VerificationResult.create({ claimId, report, workflowStatus });
      return { ...record, persistence: persistenceStatus() };
    } catch (error) {
      console.warn(`[MongoDB] Could not save claim ${claimId}; using in-memory fallback. ${error.message}`);
    }
  }

  memoryClaims.set(claimId, record);
  return record;
}

async function getClaimVerification(claimId) {
  const status = persistenceStatus();
  if (status.available) {
    try {
      const [claim, verification] = await Promise.all([
        Claim.findOne({ claimId }).lean(),
        VerificationResult.findOne({ claimId }).lean()
      ]);
      if (claim && verification) {
        return {
          claimId,
          claim: claim.claim,
          documents: claim.documents,
          report: verification.report,
          workflowStatus: verification.workflowStatus,
          persistence: status,
          createdAt: verification.createdAt || claim.createdAt
        };
      }
    } catch (error) {
      console.warn(`[MongoDB] Could not read claim ${claimId}; checking in-memory fallback. ${error.message}`);
    }
  }
  return memoryClaims.get(claimId) || null;
}

module.exports = { saveClaimVerification, getClaimVerification, persistenceStatus };
