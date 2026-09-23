function fallbackInsight(result) {
  const flags = result.flags || [];
  const priorities = [];
  if (flags.some((flag) => flag.key === 'resettlement')) priorities.push('Coordinate resettlement infrastructure before possession.');
  if (flags.some((flag) => flag.key === 'livelihood')) priorities.push('Validate livelihood restoration evidence and the affected activity.');
  priorities.push('Have the competent authority verify title, valuation evidence, dates and applicable notifications.');
  return {
    provider: 'deterministic-fallback',
    label: 'Fallback decision support',
    fallback: true,
    summary: 'The rule-based estimate is ready for administrative review. No AI interpretation was available.',
    priorities,
    caveat: 'AI failure did not change the deterministic calculation.'
  };
}

async function interpretCompensation(result) {
  const fallback = fallbackInsight(result);
  const prompt = `You are interpreting a deterministic land-acquisition compensation result for administrative decision support.
Do not recalculate, alter, approve, reject, or invent any financial value. Use only the supplied JSON.
Return JSON only with this shape:
{"summary":"string","priorities":["string"],"caveat":"string"}
The result is preliminary and requires authority review.
DETERMINISTIC_RESULT:
${JSON.stringify(result)}`;

  try {
    const resultFromAI = await requestWithProvider({
      label: 'compensation interpretation',
      messages: [
        { role: 'system', content: 'Return valid JSON only. Do not change deterministic financial values.' },
        { role: 'user', content: prompt },
      ],
    });
    if (!resultFromAI?.parsed) return fallback;
    const { model, parsed } = resultFromAI;
    if (!parsed || typeof parsed.summary !== 'string' || !Array.isArray(parsed.priorities)) return fallback;
    return {
      provider: resultFromAI.provider,
      model,
      label: 'AI interpretation of deterministic result',
      fallback: false,
      summary: parsed.summary,
      priorities: parsed.priorities.map(String),
      caveat: parsed.caveat || 'AI output is advisory and requires authority review.'
    };
  } catch (error) {
    return fallback;
  }
}

module.exports = { interpretCompensation, fallbackInsight };
const { requestWithProvider } = require('./services/ai/aiService');
