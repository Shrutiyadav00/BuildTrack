// ─── IDs ────────────────────────────────────────────────────────────────────
export const IDS = {
  users:   { ahmed: 'u1', usman: 'u2', sara: 'u3', bilal: 'u4' },
  projects:{ p1: 'p1', p2: 'p2', p3: 'p3', p4: 'p4' },
};

// ─── USERS ───────────────────────────────────────────────────────────────────
export const MOCK_USERS = [
  { _id: 'u1', name: 'Ahmed Khan',   email: 'ahmed@buildtrack.com', role: 'owner',      company: 'Khan Constructions Pvt Ltd', phone: '+92 300 1234567' },
  { _id: 'u2', name: 'Usman Ali',    email: 'usman@buildtrack.com', role: 'engineer',   company: 'Khan Constructions Pvt Ltd', phone: '+92 321 9876543' },
  { _id: 'u3', name: 'Sara Malik',   email: 'sara@buildtrack.com',  role: 'supervisor', company: 'Khan Constructions Pvt Ltd', phone: '+92 333 4567890' },
  { _id: 'u4', name: 'Bilal Sheikh', email: 'bilal@buildtrack.com', role: 'engineer',   company: 'Khan Constructions Pvt Ltd', phone: '+92 345 6789012' },
  { _id: 'u5', name: 'Ali Hassan',   email: 'ali@buildtrack.com',   role: 'worker',     company: 'Khan Constructions Pvt Ltd', phone: '+92 311 1234567', workerId: 'w1' },
];

