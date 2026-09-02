const dashboardSummary = {
  totalProjects: 18,
  landProposed: 8240,
  landNotified: 5985,
  landAcquired: 4112,
  compensationAssessed: 2840,
  compensationDisbursed: 1934,
  affectedFamilies: 12640,
  displacedFamilies: 3150,
  rrProgress: 71,
  possessionProgress: 68,
  delayedProjects: 4,
  highRiskProjects: 3,
  stateBreakdown: [
    { name: 'Maharashtra', value: 46, projects: 8 },
    { name: 'Madhya Pradesh', value: 27, projects: 4 },
    { name: 'Rajasthan', value: 18, projects: 3 },
    { name: 'Uttar Pradesh', value: 9, projects: 3 }
  ]
};

const projects = [
  {
    id: 'MAH-201',
    name: 'Nagpur Ring Road Expansion',
    state: 'Maharashtra',
    district: 'Nagpur',
    region: 'Maharashtra',
    totalLandArea: 482,
    acquiredLandArea: 334,
    compensationDisbursed: 146,
    riskScore: 58,
    status: 'In Progress',
    risk: 'High',
    progress: 68,
    alerts: 3,
    proposedArea: 482,
    notifiedArea: 436,
    acquiredArea: 334,
    compensation: 146,
    families: 1260,
    rr: 72,
    possession: 61,
    milestones: [
      { name: 'Survey', status: 'Completed' },
      { name: 'Notification', status: 'Completed' },
      { name: 'Award', status: 'In Progress' },
      { name: 'Compensation', status: 'Pending' },
      { name: 'Possession', status: 'Pending' }
    ]
  },
  {
    id: 'MAH-208',
    name: 'Aurangabad Industrial Corridor',
    state: 'Maharashtra',
    district: 'Aurangabad',
    region: 'Maharashtra',
    totalLandArea: 630,
    acquiredLandArea: 278,
    compensationDisbursed: 112,
    riskScore: 52,
    status: 'Delayed',
    risk: 'Critical',
    progress: 44,
    alerts: 5,
    proposedArea: 630,
    notifiedArea: 520,
    acquiredArea: 278,
    compensation: 112,
    families: 1820,
    rr: 58,
    possession: 42,
    milestones: [
      { name: 'Survey', status: 'Completed' },
      { name: 'Notification', status: 'Completed' },
      { name: 'Award', status: 'In Progress' },
      { name: 'Compensation', status: 'Delayed' },
      { name: 'Possession', status: 'Pending' }
    ]
  },
  {
    id: 'MP-115',
    name: 'Bhopal Metro Phase 2',
    state: 'Madhya Pradesh',
    district: 'Bhopal',
    region: 'Madhya Pradesh',
    totalLandArea: 510,
    acquiredLandArea: 382,
    compensationDisbursed: 134,
    riskScore: 82,
    status: 'Monitoring',
    risk: 'Medium',
    progress: 74,
    alerts: 1,
    proposedArea: 510,
    notifiedArea: 470,
    acquiredArea: 382,
    compensation: 134,
    families: 980,
    rr: 80,
    possession: 74,
    milestones: [
      { name: 'Survey', status: 'Completed' },
      { name: 'Notification', status: 'Completed' },
      { name: 'Award', status: 'Completed' },
      { name: 'Compensation', status: 'In Progress' },
      { name: 'Possession', status: 'Monitoring' }
    ]
  },
  {
    id: 'MAH-220',
    name: 'Eastern Pune Ring Road & Industrial Logistics Hub',
    state: 'Maharashtra',
    region: 'Pune Region',
    district: 'Pune',
    status: 'In Progress',
    risk: 'Elevated',
    riskScore: 66,
    progress: 57,
    totalLandArea: 720,
    acquiredLandArea: 414,
    proposedArea: 720,
    notifiedArea: 612,
    acquiredArea: 414,
    compensation: 198,
    compensationDisbursed: 121,
    families: 1540,
    rr: 64,
    possession: 49,
    alerts: 2,
    milestones: [
      { name: 'Survey', status: 'Completed' },
      { name: 'Notification', status: 'Completed' },
      { name: 'Award', status: 'In Progress' },
      { name: 'Compensation', status: 'In Progress' },
      { name: 'Possession', status: 'Pending' }
    ]
  },
  {
    id: 'PUN-318',
    name: 'Ludhiana-Amritsar Economic Expressway & Freight Corridor',
    state: 'Punjab',
    region: 'Punjab',
    district: 'Amritsar',
    status: 'Monitoring',
    risk: 'Low',
    riskScore: 91,
    progress: 86,
    totalLandArea: 385,
    acquiredLandArea: 331,
    proposedArea: 385,
    notifiedArea: 360,
    acquiredArea: 331,
    compensation: 104,
    compensationDisbursed: 96,
    families: 720,
    rr: 88,
    possession: 82,
    alerts: 0,
    milestones: [
      { name: 'Survey', status: 'Completed' },
      { name: 'Notification', status: 'Completed' },
      { name: 'Award', status: 'Completed' },
      { name: 'Compensation', status: 'Completed' },
      { name: 'Possession', status: 'In Progress' }
    ]
  }
];

