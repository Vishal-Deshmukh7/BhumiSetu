const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema({
  claimId: { type: String, required: true, unique: true, index: true },
  claim: { type: mongoose.Schema.Types.Mixed, required: true },
  documents: { type: [mongoose.Schema.Types.Mixed], default: [] },
  createdAt: { type: Date, default: Date.now }
}, { collection: 'claims', versionKey: false });

module.exports = mongoose.models.Claim || mongoose.model('Claim', claimSchema);
