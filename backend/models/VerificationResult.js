const mongoose = require('mongoose');

const verificationResultSchema = new mongoose.Schema({
  claimId: { type: String, required: true, unique: true, index: true },
  report: { type: mongoose.Schema.Types.Mixed, required: true },
  workflowStatus: { type: mongoose.Schema.Types.Mixed, required: true },
  createdAt: { type: Date, default: Date.now }
}, { collection: 'verification_results', versionKey: false });

module.exports = mongoose.models.VerificationResult || mongoose.model('VerificationResult', verificationResultSchema);
