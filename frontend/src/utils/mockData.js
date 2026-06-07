// ─────────────────────────────────────────────────────────────────────────────
// BUILDTRACK — MOCK DATA
// Switch mock ↔ real backend by changing ONE line in .env:
//   REACT_APP_USE_MOCK=true   ← use this file (no backend needed)
//   REACT_APP_USE_MOCK=false  ← real API
// ─────────────────────────────────────────────────────────────────────────────

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const d = (days) => { const dt = new Date(); dt.setDate(dt.getDate() + days); return dt.toISOString(); };
const dStr = (days) => { const dt = new Date(); dt.setDate(dt.getDate() + days); return dt.toISOString().slice(0,10); };

// ─── IDs ─────────────────────────────────────────────────────────────────────
export const IDS = {
  users:    { ahmed: 'u1', usman: 'u2', sara: 'u3', bilal: 'u4', ali: 'u5', tariq: 'u6' },
  projects: { p1: 'p1', p2: 'p2', p3: 'p3', p4: 'p4' },
};

// ─── SUBSCRIPTION ─────────────────────────────────────────────────────────────
export const MOCK_SUBSCRIPTION = {
  _id:           'sub1',
  owner:         'u1',
  plan:          'standard',
  status:        'active',
  startDate:     d(-60),
  endDate:       d(120),
  trialUsed:     true,
  isActive:      true,
  daysRemaining: 120,
};

// ─── USERS ───────────────────────────────────────────────────────────────────
export const MOCK_USERS = [
  {
    _id: 'u1', name: 'Ahmed Khan', email: 'ahmed@buildtrack.com',
    role: 'owner', company: 'Khan Constructions Pvt Ltd', phone: '+91 98001 23456',
    organizationId: 'u1', isActive: true,
    subscription: { plan: 'standard', status: 'active', endDate: d(120), isActive: true, daysRemaining: 120 },
    bankDetails: { accountHolderName: 'Khan Constructions Pvt Ltd', bankName: 'HDFC Bank', accountNumber: '50200012345678', ifscCode: 'HDFC0001234' },
  },
  { _id: 'u2', name: 'Usman Ali',    email: 'usman@buildtrack.com', role: 'engineer',   company: 'Khan Constructions Pvt Ltd', phone: '+91 98001 34567', organizationId: 'u1', isActive: true },
  { _id: 'u3', name: 'Sara Malik',   email: 'sara@buildtrack.com',  role: 'supervisor', company: 'Khan Constructions Pvt Ltd', phone: '+91 98001 45678', organizationId: 'u1', isActive: true },
  { _id: 'u4', name: 'Bilal Sheikh', email: 'bilal@buildtrack.com', role: 'engineer',   company: 'Khan Constructions Pvt Ltd', phone: '+91 98001 56789', organizationId: 'u1', isActive: true },
  { _id: 'u5', name: 'Ali Hassan',   email: 'ali@buildtrack.com',   role: 'worker',     company: 'Khan Constructions Pvt Ltd', phone: '+91 98001 67890', organizationId: 'u1', isActive: true, workerId: 'w1' },
  { _id: 'u6', name: 'Tariq Mehmood',email: 'tariq@buildtrack.com', role: 'client',     company: '',                          phone: '+91 98001 78901', organizationId: 'u1', isActive: true, clientProjectId: 'p1' },
  { _id: 'u7', name: 'Ravi Sharma',  email: 'ravi@buildtrack.com',  role: 'manager',    company: 'Khan Constructions Pvt Ltd', phone: '+91 98001 89012', organizationId: 'u1', isActive: true },
];

