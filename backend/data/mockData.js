/*
 * Public project metadata is limited to identity, location, scope and agency
 * facts from the linked sources. Parcel ownership and operational figures are
 * synthetic demonstration records and are deliberately kept in this mock
 * adapter until a production records store is connected.
 */

const source = (title, url, note) => ({ title, url, note });

const projects = [
  {
    id: 'NHSRCL-MAHSR',
    projectId: 'NHSRCL-MAHSR',
    name: 'Mumbai–Ahmedabad High Speed Rail',
    projectName: 'Mumbai–Ahmedabad High Speed Rail',
    infrastructureCategory: 'Transport',
    projectType: 'High-speed rail corridor',
    state: 'Maharashtra / Gujarat',
    districts: ['Palghar', 'Thane', 'Vapi', 'Surat', 'Vadodara', 'Ahmedabad'],
    district: 'Palghar',
    region: 'Western India',
    implementingAgency: 'National High Speed Rail Corporation Limited (NHSRCL)',
    status: 'In Progress',
    currentStatus: 'In Progress',
    projectDescription: 'India’s first high-speed rail corridor connecting Mumbai and Ahmedabad.',
    estimatedTimeline: '2017–2028 (public programme timeline; subject to package schedules)',
    progress: 74,
    projectProgressPercentage: 74,
    landAcquisitionStatus: 'Advanced acquisition and possession',
    totalLandRequired: 1_398,
    totalLandArea: 1_398,
    proposedArea: 1_398,
    landAcquired: 1_284,
    acquiredLandArea: 1_284,
    acquiredArea: 1_284,
    landPending: 114,
    affectedVillages: 298,
    affectedFamilies: 3_420,
    families: 3_420,
    compensationProgress: 92,
    compensation: 2_180,
    compensationAssessed: 2_180,
    compensationDisbursed: 2_006,
    rrProgress: 88,
    rr: 88,
    possession: 81,
    riskScore: 62,
    risk: 'Elevated',
    alerts: 2,
    coordinates: [19.85, 73.35],
    projectBoundary: { type: 'Polygon', coordinates: [[[72.82, 19.05], [73.98, 19.05], [73.98, 23.03], [72.82, 23.03], [72.82, 19.05]]] },
    sourceMetadata: {
      sources: [source('NHSRCL project overview', 'https://nhsrcl.in/', 'Public project identity, corridor and implementing agency.')],
      dataNote: 'Operational land, progress and risk figures are synthetic demonstration metrics.'
    },
    dataClassification: 'Public project metadata + synthetic operational metrics',
    milestones: [
      { name: 'Survey', status: 'Completed' },
      { name: 'Notification', status: 'Completed' },
      { name: 'Award', status: 'In Progress' },
      { name: 'Compensation', status: 'In Progress' },
      { name: 'Possession', status: 'In Progress' }
    ]
  },
  {
    id: 'NHAI-DME',
    projectId: 'NHAI-DME',
    name: 'Delhi–Mumbai Expressway',
    projectName: 'Delhi–Mumbai Expressway',
    infrastructureCategory: 'Transport',
    projectType: 'Access-controlled greenfield expressway',
    state: 'Delhi / Haryana / Rajasthan / Madhya Pradesh / Gujarat / Maharashtra',
    districts: ['Gurugram', 'Dausa', 'Ratlam', 'Vadodara', 'Surat', 'Nashik'],
    district: 'Dausa',
    region: 'North-West and Central India',
    implementingAgency: 'National Highways Authority of India (NHAI)',
    status: 'In Progress',
    currentStatus: 'In Progress',
    projectDescription: 'A 1,386 km access-controlled expressway linking the National Capital Region with Mumbai.',
    estimatedTimeline: '2018–2026 (package-wise completion)',
    progress: 86,
    projectProgressPercentage: 86,
    landAcquisitionStatus: 'Package-wise acquisition and handover',
    totalLandRequired: 9_600,
    totalLandArea: 9_600,
    proposedArea: 9_600,
    landAcquired: 9_020,
    acquiredLandArea: 9_020,
    acquiredArea: 9_020,
    landPending: 580,
    affectedVillages: 420,
    affectedFamilies: 7_850,
    families: 7_850,
    compensationProgress: 90,
    compensation: 4_760,
    compensationAssessed: 4_760,
    compensationDisbursed: 4_280,
    rrProgress: 84,
    rr: 84,
    possession: 79,
    riskScore: 55,
    risk: 'Medium',
    alerts: 1,
    coordinates: [24.35, 75.75],
    projectBoundary: { type: 'Polygon', coordinates: [[[72.65, 19.0], [77.25, 19.0], [77.25, 28.7], [72.65, 28.7], [72.65, 19.0]]] },
    sourceMetadata: {
      sources: [source('NHAI official portal', 'https://nhai.gov.in/', 'Public project and highway authority source.')],
      dataNote: 'Operational land, progress and risk figures are synthetic demonstration metrics.'
    },
    dataClassification: 'Public project metadata + synthetic operational metrics',
    milestones: [
      { name: 'Survey', status: 'Completed' },
      { name: 'Notification', status: 'Completed' },
      { name: 'Award', status: 'Completed' },
      { name: 'Compensation', status: 'In Progress' },
      { name: 'Possession', status: 'In Progress' }
    ]
  },
  {
    id: 'NPCIL-KKNPP-34',
    projectId: 'NPCIL-KKNPP-34',
    name: 'Kudankulam Nuclear Power Project Units 3 & 4',
    projectName: 'Kudankulam Nuclear Power Project Units 3 & 4',
    infrastructureCategory: 'Nuclear',
    projectType: 'Nuclear power generation',
    state: 'Tamil Nadu',
    districts: ['Tirunelveli'],
    district: 'Tirunelveli',
    region: 'Southern India',
    implementingAgency: 'Nuclear Power Corporation of India Limited (NPCIL)',
    status: 'Under Construction',
    currentStatus: 'Under Construction',
    projectDescription: 'Two 1,000 MW pressurised water reactor units being added at the Kudankulam site.',
    estimatedTimeline: '2017–2027 (unit-wise commissioning programme)',
    progress: 58,
    projectProgressPercentage: 58,
    landAcquisitionStatus: 'Site and allied infrastructure acquisition substantially complete',
    totalLandRequired: 312,
    totalLandArea: 312,
    proposedArea: 312,
    landAcquired: 289,
    acquiredLandArea: 289,
    acquiredArea: 289,
    landPending: 23,
    affectedVillages: 6,
    affectedFamilies: 410,
    families: 410,
    compensationProgress: 93,
    compensation: 210,
    compensationAssessed: 210,
    compensationDisbursed: 195,
    rrProgress: 91,
    rr: 91,
    possession: 87,
    riskScore: 48,
    risk: 'Medium',
    alerts: 1,
    coordinates: [8.17, 77.71],
    projectBoundary: { type: 'Polygon', coordinates: [[[77.66, 8.12], [77.77, 8.12], [77.77, 8.23], [77.66, 8.23], [77.66, 8.12]]] },
    sourceMetadata: {
      sources: [source('NPCIL project information', 'https://www.npcil.nic.in/', 'Public project identity and nuclear operator source.')],
      dataNote: 'Operational land, progress and risk figures are synthetic demonstration metrics.'
    },
    dataClassification: 'Public project metadata + synthetic operational metrics',
    milestones: [
      { name: 'Site survey', status: 'Completed' },
      { name: 'Notification', status: 'Completed' },
      { name: 'Award', status: 'Completed' },
      { name: 'Compensation', status: 'Completed' },
      { name: 'Possession', status: 'In Progress' }
    ]
  },
  {
    id: 'POWERGRID-GEC2',
    projectId: 'POWERGRID-GEC2',
    name: 'Green Energy Corridor Phase-II',
    projectName: 'Green Energy Corridor Phase-II',
    infrastructureCategory: 'Energy',
    projectType: 'Inter-state transmission network',
    state: 'Gujarat / Rajasthan / Karnataka / Tamil Nadu',
    districts: ['Kutch', 'Jaisalmer', 'Tumakuru', 'Tirunelveli'],
    district: 'Kutch',
    region: 'Multi-state',
    implementingAgency: 'Power Grid Corporation of India Limited (POWERGRID) and state transmission utilities',
    status: 'In Progress',
    currentStatus: 'In Progress',
    projectDescription: 'Transmission infrastructure supporting integration of renewable generation into the national grid.',
    estimatedTimeline: '2022–2026 (package-wise implementation)',
    progress: 67,
    projectProgressPercentage: 67,
    landAcquisitionStatus: 'Tower sites and substation parcels in acquisition',
    totalLandRequired: 2_740,
    totalLandArea: 2_740,
    proposedArea: 2_740,
    landAcquired: 1_890,
    acquiredLandArea: 1_890,
    acquiredArea: 1_890,
    landPending: 850,
    affectedVillages: 185,
    affectedFamilies: 2_160,
    families: 2_160,
    compensationProgress: 76,
    compensation: 1_040,
    compensationAssessed: 1_040,
    compensationDisbursed: 790,
    rrProgress: 69,
    rr: 69,
    possession: 61,
    riskScore: 71,
    risk: 'Elevated',
    alerts: 3,
    coordinates: [23.4, 70.1],
    projectBoundary: { type: 'Polygon', coordinates: [[[68.1, 8.0], [80.4, 8.0], [80.4, 28.3], [68.1, 28.3], [68.1, 8.0]]] },
    sourceMetadata: {
      sources: [source('POWERGRID official website', 'https://www.powergrid.in/', 'Public transmission utility and programme source.')],
      dataNote: 'Operational land, progress and risk figures are synthetic demonstration metrics.'
    },
    dataClassification: 'Public project metadata + synthetic operational metrics',
    milestones: [
      { name: 'Route survey', status: 'Completed' },
      { name: 'Notification', status: 'In Progress' },
      { name: 'Award', status: 'In Progress' },
      { name: 'Compensation', status: 'In Progress' },
      { name: 'Possession', status: 'Pending' }
    ]
  },
  {
    id: 'NICDC-CBIC',
    projectId: 'NICDC-CBIC',
    name: 'Chennai–Bengaluru Industrial Corridor',
    projectName: 'Chennai–Bengaluru Industrial Corridor',
    infrastructureCategory: 'Industrial',
    projectType: 'Industrial corridor and manufacturing nodes',
    state: 'Tamil Nadu / Karnataka / Andhra Pradesh',
    districts: ['Chittoor', 'Krishnagiri', 'Bengaluru Rural', 'Tiruvallur'],
    district: 'Krishnagiri',
    region: 'Southern India',
    implementingAgency: 'National Industrial Corridor Development Corporation (NICDC)',
    status: 'In Progress',
    currentStatus: 'In Progress',
    projectDescription: 'Industrial corridor development connecting manufacturing and logistics nodes between Chennai and Bengaluru.',
    estimatedTimeline: '2011–2027 (node-wise development)',
    progress: 52,
    projectProgressPercentage: 52,
    landAcquisitionStatus: 'Node-wise acquisition and trunk infrastructure',
    totalLandRequired: 4_180,
    totalLandArea: 4_180,
    proposedArea: 4_180,
    landAcquired: 2_460,
    acquiredLandArea: 2_460,
    acquiredArea: 2_460,
    landPending: 1_720,
    affectedVillages: 96,
    affectedFamilies: 2_880,
    families: 2_880,
    compensationProgress: 68,
    compensation: 1_880,
    compensationAssessed: 1_880,
    compensationDisbursed: 1_210,
    rrProgress: 62,
    rr: 62,
    possession: 54,
    riskScore: 77,
    risk: 'High',
    alerts: 4,
    coordinates: [13.25, 78.1],
    projectBoundary: { type: 'Polygon', coordinates: [[[77.3, 12.4], [80.5, 12.4], [80.5, 14.4], [77.3, 14.4], [77.3, 12.4]]] },
    sourceMetadata: {
      sources: [source('NICDC official website', 'https://www.nicdc.in/', 'Public corridor, node and implementing corporation source.')],
      dataNote: 'Operational land, progress and risk figures are synthetic demonstration metrics.'
    },
    dataClassification: 'Public project metadata + synthetic operational metrics',
    milestones: [
      { name: 'Node survey', status: 'Completed' },
      { name: 'Notification', status: 'In Progress' },
      { name: 'Award', status: 'In Progress' },
      { name: 'Compensation', status: 'Pending' },
      { name: 'Possession', status: 'Pending' }
    ]
  },
  {
    id: 'MEITY-DFAB',
    projectId: 'MEITY-DFAB',
    name: 'Tata Electronics Semiconductor Fab, Dholera',
    projectName: 'Tata Electronics Semiconductor Fab, Dholera',
    infrastructureCategory: 'Creative / Industrial',
    projectType: 'Semiconductor manufacturing facility',
    state: 'Gujarat',
    districts: ['Ahmedabad'],
    district: 'Ahmedabad',
    region: 'Western India',
    implementingAgency: 'Tata Electronics Private Limited with Government of India semiconductor programme support',
    status: 'Under Construction',
    currentStatus: 'Under Construction',
    projectDescription: 'A semiconductor fabrication facility approved for the Dholera Special Investment Region.',
    estimatedTimeline: '2024–2026 (publicly announced construction programme)',
    progress: 41,
    projectProgressPercentage: 41,
    landAcquisitionStatus: 'Industrial estate parcels assembled; utility corridors progressing',
    totalLandRequired: 500,
    totalLandArea: 500,
    proposedArea: 500,
    landAcquired: 468,
    acquiredLandArea: 468,
    acquiredArea: 468,
    landPending: 32,
    affectedVillages: 11,
    affectedFamilies: 760,
    families: 760,
    compensationProgress: 86,
    compensation: 620,
    compensationAssessed: 620,
    compensationDisbursed: 542,
    rrProgress: 80,
    rr: 80,
    possession: 72,
    riskScore: 58,
    risk: 'Medium',
    alerts: 2,
    coordinates: [22.18, 72.02],
    projectBoundary: { type: 'Polygon', coordinates: [[[71.94, 22.12], [72.12, 22.12], [72.12, 22.25], [71.94, 22.25], [71.94, 22.12]]] },
    sourceMetadata: {
      sources: [source('Ministry of Electronics and Information Technology', 'https://www.meity.gov.in/', 'Public approval and semiconductor programme source.')],
      dataNote: 'Operational land, progress and risk figures are synthetic demonstration metrics.'
    },
    dataClassification: 'Public project metadata + synthetic operational metrics',
    milestones: [
      { name: 'Industrial estate survey', status: 'Completed' },
      { name: 'Notification', status: 'Completed' },
      { name: 'Award', status: 'Completed' },
      { name: 'Compensation', status: 'In Progress' },
      { name: 'Possession', status: 'In Progress' }
    ]
  },
  {
    id: 'KBLP-MP-UP',
    projectId: 'KBLP-MP-UP',
    name: 'Ken–Betwa River Linking Project',
    projectName: 'Ken–Betwa River Linking Project',
    infrastructureCategory: 'Water',
    projectType: 'Inter-basin water transfer and irrigation',
    state: 'Madhya Pradesh / Uttar Pradesh',
    districts: ['Chhatarpur', 'Panna', 'Tikamgarh', 'Mahoba', 'Jhansi'],
    district: 'Chhatarpur',
    region: 'Central India',
    implementingAgency: 'National Water Development Agency (NWDA), Ministry of Jal Shakti',
    status: 'Under Construction',
    currentStatus: 'Under Construction',
    projectDescription: 'An inter-basin water transfer project intended to provide irrigation and drinking-water benefits in Bundelkhand.',
    estimatedTimeline: '2021–2030 (public implementation horizon)',
    progress: 29,
    projectProgressPercentage: 29,
    landAcquisitionStatus: 'Reservoir and canal package acquisition underway',
    totalLandRequired: 5_420,
    totalLandArea: 5_420,
    proposedArea: 5_420,
    landAcquired: 1_860,
    acquiredLandArea: 1_860,
    acquiredArea: 1_860,
    landPending: 3_560,
    affectedVillages: 98,
    affectedFamilies: 6_420,
    families: 6_420,
    compensationProgress: 43,
    compensation: 2_240,
    compensationAssessed: 2_240,
    compensationDisbursed: 970,
    rrProgress: 36,
    rr: 36,
    possession: 31,
    riskScore: 84,
    risk: 'Critical',
    alerts: 5,
    coordinates: [24.72, 79.45],
    projectBoundary: { type: 'Polygon', coordinates: [[[78.7, 24.1], [80.3, 24.1], [80.3, 25.6], [78.7, 25.6], [78.7, 24.1]]] },
    sourceMetadata: {
      sources: [source('Ministry of Jal Shakti – Department of Water Resources', 'https://jalshakti-dowr.gov.in/', 'Public river-linking programme source.')],
      dataNote: 'Operational land, progress and risk figures are synthetic demonstration metrics.'
    },
    dataClassification: 'Public project metadata + synthetic operational metrics',
    milestones: [
      { name: 'Baseline survey', status: 'Completed' },
      { name: 'Notification', status: 'In Progress' },
      { name: 'Award', status: 'Pending' },
      { name: 'Compensation', status: 'Pending' },
      { name: 'Possession', status: 'Pending' }
    ]
  }
];