const parcels = [
  {
    id: 'PAR-4012',
    projectId: 'MAH-201',
    surveyNumber: '49/2A',
    village: 'Shivaji Nagar',
    district: 'Nagpur',
    area: 4.8,
    landType: 'Private Agricultural',
    status: 'Awarded',
    compensation: 18.4,
    paymentStatus: 'Partially Paid',
    possession: 'Pending',
    rrRequired: true,
    validation: 'Mismatch Detected',
    geometry: [
      [21.124, 79.06],
      [21.126, 79.08],
      [21.132, 79.08],
      [21.13, 79.05],
      [21.124, 79.06]
    ]
  },
  {
    id: 'PAR-4015',
    projectId: 'MAH-201',
    surveyNumber: '48/7',
    village: 'Nandanvan',
    district: 'Nagpur',
    area: 5.3,
    landType: 'Residential',
    status: 'Notified',
    compensation: 22,
    paymentStatus: 'Awaiting Approval',
    possession: 'Not Started',
    rrRequired: false,
    validation: 'Verified',
    geometry: [
      [21.115, 79.072],
      [21.118, 79.082],
      [21.122, 79.074],
      [21.119, 79.066],
      [21.115, 79.072]
    ]
  },
  {
    id: 'PAR-2241',
    projectId: 'MAH-208',
    surveyNumber: '112/5',
    village: 'Dharmpuri',
    district: 'Aurangabad',
    area: 7.4,
    landType: 'Industrial',
    status: 'Acquisition in Delay',
    compensation: 31.2,
    paymentStatus: 'Delayed',
    possession: 'Pending',
    rrRequired: true,
    validation: 'Data Conflict',
    geometry: [
      [19.885, 75.331],
      [19.89, 75.338],
      [19.897, 75.336],
      [19.892, 75.327],
      [19.885, 75.331]
    ]
  },
  {
    id: 'PAR-4018',
    projectId: 'MAH-201',
    surveyNumber: '50/1',
    village: 'Sitabuldi',
    district: 'Nagpur',
    area: 3.2,
    landType: 'Private Commercial',
    status: 'Awarded',
    compensation: 15.8,
    paymentStatus: 'Paid',
    possession: 'In Progress',
    rrRequired: false,
    validation: 'Verified',
    geometry: [
      [21.145, 79.085],
      [21.148, 79.092],
      [21.152, 79.088],
      [21.149, 79.081],
      [21.145, 79.085]
    ]
  },
  {
    id: 'PAR-4021',
    projectId: 'MAH-201',
    surveyNumber: '51/3',
    village: 'Ramdaspeth',
    district: 'Nagpur',
    area: 4.1,
    landType: 'Agricultural',
    status: 'Notified',
    compensation: 19.5,
    paymentStatus: 'Pending',
    possession: 'Not Started',
    rrRequired: true,
    validation: 'Verified',
    geometry: [
      [21.105, 79.045],
      [21.108, 79.052],
      [21.112, 79.048],
      [21.109, 79.041],
      [21.105, 79.045]
    ]
  },
  {
    id: 'PAR-2245',
    projectId: 'MAH-208',
    surveyNumber: '113/2',
    village: 'Paithan',
    district: 'Aurangabad',
    area: 6.8,
    landType: 'Agricultural',
    status: 'Notified',
    compensation: 28.5,
    paymentStatus: 'Awaiting Approval',
    possession: 'Not Started',
    rrRequired: true,
    validation: 'Anomaly',
    geometry: [
      [19.905, 75.315],
      [19.910, 75.325],
      [19.915, 75.320],
      [19.910, 75.310],
      [19.905, 75.315]
    ]
  },
  {
    id: 'PAR-2248',
    projectId: 'MAH-208',
    surveyNumber: '114/6',
    village: 'Aurangpura',
    district: 'Aurangabad',
    area: 5.9,
    landType: 'Residential',
    status: 'Award in Progress',
    compensation: 24.6,
    paymentStatus: 'Pending',
    possession: 'Pending',
    rrRequired: false,
    validation: 'Verified',
    geometry: [
      [19.875, 75.345],
      [19.880, 75.355],
      [19.885, 75.350],
      [19.880, 75.340],
      [19.875, 75.345]
    ]
  },
  {
    id: 'PAR-4024',
    projectId: 'MAH-201',
    surveyNumber: '52/5',
    village: 'Itwari',
    district: 'Nagpur',
    area: 3.8,
    landType: 'Private Residential',
    status: 'Awarded',
    compensation: 17.2,
    paymentStatus: 'Partially Paid',
    possession: 'In Progress',
    rrRequired: false,
    validation: 'Verified',
    geometry: [
      [21.120, 79.055],
      [21.123, 79.062],
      [21.127, 79.058],
      [21.124, 79.051],
      [21.120, 79.055]
    ]
  },
  {
    id: 'PAR-2250',
    projectId: 'MAH-208',
    surveyNumber: '115/1',
    village: 'Kazi Gate',
    district: 'Aurangabad',
    area: 4.6,
    landType: 'Commercial',
    status: 'Compensation Stage',
    compensation: 22.1,
    paymentStatus: 'In Process',
    possession: 'Pending',
    rrRequired: false,
    validation: 'Verified',
    geometry: [
      [19.860, 75.330],
      [19.863, 75.337],
      [19.867, 75.333],
      [19.864, 75.326],
      [19.860, 75.330]
    ]
  },
  {
    id: 'PAR-4027',
    projectId: 'MAH-201',
    surveyNumber: '49/4',
    village: 'Ameerpeth',
    district: 'Nagpur',
    area: 5.5,
    landType: 'Industrial',
    status: 'Award Pending',
    compensation: 25.8,
    paymentStatus: 'Awaiting Approval',
    possession: 'Pending',
    rrRequired: true,
    validation: 'Data Conflict',
    geometry: [
      [21.135, 79.075],
      [21.138, 79.082],
      [21.142, 79.078],
      [21.139, 79.071],
      [21.135, 79.075]
    ]
  }
];