// ─── PROJECTS ─────────────────────────────────────────────────────────────────
export const MOCK_PROJECTS = [
  {
    _id: 'p1', name: 'DHA Phase 9 Luxury Villa', type: 'residential',
    description: '5-marla double storey luxury villa with basement in DHA Phase 9. Full finishing with imported marble flooring.',
    address: 'Block C, House 142, DHA Phase 9, Lahore',
    owner: 'u1', leadEngineer: { _id: 'u2', name: 'Usman Ali', email: 'usman@buildtrack.com' },
    team: [{ _id: 'u2', name: 'Usman Ali' }, { _id: 'u3', name: 'Sara Malik' }],
    client: { name: 'Tariq Mehmood', email: 'tariq@gmail.com', phone: '+91 98001 78901' },
    clientUserId: 'u6',
    budget:      { total: 12500000, structure: 5000000, labour: 2800000, mep: 1800000, finishing: 1900000, misc: 1000000 },
    budgetSpent: { total: 7423500,  structure: 1645000, labour:  915000, mep:  327000, finishing:  480000, misc:   56500 },
    contractValue: 15000000, currency: 'INR',
    startDate: '2024-03-01', endDate: '2025-07-31', completion: 62, status: 'active',
    phases: [
      { name: 'Foundation & Basement',  plannedStart: '2024-03-01', plannedEnd: '2024-05-31', status: 'completed',   completion: 100 },
      { name: 'Ground Floor Structure', plannedStart: '2024-06-01', plannedEnd: '2024-08-31', status: 'completed',   completion: 100 },
      { name: 'First Floor Structure',  plannedStart: '2024-09-01', plannedEnd: '2024-11-30', status: 'completed',   completion: 100 },
      { name: 'Roof Slab & Parapet',    plannedStart: '2024-12-01', plannedEnd: '2025-01-31', status: 'completed',   completion: 100 },
      { name: 'MEP Rough-In',           plannedStart: '2025-01-01', plannedEnd: '2025-03-31', status: 'in_progress', completion: 70  },
      { name: 'Plastering & Finishing', plannedStart: '2025-03-01', plannedEnd: '2025-06-30', status: 'in_progress', completion: 30  },
    ],
    clientPortalEnabled: true, clientPortalToken: 'ct_dha_mock_token',
    createdAt: '2024-02-15T00:00:00.000Z',
  },
  {
    _id: 'p2', name: 'Gulberg Commercial Tower', type: 'commercial',
    description: 'G+8 commercial tower with basement parking in Gulberg III. Mixed-use development.',
    address: 'Main Boulevard, Gulberg III, Lahore',
    owner: 'u1', leadEngineer: { _id: 'u4', name: 'Bilal Sheikh', email: 'bilal@buildtrack.com' },
    team: [{ _id: 'u4', name: 'Bilal Sheikh' }, { _id: 'u2', name: 'Usman Ali' }],
    client: { name: 'Zafar Brothers Holdings', email: 'zafar@zafarbros.com', phone: '+91 44 35761234' },
    clientUserId: null,
    budget:      { total: 45000000, structure: 18000000, labour:  9000000, mep: 8000000, finishing: 6000000, misc: 4000000 },
    budgetSpent: { total: 38250000, structure: 18500000, labour: 10200000, mep: 5100000, finishing: 2800000, misc: 1650000 },
    contractValue: 52000000, currency: 'INR',
    startDate: '2024-06-01', endDate: '2026-12-31', completion: 38, status: 'active',
    phases: [
      { name: 'Piling & Foundation',  plannedStart: '2024-06-01', plannedEnd: '2024-09-30', status: 'completed',   completion: 100 },
      { name: 'Basement & Podium',    plannedStart: '2024-10-01', plannedEnd: '2025-03-31', status: 'in_progress', completion: 65  },
      { name: 'Ground to 4th Floor',  plannedStart: '2025-03-01', plannedEnd: '2025-09-30', status: 'pending',     completion: 0   },
      { name: '5th to 8th Floor',     plannedStart: '2025-09-01', plannedEnd: '2026-03-31', status: 'pending',     completion: 0   },
      { name: 'MEP & Façade',         plannedStart: '2026-02-01', plannedEnd: '2026-09-30', status: 'pending',     completion: 0   },
      { name: 'Finishing & Handover', plannedStart: '2026-08-01', plannedEnd: '2026-12-31', status: 'pending',     completion: 0   },
    ],
    clientPortalEnabled: false, createdAt: '2024-05-10T00:00:00.000Z',
  },
  {
    _id: 'p3', name: 'F-10 Apartment Complex', type: 'residential',
    description: '12-unit luxury apartment complex in F-10, Islamabad.',
    address: 'Street 7, F-10/3, Islamabad',
    owner: 'u1', leadEngineer: { _id: 'u2', name: 'Usman Ali', email: 'usman@buildtrack.com' },
    team: [{ _id: 'u2', name: 'Usman Ali' }],
    client: { name: 'Capital Developers', email: 'info@capitaldevelop.com', phone: '+91 11 2878765' },
    clientUserId: null,
    budget:      { total: 28000000, structure: 11000000, labour: 6500000, mep: 4500000, finishing: 4000000, misc: 2000000 },
    budgetSpent: { total: 0, structure: 0, labour: 0, mep: 0, finishing: 0, misc: 0 },
    contractValue: 33000000, currency: 'INR',
    startDate: '2025-04-01', endDate: '2027-03-31', completion: 0, status: 'planning',
    phases: [
      { name: 'Site Clearance & Leveling', status: 'pending', completion: 0 },
      { name: 'Foundation Work',           status: 'pending', completion: 0 },
      { name: 'Structural Work',           status: 'pending', completion: 0 },
      { name: 'MEP Installation',          status: 'pending', completion: 0 },
      { name: 'Finishing & Handover',      status: 'pending', completion: 0 },
    ],
    clientPortalEnabled: false, createdAt: '2025-02-20T00:00:00.000Z',
  },
  {
    _id: 'p4', name: 'Port Qasim Industrial Warehouse', type: 'industrial',
    description: '40,000 sq ft temperature-controlled industrial warehouse.',
    address: 'Plot 22, Industrial Zone, Port Qasim, Karachi',
    owner: 'u1', leadEngineer: { _id: 'u4', name: 'Bilal Sheikh', email: 'bilal@buildtrack.com' },
    team: [{ _id: 'u4', name: 'Bilal Sheikh' }],
    client: { name: 'Alpha Logistics Ltd', email: 'ops@alphalogistics.pk', phone: '+91 22 34571234' },
    clientUserId: null,
    budget:      { total: 8500000, structure: 3500000, labour: 2000000, mep: 1500000, finishing: 800000, misc: 700000 },
    budgetSpent: { total: 9150000, structure: 3700000, labour: 2200000, mep: 1600000, finishing: 950000, misc: 700000 },
    contractValue: 9800000, currency: 'INR',
    startDate: '2023-09-01', endDate: '2024-08-31', completion: 100, status: 'completed',
    phases: [
      { name: 'Foundation',         status: 'completed', completion: 100 },
      { name: 'Steel Frame',        status: 'completed', completion: 100 },
      { name: 'Cladding & Roofing', status: 'completed', completion: 100 },
      { name: 'MEP & Finishing',    status: 'completed', completion: 100 },
    ],
    clientPortalEnabled: false, createdAt: '2023-08-01T00:00:00.000Z',
  },
];

// ─── WORKERS ─────────────────────────────────────────────────────────────────
export const MOCK_WORKERS = [
  { _id: 'w1',  name: 'Ali Hassan',     trade: 'mason',       payType: 'daily',   rate: 1800,  currency: 'INR', phone: '+91 95001 11001', isActive: true, joinDate: '2024-01-15', projects: ['p1','p2'], userId: 'u5' },
  { _id: 'w2',  name: 'Abdul Qadir',    trade: 'mason',       payType: 'daily',   rate: 1800,  currency: 'INR', phone: '+91 95001 11002', isActive: true, joinDate: '2024-01-15', projects: ['p1','p2'] },
  { _id: 'w3',  name: 'Nasir Ahmed',    trade: 'electrician', payType: 'daily',   rate: 2200,  currency: 'INR', phone: '+91 95001 11003', isActive: true, joinDate: '2024-02-01', projects: ['p1','p2'] },
  { _id: 'w4',  name: 'Amjad Khan',     trade: 'plumber',     payType: 'daily',   rate: 2000,  currency: 'INR', phone: '+91 95001 11004', isActive: true, joinDate: '2024-02-01', projects: ['p1','p2'] },
  { _id: 'w5',  name: 'Shahzad Ali',    trade: 'steel_fixer', payType: 'daily',   rate: 2100,  currency: 'INR', phone: '+91 95001 11005', isActive: true, joinDate: '2024-03-01', projects: ['p1','p2'] },
  { _id: 'w6',  name: 'Farhan Mehmood', trade: 'steel_fixer', payType: 'daily',   rate: 2100,  currency: 'INR', phone: '+91 95001 11006', isActive: true, joinDate: '2024-03-01', projects: ['p1','p2'] },
  { _id: 'w7',  name: 'Aslam Khan',     trade: 'helper',      payType: 'daily',   rate: 1200,  currency: 'INR', phone: '+91 95001 11007', isActive: true, joinDate: '2024-01-20', projects: ['p1','p2'] },
  { _id: 'w8',  name: 'Zubair Ahmed',   trade: 'helper',      payType: 'daily',   rate: 1200,  currency: 'INR', phone: '+91 95001 11008', isActive: true, joinDate: '2024-01-20', projects: ['p1','p2'] },
  { _id: 'w9',  name: 'Imran Butt',     trade: 'carpenter',   payType: 'daily',   rate: 2000,  currency: 'INR', phone: '+91 95001 11009', isActive: true, joinDate: '2024-04-10', projects: ['p1'] },
  { _id: 'w10', name: 'Naveed Hussain', trade: 'painter',     payType: 'daily',   rate: 1700,  currency: 'INR', phone: '+91 95001 11010', isActive: true, joinDate: '2025-01-01', projects: ['p1'] },
  { _id: 'w11', name: 'Rashid Mahmood', trade: 'driver',      payType: 'monthly', rate: 35000, currency: 'INR', phone: '+91 95001 11011', isActive: true, joinDate: '2024-01-10', projects: ['p1','p2'] },
  { _id: 'w12', name: 'Hamid Ali',      trade: 'mason',       payType: 'daily',   rate: 1850,  currency: 'INR', phone: '+91 95001 11012', isActive: true, joinDate: '2024-03-15', projects: ['p1','p2'] },
];