const projectById = new Map(projects.map((project) => [project.id, project]));

const parcelTemplates = [
  ['NHSRCL-MAHSR', 'Palghar', 'Kelve', 19.72, 72.80],
  ['NHSRCL-MAHSR', 'Palghar', 'Saphale', 19.78, 72.95],
  ['NHAI-DME', 'Dausa', 'Bhandarej', 26.88, 76.34],
  ['NHAI-DME', 'Ratlam', 'Jaora', 23.63, 75.13],
  ['NPCIL-KKNPP-34', 'Tirunelveli', 'Kudankulam', 8.17, 77.71],
  ['NPCIL-KKNPP-34', 'Tirunelveli', 'Chettikulam', 8.20, 77.66],
  ['POWERGRID-GEC2', 'Kutch', 'Naliya', 23.95, 68.83],
  ['POWERGRID-GEC2', 'Kutch', 'Bhuj', 23.25, 69.67],
  ['NICDC-CBIC', 'Krishnagiri', 'Shoolagiri', 12.66, 78.02],
  ['NICDC-CBIC', 'Chittoor', 'Sri City', 13.57, 79.62],
  ['MEITY-DFAB', 'Ahmedabad', 'Dholera', 22.18, 72.02],
  ['MEITY-DFAB', 'Ahmedabad', 'Bavaliyari', 22.12, 72.08],
  ['KBLP-MP-UP', 'Chhatarpur', 'Daudhan', 24.69, 79.48],
  ['KBLP-MP-UP', 'Panna', 'Ajaigarh', 24.90, 80.26]
];

