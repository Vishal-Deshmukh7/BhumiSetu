require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { analyzeDocument } = require('./intelligenceService');
const { calculateCompensation } = require('./compensationService');
const { interpretCompensation } = require('./compensationAiService');
const { connectMongo } = require('./mongo');
const { verifyClaim, getClaimVerification } = require('./services/claimVerificationService');
const aiTestRouter = require('./routes/aiTest');
const aiAdminRouter = require('./routes/aiAdmin');
const landownerRouter = require('./routes/landowner');
const authRouter = require('./routes/auth');
const {
  dashboardSummary,
  projects,
  parcels,
  alerts,
  documents,
  riskInsights
} = require('./data/mockData');

const app = express();
const PORT = process.env.PORT || 5001;
const assessments = new Map();
let nextAssessmentNumber = 1;

function getCompensationCalculation(body) {
  if (body?.calculation?.inputs) return calculateCompensation(body.calculation.inputs);
  return calculateCompensation(body);
}

function normalizeMimeType(file) {
  const mime = (file.mimetype || '').toLowerCase();
  const ext = (file.originalname || '').split('.').pop()?.toLowerCase();

  if (mime.includes('pdf') || ext === 'pdf') return 'application/pdf';
  if (mime.includes('png') || ext === 'png') return 'image/png';
  if (mime.includes('jpeg') || mime.includes('jpg') || ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
  return mime || '';
}

app.use(cors());
app.use(express.json());
app.use('/api/ai', aiTestRouter);
app.use('/api/ai', aiAdminRouter);
app.use('/api/landowner', landownerRouter);
app.use('/api/landowner', authRouter);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    const normalizedType = normalizeMimeType(file);
    const allowed = ['application/pdf', 'image/jpeg', 'image/png'];

    if (!allowed.includes(normalizedType)) {
      return callback(new Error('Unsupported document type'));
    }

    file.mimetype = normalizedType;
    callback(null, true);
  }
});
const claimUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 10 },
  fileFilter: (req, file, callback) => {
    const normalizedType = normalizeMimeType(file);
    const allowed = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowed.includes(normalizedType)) return callback(new Error('Unsupported document type'));
    file.mimetype = normalizedType;
    callback(null, true);
  }
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Land Acquisition Prototype API is running',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/dashboard', (req, res) => {
  res.json({
    summary: dashboardSummary,
    alerts,
    projects,
    risk: riskInsights
  });
});

app.get('/api/projects', (req, res) => {
  res.json({ projects });
});

app.get('/api/projects/:projectId', (req, res) => {
  const project = projects.find((item) => item.id === req.params.projectId);

  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }

  return res.json({ project });
});

app.get('/api/projects/:projectId/parcels', (req, res) => {
  const filteredParcels = parcels.filter((parcel) => parcel.projectId === req.params.projectId);
  res.json({ parcels: filteredParcels });
});

app.get('/api/parcels/:parcelId/context', (req, res) => {
  const parcel = parcels.find((item) => item.id === req.params.parcelId || item.parcelId === req.params.parcelId);
  if (!parcel) return res.status(404).json({ message: 'Parcel not found' });

  const project = projects.find((item) => item.id === parcel.projectId);
  return res.json({
    parcel,
    project,
    context: {
      parentProject: project,
      parcelImpact: parcel.impact,
      timeline: parcel.timeline,
      operationalDependency: parcel.operationalDependency,
      aiInsight: parcel.aiInsight
    }
  });
});

app.get('/api/parcels/:parcelId', (req, res) => {
  const parcel = parcels.find((item) => item.id === req.params.parcelId || item.parcelId === req.params.parcelId);
  if (!parcel) return res.status(404).json({ message: 'Parcel not found' });
  return res.json({ parcel });
});

app.get('/api/documents', (req, res) => {
  res.json({ documents });
});

app.get('/api/intelligence', (req, res) => {
  const activeProjects = projects.filter((project) => project.alerts > 0);
  const discrepancyCount = parcels.filter((parcel) => parcel.validation !== 'Verified').length;
  res.json({
    risk: riskInsights,
    alerts,
    documents,
    today: {
      projectsRequiringAttention: activeProjects.length,
      recordDiscrepancies: discrepancyCount,
      rnrCasesRequiringReview: parcels.filter((parcel) => parcel.rrRequired && parcel.possession !== 'In Progress').length
    }
  });
});