// ─── VENDORS ─────────────────────────────────────────────────────────────────
export const MOCK_VENDORS = [
  {
    _id: 'v1', owner: 'u1', companyName: 'Maple Leaf Cement', contactPerson: 'Irfan Siddiqui',
    email: 'sales@mapleleafcement.pk', phone: '+91 42 35761100', gstNumber: '07AABCM1234A1Z5',
    aadharNumber: 'XXXX-XXXX-1234', address: '14-B, SITE Industrial Area, Lahore',
    bankDetails: { accountHolderName: 'Maple Leaf Cement Ltd', bankName: 'MCB Bank', accountNumber: '0010012345671', ifscCode: 'MCBL0000001' },
    isActive: true, createdAt: d(-200),
  },
  {
    _id: 'v2', owner: 'u1', companyName: 'Ittefaq Steel Mills', contactPerson: 'Waseem Akhtar',
    email: 'sales@ittefaqsteel.pk', phone: '+91 21 34571200', gstNumber: '08AABCI5678B2Z3',
    aadharNumber: 'XXXX-XXXX-5678', address: 'Steel Mills Road, Industrial Zone, Karachi',
    bankDetails: { accountHolderName: 'Ittefaq Steel Mills Ltd', bankName: 'HBL Bank', accountNumber: '0020056789012', ifscCode: 'HBLL0000002' },
    isActive: true, createdAt: d(-180),
  },
  {
    _id: 'v3', owner: 'u1', companyName: 'National Electric Supplies', contactPerson: 'Tariq Bashir',
    email: 'tariq@nationalelectric.pk', phone: '+91 42 35769900', gstNumber: '07AABCN2345C3Z1',
    aadharNumber: 'XXXX-XXXX-9012', address: 'Shop 4, Hafeez Centre, Gulberg, Lahore',
    bankDetails: { accountHolderName: 'National Electric Supplies', bankName: 'Allied Bank', accountNumber: '0030034567890', ifscCode: 'ABLL0000003' },
    isActive: true, createdAt: d(-150),
  },
  {
    _id: 'v4', owner: 'u1', companyName: 'Marble World Lahore', contactPerson: 'Azeem Raza',
    email: 'azeem@marbleworld.pk', phone: '+91 42 35764400', gstNumber: '07AABCM6789D4Z9',
    aadharNumber: 'XXXX-XXXX-3456', address: '78, Multan Road, Near Thokar, Lahore',
    bankDetails: { accountHolderName: 'Marble World Lahore', bankName: 'Bank Alfalah', accountNumber: '0040067890123', ifscCode: 'BALF0000004' },
    isActive: true, createdAt: d(-120),
  },
  {
    _id: 'v5', owner: 'u1', companyName: 'SafetyFirst Pakistan', contactPerson: 'Naveed Iqbal',
    email: 'info@safetyfirst.pk', phone: '+91 42 35768800', gstNumber: '07AABCS9012E5Z7',
    aadharNumber: 'XXXX-XXXX-7890', address: 'Office 12, Johar Town, Lahore',
    bankDetails: { accountHolderName: 'SafetyFirst Pakistan', bankName: 'Meezan Bank', accountNumber: '0050012345678', ifscCode: 'MEZN0000005' },
    isActive: true, createdAt: d(-90),
  },
];

// ─── PURCHASE ORDERS ─────────────────────────────────────────────────────────
export const MOCK_PURCHASE_ORDERS = [
  {
    _id: 'po1', owner: 'u1', project: 'p1', vendor: 'v1', poNumber: 'PO-2024-0001',
    items: [
      { name: 'OPC Cement 50kg bags', qty: 1000, unit: 'bags', rate: 580, total: 580000 },
    ],
    subtotal: 580000, tax: 0, totalAmount: 580000, currency: 'INR',
    category: 'structure', status: 'paid',
    notes: 'Foundation and ground floor slab requirement', privateMode: false,
    sentToVendor: true, sentToClient: false,
    paidAt: d(-80), createdBy: 'u1', createdAt: d(-90),
  },
  {
    _id: 'po2', owner: 'u1', project: 'p1', vendor: 'v2', poNumber: 'PO-2024-0002',
    items: [
      { name: 'Steel Bars Grade 60 (12mm)', qty: 5000, unit: 'kg', rate: 70, total: 350000 },
      { name: 'Steel Bars Grade 60 (16mm)', qty: 1000, unit: 'kg', rate: 72, total: 72000 },
    ],
    subtotal: 422000, tax: 0, totalAmount: 422000, currency: 'INR',
    category: 'structure', status: 'paid',
    notes: 'Ground and first floor column reinforcement', privateMode: false,
    sentToVendor: true, sentToClient: false,
    paidAt: d(-75), createdBy: 'u1', createdAt: d(-85),
  },
  {
    _id: 'po3', owner: 'u1', project: 'p2', vendor: 'v2', poNumber: 'PO-2024-0003',
    items: [
      { name: 'High-Tensile Steel Grade 500 (20mm)', qty: 30000, unit: 'kg', rate: 72, total: 2160000 },
    ],
    subtotal: 2160000, tax: 0, totalAmount: 2160000, currency: 'INR',
    category: 'structure', status: 'paid',
    notes: 'Tower basement columns and beams', privateMode: false,
    sentToVendor: true, sentToClient: false,
    paidAt: d(-60), createdBy: 'u1', createdAt: d(-70),
  },
  {
    _id: 'po4', owner: 'u1', project: 'p1', vendor: 'v3', poNumber: 'PO-2026-0001',
    items: [
      { name: 'Electrical Conduit (3/4")', qty: 200, unit: 'rft', rate: 45,   total: 9000   },
      { name: 'PVC Wire 2.5mm Red',        qty: 500, unit: 'rft', rate: 28,   total: 14000  },
      { name: 'PVC Wire 2.5mm Black',      qty: 500, unit: 'rft', rate: 28,   total: 14000  },
      { name: 'Electrical DB Box 8-way',   qty: 4,   unit: 'nos', rate: 1800, total: 7200   },
      { name: 'MCB 32A',                   qty: 20,  unit: 'nos', rate: 350,  total: 7000   },
      { name: 'Junction Boxes',            qty: 50,  unit: 'nos', rate: 60,   total: 3000   },
    ],
    subtotal: 54200, tax: 5418, totalAmount: 59618, currency: 'INR',
    category: 'mep', status: 'sent',
    notes: 'MEP rough-in phase electrical requirements', privateMode: false,
    sentToVendor: true, sentToClient: false,
    createdBy: 'u1', createdAt: d(-5),
  },
  {
    _id: 'po5', owner: 'u1', project: 'p1', vendor: 'v4', poNumber: 'PO-2026-0002',
    items: [
      { name: 'Italian Carrara Marble (24"×24")', qty: 1200, unit: 'sqft', rate: 380, total: 456000 },
      { name: 'Marble Skirting (4" height)',       qty: 400,  unit: 'rft',  rate: 120, total: 48000  },
    ],
    subtotal: 504000, tax: 50400, totalAmount: 554400, currency: 'INR',
    category: 'finishing', status: 'draft',
    notes: 'Master bedroom and living room marble flooring', privateMode: false,
    sentToVendor: false, sentToClient: false,
    createdBy: 'u1', createdAt: d(-2),
  },
  {
    _id: 'po6', owner: 'u1', project: 'p2', vendor: 'v5', poNumber: 'PO-2026-0003',
    items: [
      { name: 'Safety Helmets (Yellow)',      qty: 30, unit: 'nos', rate: 320, total: 9600  },
      { name: 'Safety Harness Full Body',     qty: 10, unit: 'nos', rate: 850, total: 8500  },
      { name: 'Safety Shoes Steel Toe',       qty: 20, unit: 'nos', rate: 650, total: 13000 },
      { name: 'Reflective Safety Vests',      qty: 30, unit: 'nos', rate: 180, total: 5400  },
    ],
    subtotal: 36500, tax: 3650, totalAmount: 40150, currency: 'INR',
    category: 'misc', status: 'unpaid',
    notes: 'Q2 2026 safety equipment replenishment', privateMode: false,
    sentToVendor: true, sentToClient: false,
    createdBy: 'u1', createdAt: d(-8),
  },
];