const compensationScenarios = {
  '0-0': {
    scenario: 'rural-agricultural',
    locality: 'rural',
    landType: 'Private Agricultural',
    cropsValue: 220000,
    displacement: true,
    livelihoodImpacted: true,
    livelihoodAmount: 180000,
    resettlementInfrastructure: ['Irrigation access', 'Village road connectivity', 'Livelihood restoration desk']
  },
  '0-1': {
    scenario: 'urban-residential',
    locality: 'urban',
    landType: 'Private Residential',
    structureValue: 1450000,
    displacement: true,
    partialDisplacement: true,
    resettlementInfrastructure: ['Temporary accommodation', 'Water and sanitation connection', 'Access to public transport']
  },
  '1-0': {
    scenario: 'commercial-livelihood',
    locality: 'urban',
    landType: 'Private Commercial',
    structureValue: 900000,
    businessAssetValue: 650000,
    livelihoodImpacted: true,
    livelihoodAmount: 300000,
    resettlementInfrastructure: ['Business relocation site', 'Customer access and loading space', 'Livelihood restoration support']
  }
};

function polygonFor(lat, lng, size = 0.018) {
  const ring = [
    [lat - size, lng - size],
    [lat - size * 0.72, lng + size],
    [lat + size, lng + size * 0.84],
    [lat + size * 0.82, lng - size],
    [lat - size, lng - size]
  ];
  return {
    geoJson: { type: 'Polygon', coordinates: [ring.map(([pointLat, pointLng]) => [pointLng, pointLat])] },
    leaflet: ring
  };
}