// ─── PROJECTS ─────────────────────────────────────────────────────────────────
export const MOCK_PROJECTS = [
  {
    _id: 'p1', name: 'DHA Phase 9 Luxury Villa', type: 'residential',
    description: '5-marla double storey luxury villa with basement in DHA Phase 9, Lahore. Full finishing with imported marble flooring.',
    address: 'Block C, House 142, DHA Phase 9, Lahore',
    owner: 'u1', leadEngineer: { _id: 'u2', name: 'Usman Ali', email: 'usman@buildtrack.com' },
    team: [{ _id: 'u2', name: 'Usman Ali' }, { _id: 'u3', name: 'Sara Malik' }],
    client: { name: 'Tariq Mehmood', email: 'tariq@gmail.com', phone: '+92 300 9999888' },
    budget: { total: 12500000, structure: 5000000, labour: 2800000, mep: 1800000, finishing: 1900000, misc: 1000000 },
    contractValue: 15000000, currency: 'PKR',
    startDate: '2024-03-01', endDate: '2025-07-31', completion: 62, status: 'active',
    phases: [
      { name: 'Foundation & Basement',    plannedStart: '2024-03-01', plannedEnd: '2024-05-31', status: 'completed',   completion: 100 },
      { name: 'Ground Floor Structure',   plannedStart: '2024-06-01', plannedEnd: '2024-08-31', status: 'completed',   completion: 100 },
      { name: 'First Floor Structure',    plannedStart: '2024-09-01', plannedEnd: '2024-11-30', status: 'completed',   completion: 100 },
      { name: 'Roof Slab & Parapet',      plannedStart: '2024-12-01', plannedEnd: '2025-01-31', status: 'completed',   completion: 100 },
      { name: 'MEP Rough-In',             plannedStart: '2025-01-01', plannedEnd: '2025-03-31', status: 'in_progress', completion: 70 },
      { name: 'Plastering & Finishing',   plannedStart: '2025-03-01', plannedEnd: '2025-06-30', status: 'in_progress', completion: 30 },
    ],
    clientPortalEnabled: true,
    createdAt: '2024-02-15T00:00:00.000Z',
  },
  {
    _id: 'p2', name: 'Gulberg Commercial Tower', type: 'commercial',
    description: 'G+8 commercial tower with basement parking in Gulberg III. Mixed-use development with retail on ground floor and offices above.',
    address: 'Main Boulevard, Gulberg III, Lahore',
    owner: 'u1', leadEngineer: { _id: 'u4', name: 'Bilal Sheikh', email: 'bilal@buildtrack.com' },
    team: [{ _id: 'u4', name: 'Bilal Sheikh' }, { _id: 'u2', name: 'Usman Ali' }],
    client: { name: 'Zafar Brothers Holdings', email: 'zafar@zafarbros.com', phone: '+92 42 35761234' },
    budget: { total: 45000000, structure: 18000000, labour: 9000000, mep: 8000000, finishing: 6000000, misc: 4000000 },
    contractValue: 52000000, currency: 'PKR',
    startDate: '2024-06-01', endDate: '2026-12-31', completion: 38, status: 'active',
    phases: [
      { name: 'Piling & Foundation',  plannedStart: '2024-06-01', plannedEnd: '2024-09-30', status: 'completed',   completion: 100 },
      { name: 'Basement & Podium',    plannedStart: '2024-10-01', plannedEnd: '2025-03-31', status: 'in_progress', completion: 65 },
      { name: 'Ground to 4th Floor',  plannedStart: '2025-03-01', plannedEnd: '2025-09-30', status: 'pending',     completion: 0 },
      { name: '5th to 8th Floor',     plannedStart: '2025-09-01', plannedEnd: '2026-03-31', status: 'pending',     completion: 0 },
      { name: 'MEP & Façade',         plannedStart: '2026-02-01', plannedEnd: '2026-09-30', status: 'pending',     completion: 0 },
      { name: 'Finishing & Handover', plannedStart: '2026-08-01', plannedEnd: '2026-12-31', status: 'pending',     completion: 0 },
    ],
    clientPortalEnabled: false,
    createdAt: '2024-05-10T00:00:00.000Z',
  },
  {
    _id: 'p3', name: 'F-10 Apartment Complex', type: 'residential',
    description: 'A 12-unit luxury apartment complex in F-10, Islamabad. Each unit is 3-bed with modern amenities and covered parking.',
    address: 'Street 7, F-10/3, Islamabad',
    owner: 'u1', leadEngineer: { _id: 'u2', name: 'Usman Ali', email: 'usman@buildtrack.com' },
    team: [{ _id: 'u2', name: 'Usman Ali' }],
    client: { name: 'Capital Developers', email: 'info@capitaldevelop.com', phone: '+92 51 2878765' },
    budget: { total: 28000000, structure: 11000000, labour: 6500000, mep: 4500000, finishing: 4000000, misc: 2000000 },
    contractValue: 33000000, currency: 'PKR',
    startDate: '2025-04-01', endDate: '2027-03-31', completion: 0, status: 'planning',
    phases: [
      { name: 'Site Clearance & Leveling', plannedStart: '2025-04-01', plannedEnd: '2025-04-30', status: 'pending', completion: 0 },
      { name: 'Foundation Work',           plannedStart: '2025-05-01', plannedEnd: '2025-08-31', status: 'pending', completion: 0 },
      { name: 'Structural Work',           plannedStart: '2025-08-01', plannedEnd: '2026-06-30', status: 'pending', completion: 0 },
      { name: 'MEP Installation',          plannedStart: '2026-05-01', plannedEnd: '2026-10-31', status: 'pending', completion: 0 },
      { name: 'Finishing & Handover',      plannedStart: '2026-10-01', plannedEnd: '2027-03-31', status: 'pending', completion: 0 },
    ],
    clientPortalEnabled: false,
    createdAt: '2025-02-20T00:00:00.000Z',
  },
  {
    _id: 'p4', name: 'Port Qasim Industrial Warehouse', type: 'industrial',
    description: 'A 40,000 sq ft temperature-controlled industrial warehouse near Port Qasim, Karachi.',
    address: 'Plot 22, Industrial Zone, Port Qasim, Karachi',
    owner: 'u1', leadEngineer: { _id: 'u4', name: 'Bilal Sheikh', email: 'bilal@buildtrack.com' },
    team: [{ _id: 'u4', name: 'Bilal Sheikh' }],
    client: { name: 'Alpha Logistics Ltd', email: 'ops@alphalogistics.pk', phone: '+92 21 34571234' },
    budget: { total: 8500000, structure: 3500000, labour: 2000000, mep: 1500000, finishing: 800000, misc: 700000 },
    contractValue: 9800000, currency: 'PKR',
    startDate: '2023-09-01', endDate: '2024-08-31', completion: 100, status: 'completed',
    phases: [
      { name: 'Foundation',          status: 'completed', completion: 100 },
      { name: 'Steel Frame',         status: 'completed', completion: 100 },
      { name: 'Cladding & Roofing',  status: 'completed', completion: 100 },
      { name: 'MEP & Finishing',     status: 'completed', completion: 100 },
    ],
    clientPortalEnabled: false,
    createdAt: '2023-08-01T00:00:00.000Z',
  },
];