// ─── SITE DIARY ───────────────────────────────────────────────────────────────
export const MOCK_SITE_DIARY = [
  {
    _id: 'sd1', project: 'p1', date: dStr(-1),
    reportedBy: { _id: 'u2', name: 'Usman Ali' },
    weather: 'sunny', workDone: 'Electrical conduit laying completed for ground floor master bedroom and living room. Conduits chased into walls and slab. 3 workers on electrical team.',
    workersPresent: 14, issues: '', materials: '45 rft conduit, 120 rft wire used',
    nextDayPlan: 'Start first floor conduit laying and complete living room trunking',
    createdAt: d(-1),
  },
  {
    _id: 'sd2', project: 'p1', date: dStr(-2),
    reportedBy: { _id: 'u2', name: 'Usman Ali' },
    weather: 'cloudy', workDone: 'Plumbing rough-in started for ground floor bathrooms. Main water supply line from street connected to internal riser. Waste water drain pipes laid in slab trench.',
    workersPresent: 12, issues: 'Plumber Amjad reported inlet pipe size mismatch at meter point — needs 1.5" to 1" reducer fitting', materials: '22 rft PVC 3" drain pipe, 15 rft GI water pipe',
    nextDayPlan: 'Continue plumbing for bathroom 2 and kitchen. Get reducer fitting from vendor.',
    createdAt: d(-2),
  },
  {
    _id: 'sd3', project: 'p1', date: dStr(-3),
    reportedBy: { _id: 'u3', name: 'Sara Malik' },
    weather: 'rainy', workDone: 'Work suspended for half day due to heavy rainfall. Morning session: internal plaster sample panel made for client approval on living room east wall.',
    workersPresent: 8, issues: 'Rain delayed outdoor work. Sample plaster on east wall pending client visit scheduled for tomorrow.',
    materials: '3 bags cement, 10 bags sand (plaster mortar)',
    nextDayPlan: 'Client visit for plaster sample approval. Continue conduit laying once weather clears.',
    createdAt: d(-3),
  },
  {
    _id: 'sd4', project: 'p1', date: dStr(-5),
    reportedBy: { _id: 'u2', name: 'Usman Ali' },
    weather: 'sunny', workDone: 'Roof parapet wall plastered and cured. External waterproofing chemical applied to roof slab using APP membrane system. 2 coats applied.',
    workersPresent: 16, issues: '', materials: '8 bags cement, 6 rolls APP membrane (20sqm each), waterproofing chemical 40 liters',
    nextDayPlan: 'Third coat APP membrane on roof. Start MEP rough-in marking on first floor.',
    createdAt: d(-5),
  },
  {
    _id: 'sd5', project: 'p1', date: dStr(-7),
    reportedBy: { _id: 'u3', name: 'Sara Malik' },
    weather: 'hot', workDone: 'HVAC duct chasing completed for all 4 AC points on ground floor. Copper refrigerant lines run from outdoor unit slab to indoor units.',
    workersPresent: 11, issues: 'Heat causing early fatigue — extended lunch break (1hr extra) approved. Extra water and ORS provided.',
    materials: '35 rft copper pipe 3/8", 35 rft copper pipe 1/2", 4 AC slab brackets',
    nextDayPlan: 'First floor HVAC routing. Get drain pipe connection approved by client.',
    createdAt: d(-7),
  },
  {
    _id: 'sd6', project: 'p1', date: dStr(-10),
    reportedBy: { _id: 'u2', name: 'Usman Ali' },
    weather: 'sunny', workDone: 'Internal brick masonry completed for ground floor partition walls as per revised drawings. Total 4200 bricks used. Lintel beams cast over all door openings.',
    workersPresent: 18, issues: '', materials: '4200 red bricks, 12 bags cement, 4 bags sand, 2 nos steel lintels',
    nextDayPlan: 'Start first floor partition walls. Water cure masonry for 3 days.',
    createdAt: d(-10),
  },
  {
    _id: 'sd7', project: 'p1', date: dStr(-14),
    reportedBy: { _id: 'u3', name: 'Sara Malik' },
    weather: 'windy', workDone: 'External scaffolding dismantled from west and south elevations. External plaster for parapet walls and fascia completed.',
    workersPresent: 13, issues: 'Windy conditions slowed scaffolding dismantling. Safety harnesses worn by all workers at height.',
    materials: '15 bags plaster cement, POP finish material',
    nextDayPlan: 'Dismantling north elevation scaffolding. External paint primer coat application.',
    createdAt: d(-14),
  },
  {
    _id: 'sd8', project: 'p1', date: dStr(-18),
    reportedBy: { _id: 'u2', name: 'Usman Ali' },
    weather: 'sunny', workDone: 'Roof slab construction completed successfully. 28 cubic meters M-25 RCC poured in single continuous operation. Cube samples taken for 7-day and 28-day testing.',
    workersPresent: 22, issues: '', materials: '28 cubic meter RCC M-25, 6 tons steel (already placed), 1 batch admixture plasticizer',
    nextDayPlan: 'Water curing of roof slab for 21 days. Formwork striking after 10 days.',
    createdAt: d(-18),
  },
];