const parcels = parcelTemplates.flatMap(([projectId, district, village, lat, lng], projectIndex) =>
  [0, 1].map((parcelIndex) => {
    const offset = (projectIndex + parcelIndex) * 0.012;
    const center = [lat + offset * 0.12, lng + offset * 0.08];
    const shape = polygonFor(center[0], center[1], 0.012 + parcelIndex * 0.003);
    const number = 1000 + projectIndex * 20 + parcelIndex;
    const area = Number((2.6 + ((projectIndex * 3 + parcelIndex) % 7) * 0.7).toFixed(1));
    const acquisitionStatus = ['Awarded', 'Notified', 'Compensation Stage', 'Possession In Progress'][projectIndex % 4];
    const paymentStatus = ['Paid', 'Partially Paid', 'Awaiting Approval', 'In Process'][parcelIndex + projectIndex % 3 > 2 ? 0 : parcelIndex + projectIndex % 3];
    const possession = projectIndex % 3 === 0 ? 'In Progress' : 'Pending';
    const validation = projectIndex % 5 === 0 && parcelIndex === 0 ? 'Mismatch Detected' : projectIndex % 4 === 1 ? 'Anomaly' : 'Verified';
    const compensation = Number((area * (3.4 + projectIndex * 0.35)).toFixed(1));
    const project = projectById.get(projectId);
    const id = `PAR-${number}`;
    const scenario = compensationScenarios[`${projectIndex}-${parcelIndex}`] || {
      scenario: parcelIndex ? 'rural-agricultural' : 'urban-residential',
      locality: parcelIndex ? 'rural' : 'urban',
      landType: parcelIndex ? 'Private Agricultural' : 'Private Residential',
      displacement: false,
      livelihoodImpacted: false,
      resettlementInfrastructure: []
    };
    const marketRatePerHectare = scenario.locality === 'rural' ? 1800000 : scenario.scenario === 'commercial-livelihood' ? 32000000 : 26000000;
    return {
      id,
      parcelId: id,
      projectId,
      surveyNumber: `${40 + projectIndex}/${parcelIndex + 2}${parcelIndex ? 'B' : 'A'}`,
      village,
      district,
      area,
      landArea: { value: area, unit: 'hectare', squareFeet: Math.round(area * 107639) },
      landAreaSqFt: Math.round(area * 107639),
      landType: scenario.landType,
      compensationScenario: scenario.scenario,
      locality: scenario.locality,
      ruralUrban: scenario.locality,
      marketRate: marketRatePerHectare,
      marketRateUnit: 'INR/hectare',
      cropsValue: scenario.cropsValue || 0,
      structureValue: scenario.structureValue || 0,
      businessAssetValue: scenario.businessAssetValue || 0,
      livelihoodAmount: scenario.livelihoodAmount || 0,
      displacement: Boolean(scenario.displacement),
      partialDisplacement: Boolean(scenario.partialDisplacement),
      livelihoodImpacted: Boolean(scenario.livelihoodImpacted),
      notificationDate: '2025-01-15',
      awardDate: '2026-08-14',
      resettlementInfrastructure: scenario.resettlementInfrastructure,
      status: acquisitionStatus,
      acquisitionStatus,
      compensation,
      compensationStatus: paymentStatus,
      paymentStatus,
      possessionStatus: possession,
      possession,
      owner: { name: `Synthetic Owner ${projectIndex + 1}${parcelIndex + 1}`, type: 'Synthetic individual record' },
      coordinates: { latitude: center[0], longitude: center[1] },
      geometry: shape.geoJson,
      parcelShape: shape.geoJson,
      leafletCoordinates: shape.leaflet,
      rrRequired: projectIndex % 2 === 0,
      validation,
      acquisitionNotes: 'Synthetic parcel record for interface and workflow demonstration; not a legal title record.',
      sourceContext: {
        projectSource: project.sourceMetadata.sources[0].url,
        parcelData: 'Synthetic demonstration data'
      },
      isSynthetic: true,
      titleRecords: [
        { type: 'Record of Rights', reference: `SYN-ROR-${number}`, status: 'Synthetic / unverified' },
        { type: 'Mutation register', reference: `SYN-MUT-${number}`, status: 'Synthetic / unverified' }
      ],
      timeline: [
        { label: 'Survey completed', date: '2024-02-14', status: 'complete' },
        { label: 'Notice issued', date: '2024-08-22', status: 'complete' },
        { label: 'Award review', date: '2025-06-18', status: acquisitionStatus === 'Notified' ? 'current' : 'complete' },
        { label: 'Compensation / possession', date: '2026-03-31', status: paymentStatus === 'Paid' ? 'complete' : 'current' }
      ],
      impact: {
        projectName: project.name,
        landUseImpact: parcelIndex ? 'Agricultural use conversion' : 'Residential relocation review',
        affectedFamilyCount: 1 + parcelIndex,
        acquisitionStage: acquisitionStatus
      },
      operationalDependency: projectIndex % 2 === 0
        ? 'Compensation approval is required before possession handover.'
        : 'Title validation and mutation entry are required before award closure.',
      aiInsight: {
        label: 'Structured AI insight (demo)',
        text: validation === 'Verified'
          ? 'No synthetic record exception detected. Confirm against the authorised land register before action.'
          : 'Review the synthetic validation exception and reconcile award, title and payment records before possession.'
      }
    };
  })
);