// ─── WORKERS ─────────────────────────────────────────────────────────────────
export const MOCK_WORKERS = [
  { _id: 'w1',  name: 'Ali Hassan',      trade: 'mason',       payType: 'daily',   rate: 1800,  currency: 'PKR', phone: '+92 311 1234567', cnic: '35202-1234567-1', isActive: true, joinDate: '2024-01-15', projects: ['p1','p2'], userId: 'u5' },
  { _id: 'w2',  name: 'Abdul Qadir',     trade: 'mason',       payType: 'daily',   rate: 1800,  currency: 'PKR', phone: '+92 312 1111002', cnic: '35202-2234567-2', isActive: true, joinDate: '2024-01-15', projects: ['p1','p2'] },
  { _id: 'w3',  name: 'Nasir Ahmed',     trade: 'electrician', payType: 'daily',   rate: 2200,  currency: 'PKR', phone: '+92 312 1111003', cnic: '35202-3334567-3', isActive: true, joinDate: '2024-02-01', projects: ['p1','p2'] },
  { _id: 'w4',  name: 'Amjad Khan',      trade: 'plumber',     payType: 'daily',   rate: 2000,  currency: 'PKR', phone: '+92 312 1111004', cnic: '35202-4434567-4', isActive: true, joinDate: '2024-02-01', projects: ['p1','p2'] },
  { _id: 'w5',  name: 'Shahzad Ali',     trade: 'steel_fixer', payType: 'daily',   rate: 2100,  currency: 'PKR', phone: '+92 312 1111005', cnic: '35202-5534567-5', isActive: true, joinDate: '2024-03-01', projects: ['p1','p2'] },
  { _id: 'w6',  name: 'Farhan Mehmood',  trade: 'steel_fixer', payType: 'daily',   rate: 2100,  currency: 'PKR', phone: '+92 312 1111006', cnic: '35202-6634567-6', isActive: true, joinDate: '2024-03-01', projects: ['p1','p2'] },
  { _id: 'w7',  name: 'Aslam Khan',      trade: 'helper',      payType: 'daily',   rate: 1200,  currency: 'PKR', phone: '+92 312 1111007', cnic: '35202-7734567-7', isActive: true, joinDate: '2024-01-20', projects: ['p1','p2'] },
  { _id: 'w8',  name: 'Zubair Ahmed',    trade: 'helper',      payType: 'daily',   rate: 1200,  currency: 'PKR', phone: '+92 312 1111008', cnic: '35202-8834567-8', isActive: true, joinDate: '2024-01-20', projects: ['p1','p2'] },
  { _id: 'w9',  name: 'Imran Butt',      trade: 'carpenter',   payType: 'daily',   rate: 2000,  currency: 'PKR', phone: '+92 312 1111009', cnic: '35202-9934567-9', isActive: true, joinDate: '2024-04-10', projects: ['p1'] },
  { _id: 'w10', name: 'Naveed Hussain',  trade: 'painter',     payType: 'daily',   rate: 1700,  currency: 'PKR', phone: '+92 312 1111010', cnic: '35202-1034567-0', isActive: true, joinDate: '2025-01-01', projects: ['p1'] },
  { _id: 'w11', name: 'Rashid Mahmood',  trade: 'driver',      payType: 'monthly', rate: 35000, currency: 'PKR', phone: '+92 312 1111011', cnic: '35202-1134567-1', isActive: true, joinDate: '2024-01-10', projects: ['p1','p2'] },
  { _id: 'w12', name: 'Hamid Ali',       trade: 'mason',       payType: 'daily',   rate: 1850,  currency: 'PKR', phone: '+92 312 1111012', cnic: '35202-1234568-2', isActive: true, joinDate: '2024-03-15', projects: ['p1','p2'] },
];