app.post('/api/compensation/calculate', (req, res) => {
  try {
    return res.json({ calculation: calculateCompensation(req.body) });
  } catch (error) {
    if (error.code === 'INVALID_INPUT') return res.status(422).json({ message: error.message });
    return res.status(500).json({ message: 'Compensation calculation failed.' });
  }
});

app.post('/api/compensation/analyze', async (req, res) => {
  try {
    const calculation = getCompensationCalculation(req.body);
    const insight = await interpretCompensation(calculation);
    return res.json({ calculation, insight });
  } catch (error) {
    if (error.code === 'INVALID_INPUT') return res.status(422).json({ message: error.message });
    return res.status(500).json({ message: 'Compensation analysis failed.' });
  }
});

app.post('/api/compensation/assessments', (req, res) => {
  try {
    const calculation = getCompensationCalculation(req.body);
    const assessmentId = `ASM-${String(nextAssessmentNumber).padStart(4, '0')}`;
    nextAssessmentNumber += 1;
    const assessment = {
      assessmentId,
      projectId: req.body?.projectId || calculation.inputs?.projectId || null,
      parcelId: req.body?.parcelId || calculation.inputs?.parcelId || null,
      calculation,
      insight: req.body?.insight || null,
      createdAt: new Date().toISOString(),
      persistence: 'in-memory-prototype'
    };
    assessments.set(assessmentId, assessment);
    return res.status(201).json({ assessment });
  } catch (error) {
    if (error.code === 'INVALID_INPUT') return res.status(422).json({ message: error.message });
    return res.status(500).json({ message: 'Assessment could not be saved.' });
  }
});

app.get('/api/compensation/assessments/:assessmentId', (req, res) => {
  const assessment = assessments.get(req.params.assessmentId);
  if (!assessment) return res.status(404).json({ message: 'Assessment not found.' });
  return res.json({ assessment });
});

app.post('/api/intelligence/:type', upload.single('document'), async (req, res) => {
  const allowedTypes = ['award', 'compensation', 'rnr'];
  if (!allowedTypes.includes(req.params.type)) return res.status(400).json({ message: 'Unsupported intelligence service.' });
  if (!req.file) return res.status(400).json({ message: 'Upload a PDF, JPG, or PNG document.' });

  try {
    return res.json(await analyzeDocument(req.params.type, req.file));
  } catch (error) {
    if (error.code === 'UNSUPPORTED_DOCUMENT' || error.message === 'Unsupported document type') {
      return res.status(422).json({ message: 'This document could not be identified as one of the supported acquisition document types.' });
    }
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ message: 'Document exceeds the 10 MB upload limit.' });
    }
    return res.status(502).json({ message: 'Document analysis is temporarily unavailable. Please try again.' });
  }
});

app.post('/api/claims/verify', claimUpload.array('documents', 10), async (req, res) => {
  if (!req.files || req.files.length < 1) {
    return res.status(400).json({ message: 'Upload at least one PDF, JPG, or PNG document in the documents field.' });
  }

  try {
    const result = await verifyClaim({ body: req.body, files: req.files });
    return res.status(201).json(result);
  } catch (error) {
    console.error('[Claims] Verification failed:', error);
    return res.status(500).json({ message: 'Claim verification could not be completed. Please try again.' });
  }
});

app.get('/api/claims/:claimId', async (req, res) => {
  try {
    const result = await getClaimVerification(req.params.claimId);
    if (!result) return res.status(404).json({ message: 'Claim verification not found.' });
    return res.json(result);
  } catch (error) {
    console.error('[Claims] Read failed:', error);
    return res.status(500).json({ message: 'Claim verification could not be loaded.' });
  }
});

app.get('/api/map', (req, res) => {
  res.json({ parcels });
});

app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ message: 'Document exceeds the 10 MB upload limit.' });
  }

  if (error.message === 'Unsupported document type') {
    return res.status(422).json({ message: 'This document could not be identified as one of the supported acquisition document types.' });
  }

  return res.status(500).json({ message: 'Unexpected upload error.' });
});

connectMongo().catch((error) => {
  console.warn(`[MongoDB] Startup connection failed; using in-memory claim persistence. ${error.message}`);
});

app.listen(PORT, () => {
  console.log(`Land Acquisition API running on http://localhost:${PORT}`);
});