const total = (field) => projects.reduce((sum, project) => sum + Number(project[field] || 0), 0);
const stateBreakdown = [...new Set(projects.flatMap((project) => project.state.split(' / ')))].map((name) => {
  const inState = projects.filter((project) => project.state.includes(name));
  return { name, value: Math.round(inState.reduce((sum, project) => sum + project.progress, 0) / inState.length), projects: inState.length };
});

const dashboardSummary = {
  totalProjects: projects.length,
  landProposed: total('totalLandArea'),
  landNotified: Math.round(total('totalLandArea') * 0.82),
  landAcquired: total('acquiredLandArea'),
  compensationAssessed: total('compensationAssessed'),
  compensationDisbursed: total('compensationDisbursed'),
  affectedFamilies: total('families'),
  displacedFamilies: Math.round(total('families') * 0.22),
  rrProgress: Math.round(total('rr') / projects.length),
  possessionProgress: Math.round(total('possession') / projects.length),
  delayedProjects: projects.filter((project) => project.riskScore >= 75).length,
  highRiskProjects: projects.filter((project) => project.riskScore >= 70).length,
  stateBreakdown
};

const alerts = [
  { id: 1, projectId: 'KBLP-MP-UP', title: 'R&R dependency', message: 'Synthetic relocation records remain pending for reservoir-affected families.', severity: 'High' },
  { id: 2, projectId: 'NICDC-CBIC', title: 'Award backlog', message: 'Node-wise title verification is required before compensation release.', severity: 'High' },
  { id: 3, projectId: 'POWERGRID-GEC2', title: 'Wayleave coordination', message: 'Transmission corridor parcels require cross-agency possession scheduling.', severity: 'Medium' },
  { id: 4, projectId: 'NHSRCL-MAHSR', title: 'Payment reconciliation', message: 'Two synthetic parcel records are awaiting award-to-ledger reconciliation.', severity: 'Medium' }
];

const documents = [
  { id: 'DOC-1801', name: 'Award Notice - Synthetic parcel PAR-1000', projectId: 'NHSRCL-MAHSR', status: 'Validated', extractedFields: 14 },
  { id: 'DOC-1809', name: 'Compensation Ledger - Dholera demo', projectId: 'MEITY-DFAB', status: 'Needs Review', extractedFields: 9 },
  { id: 'DOC-1982', name: 'R&R Family Checklist - Ken–Betwa demo', projectId: 'KBLP-MP-UP', status: 'Flagged', extractedFields: 18 }
];

const riskInsights = {
  overallRisk: 'High',
  score: Math.round(projects.reduce((sum, project) => sum + project.riskScore, 0) / projects.length),
  factors: ['Compensation backlog and payment exceptions', 'Title and award reconciliation across synthetic parcel records', 'Pending R&R documentation for affected families', 'Package-wise possession dependencies'],
  actions: ['Verify parcel-level data against authorised registers', 'Prioritise payment reconciliation for delayed families', 'Escalate R&R documentation review before possession handover']
};

module.exports = { dashboardSummary, projects, parcels, alerts, documents, riskInsights };
