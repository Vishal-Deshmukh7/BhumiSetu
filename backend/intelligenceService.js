const { projects, parcels } = require('./data/mockData');
const { requestGemini } = require('./geminiService');

const supportedTypes = {
  award: 'Award Notice',
  compensation: 'Compensation Ledger',
  rnr: 'R&R Family Checklist'
};

function coerceString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function detectServiceHint(fileName, routeType) {
  const name = coerceString(fileName).toLowerCase();
  const route = coerceString(routeType).toLowerCase();

  if (route.includes('award') || name.includes('award')) return 'award';
  if (route.includes('comp') || route.includes('ledger') || name.includes('comp') || name.includes('ledger')) return 'compensation';
  if (route.includes('rr') || route.includes('rnr') || route.includes('family') || name.includes('rr') || name.includes('rnr') || name.includes('family')) return 'rnr';

  return route || 'award';
}

function findProject(data = {}) {
  if (!data || typeof data !== 'object') return null;
  const text = `${data.projectId || ''} ${data.projectName || ''} ${data.parcelId || ''} ${data.surveyNumber || ''} ${data.village || ''} ${data.district || ''}`.toLowerCase();
  return projects.find((project) => text.includes(project.id.toLowerCase()) || text.includes(project.name.toLowerCase()))
    || projects.find((project) => project.district && text.includes(project.district.toLowerCase()))
    || null;
}

function findParcel(data = {}) {
  if (!data || typeof data !== 'object') return null;
  return parcels.find((parcel) => (
    (data.parcelId && parcel.id.toLowerCase() === data.parcelId.toLowerCase())
    || (data.surveyNumber && parcel.surveyNumber.toLowerCase() === data.surveyNumber.toLowerCase())
  )) || null;
}

function compareField(label, uploaded, registered, formatter = (value) => value) {
  if (uploaded === undefined || uploaded === null || uploaded === '') {
    return { label, status: 'missing', uploaded: 'Not found', registered: formatter(registered) };
  }

  const matched = String(uploaded).toLowerCase() === String(registered).toLowerCase();
  return { label, status: matched ? 'matched' : 'discrepancy', uploaded: formatter(uploaded), registered: formatter(registered) };
}

function extractDemo(type, file) {
  const name = (file && file.originalname ? file.originalname : '').toLowerCase();

  if (type === 'award') {
    const parcel = name.includes('4012') ? parcels.find((item) => item.id === 'PAR-4012') : parcels[0];
    return {
      documentType: supportedTypes.award,
      projectId: parcel.projectId,
      projectName: projects.find((item) => item.id === parcel.projectId).name,
      district: parcel.district,
      village: parcel.village,
      surveyNumber: parcel.surveyNumber,
      parcelId: parcel.id,
      landArea: name.includes('4012') ? 5.9 : parcel.area,
      awardAmount: parcel.compensation,
      awardDate: '2026-08-14',
      confidence: 0.96,
      missingInformation: [],
      observations: ['Synthetic demonstration extraction.']
    };
  }

  if (type === 'compensation') {
    const parcel = parcels.find((item) => item.id === 'PAR-2250') || parcels[0];
    return {
      documentType: supportedTypes.compensation,
      projectId: parcel.projectId,
      projectName: projects.find((item) => item.id === parcel.projectId).name,
      district: parcel.district,
      village: parcel.village,
      surveyNumber: parcel.surveyNumber,
      parcelId: parcel.id,
      beneficiary: 'Aarav Mehta (Synthetic)',
      landArea: parcel.area,
      totalAssessed: parcel.compensation,
      amountPaid: name.includes('exception') ? 10 : parcel.compensation - 5,
      amountPending: name.includes('exception') ? 12.1 : 5,
      paymentPhases: ['Initial award release', 'Final possession release'],
      paymentReferences: ['DEMO-LEDGER-2026-08'],
      additionalBenefits: [],
      confidence: 0.94,
      missingInformation: [],
      observations: ['Synthetic demonstration extraction.']
    };
  }

  return {
    documentType: supportedTypes.rnr,
    projectId: 'MAH-208',
    projectName: 'Aurangabad Industrial Corridor',
    district: 'Aurangabad',
    village: 'Dharmpuri',
    confidence: 0.92,
    missingInformation: [],
    observations: ['Synthetic family-level checklist extraction.'],
    families: [
      { familyId: 'RNR-001', familyHead: 'Shinde Family (Synthetic)', houseNumber: 'H-142', housingStatus: 'Complete', relocationStatus: 'Complete', livelihoodStatus: 'Complete', compensationStatus: 'Paid', overallRnRStatus: 'Settled' },
      { familyId: 'RNR-002', familyHead: 'Patil Family (Synthetic)', houseNumber: 'H-143', housingStatus: 'Complete', relocationStatus: 'In Review', livelihoodStatus: 'Pending', compensationStatus: 'Paid', overallRnRStatus: 'In Review' },
      { familyId: 'RNR-003', familyHead: 'Jadhav Family (Synthetic)', houseNumber: 'H-144', housingStatus: 'Pending', relocationStatus: 'Pending', livelihoodStatus: 'Pending', compensationStatus: 'Pending', overallRnRStatus: 'Pending' }
    ]
  };
}