// ─── INVENTORY ────────────────────────────────────────────────────────────────
export const MOCK_INVENTORY = [
  {
    _id: 'inv1', project: 'p1', owner: 'u1', itemName: 'Portland Cement (OPC 43)',
    unit: 'bags', currentStock: 245, minimumStock: 100,
    transactions: [
      { type: 'in',  quantity: 500, date: d(-30), description: 'PO-2024-0001 delivery', recordedBy: 'u2' },
      { type: 'out', quantity: 255, date: d(-25), description: 'Ground floor slab usage', recordedBy: 'u2' },
    ],
    createdAt: d(-30),
  },
  {
    _id: 'inv2', project: 'p1', owner: 'u1', itemName: 'Steel Bars 12mm',
    unit: 'kg', currentStock: 3200, minimumStock: 500,
    transactions: [
      { type: 'in',  quantity: 5000, date: d(-40), description: 'PO-2024-0002 delivery', recordedBy: 'u2' },
      { type: 'out', quantity: 1800, date: d(-20), description: 'First floor columns', recordedBy: 'u3' },
    ],
    createdAt: d(-40),
  },
  {
    _id: 'inv3', project: 'p1', owner: 'u1', itemName: 'Red Clay Bricks',
    unit: 'nos', currentStock: 1800, minimumStock: 2000,
    transactions: [
      { type: 'in',  quantity: 50000, date: d(-60), description: 'Bhopal Brick Kiln delivery', recordedBy: 'u3' },
      { type: 'out', quantity: 34200, date: d(-10), description: 'Ground floor partition walls', recordedBy: 'u3' },
      { type: 'out', quantity: 14000, date: d(-5),  description: 'First floor partition masonry', recordedBy: 'u2' },
    ],
    createdAt: d(-60),
  },
  {
    _id: 'inv4', project: 'p1', owner: 'u1', itemName: 'PVC Pipes 3"',
    unit: 'rft', currentStock: 85, minimumStock: 20,
    transactions: [
      { type: 'in',  quantity: 200, date: d(-20), description: 'Master Pipes & Fittings delivery', recordedBy: 'u2' },
      { type: 'out', quantity: 115, date: d(-2),  description: 'Ground floor bathroom drain lines', recordedBy: 'u3' },
    ],
    createdAt: d(-20),
  },
  {
    _id: 'inv5', project: 'p1', owner: 'u1', itemName: 'Electrical Wire 2.5mm',
    unit: 'rft', currentStock: 12, minimumStock: 50,
    transactions: [
      { type: 'in',  quantity: 500, date: d(-15), description: 'National Electric Supplies delivery', recordedBy: 'u2' },
      { type: 'out', quantity: 488, date: d(-1),  description: 'Ground floor MEP rough-in', recordedBy: 'u2' },
    ],
    createdAt: d(-15),
  },
  {
    _id: 'inv6', project: 'p1', owner: 'u1', itemName: 'Sand & Bajri (Aggregates)',
    unit: 'cubic ft', currentStock: 28, minimumStock: 10,
    transactions: [
      { type: 'in',  quantity: 60, date: d(-25), description: 'Punjab Aggregates delivery', recordedBy: 'u3' },
      { type: 'out', quantity: 32, date: d(-8),  description: 'Plastering and masonry mortar', recordedBy: 'u3' },
    ],
    createdAt: d(-25),
  },
];

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────
export const MOCK_NOTIFICATIONS = [
  { _id: 'n1', recipient: 'u1', type: 'low_stock',             title: 'Low Stock Alert — Electrical Wire 2.5mm', message: 'DHA Phase 9 Villa: Only 12 rft remaining (min: 50 rft). Reorder immediately.', relatedProject: 'p1', isRead: false, createdAt: d(-0.1) },
  { _id: 'n2', recipient: 'u1', type: 'low_stock',             title: 'Low Stock Alert — Red Clay Bricks',       message: 'DHA Phase 9 Villa: Only 1800 nos remaining (min: 2000 nos). Stock below minimum.',  relatedProject: 'p1', isRead: false, createdAt: d(-0.5) },
  { _id: 'n3', recipient: 'u1', type: 'po_paid',               title: 'PO-2024-0003 Marked as Paid',             message: '₹21,60,000 paid to Ittefaq Steel Mills for Gulberg Tower steel supply.',             relatedProject: 'p2', isRead: false, createdAt: d(-1) },
  { _id: 'n4', recipient: 'u1', type: 'payment_requested',     title: 'Payment Request — 3rd Milestone',         message: 'Client Tariq Mehmood has been notified for ₹3,00,000 milestone payment.',             relatedProject: 'p1', isRead: false, createdAt: d(-2) },
  { _id: 'n5', recipient: 'u1', type: 'task_completed',        title: 'Task Completed: Roof Slab Casting',       message: 'Usman Ali marked "Roof Slab Casting" as complete on DHA Phase 9 Villa.',             relatedProject: 'p1', isRead: true,  createdAt: d(-3) },
  { _id: 'n6', recipient: 'u1', type: 'phase_started',         title: 'Phase Started: MEP Rough-In',             message: 'MEP Rough-In phase has started on DHA Phase 9 Villa project.',                      relatedProject: 'p1', isRead: true,  createdAt: d(-5) },
  { _id: 'n7', recipient: 'u1', type: 'payment_received',      title: 'Payment Received — 2nd Installment',     message: '₹30,00,000 received from Tariq Mehmood (2nd installment — structure completion).',   relatedProject: 'p1', isRead: true,  createdAt: d(-8) },
  { _id: 'n8', recipient: 'u1', type: 'po_created',            title: 'PO-2026-0001 Created',                   message: 'New PO for Electrical Conduit & Wiring created for DHA Villa MEP phase.',           relatedProject: 'p1', isRead: true,  createdAt: d(-5) },
  { _id: 'n9', recipient: 'u1', type: 'user_invited',          title: 'New Team Member Added',                  message: 'Ravi Sharma (Manager) has been invited and can now access BuildTrack.',             relatedProject: null, isRead: true,  createdAt: d(-10) },
  { _id: 'n10',recipient: 'u1', type: 'subscription_expiring', title: 'Subscription Renews in 120 Days',        message: 'Your Standard plan is active. Next renewal on schedule.',                          relatedProject: null, isRead: true,  createdAt: d(-15) },
];

