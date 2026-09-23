const express = require('express');
const {
  explainDocument, summarizeCase, explainConflict, interpretAdminQuery,
  explainAlternatives
} = require('../services/ai/adminService');

const router = express.Router();

function handle(fn) {
  return async (req, res) => {
    try {
      return res.json(await fn(req));
    } catch (error) {
      const status = error.status || (error.code === 'NOT_FOUND' ? 404 : error.code === 'UNSAFE_QUERY' ? 422 : 500);
      return res.status(status).json({ success: false, error: error.message });
    }
  };
}

router.post('/document-explanation', handle((req) => explainDocument(req.body || {})));
router.post('/case-summary', handle((req) => summarizeCase(req.body || {})));
router.post('/conflict-explanation', handle((req) => explainConflict(req.body || {})));
router.post('/assistant', handle((req) => interpretAdminQuery(req.body?.question)));
router.get('/critical-parcels', handle((req) => explainAlternatives({ projectId: req.query.projectId })));

module.exports = router;