async function tryGemini(type, file) {
  const serviceLabels = {
    award: 'Award Notice',
    compensation: 'Compensation Ledger',
    rnr: 'R&R Family Checklist'
  };

  const prompt = `You are a document intelligence assistant for BHUMISETU, a land-acquisition decision support system.

Goal:
- Identify the document as ${serviceLabels[type] || type}.
- Extract structured JSON only.
- Treat backend system records as the source of truth.
- Never approve or reject a government record.
- Detect contradictions and missing fields for manual review.
- Never invent values. Use null when a field is missing.

Return JSON matching this pattern:
{
  "documentType": "${serviceLabels[type] || type}",
  "projectId": "string or null",
  "projectName": "string or null",
  "district": "string or null",
  "village": "string or null",
  "parcelId": "string or null",
  "surveyNumber": "string or null",
  "landArea": 0,
  "awardAmount": 0,
  "totalAssessed": 0,
  "amountPaid": 0,
  "amountPending": 0,
  "beneficiary": "string or null",
  "familyHead": "string or null",
  "families": [],
  "confidence": 0.0,
  "missingInformation": [],
  "observations": []
}

Important rules:
- Return valid JSON only, no markdown fences.
- Keep values realistic and consistent with a government land acquisition portal.
- Use the uploaded document content, not generic placeholder values.
- If the document is not a ${serviceLabels[type] || type}, return an object with documentType set to the detected type and missingInformation listing the issue.
- Do not claim a record is approved or rejected.
- The backend will reconcile this output with synthetic project records.`;

  try {
    const mimeType = file && file.mimetype ? file.mimetype : 'application/pdf';
    const buffer = file && file.buffer ? file.buffer : Buffer.from('');
    console.log(`[Gemini] Attempting live extraction for ${serviceLabels[type] || type} (${file?.originalname || 'unknown file'})`);

    const resultFromGemini = await requestGemini({
      label: `${serviceLabels[type] || type} extraction`,
      contents: [{
        parts: [
          { text: prompt },
          { inlineData: { mimeType, data: buffer.toString('base64') } }
        ]
      }]
    });

    if (!resultFromGemini) return null;
    const { payload, model } = resultFromGemini;
    console.log(`[Gemini] Live response received from model ${model}.`);
    console.log('[Gemini] Raw API response:');
    console.log(JSON.stringify(payload, null, 2));

    const text = payload.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    const cleaned = String(text).replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
    if (!cleaned) {
      console.log('[Gemini] Empty response body from Gemini.');
      return null;
    }

    try {
      const parsed = JSON.parse(cleaned);
      console.log('[Gemini] Live extraction succeeded. Parsed result:');
      console.log(JSON.stringify(parsed, null, 2));
      return parsed;
    } catch (parseError) {
      console.log('[Gemini] Failed to parse Gemini JSON response:', parseError.message);
      console.log('[Gemini] Response text was:', cleaned);
      return null;
    }
  } catch (error) {
    console.log('[Gemini] Exception during Gemini request:', error.message);
    return null;
  }
}

async function analyzeDocument(type, file) {
  const normalizedType = supportedTypes[type] ? type : detectServiceHint(file?.originalname || '', type || '');
  const liveExtraction = await tryGemini(normalizedType, file);
  const extracted = liveExtraction || extractDemo(normalizedType, file);

  if (!liveExtraction) {
    console.log('[Gemini] Using fallback synthetic extraction. Fallback payload:');
    console.log(JSON.stringify(extracted, null, 2));
  } else {
    console.log('[Gemini] Using live Gemini response for analysis.');
  }

  const project = findProject(extracted);
  const parcel = findParcel(extracted);

  if (normalizedType === 'rnr') {
    const families = extracted.families || [];
    return {
      documentType: supportedTypes.rnr,
      extractedData: extracted,
      matchedRecord: project ? { projectId: project.id, projectName: project.name } : null,
      validation: { matched: Boolean(project), fields: [] },
      discrepancies: project ? [] : ['No matching project record found.'],
      recommendations: project ? ['Review families marked In Review or Pending before advancing the R&R stage.'] : ['Confirm the project identifier manually.']
    };
  }

  const fields = project && parcel ? [
    compareField('Project ID', extracted.projectId, project.id),
    compareField('Survey number', extracted.surveyNumber, parcel.surveyNumber),
    compareField('Village', extracted.village, parcel.village),
    compareField('District', extracted.district, parcel.district),
    compareField('Land area', extracted.landArea, parcel.area, (value) => `${value} ha`),
    compareField(normalizedType === 'award' ? 'Award amount' : 'Assessed amount', normalizedType === 'award' ? extracted.awardAmount : extracted.totalAssessed, parcel.compensation, (value) => `₹${value} Cr`)
  ] : [];

  const discrepancies = (fields || []).filter((field) => field.status === 'discrepancy').map((field) => `${field.label}: uploaded ${field.uploaded}; system ${field.registered}.`);

  return {
    documentType: supportedTypes[normalizedType],
    extractedData: extracted,
    matchedRecord: project && parcel ? { project, parcel } : null,
    validation: { matched: fields.length > 0 && discrepancies.length === 0, fields },
    discrepancies,
    recommendations: discrepancies.length ? ['Manual verification recommended before advancing this record to the next acquisition stage.'] : ['Records matched and are eligible for the next verification stage.']
  };
}

module.exports = { analyzeDocument, supportedTypes, detectServiceHint, findProject, findParcel };