// ─── PAYMENT SCHEDULES ────────────────────────────────────────────────────────
export const MOCK_PAYMENT_SCHEDULES = [
  { _id: 'ps1', project: 'p1', owner: 'u1', milestoneName: '1st Installment — Advance (30%)',         amount: 4500000, currency: 'INR', percentOfContract: 30, status: 'received', dueDate: d(-160), requestedAt: d(-165), receivedAt: d(-160), notes: 'Advance on contract signing',       createdAt: d(-180) },
  { _id: 'ps2', project: 'p1', owner: 'u1', milestoneName: '2nd Installment — Structure Completion',  amount: 3000000, currency: 'INR', percentOfContract: 20, status: 'received', dueDate: d(-30),  requestedAt: d(-32),  receivedAt: d(-30),  notes: '2nd payment on roof slab completion', createdAt: d(-180) },
  { _id: 'ps3', project: 'p1', owner: 'u1', milestoneName: '3rd Installment — MEP Completion (20%)', amount: 3000000, currency: 'INR', percentOfContract: 20, status: 'requested', dueDate: d(15),   requestedAt: d(-2),   receivedAt: null,    notes: 'Due on MEP rough-in completion',      createdAt: d(-180) },
  { _id: 'ps4', project: 'p1', owner: 'u1', milestoneName: '4th Installment — Handover (30%)',       amount: 4500000, currency: 'INR', percentOfContract: 30, status: 'pending',   dueDate: d(60),   requestedAt: null,    receivedAt: null,    notes: 'Final payment on possession',         createdAt: d(-180) },
];

// ─── TASKS ────────────────────────────────────────────────────────────────────
export const MOCK_TASKS = [
  { _id: 't1',  project: 'p1', title: 'Foundation & Basement Work',      phase: 'Foundation & Basement',  priority: 'high',     status: 'completed',       assignedTo: { _id:'u2', name:'Usman Ali' },    createdBy: { _id:'u1', name:'Ahmed Khan' }, dueDate: d(-120), completedAt: d(-115) },
  { _id: 't2',  project: 'p1', title: 'Ground Floor Columns & Beams',    phase: 'Ground Floor Structure', priority: 'high',     status: 'completed',       assignedTo: { _id:'u2', name:'Usman Ali' },    createdBy: { _id:'u1', name:'Ahmed Khan' }, dueDate: d(-90),  completedAt: d(-85) },
  { _id: 't3',  project: 'p1', title: 'Ground Floor Slab Casting',       phase: 'Ground Floor Structure', priority: 'high',     status: 'completed',       assignedTo: { _id:'u3', name:'Sara Malik' },   createdBy: { _id:'u1', name:'Ahmed Khan' }, dueDate: d(-80),  completedAt: d(-78) },
  { _id: 't4',  project: 'p1', title: 'First Floor Structure',           phase: 'First Floor Structure',  priority: 'high',     status: 'completed',       assignedTo: { _id:'u2', name:'Usman Ali' },    createdBy: { _id:'u1', name:'Ahmed Khan' }, dueDate: d(-50),  completedAt: d(-48) },
  { _id: 't5',  project: 'p1', title: 'Roof Slab Casting',               phase: 'Roof Slab & Parapet',    priority: 'high',     status: 'completed',       assignedTo: { _id:'u2', name:'Usman Ali' },    createdBy: { _id:'u1', name:'Ahmed Khan' }, dueDate: d(-20),  completedAt: d(-18) },
  { _id: 't6',  project: 'p1', title: 'Electrical Conduit Laying',       phase: 'MEP Rough-In',           priority: 'high',     status: 'in_progress',     assignedTo: { _id:'u2', name:'Usman Ali' },    createdBy: { _id:'u1', name:'Ahmed Khan' }, dueDate: d(10) },
  { _id: 't7',  project: 'p1', title: 'Plumbing Rough-In',               phase: 'MEP Rough-In',           priority: 'high',     status: 'in_progress',     assignedTo: { _id:'u3', name:'Sara Malik' },   createdBy: { _id:'u1', name:'Ahmed Khan' }, dueDate: d(15) },
  { _id: 't8',  project: 'p1', title: 'Internal Plastering – Ground',    phase: 'Plastering & Finishing', priority: 'medium',   status: 'open',            assignedTo: { _id:'u3', name:'Sara Malik' },   createdBy: { _id:'u1', name:'Ahmed Khan' }, dueDate: d(30) },
  { _id: 't9',  project: 'p1', title: 'External Plaster & Paint',        phase: 'Plastering & Finishing', priority: 'medium',   status: 'open',            assignedTo: { _id:'u2', name:'Usman Ali' },    createdBy: { _id:'u1', name:'Ahmed Khan' }, dueDate: d(45) },
  { _id: 't10', project: 'p1', title: 'Floor Tile Work – Ground Floor',  phase: 'Plastering & Finishing', priority: 'medium',   status: 'open',            assignedTo: { _id:'u3', name:'Sara Malik' },   createdBy: { _id:'u1', name:'Ahmed Khan' }, dueDate: d(60) },
  { _id: 't11', project: 'p1', title: 'HVAC System Installation',        phase: 'MEP Rough-In',           priority: 'medium',   status: 'open',            assignedTo: { _id:'u2', name:'Usman Ali' },    createdBy: { _id:'u1', name:'Ahmed Khan' }, dueDate: d(50) },
  { _id: 't12', project: 'p1', title: 'Main Gate & Boundary Wall',       phase: 'Plastering & Finishing', priority: 'low',      status: 'open',            assignedTo: { _id:'u3', name:'Sara Malik' },   createdBy: { _id:'u1', name:'Ahmed Khan' }, dueDate: d(75) },
  { _id: 't13', project: 'p2', title: 'Piling Work',                     phase: 'Piling & Foundation',    priority: 'critical', status: 'completed',       assignedTo: { _id:'u4', name:'Bilal Sheikh' }, createdBy: { _id:'u1', name:'Ahmed Khan' }, dueDate: d(-140), completedAt: d(-135) },
  { _id: 't14', project: 'p2', title: 'Pile Caps & Grade Beams',         phase: 'Piling & Foundation',    priority: 'critical', status: 'completed',       assignedTo: { _id:'u4', name:'Bilal Sheikh' }, createdBy: { _id:'u1', name:'Ahmed Khan' }, dueDate: d(-100), completedAt: d(-95) },
  { _id: 't15', project: 'p2', title: 'Basement B1 Slab',                phase: 'Basement & Podium',      priority: 'high',     status: 'completed',       assignedTo: { _id:'u4', name:'Bilal Sheikh' }, createdBy: { _id:'u1', name:'Ahmed Khan' }, dueDate: d(-60),  completedAt: d(-55) },
  { _id: 't16', project: 'p2', title: 'Basement B2 Slab',                phase: 'Basement & Podium',      priority: 'high',     status: 'completed',       assignedTo: { _id:'u2', name:'Usman Ali' },    createdBy: { _id:'u1', name:'Ahmed Khan' }, dueDate: d(-30),  completedAt: d(-28) },
  { _id: 't17', project: 'p2', title: 'Ground Floor Columns',            phase: 'Basement & Podium',      priority: 'high',     status: 'in_progress',     assignedTo: { _id:'u4', name:'Bilal Sheikh' }, createdBy: { _id:'u1', name:'Ahmed Khan' }, dueDate: d(20) },
  { _id: 't18', project: 'p2', title: 'Ground Floor Slab',               phase: 'Basement & Podium',      priority: 'high',     status: 'open',            assignedTo: { _id:'u4', name:'Bilal Sheikh' }, createdBy: { _id:'u1', name:'Ahmed Khan' }, dueDate: d(40) },
  { _id: 't19', project: 'p2', title: 'Podium Façade Design Approval',   phase: 'Basement & Podium',      priority: 'medium',   status: 'pending_approval',assignedTo: { _id:'u2', name:'Usman Ali' },    createdBy: { _id:'u1', name:'Ahmed Khan' }, dueDate: d(7) },
  { _id: 't20', project: 'p2', title: 'Fire Fighting Riser Installation',phase: 'MEP & Façade',           priority: 'medium',   status: 'open',            assignedTo: { _id:'u4', name:'Bilal Sheikh' }, createdBy: { _id:'u1', name:'Ahmed Khan' }, dueDate: d(180) },
];

