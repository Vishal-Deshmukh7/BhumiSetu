const DEFAULT_RULES = Object.freeze({
  version: 'compensation-rules-2026.1',
  source: 'BHUMISETU deterministic prototype rules',
  ruralMultiplier: 2,
  urbanMultiplier: 1,
  solatiumRate: 1,
  additionalAmountRate: 0.12,
});

const AREA_TO_HECTARES = Object.freeze({
  hectare: 1,
  hectares: 1,
  ha: 1,
  acre: 0.40468564224,
  acres: 0.40468564224,
  sqm: 0.0001,
  'sq m': 0.0001,
  'sq. m': 0.0001,
  'square metre': 0.0001,
  'square meter': 0.0001,
  'square metres': 0.0001,
  'square meters': 0.0001,
  'm²': 0.0001,
  sqft: 0.000009290304,
  'sq ft': 0.000009290304,
  'sq. ft': 0.000009290304,
  'square foot': 0.000009290304,
  'square feet': 0.000009290304,
  'ft²': 0.000009290304,
});

const RATE_UNIT_TO_HECTARE = Object.freeze({
  hectare: 1,
  hectares: 1,
  ha: 1,
  acre: 1 / 0.40468564224,
  acres: 1 / 0.40468564224,
  sqm: 1 / 0.0001,
  'sq m': 1 / 0.0001,
  'sq. m': 1 / 0.0001,
  'square metre': 1 / 0.0001,
  'square meter': 1 / 0.0001,
  'square metres': 1 / 0.0001,
  'square meters': 1 / 0.0001,
  'm²': 1 / 0.0001,
  sqft: 1 / 0.000009290304,
  'sq ft': 1 / 0.000009290304,
  'sq. ft': 1 / 0.000009290304,
  'square foot': 1 / 0.000009290304,
  'square feet': 1 / 0.000009290304,
  'ft²': 1 / 0.000009290304,
});

const roundCurrency = (value) => Math.round((Number(value) || 0) * 100) / 100;
const roundNumber = (value, digits = 6) => {
  const factor = 10 ** digits;
  return Math.round((Number(value) || 0) * factor) / factor;
};

function numeric(value, fallback = 0) {
  if (value === '' || value === null || value === undefined) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeUnit(value, fallback) {
  return String(value || fallback || '').trim().toLowerCase().replace(/₹|rs\.?|inr|per|\/|\s+/g, (match) => match.includes('/') ? '/' : ' ').trim();
}

function areaToHectares(value, unit = 'hectare') {
  const normalizedUnit = normalizeUnit(unit, 'hectare');
  const factor = AREA_TO_HECTARES[normalizedUnit];
  if (!factor) {
    const error = new Error(`Unsupported area unit: ${unit}`);
    error.code = 'INVALID_INPUT';
    throw error;
  }
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) {
    const error = new Error('Area must be a finite number greater than zero.');
    error.code = 'INVALID_INPUT';
    throw error;
  }
  return { value: amount, unit: normalizedUnit, hectares: roundNumber(amount * factor) };
}

function rateToPerHectare(value, unit = 'INR/hectare') {
  const rawUnit = normalizeUnit(unit, 'inr/hectare').replace(/^inr\s*/, '').trim();
  const normalizedUnit = rawUnit.replace(/^\/\s*/, '');
  const factor = RATE_UNIT_TO_HECTARE[normalizedUnit] || RATE_UNIT_TO_HECTARE[normalizedUnit.replace(/^square\s+/, '')];
  if (!factor) {
    const error = new Error(`Unsupported market rate unit: ${unit}`);
    error.code = 'INVALID_INPUT';
    throw error;
  }
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) {
    const error = new Error('Market rate must be a finite non-negative number.');
    error.code = 'INVALID_INPUT';
    throw error;
  }
  return {
    value: amount,
    unit: normalizedUnit,
    perHectare: roundCurrency(amount * factor),
  };
}

function dateYears(start, end) {
  if (!start || !end) return 0;
  const from = new Date(start);
  const to = new Date(end);
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || to <= from) return 0;
  return roundNumber((to.getTime() - from.getTime()) / (365.25 * 24 * 60 * 60 * 1000), 4);
}

function validateDates(input) {
  if (!input.notificationDate && !input.awardDate) return;
  const dates = [input.notificationDate, input.awardDate].filter(Boolean).map((value) => new Date(value));
  if (dates.some((date) => Number.isNaN(date.getTime()))) {
    const error = new Error('Notification and award dates must be valid dates.');
    error.code = 'INVALID_INPUT';
    throw error;
  }
  if (dates.length === 2 && dates[1] < dates[0]) {
    const error = new Error('Award date cannot be earlier than notification date.');
    error.code = 'INVALID_INPUT';
    throw error;
  }
}