const alerts = [
  { id: 1, title: 'Compensation discrepancy', message: 'Parcel PAR-4012 shows mismatch between award and field record.', severity: 'High' },
  { id: 2, title: 'R&R dependency', message: 'Five families in Aurangabad are blocked due to pending relocation documentation.', severity: 'Medium' },
  { id: 3, title: 'Possession delay', message: 'Nagpur ring road project is behind schedule by 11 days at award stage.', severity: 'Medium' }
];

const documents = [
  { id: 'DOC-1801', name: 'Award Notice - Parcel 49/2A', projectId: 'MAH-201', status: 'Validated', extractedFields: 14 },
  { id: 'DOC-1809', name: 'Compensation Ledger - Nandanvan', projectId: 'MAH-201', status: 'Needs Review', extractedFields: 9 },
  { id: 'DOC-1982', name: 'R&R Family Checklist - Dharmpuri', projectId: 'MAH-208', status: 'Flagged', extractedFields: 18 }
];

const riskInsights = {
  overallRisk: 'High',
  score: 78,
  factors: [
    'Compensation backlog and payment exceptions',
    'Data mismatch between land records and award documents',
    'Pending R&R documentation for affected families',
    'Possession delays across the active corridor'
  ],
  actions: [
    'Verify parcel-level data for all disputed notices',
    'Prioritize payment reconciliation for delayed families',
    'Escalate R&R documentation review for project MAH-208'
  ]
};

module.exports = {
  dashboardSummary,
  projects,
  parcels,
  alerts,
  documents,
  riskInsights
};