// ─── TASKS ────────────────────────────────────────────────────────────────────
const d = (days) => { const dt = new Date(); dt.setDate(dt.getDate() + days); return dt.toISOString(); };
export const MOCK_TASKS = [
  // Project 1
  { _id: 't1',  project: 'p1', title: 'Foundation & Basement Work',     phase: 'Foundation & Basement',  priority: 'high',     status: 'completed',       assignedTo: { _id:'u2', name:'Usman Ali' }, createdBy: { _id:'u1', name:'Ahmed Khan' }, dueDate: d(-120), completedAt: d(-115) },
  { _id: 't2',  project: 'p1', title: 'Ground Floor Columns & Beams',   phase: 'Ground Floor Structure', priority: 'high',     status: 'completed',       assignedTo: { _id:'u2', name:'Usman Ali' }, createdBy: { _id:'u1', name:'Ahmed Khan' }, dueDate: d(-90),  completedAt: d(-85) },
  { _id: 't3',  project: 'p1', title: 'Ground Floor Slab Casting',      phase: 'Ground Floor Structure', priority: 'high',     status: 'completed',       assignedTo: { _id:'u3', name:'Sara Malik' }, createdBy: { _id:'u1', name:'Ahmed Khan' }, dueDate: d(-80),  completedAt: d(-78) },
  { _id: 't4',  project: 'p1', title: 'First Floor Structure',          phase: 'First Floor Structure',  priority: 'high',     status: 'completed',       assignedTo: { _id:'u2', name:'Usman Ali' }, createdBy: { _id:'u1', name:'Ahmed Khan' }, dueDate: d(-50),  completedAt: d(-48) },
  { _id: 't5',  project: 'p1', title: 'Roof Slab Casting',              phase: 'Roof Slab & Parapet',    priority: 'high',     status: 'completed',       assignedTo: { _id:'u2', name:'Usman Ali' }, createdBy: { _id:'u1', name:'Ahmed Khan' }, dueDate: d(-20),  completedAt: d(-18) },
  { _id: 't6',  project: 'p1', title: 'Electrical Conduit Laying',      phase: 'MEP Rough-In',           priority: 'high',     status: 'in_progress',     assignedTo: { _id:'u2', name:'Usman Ali' }, createdBy: { _id:'u1', name:'Ahmed Khan' }, dueDate: d(10) },
  { _id: 't7',  project: 'p1', title: 'Plumbing Rough-In',              phase: 'MEP Rough-In',           priority: 'high',     status: 'in_progress',     assignedTo: { _id:'u3', name:'Sara Malik' }, createdBy: { _id:'u1', name:'Ahmed Khan' }, dueDate: d(15) },
  { _id: 't8',  project: 'p1', title: 'Internal Plastering – Ground',   phase: 'Plastering & Finishing', priority: 'medium',   status: 'open',            assignedTo: { _id:'u3', name:'Sara Malik' }, createdBy: { _id:'u1', name:'Ahmed Khan' }, dueDate: d(30) },
  { _id: 't9',  project: 'p1', title: 'External Plaster & Paint',       phase: 'Plastering & Finishing', priority: 'medium',   status: 'open',            assignedTo: { _id:'u2', name:'Usman Ali' }, createdBy: { _id:'u1', name:'Ahmed Khan' }, dueDate: d(45) },
  { _id: 't10', project: 'p1', title: 'Floor Tile Work – Ground Floor', phase: 'Plastering & Finishing', priority: 'medium',   status: 'open',            assignedTo: { _id:'u3', name:'Sara Malik' }, createdBy: { _id:'u1', name:'Ahmed Khan' }, dueDate: d(60) },
  { _id: 't11', project: 'p1', title: 'HVAC System Installation',       phase: 'MEP Rough-In',           priority: 'medium',   status: 'open',            assignedTo: { _id:'u2', name:'Usman Ali' }, createdBy: { _id:'u1', name:'Ahmed Khan' }, dueDate: d(50) },
  { _id: 't12', project: 'p1', title: 'Main Gate & Boundary Wall',      phase: 'Plastering & Finishing', priority: 'low',      status: 'open',            assignedTo: { _id:'u3', name:'Sara Malik' }, createdBy: { _id:'u1', name:'Ahmed Khan' }, dueDate: d(75) },
  // Project 2
  { _id: 't13', project: 'p2', title: 'Piling Work',                    phase: 'Piling & Foundation',    priority: 'critical', status: 'completed',       assignedTo: { _id:'u4', name:'Bilal Sheikh' }, createdBy: { _id:'u1', name:'Ahmed Khan' }, dueDate: d(-140), completedAt: d(-135) },
  { _id: 't14', project: 'p2', title: 'Pile Caps & Grade Beams',        phase: 'Piling & Foundation',    priority: 'critical', status: 'completed',       assignedTo: { _id:'u4', name:'Bilal Sheikh' }, createdBy: { _id:'u1', name:'Ahmed Khan' }, dueDate: d(-100), completedAt: d(-95) },
  { _id: 't15', project: 'p2', title: 'Basement B1 Slab',               phase: 'Basement & Podium',      priority: 'high',     status: 'completed',       assignedTo: { _id:'u4', name:'Bilal Sheikh' }, createdBy: { _id:'u1', name:'Ahmed Khan' }, dueDate: d(-60),  completedAt: d(-55) },
  { _id: 't16', project: 'p2', title: 'Basement B2 Slab',               phase: 'Basement & Podium',      priority: 'high',     status: 'completed',       assignedTo: { _id:'u2', name:'Usman Ali' }, createdBy: { _id:'u1', name:'Ahmed Khan' }, dueDate: d(-30),  completedAt: d(-28) },
  { _id: 't17', project: 'p2', title: 'Ground Floor Columns',           phase: 'Basement & Podium',      priority: 'high',     status: 'in_progress',     assignedTo: { _id:'u4', name:'Bilal Sheikh' }, createdBy: { _id:'u1', name:'Ahmed Khan' }, dueDate: d(20) },
  { _id: 't18', project: 'p2', title: 'Ground Floor Slab',              phase: 'Basement & Podium',      priority: 'high',     status: 'open',            assignedTo: { _id:'u4', name:'Bilal Sheikh' }, createdBy: { _id:'u1', name:'Ahmed Khan' }, dueDate: d(40) },
  { _id: 't19', project: 'p2', title: 'Podium Façade Design Approval',  phase: 'Basement & Podium',      priority: 'medium',   status: 'pending_approval',assignedTo: { _id:'u2', name:'Usman Ali' }, createdBy: { _id:'u1', name:'Ahmed Khan' }, dueDate: d(7) },
  { _id: 't20', project: 'p2', title: 'Fire Fighting Riser Installation',phase:'MEP & Façade',           priority: 'medium',   status: 'open',            assignedTo: { _id:'u4', name:'Bilal Sheikh' }, createdBy: { _id:'u1', name:'Ahmed Khan' }, dueDate: d(180) },
];

