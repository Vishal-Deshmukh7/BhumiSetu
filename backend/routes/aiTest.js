const express = require('express');
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const {
  testOpenRouter,
  extractLandDocumentFields,
  getErrorDetails
} = require('../services/ai/openrouter');

const router = express.Router();

function findTestPdf() {
  const candidates = [
    path.resolve(__dirname, '..', 'demo-docs', 'Land Ownership Certificate (Prompt 1).pdf'),
    path.resolve(__dirname, '..', 'demo-docs', 'Area Discrepancy (Prompt 3).pdf'),
    path.resolve(__dirname, '..', 'Fictional Land Ownership Certificate.pdf'),
    path.resolve(__dirname, '..', '..', 'Fictional Land Ownership Certificate.pdf'),
    path.resolve(__dirname, '..', '..', 'proxy_pdf.pdf')
  ];

  return candidates.find((filePath) => fs.existsSync(filePath)) || null;
}

router.get('/test', async (req, res) => {
  try {
    const connectivity = await testOpenRouter();
    const pdfPath = findTestPdf();

    if (!pdfPath) {
      return res.status(404).json({
        connectivity,
        pdfParsing: { succeeded: false, error: 'No test PDF was found.' }
      });
    }

    const pdfBuffer = fs.readFileSync(pdfPath);
    const parsedPdf = await pdfParse(pdfBuffer);
    const extraction = await extractLandDocumentFields(parsedPdf.text);

    return res.json({
      connectivity,
      pdfParsing: {
        succeeded: true,
        file: path.basename(pdfPath),
        requestedFileFound: [
          'Land Ownership Certificate (Prompt 1).pdf',
          'Area Discrepancy (Prompt 3).pdf'
        ].includes(path.basename(pdfPath)),
        textLength: parsedPdf.text.length
      },
      openRouterResponse: extraction.content,
      structuredResult: extraction.parsed,
      model: extraction.model
    });
  } catch (error) {
    const details = getErrorDetails(error);
    return res.status(details.status).json({
      success: false,
      error: details.message
    });
  }
});

module.exports = router;
