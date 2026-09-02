require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { analyzeDocument } = require('./intelligenceService');
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

app.listen(PORT, () => {
  console.log(`Land Acquisition API running on http://localhost:${PORT}`);
});