// ─── TRANSACTIONS ─────────────────────────────────────────────────────────────
export const MOCK_TRANSACTIONS = [
  // Project 1
  { _id: 'tx1',  project: 'p1', type: 'client_receipt',    category: 'misc',      amount: 4500000, description: '30% advance payment on contract signing',           paymentMethod: 'bank',     status: 'paid',    date: '2024-03-05', createdBy: { _id:'u1', name:'Ahmed Khan' } },
  { _id: 'tx2',  project: 'p1', type: 'client_receipt',    category: 'misc',      amount: 3000000, description: '20% second installment – structure completion',      paymentMethod: 'cheque',   status: 'paid',    date: '2024-12-20', createdBy: { _id:'u1', name:'Ahmed Khan' } },
  { _id: 'tx3',  project: 'p1', type: 'material_purchase', category: 'structure', amount: 580000,  description: 'OPC Cement – 1000 bags (Maple Leaf)',                paymentMethod: 'bank',     status: 'paid',    date: '2024-03-15', vendor: 'Maple Leaf Cement',    invoiceNo: 'MLC-2024-0312', createdBy: { _id:'u2', name:'Usman Ali' } },
  { _id: 'tx4',  project: 'p1', type: 'material_purchase', category: 'structure', amount: 420000,  description: 'Steel Bars Grade 60 – 10 tons (Ittefaq)',            paymentMethod: 'cheque',   status: 'paid',    date: '2024-03-18', vendor: 'Ittefaq Steel Mills',  invoiceNo: 'ISM-7741',       createdBy: { _id:'u2', name:'Usman Ali' } },
  { _id: 'tx5',  project: 'p1', type: 'material_purchase', category: 'structure', amount: 210000,  description: 'Red Clay Bricks – 50,000 units',                     paymentMethod: 'cash',     status: 'paid',    date: '2024-04-10', vendor: 'Bhopal Brick Kiln',    invoiceNo: 'BBK-0091',       createdBy: { _id:'u3', name:'Sara Malik' } },
  { _id: 'tx6',  project: 'p1', type: 'material_purchase', category: 'structure', amount: 95000,   description: 'Crush, Sand & Bajri – 3 trips',                      paymentMethod: 'cash',     status: 'paid',    date: '2024-04-22', vendor: 'Punjab Aggregates',    invoiceNo: 'PA-441',         createdBy: { _id:'u3', name:'Sara Malik' } },
  { _id: 'tx7',  project: 'p1', type: 'material_purchase', category: 'structure', amount: 340000,  description: 'Cement – 600 bags for first floor slab',             paymentMethod: 'bank',     status: 'paid',    date: '2024-09-12', vendor: 'Maple Leaf Cement',    invoiceNo: 'MLC-2024-0891',  createdBy: { _id:'u2', name:'Usman Ali' } },
  { _id: 'tx8',  project: 'p1', type: 'material_purchase', category: 'mep',       amount: 185000,  description: 'Electrical conduit, wires & boxes – GFS brand',      paymentMethod: 'cash',     status: 'paid',    date: '2025-01-15', vendor: 'National Electric Supplies', invoiceNo: 'NES-3301', createdBy: { _id:'u2', name:'Usman Ali' } },
  { _id: 'tx9',  project: 'p1', type: 'material_purchase', category: 'mep',       amount: 142000,  description: 'PVC plumbing pipes, joints & fittings',              paymentMethod: 'cash',     status: 'paid',    date: '2025-01-20', vendor: 'Master Pipes & Fittings', invoiceNo: 'MPF-8812', createdBy: { _id:'u3', name:'Sara Malik' } },
  { _id: 'tx10', project: 'p1', type: 'material_purchase', category: 'finishing', amount: 480000,  description: 'Imported marble tiles – 2000 sqft (Italian Carrara)', paymentMethod: 'bank',     status: 'pending', date: '2025-02-10', vendor: 'Marble World Lahore',   invoiceNo: 'MWL-2025-441',   createdBy: { _id:'u1', name:'Ahmed Khan' } },
  { _id: 'tx11', project: 'p1', type: 'labour_payment',    category: 'labour',    amount: 285000,  description: 'Labour wages – March 2024 (foundation team)',        paymentMethod: 'cash',     status: 'paid',    date: '2024-03-31', createdBy: { _id:'u3', name:'Sara Malik' } },
  { _id: 'tx12', project: 'p1', type: 'labour_payment',    category: 'labour',    amount: 295000,  description: 'Labour wages – April 2024',                          paymentMethod: 'cash',     status: 'paid',    date: '2024-04-30', createdBy: { _id:'u3', name:'Sara Malik' } },
  { _id: 'tx13', project: 'p1', type: 'labour_payment',    category: 'labour',    amount: 310000,  description: 'Labour wages – May 2024',                            paymentMethod: 'cash',     status: 'paid',    date: '2024-05-31', createdBy: { _id:'u3', name:'Sara Malik' } },
  { _id: 'tx14', project: 'p1', type: 'advance',           category: 'labour',    amount: 25000,   description: 'Advance payment – Nasir Ahmed (electrician)',        paymentMethod: 'easypaisa',status: 'paid',    date: '2025-01-12', createdBy: { _id:'u3', name:'Sara Malik' } },
  { _id: 'tx15', project: 'p1', type: 'misc_expense',      category: 'misc',      amount: 38000,   description: 'Site office rental – 3 months',                      paymentMethod: 'cash',     status: 'paid',    date: '2024-03-01', createdBy: { _id:'u1', name:'Ahmed Khan' } },
  { _id: 'tx16', project: 'p1', type: 'misc_expense',      category: 'misc',      amount: 18500,   description: 'Safety equipment – helmets, gloves, harnesses',      paymentMethod: 'cash',     status: 'paid',    date: '2024-03-05', vendor: 'SafetyFirst Pakistan', invoiceNo: 'SF-2024-119', createdBy: { _id:'u3', name:'Sara Malik' } },
  // Project 2
  { _id: 'tx17', project: 'p2', type: 'client_receipt',    category: 'misc',      amount: 15600000,description: '30% advance – Gulberg Tower project commencement',    paymentMethod: 'bank',     status: 'paid',    date: '2024-06-10', createdBy: { _id:'u1', name:'Ahmed Khan' } },
  { _id: 'tx18', project: 'p2', type: 'client_receipt',    category: 'misc',      amount: 10400000,description: '20% on completion of piling works',                  paymentMethod: 'cheque',   status: 'paid',    date: '2024-10-25', createdBy: { _id:'u1', name:'Ahmed Khan' } },
  { _id: 'tx19', project: 'p2', type: 'material_purchase', category: 'structure', amount: 1850000, description: 'Piling contractor – 28 bored piles, 18m depth',      paymentMethod: 'bank',     status: 'paid',    date: '2024-06-20', vendor: 'Foundation Engineers Ltd', invoiceNo: 'FEL-2024-330', createdBy: { _id:'u4', name:'Bilal Sheikh' } },
  { _id: 'tx20', project: 'p2', type: 'material_purchase', category: 'structure', amount: 1240000, description: 'High-strength cement – 2000 bags (53-grade)',         paymentMethod: 'bank',     status: 'paid',    date: '2024-07-11', vendor: 'Lucky Cement',          invoiceNo: 'LC-20240711',    createdBy: { _id:'u4', name:'Bilal Sheikh' } },
  { _id: 'tx21', project: 'p2', type: 'material_purchase', category: 'structure', amount: 2100000, description: 'High-tensile steel – 50 tons (Grade 500)',            paymentMethod: 'cheque',   status: 'paid',    date: '2024-07-25', vendor: 'Pakistan Steel',        invoiceNo: 'PS-7761',         createdBy: { _id:'u4', name:'Bilal Sheikh' } },
  { _id: 'tx22', project: 'p2', type: 'labour_payment',    category: 'labour',    amount: 680000,  description: 'Labour wages – July 2024 (piling & foundation team)',  paymentMethod: 'cash',     status: 'paid',    date: '2024-07-31', createdBy: { _id:'u4', name:'Bilal Sheikh' } },
  { _id: 'tx23', project: 'p2', type: 'labour_payment',    category: 'labour',    amount: 720000,  description: 'Labour wages – August 2024',                         paymentMethod: 'cash',     status: 'paid',    date: '2024-08-31', createdBy: { _id:'u4', name:'Bilal Sheikh' } },
];