function firstDefined(...values) {
  return values.find((value) => value !== undefined && value !== null && value !== '');
}

function getAreaInput(input) {
  if (input.area && typeof input.area === 'object') return input.area;
  if (input.landArea && typeof input.landArea === 'object') return input.landArea;
  if (input.area !== undefined) return { value: input.area, unit: input.areaUnit || 'hectare' };
  if (input.landArea !== undefined) return { value: input.landArea, unit: input.landAreaUnit || 'hectare' };
  if (input.landArea?.value !== undefined) return input.landArea;
  if (input.landAreaSqFt !== undefined) return { value: input.landAreaSqFt, unit: 'sq ft' };
  return null;
}

function getRateInput(input) {
  const value = firstDefined(input.marketRate, input.marketRatePerUnit, input.rate);
  if (value && typeof value === 'object') {
    return { value: value.value, unit: value.unit || input.marketRateUnit || input.rateUnit || 'INR/hectare' };
  }
  return { value, unit: input.marketRateUnit || input.rateUnit || 'INR/hectare' };
}

function getAssetLines(input) {
  const assets = Array.isArray(input.assets) ? input.assets : [];
  const lines = assets.map((asset, index) => ({
    label: String(asset.label || asset.type || `Asset ${index + 1}`),
    amount: roundCurrency(numeric(firstDefined(asset.amount, asset.value))),
    reason: asset.reason || 'Asset value supplied for authority review.',
  })).filter((asset) => asset.amount > 0);

  const scalarAssets = [
    ['Standing crops', input.cropValue ?? input.cropsValue],
    ['Structures', input.structureValue ?? input.structuresValue],
    ['Trees', input.treeValue ?? input.treesValue],
    ['Business assets', input.businessAssetValue],
  ];
  scalarAssets.forEach(([label, amount]) => {
    if (numeric(amount) > 0 && !lines.some((line) => line.label.toLowerCase() === label.toLowerCase())) {
      lines.push({ label, amount: roundCurrency(amount), reason: `${label} value supplied for authority review.` });
    }
  });
  return lines;
}

function validateInput(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    const error = new Error('A calculation object is required.');
    error.code = 'INVALID_INPUT';
    throw error;
  }
  const area = getAreaInput(input);
  if (!area) {
    const error = new Error('Area is required. Provide area, landArea, or landAreaSqFt.');
    error.code = 'INVALID_INPUT';
    throw error;
  }
  if (input.marketRate === undefined && input.marketRatePerUnit === undefined && input.rate === undefined) {
    const error = new Error('Market rate is required.');
    error.code = 'INVALID_INPUT';
    throw error;
  }
  const locality = String(firstDefined(input.locality, input.ruralUrban, input.areaType, 'rural')).toLowerCase();
  if (!['rural', 'urban'].includes(locality)) {
    const error = new Error('Locality must be rural or urban.');
    error.code = 'INVALID_INPUT';
    throw error;
  }
  validateDates(input);
}