// ─── TRANSACTIONS ─────────────────────────────────────────────────────────────
export const MOCK_TRANSACTIONS = [
  { _id: 'tx1',  project: 'p1', type: 'client_receipt',    category: 'misc',      amount: 4500000, description: '30% advance payment on contract signing',              paymentMethod: 'bank',      status: 'paid',    date: '2024-03-05', createdBy: { _id:'u1', name:'Ahmed Khan' } },
  { _id: 'tx2',  project: 'p1', type: 'client_receipt',    category: 'misc',      amount: 3000000, description: '20% second installment – structure completion',         paymentMethod: 'cheque',    status: 'paid',    date: '2024-12-20', createdBy: { _id:'u1', name:'Ahmed Khan' } },
  { _id: 'tx3',  project: 'p1', type: 'material_purchase', category: 'structure', amount: 580000,  description: 'OPC Cement – 1000 bags (PO-2024-0001)',                 paymentMethod: 'bank',      status: 'paid',    date: '2024-03-15', vendor: 'Maple Leaf Cement',          invoiceNo: 'PO-2024-0001', createdBy: { _id:'u2', name:'Usman Ali' }   },
  { _id: 'tx4',  project: 'p1', type: 'material_purchase', category: 'structure', amount: 422000,  description: 'Steel Bars Grade 60 (PO-2024-0002)',                    paymentMethod: 'cheque',    status: 'paid',    date: '2024-03-18', vendor: 'Ittefaq Steel Mills',        invoiceNo: 'PO-2024-0002', createdBy: { _id:'u2', name:'Usman Ali' }   },
  { _id: 'tx5',  project: 'p1', type: 'material_purchase', category: 'structure', amount: 210000,  description: 'Red Clay Bricks – 50,000 units',                        paymentMethod: 'cash',      status: 'paid',    date: '2024-04-10', vendor: 'Bhopal Brick Kiln',          invoiceNo: 'BBK-0091',     createdBy: { _id:'u3', name:'Sara Malik' } },
  { _id: 'tx6',  project: 'p1', type: 'material_purchase', category: 'structure', amount: 95000,   description: 'Crush, Sand & Bajri – 3 trips',                         paymentMethod: 'cash',      status: 'paid',    date: '2024-04-22', vendor: 'Punjab Aggregates',          invoiceNo: 'PA-441',       createdBy: { _id:'u3', name:'Sara Malik' } },
  { _id: 'tx7',  project: 'p1', type: 'material_purchase', category: 'structure', amount: 340000,  description: 'Cement – 600 bags for first floor slab',                paymentMethod: 'bank',      status: 'paid',    date: '2024-09-12', vendor: 'Maple Leaf Cement',          invoiceNo: 'MLC-2024-0891',createdBy: { _id:'u2', name:'Usman Ali' }   },
  { _id: 'tx8',  project: 'p1', type: 'material_purchase', category: 'mep',       amount: 185000,  description: 'Electrical conduit, wires & boxes',                    paymentMethod: 'cash',      status: 'paid',    date: '2025-01-15', vendor: 'National Electric Supplies', invoiceNo: 'NES-3301',     createdBy: { _id:'u2', name:'Usman Ali' }   },
  { _id: 'tx9',  project: 'p1', type: 'material_purchase', category: 'mep',       amount: 142000,  description: 'PVC plumbing pipes, joints & fittings',                paymentMethod: 'cash',      status: 'paid',    date: '2025-01-20', vendor: 'Master Pipes & Fittings',   invoiceNo: 'MPF-8812',     createdBy: { _id:'u3', name:'Sara Malik' } },
  { _id: 'tx10', project: 'p1', type: 'material_purchase', category: 'finishing', amount: 480000,  description: 'Imported marble tiles – 2000 sqft (Italian Carrara)',  paymentMethod: 'bank',      status: 'pending', date: '2025-02-10', vendor: 'Marble World Lahore',        invoiceNo: 'MWL-2025-441', createdBy: { _id:'u1', name:'Ahmed Khan' }  },
  { _id: 'tx11', project: 'p1', type: 'labour_payment',    category: 'labour',    amount: 285000,  description: 'Labour wages – March 2024 (foundation team)',           paymentMethod: 'cash',      status: 'paid',    date: '2024-03-31', createdBy: { _id:'u3', name:'Sara Malik' } },
  { _id: 'tx12', project: 'p1', type: 'labour_payment',    category: 'labour',    amount: 295000,  description: 'Labour wages – April 2024',                            paymentMethod: 'cash',      status: 'paid',    date: '2024-04-30', createdBy: { _id:'u3', name:'Sara Malik' } },
  { _id: 'tx13', project: 'p1', type: 'labour_payment',    category: 'labour',    amount: 310000,  description: 'Labour wages – May 2024',                              paymentMethod: 'cash',      status: 'paid',    date: '2024-05-31', createdBy: { _id:'u3', name:'Sara Malik' } },
  { _id: 'tx14', project: 'p1', type: 'advance',           category: 'labour',    amount: 25000,   description: 'Advance payment – Nasir Ahmed (electrician)',           paymentMethod: 'upi',       status: 'paid',    date: '2025-01-12', createdBy: { _id:'u3', name:'Sara Malik' } },
  { _id: 'tx15', project: 'p1', type: 'misc_expense',      category: 'misc',      amount: 38000,   description: 'Site office rental – 3 months',                        paymentMethod: 'cash',      status: 'paid',    date: '2024-03-01', createdBy: { _id:'u1', name:'Ahmed Khan' }  },
  { _id: 'tx16', project: 'p1', type: 'misc_expense',      category: 'misc',      amount: 18500,   description: 'Safety equipment – helmets, gloves, harnesses',         paymentMethod: 'cash',      status: 'paid',    date: '2024-03-05', vendor: 'SafetyFirst Pakistan',       invoiceNo: 'SF-2024-119',  createdBy: { _id:'u3', name:'Sara Malik' } },
  { _id: 'tx17', project: 'p2', type: 'client_receipt',    category: 'misc',      amount: 15600000,description: '30% advance – Gulberg Tower project commencement',      paymentMethod: 'bank',      status: 'paid',    date: '2024-06-10', createdBy: { _id:'u1', name:'Ahmed Khan' }  },
  { _id: 'tx18', project: 'p2', type: 'client_receipt',    category: 'misc',      amount: 10400000,description: '20% on completion of piling works',                     paymentMethod: 'cheque',    status: 'paid',    date: '2024-10-25', createdBy: { _id:'u1', name:'Ahmed Khan' }  },
  { _id: 'tx19', project: 'p2', type: 'material_purchase', category: 'structure', amount: 1850000, description: 'Piling contractor – 28 bored piles (PO-2024-0003)',     paymentMethod: 'bank',      status: 'paid',    date: '2024-06-20', vendor: 'Foundation Engineers Ltd',   invoiceNo: 'PO-2024-0003', createdBy: { _id:'u4', name:'Bilal Sheikh'} },
  { _id: 'tx20', project: 'p2', type: 'material_purchase', category: 'structure', amount: 1240000, description: 'High-strength cement – 2000 bags (53-grade)',           paymentMethod: 'bank',      status: 'paid',    date: '2024-07-11', vendor: 'Lucky Cement',               invoiceNo: 'LC-20240711',  createdBy: { _id:'u4', name:'Bilal Sheikh'} },
  { _id: 'tx21', project: 'p2', type: 'material_purchase', category: 'structure', amount: 2160000, description: 'High-tensile steel – 50 tons (PO-2024-0003)',            paymentMethod: 'cheque',    status: 'paid',    date: '2024-07-25', vendor: 'Ittefaq Steel Mills',        invoiceNo: 'PO-2024-0003', createdBy: { _id:'u4', name:'Bilal Sheikh'} },
  { _id: 'tx22', project: 'p2', type: 'labour_payment',    category: 'labour',    amount: 680000,  description: 'Labour wages – July 2024 (piling & foundation team)',   paymentMethod: 'cash',      status: 'paid',    date: '2024-07-31', createdBy: { _id:'u4', name:'Bilal Sheikh'} },
  { _id: 'tx23', project: 'p2', type: 'labour_payment',    category: 'labour',    amount: 720000,  description: 'Labour wages – August 2024',                           paymentMethod: 'cash',      status: 'paid',    date: '2024-08-31', createdBy: { _id:'u4', name:'Bilal Sheikh'} },
];