// ─── DOCUMENTS ────────────────────────────────────────────────────────────────
export const MOCK_DOCUMENTS = [
  { _id: 'd1', project: 'p1', name: 'Architectural Drawings – Rev C',  category: 'drawing',    sharedWithClient: true,  activeVersion: 2, createdBy: { _id:'u2', name:'Usman Ali' },   createdAt: '2024-02-15', versions: [{ versionNumber: 1, fileName: 'arch_rev_A.pdf', fileSize: 4200000, status: 'superseded',              uploadedAt: '2024-02-10', notes: 'Initial submission' }, { versionNumber: 2, fileName: 'arch_rev_C.pdf', fileSize: 5100000, status: 'issued_for_construction',  uploadedAt: '2024-03-01', notes: 'Client approved Rev C' }] },
  { _id: 'd2', project: 'p1', name: 'Structural Design Drawings',       category: 'structural', sharedWithClient: true,  activeVersion: 1, createdBy: { _id:'u2', name:'Usman Ali' },   createdAt: '2024-02-25', versions: [{ versionNumber: 1, fileName: 'structural_v1.pdf', fileSize: 8300000, status: 'issued_for_construction', uploadedAt: '2024-02-25', notes: 'SE-stamped drawings' }] },
  { _id: 'd3', project: 'p1', name: 'Electrical Single Line Diagram',   category: 'mep',        sharedWithClient: false, activeVersion: 1, createdBy: { _id:'u2', name:'Usman Ali' },   createdAt: '2025-01-08', versions: [{ versionNumber: 1, fileName: 'electrical_sld.pdf', fileSize: 2100000, status: 'for_review', uploadedAt: '2025-01-08', notes: 'Pending WAPDA approval' }] },
  { _id: 'd4', project: 'p1', name: 'Bill of Quantities (BOQ)',         category: 'boq',        sharedWithClient: true,  activeVersion: 2, createdBy: { _id:'u1', name:'Ahmed Khan' }, createdAt: '2024-02-15', versions: [{ versionNumber: 1, fileName: 'boq_v1.xlsx', fileSize: 310000, status: 'superseded', uploadedAt: '2024-02-15', notes: 'Draft BOQ' }, { versionNumber: 2, fileName: 'boq_v2.xlsx', fileSize: 345000, status: 'issued_for_construction', uploadedAt: '2024-03-12', notes: 'Final approved BOQ' }] },
  { _id: 'd5', project: 'p1', name: 'Site Photographs – Jan 2025',      category: 'photo',      sharedWithClient: true,  activeVersion: 1, createdBy: { _id:'u3', name:'Sara Malik' },  createdAt: '2025-01-31', versions: [{ versionNumber: 1, fileName: 'site_photos_jan25.zip', fileSize: 45000000, status: 'for_review', uploadedAt: '2025-01-31', notes: '24 progress photos' }] },
  { _id: 'd6', project: 'p2', name: 'Architectural Design – Rev B',     category: 'drawing',    sharedWithClient: true,  activeVersion: 1, createdBy: { _id:'u4', name:'Bilal Sheikh' }, createdAt: '2024-05-20', versions: [{ versionNumber: 1, fileName: 'arch_tower_B.pdf', fileSize: 7800000, status: 'issued_for_construction', uploadedAt: '2024-05-20', notes: 'Client approved after workshop' }] },
  { _id: 'd7', project: 'p2', name: 'Foundation & Piling Report',       category: 'structural', sharedWithClient: true,  activeVersion: 1, createdBy: { _id:'u4', name:'Bilal Sheikh' }, createdAt: '2024-10-30', versions: [{ versionNumber: 1, fileName: 'piling_report.pdf', fileSize: 3200000, status: 'issued_for_construction', uploadedAt: '2024-10-30', notes: 'Post-piling test – all passed' }] },
  { _id: 'd8', project: 'p2', name: 'Contractor Agreement – Gulberg',   category: 'contract',   sharedWithClient: false, activeVersion: 1, createdBy: { _id:'u1', name:'Ahmed Khan' }, createdAt: '2024-05-30', versions: [{ versionNumber: 1, fileName: 'contract_signed.pdf', fileSize: 1800000, status: 'issued_for_construction', uploadedAt: '2024-05-30', notes: 'Signed by both parties' }] },
  { _id: 'd9', project: 'p3', name: 'F-10 Concept Design',              category: 'drawing',    sharedWithClient: true,  activeVersion: 1, createdBy: { _id:'u2', name:'Usman Ali' },   createdAt: '2025-03-15', versions: [{ versionNumber: 1, fileName: 'concept_design.pdf', fileSize: 5600000, status: 'for_review', uploadedAt: '2025-03-15', notes: 'Concept for client review' }] },
  { _id: 'd10',project: 'p4', name: 'Completion & Handover Certificate',category: 'inspection', sharedWithClient: true,  activeVersion: 1, createdBy: { _id:'u4', name:'Bilal Sheikh' }, createdAt: '2024-09-01', versions: [{ versionNumber: 1, fileName: 'handover_cert.pdf', fileSize: 980000, status: 'issued_for_construction', uploadedAt: '2024-09-01', notes: 'Signed handover certificate' }] },
];

// ─── ATTENDANCE (generate last 30 days) ──────────────────────────────────────
const genAttendance = (projectId, workerIds) => {
  const statusPool = ['present','present','present','present','present','half_day','absent','overtime'];
  const records = [];
  for (let i = 0; i < 30; i++) {
    const date = new Date(); date.setDate(date.getDate() - i); date.setHours(0,0,0,0);
    if (date.getDay() === 0) continue;
    workerIds.forEach((wid, idx) => {
      const status = statusPool[(i + idx) % statusPool.length];
      records.push({ _id: `att_${projectId}_${wid}_${i}`, project: projectId, worker: wid, date: date.toISOString(), status, markedBy: 'u3' });
    });
  }
  return records;
};
export const MOCK_ATTENDANCE = [
  ...genAttendance('p1', ['w1','w2','w3','w4','w5','w6','w7','w8','w9','w10']),
  ...genAttendance('p2', ['w1','w2','w3','w4','w5','w6','w7','w8']),
];