function calculateCompensation(input, configuredRules = {}) {
  validateInput(input);
  const rules = { ...DEFAULT_RULES, ...(input.rules && typeof input.rules === 'object' ? input.rules : {}), ...configuredRules };
  const areaInput = getAreaInput(input);
  const area = areaToHectares(areaInput.value, areaInput.unit || 'hectare');
  const rateInput = getRateInput(input);
  const rate = rateToPerHectare(rateInput.value, rateInput.unit);
  const locality = String(firstDefined(input.locality, input.ruralUrban, input.areaType, 'rural')).toLowerCase();
  const multiplier = locality === 'rural' ? numeric(rules.ruralMultiplier) : numeric(rules.urbanMultiplier);
  const marketValue = roundCurrency(area.hectares * rate.perHectare);
  const multipliedMarketValue = roundCurrency(marketValue * multiplier);
  const solatium = roundCurrency(multipliedMarketValue * numeric(rules.solatiumRate));
  const years = dateYears(input.notificationDate, input.awardDate);
  const additionalAmount = roundCurrency(multipliedMarketValue * numeric(rules.additionalAmountRate) * years);
  const assetLines = getAssetLines(input);
  const assetValue = roundCurrency(assetLines.reduce((sum, asset) => sum + asset.amount, 0));
  const livelihoodAmount = roundCurrency(numeric(firstDefined(input.livelihoodAmount, input.livelihoodSupportAmount)));
  const displacementAmount = roundCurrency(numeric(firstDefined(input.displacementAmount, input.resettlementAmount)));
  const total = roundCurrency(multipliedMarketValue + solatium + additionalAmount + assetValue + livelihoodAmount + displacementAmount);
  const displacement = Boolean(input.displacement || input.displaced || input.partialDisplacement || input.displacementStatus === 'displaced');
  const livelihoodImpact = Boolean(input.livelihoodImpact || input.livelihoodImpacted || input.livelihoodStatus === 'impacted');

  const entitlements = [
    { key: 'land', label: 'Land value', amount: multipliedMarketValue, reason: `${locality === 'rural' ? 'Rural' : 'Urban'} multiplier applied to the normalized market value.` },
    { key: 'solatium', label: 'Solatium', amount: solatium, reason: `${numeric(rules.solatiumRate) * 100}% solatium rate applied to multiplied land value.` },
    { key: 'additionalAmount', label: 'Additional amount', amount: additionalAmount, reason: `${numeric(rules.additionalAmountRate) * 100}% per annum for ${years} year(s) between notification and award.` },
    { key: 'assets', label: 'Assets and improvements', amount: assetValue, reason: assetValue ? 'Itemised asset values supplied for verification.' : 'No asset values supplied.' },
    { key: 'livelihood', label: 'Livelihood support', amount: livelihoodAmount, reason: livelihoodImpact ? 'Livelihood impact is marked for authority assessment.' : 'No livelihood impact marked.' },
    { key: 'resettlement', label: 'Displacement / resettlement', amount: displacementAmount, reason: displacement ? 'Displacement is marked for resettlement review.' : 'No displacement marked.' },
  ];

  return {
    assessmentType: 'preliminary-compensation',
    status: 'PRELIMINARY_RULE_BASED',
    disclaimer: 'Preliminary rule-based estimate for authority review; not a final legal award or tax advice.',
    inputs: {
      ...input,
      area: { ...area, display: `${area.value} ${area.unit}` },
      marketRate: { ...rate, display: `INR ${rate.value} / ${rate.unit}` },
      locality,
      displacement,
      livelihoodImpact,
    },
    normalized: {
      areaHectares: area.hectares,
      marketRatePerHectare: rate.perHectare,
      marketValue,
      multiplier,
      multipliedMarketValue,
      yearsBetweenNotificationAndAward: years,
    },
    rules: {
      version: rules.version,
      source: rules.source,
      ruralMultiplier: numeric(rules.ruralMultiplier),
      urbanMultiplier: numeric(rules.urbanMultiplier),
      solatiumRate: numeric(rules.solatiumRate),
      additionalAmountRate: numeric(rules.additionalAmountRate),
      reason: 'Configured prototype rules are applied deterministically to the supplied structured inputs.',
    },
    breakdown: {
      marketValue,
      multipliedMarketValue,
      solatium,
      additionalAmount,
      assets: assetValue,
      livelihoodSupport: livelihoodAmount,
      displacementSupport: displacementAmount,
      total,
    },
    assetLines,
    entitlements,
    appliedRules: [
      { key: 'multiplier', label: `${locality === 'rural' ? 'Rural' : 'Urban'} multiplier`, value: multiplier, source: rules.source, version: rules.version, reason: `${locality === 'rural' ? 'Rural' : 'Urban'} locality selected.` },
      { key: 'solatium', label: 'Solatium', value: numeric(rules.solatiumRate), source: rules.source, version: rules.version, reason: 'Applied to multiplied land value.' },
      { key: 'additionalAmount', label: 'Additional amount rate', value: numeric(rules.additionalAmountRate), source: rules.source, version: rules.version, reason: 'Applied annually to the period between notification and award.' },
    ],
    auditNotes: [
      'All monetary inputs are deterministic values supplied by the user or synthetic parcel record.',
      'Area and market rate were normalized to hectares and INR per hectare internally.',
      'Authority must verify title, valuation evidence, dates, assets and applicable statutory notifications.',
    ],
    flags: [
      { key: 'preliminary', severity: 'info', label: 'Preliminary estimate', message: 'This output is rule-based decision support and requires authority review.' },
      { key: 'statutory', severity: 'info', label: 'Statutory review', message: 'Applicable law, notifications and competent-authority directions may change the award.' },
      { key: 'tax', severity: 'info', label: 'Informational only', message: 'Tax treatment is outside this tool and this output is not tax advice.' },
      ...(displacement ? [{ key: 'resettlement', severity: 'attention', label: 'Resettlement review', message: 'Confirm housing, site services and infrastructure capacity before possession.' }] : []),
      ...(livelihoodImpact ? [{ key: 'livelihood', severity: 'attention', label: 'Livelihood review', message: 'Validate livelihood restoration measures and supporting evidence.' }] : []),
    ],
    resettlementConsiderations: displacement
      ? ['Confirm alternate housing or site allocation.', 'Check access to roads, water, sanitation, electricity and community services.', 'Sequence possession only after the approved resettlement plan is ready.']
      : ['No displacement is marked; screen for partial impacts and access disruption before closure.'],
  };
}

module.exports = {
  DEFAULT_RULES,
  areaToHectares,
  rateToPerHectare,
  calculateCompensation,
};