// ─── DOCUMENTS ────────────────────────────────────────────────────────────────
export const MOCK_DOCUMENTS = [
  { _id: 'd1', project: 'p1', name: 'Architectural Drawings – Rev C',  category: 'drawing',  sharedWithClient: true,  activeVersion: 2, createdBy: { _id:'u2', name:'Usman Ali' },    updatedAt: d(-10), createdAt: '2024-02-15', versions: [{ versionNumber: 1, fileUrl: '#', status: 'superseded', uploadedAt: '2024-02-10', notes: 'Initial' }, { versionNumber: 2, fileUrl: '#', status: 'issued_for_construction', uploadedAt: '2024-03-01', notes: 'Client approved' }] },
  { _id: 'd2', project: 'p1', name: 'Structural Design Drawings',      category: 'structural',sharedWithClient: true,  activeVersion: 1, createdBy: { _id:'u2', name:'Usman Ali' },    updatedAt: d(-20), createdAt: '2024-02-25', versions: [{ versionNumber: 1, fileUrl: '#', status: 'issued_for_construction', uploadedAt: '2024-02-25', notes: 'SE-stamped' }] },
  { _id: 'd3', project: 'p1', name: 'Electrical Single Line Diagram',  category: 'mep',      sharedWithClient: false, activeVersion: 1, createdBy: { _id:'u2', name:'Usman Ali' },    updatedAt: d(-30), createdAt: '2025-01-08', versions: [{ versionNumber: 1, fileUrl: '#', status: 'for_review', uploadedAt: '2025-01-08', notes: 'Pending approval' }] },
  { _id: 'd4', project: 'p1', name: 'Bill of Quantities (BOQ)',        category: 'contract', sharedWithClient: true,  activeVersion: 2, createdBy: { _id:'u1', name:'Ahmed Khan' },   updatedAt: d(-15), createdAt: '2024-02-15', versions: [{ versionNumber: 1, fileUrl: '#', status: 'superseded', uploadedAt: '2024-02-15', notes: 'Draft' }, { versionNumber: 2, fileUrl: '#', status: 'issued_for_construction', uploadedAt: '2024-03-12', notes: 'Final approved BOQ' }] },
  { _id: 'd5', project: 'p1', name: 'Site Progress Photos – Jan 2025', category: 'photo',    sharedWithClient: true,  activeVersion: 1, createdBy: { _id:'u3', name:'Sara Malik' },   updatedAt: d(-5),  createdAt: '2025-01-31', versions: [{ versionNumber: 1, fileUrl: '#', status: 'for_review', uploadedAt: '2025-01-31', notes: '24 photos' }] },
  { _id: 'd6', project: 'p2', name: 'Architectural Design – Rev B',    category: 'drawing',  sharedWithClient: true,  activeVersion: 1, createdBy: { _id:'u4', name:'Bilal Sheikh' }, updatedAt: d(-40), createdAt: '2024-05-20', versions: [{ versionNumber: 1, fileUrl: '#', status: 'issued_for_construction', uploadedAt: '2024-05-20', notes: 'Client approved' }] },
  { _id: 'd7', project: 'p2', name: 'Foundation & Piling Report',      category: 'report',   sharedWithClient: true,  activeVersion: 1, createdBy: { _id:'u4', name:'Bilal Sheikh' }, updatedAt: d(-50), createdAt: '2024-10-30', versions: [{ versionNumber: 1, fileUrl: '#', status: 'issued_for_construction', uploadedAt: '2024-10-30', notes: 'Post-piling test' }] },
];

// ─── ATTENDANCE (generate last 30 days) ──────────────────────────────────────
const genAttendance = (projectId, workerIds) => {
  const pool = ['present','present','present','present','present','half_day','absent','overtime'];
  const recs = [];
  for (let i = 0; i < 30; i++) {
    const date = new Date(); date.setDate(date.getDate() - i); date.setHours(0,0,0,0);
    if (date.getDay() === 0) continue;
    workerIds.forEach((wid, idx) => {
      recs.push({ _id: `att_${projectId}_${wid}_${i}`, project: projectId, worker: wid, date: date.toISOString(), status: pool[(i + idx) % pool.length], markedBy: 'u3' });
    });
  }
  return recs;
};
export const MOCK_ATTENDANCE = [
  ...genAttendance('p1', ['w1','w2','w3','w4','w5','w6','w7','w8','w9','w10']),
  ...genAttendance('p2', ['w1','w2','w3','w4','w5','w6','w7','w8']),
];
