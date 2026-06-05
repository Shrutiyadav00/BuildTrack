require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Worker = require('../models/Worker');
const Attendance = require('../models/Attendance');
const Transaction = require('../models/Transaction');
const Document = require('../models/Document');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ MongoDB connected');
};

const seed = async () => {
  await connectDB();

  // Clear all collections
  await Promise.all([
    User.deleteMany({}), Project.deleteMany({}), Task.deleteMany({}),
    Worker.deleteMany({}), Attendance.deleteMany({}),
    Transaction.deleteMany({}), Document.deleteMany({})
  ]);
  console.log('🗑  Cleared existing data');

  // ─── USERS ─────────────────────────────────────────────────────────────────
  const [ahmed, usman, sara, bilal] = await User.create([
    { name: 'Ahmed Khan',   email: 'ahmed@buildtrack.com',  password: 'password123', role: 'owner',      company: 'Khan Constructions Pvt Ltd', phone: '+92 300 1234567' },
    { name: 'Usman Ali',    email: 'usman@buildtrack.com',  password: 'password123', role: 'engineer',   company: 'Khan Constructions Pvt Ltd', phone: '+92 321 9876543' },
    { name: 'Sara Malik',   email: 'sara@buildtrack.com',   password: 'password123', role: 'supervisor', company: 'Khan Constructions Pvt Ltd', phone: '+92 333 4567890' },
    { name: 'Bilal Sheikh', email: 'bilal@buildtrack.com',  password: 'password123', role: 'engineer',   company: 'Khan Constructions Pvt Ltd', phone: '+92 345 6789012' },
  ]);
  console.log('👤 Users created');

  // ─── PROJECTS ───────────────────────────────────────────────────────────────
  const [proj1, proj2, proj3, proj4] = await Project.create([
    {
      name: 'DHA Phase 9 Luxury Villa',
      type: 'residential',
      description: '5-marla double storey luxury villa with basement in DHA Phase 9, Lahore. Full finishing with imported marble flooring.',
      address: 'Block C, House 142, DHA Phase 9, Lahore',
      location: { lat: 31.4504, lng: 74.4025 },
      owner: ahmed._id, leadEngineer: usman._id, team: [usman._id, sara._id],
      client: { name: 'Tariq Mehmood', email: 'tariq@gmail.com', phone: '+92 300 9999888' },
      budget: { total: 12500000, structure: 5000000, labour: 2800000, mep: 1800000, finishing: 1900000, misc: 1000000 },
      contractValue: 15000000, currency: 'PKR',
      startDate: new Date('2024-03-01'), endDate: new Date('2025-07-31'),
      completion: 62, status: 'active',
      phases: [
        { name: 'Foundation & Basement', plannedStart: new Date('2024-03-01'), plannedEnd: new Date('2024-05-31'), actualStart: new Date('2024-03-05'), actualEnd: new Date('2024-06-10'), status: 'completed', completion: 100 },
        { name: 'Ground Floor Structure', plannedStart: new Date('2024-06-01'), plannedEnd: new Date('2024-08-31'), actualStart: new Date('2024-06-12'), actualEnd: new Date('2024-09-05'), status: 'completed', completion: 100 },
        { name: 'First Floor Structure',  plannedStart: new Date('2024-09-01'), plannedEnd: new Date('2024-11-30'), actualStart: new Date('2024-09-08'), status: 'completed', completion: 100 },
        { name: 'Roof Slab & Parapet',    plannedStart: new Date('2024-12-01'), plannedEnd: new Date('2025-01-31'), actualStart: new Date('2024-12-03'), status: 'completed', completion: 100 },
        { name: 'MEP Rough-In',           plannedStart: new Date('2025-01-01'), plannedEnd: new Date('2025-03-31'), actualStart: new Date('2025-01-10'), status: 'in_progress', completion: 70 },
        { name: 'Plastering & Finishing', plannedStart: new Date('2025-03-01'), plannedEnd: new Date('2025-06-30'), status: 'in_progress', completion: 30 },
      ],
      clientPortalEnabled: true,
    },
    {
      name: 'Gulberg Commercial Tower',
      type: 'commercial',
      description: 'G+8 commercial tower with basement parking in Gulberg III. Mixed-use development with retail on ground floor and offices above.',
      address: 'Main Boulevard, Gulberg III, Lahore',
      location: { lat: 31.5204, lng: 74.3587 },
      owner: ahmed._id, leadEngineer: bilal._id, team: [bilal._id, usman._id],
      client: { name: 'Zafar Brothers Holdings', email: 'zafar@zafarbros.com', phone: '+92 42 35761234' },
      budget: { total: 45000000, structure: 18000000, labour: 9000000, mep: 8000000, finishing: 6000000, misc: 4000000 },
      contractValue: 52000000, currency: 'PKR',
      startDate: new Date('2024-06-01'), endDate: new Date('2026-12-31'),
      completion: 38, status: 'active',
      phases: [
        { name: 'Piling & Foundation',    plannedStart: new Date('2024-06-01'), plannedEnd: new Date('2024-09-30'), actualStart: new Date('2024-06-05'), actualEnd: new Date('2024-10-15'), status: 'completed', completion: 100 },
        { name: 'Basement & Podium',      plannedStart: new Date('2024-10-01'), plannedEnd: new Date('2025-03-31'), actualStart: new Date('2024-10-18'), status: 'in_progress', completion: 65 },
        { name: 'Ground to 4th Floor',    plannedStart: new Date('2025-03-01'), plannedEnd: new Date('2025-09-30'), status: 'pending', completion: 0 },
        { name: '5th to 8th Floor',       plannedStart: new Date('2025-09-01'), plannedEnd: new Date('2026-03-31'), status: 'pending', completion: 0 },
        { name: 'MEP & Façade',           plannedStart: new Date('2026-02-01'), plannedEnd: new Date('2026-09-30'), status: 'pending', completion: 0 },
        { name: 'Finishing & Handover',   plannedStart: new Date('2026-08-01'), plannedEnd: new Date('2026-12-31'), status: 'pending', completion: 0 },
      ],
    },
    {
      name: 'F-10 Apartment Complex',
      type: 'residential',
      description: 'A 12-unit luxury apartment complex in F-10, Islamabad. Each unit is 3-bed with modern amenities and covered parking.',
      address: 'Street 7, F-10/3, Islamabad',
      location: { lat: 33.6844, lng: 73.0479 },
      owner: ahmed._id, leadEngineer: usman._id,
      client: { name: 'Capital Developers', email: 'info@capitaldevelop.com', phone: '+92 51 2878765' },
      budget: { total: 28000000, structure: 11000000, labour: 6500000, mep: 4500000, finishing: 4000000, misc: 2000000 },
      contractValue: 33000000, currency: 'PKR',
      startDate: new Date('2025-04-01'), endDate: new Date('2027-03-31'),
      completion: 0, status: 'planning',
      phases: [
        { name: 'Site Clearance & Leveling', plannedStart: new Date('2025-04-01'), plannedEnd: new Date('2025-04-30'), status: 'pending', completion: 0 },
        { name: 'Foundation Work',           plannedStart: new Date('2025-05-01'), plannedEnd: new Date('2025-08-31'), status: 'pending', completion: 0 },
        { name: 'Structural Work',           plannedStart: new Date('2025-08-01'), plannedEnd: new Date('2026-06-30'), status: 'pending', completion: 0 },
        { name: 'MEP Installation',          plannedStart: new Date('2026-05-01'), plannedEnd: new Date('2026-10-31'), status: 'pending', completion: 0 },
        { name: 'Finishing & Handover',      plannedStart: new Date('2026-10-01'), plannedEnd: new Date('2027-03-31'), status: 'pending', completion: 0 },
      ],
    },
    {
      name: 'Port Qasim Industrial Warehouse',
      type: 'industrial',
      description: 'A 40,000 sq ft temperature-controlled industrial warehouse near Port Qasim, Karachi. Includes loading docks and office block.',
      address: 'Plot 22, Industrial Zone, Port Qasim, Karachi',
      location: { lat: 24.7832, lng: 67.3264 },
      owner: ahmed._id, leadEngineer: bilal._id,
      client: { name: 'Alpha Logistics Ltd', email: 'ops@alphalogistics.pk', phone: '+92 21 34571234' },
      budget: { total: 8500000, structure: 3500000, labour: 2000000, mep: 1500000, finishing: 800000, misc: 700000 },
      contractValue: 9800000, currency: 'PKR',
      startDate: new Date('2023-09-01'), endDate: new Date('2024-08-31'),
      completion: 100, status: 'completed',
      phases: [
        { name: 'Foundation',  plannedStart: new Date('2023-09-01'), plannedEnd: new Date('2023-11-30'), actualStart: new Date('2023-09-05'), actualEnd: new Date('2023-11-28'), status: 'completed', completion: 100 },
        { name: 'Steel Frame', plannedStart: new Date('2023-11-01'), plannedEnd: new Date('2024-02-28'), actualStart: new Date('2023-12-01'), actualEnd: new Date('2024-03-05'), status: 'completed', completion: 100 },
        { name: 'Cladding & Roofing', plannedStart: new Date('2024-02-01'), plannedEnd: new Date('2024-04-30'), actualStart: new Date('2024-03-08'), actualEnd: new Date('2024-05-10'), status: 'completed', completion: 100 },
        { name: 'MEP & Finishing', plannedStart: new Date('2024-05-01'), plannedEnd: new Date('2024-08-31'), actualStart: new Date('2024-05-12'), actualEnd: new Date('2024-08-28'), status: 'completed', completion: 100 },
      ],
    },
  ]);
  console.log('🏗  Projects created');

  // ─── WORKER USERS (for login) ──────────────────────────────────────────────
  const [workerUser1, workerUser2] = await User.create([
    { name: 'Muhammad Rafiq', email: 'rafiq@buildtrack.com',  password: 'password123', role: 'worker', phone: '+91 98765 43210' },
    { name: 'Nasir Ahmed',    email: 'nasir@buildtrack.com',  password: 'password123', role: 'worker', phone: '+91 98765 43212' },
  ]);
  console.log('👷 Worker users created');

  // ─── WORKERS ────────────────────────────────────────────────────────────────
  const workerData = [
    { name: 'Muhammad Rafiq',   trade: 'mason',       payType: 'daily',   rate: 500, idType: 'aadhar', idNumber: '123456789012', phone: '+91 98765 43210', country: 'India' },
    { name: 'Abdul Qadir',      trade: 'mason',       payType: 'daily',   rate: 500, idType: 'aadhar', idNumber: '123456789013', phone: '+91 98765 43211', country: 'India' },
    { name: 'Nasir Ahmed',      trade: 'electrician', payType: 'daily',   rate: 600, idType: 'aadhar', idNumber: '123456789014', phone: '+91 98765 43212', country: 'India' },
    { name: 'Amjad Khan',       trade: 'plumber',     payType: 'daily',   rate: 550, idType: 'aadhar', idNumber: '123456789015', phone: '+91 98765 43213', country: 'India' },
    { name: 'Shahzad Ali',      trade: 'steel_fixer', payType: 'daily',   rate: 600, idType: 'aadhar', idNumber: '123456789016', phone: '+91 98765 43214', country: 'India' },
    { name: 'Farhan Mehmood',   trade: 'steel_fixer', payType: 'daily',   rate: 600, idType: 'aadhar', idNumber: '123456789017', phone: '+91 98765 43215', country: 'India' },
    { name: 'Aslam Khan',       trade: 'helper',      payType: 'daily',   rate: 350, idType: 'aadhar', idNumber: '123456789018', phone: '+91 98765 43216', country: 'India' },
    { name: 'Zubair Ahmed',     trade: 'helper',      payType: 'daily',   rate: 350, idType: 'aadhar', idNumber: '123456789019', phone: '+91 98765 43217', country: 'India' },
    { name: 'Imran Butt',       trade: 'carpenter',   payType: 'daily',   rate: 550, idType: 'aadhar', idNumber: '123456789020', phone: '+91 98765 43218', country: 'India' },
    { name: 'Naveed Hussain',   trade: 'painter',     payType: 'daily',   rate: 480, idType: 'aadhar', idNumber: '123456789021', phone: '+91 98765 43219', country: 'India' },
    { name: 'Rashid Mahmood',   trade: 'driver',      payType: 'monthly', rate: 12000, idType: 'driving_license', idNumber: 'DL-2024-001', phone: '+91 98765 43220', country: 'India' },
    { name: 'Hamid Ali',        trade: 'mason',       payType: 'daily',   rate: 520, idType: 'aadhar', idNumber: '123456789022', phone: '+91 98765 43221', country: 'India' },
  ];
  const workers = await Worker.create(workerData.map(w => ({ ...w, owner: ahmed._id, projects: [proj1._id, proj2._id], currency: 'INR', payment: { method: 'cash' } })));
  console.log('👷 Workers created');

  // Link worker users to their worker profiles
  await Worker.findByIdAndUpdate(workers[0]._id, { userId: workerUser1._id });
  await Worker.findByIdAndUpdate(workers[2]._id, { userId: workerUser2._id });
  await User.findByIdAndUpdate(workerUser1._id, { workerId: workers[0]._id });
  await User.findByIdAndUpdate(workerUser2._id, { workerId: workers[2]._id });
  console.log('🔗 Worker users linked to profiles');

  // ─── TASKS ──────────────────────────────────────────────────────────────────
  const now = new Date();
  const future = (days) => new Date(now.getTime() + days * 86400000);
  const past = (days) => new Date(now.getTime() - days * 86400000);

  await Task.create([
    // Project 1 tasks
    { project: proj1._id, title: 'Foundation & Basement Work',      description: 'Complete excavation, PCC, and basement structure.',       phase: 'Foundation & Basement',    priority: 'high',     status: 'completed',    assignedTo: usman._id, createdBy: ahmed._id, dueDate: past(120), completedAt: past(115) },
    { project: proj1._id, title: 'Ground Floor Columns & Beams',    description: 'All columns, beams, and lintel work on ground floor.',    phase: 'Ground Floor Structure',   priority: 'high',     status: 'completed',    assignedTo: usman._id, createdBy: ahmed._id, dueDate: past(90),  completedAt: past(85)  },
    { project: proj1._id, title: 'Ground Floor Slab Casting',       description: 'Slab casting for ground floor. Mix ratio: 1:1.5:3.',      phase: 'Ground Floor Structure',   priority: 'high',     status: 'completed',    assignedTo: sara._id,  createdBy: ahmed._id, dueDate: past(80),  completedAt: past(78)  },
    { project: proj1._id, title: 'First Floor Structure',           description: 'Columns, beams, and slab for first floor.',              phase: 'First Floor Structure',    priority: 'high',     status: 'completed',    assignedTo: usman._id, createdBy: ahmed._id, dueDate: past(50),  completedAt: past(48)  },
    { project: proj1._id, title: 'Roof Slab Casting',               description: 'Roof slab with waterproofing treatment.',                phase: 'Roof Slab & Parapet',      priority: 'high',     status: 'completed',    assignedTo: usman._id, createdBy: ahmed._id, dueDate: past(20),  completedAt: past(18)  },
    { project: proj1._id, title: 'Electrical Conduit Laying',       description: 'Install all electrical conduits before plastering.',     phase: 'MEP Rough-In',             priority: 'high',     status: 'in_progress',  assignedTo: usman._id, createdBy: ahmed._id, dueDate: future(10) },
    { project: proj1._id, title: 'Plumbing Rough-In',               description: 'Install all plumbing pipes, valves, and access points.', phase: 'MEP Rough-In',             priority: 'high',     status: 'in_progress',  assignedTo: sara._id,  createdBy: ahmed._id, dueDate: future(15) },
    { project: proj1._id, title: 'Internal Plastering – Ground',    description: 'Plaster all internal walls on ground floor.',            phase: 'Plastering & Finishing',   priority: 'medium',   status: 'open',         assignedTo: sara._id,  createdBy: ahmed._id, dueDate: future(30) },
    { project: proj1._id, title: 'External Plaster & Paint',        description: 'External rough plaster and primer coat.',               phase: 'Plastering & Finishing',   priority: 'medium',   status: 'open',         assignedTo: usman._id, createdBy: ahmed._id, dueDate: future(45) },
    { project: proj1._id, title: 'Floor Tile Work – Ground Floor',  description: 'Imported marble tile installation on ground floor.',    phase: 'Plastering & Finishing',   priority: 'medium',   status: 'open',         assignedTo: sara._id,  createdBy: ahmed._id, dueDate: future(60) },
    { project: proj1._id, title: 'HVAC System Installation',        description: 'Split AC installation + ducting in all rooms.',         phase: 'MEP Rough-In',             priority: 'medium',   status: 'open',         assignedTo: usman._id, createdBy: ahmed._id, dueDate: future(50) },
    { project: proj1._id, title: 'Main Gate & Boundary Wall',       description: 'Iron gate fabrication and boundary wall plastering.',    phase: 'Plastering & Finishing',   priority: 'low',      status: 'open',         assignedTo: sara._id,  createdBy: ahmed._id, dueDate: future(75) },
    // Project 2 tasks
    { project: proj2._id, title: 'Piling Work',                     description: 'Bored cast-in-situ piles 450mm dia × 18m deep.',        phase: 'Piling & Foundation',      priority: 'critical', status: 'completed',    assignedTo: bilal._id, createdBy: ahmed._id, dueDate: past(140), completedAt: past(135) },
    { project: proj2._id, title: 'Pile Caps & Grade Beams',         description: 'Pile caps, tie beams, and raft foundation.',            phase: 'Piling & Foundation',      priority: 'critical', status: 'completed',    assignedTo: bilal._id, createdBy: ahmed._id, dueDate: past(100), completedAt: past(95)  },
    { project: proj2._id, title: 'Basement B1 Slab',                description: 'B1 level retaining walls and suspended slab.',          phase: 'Basement & Podium',        priority: 'high',     status: 'completed',    assignedTo: bilal._id, createdBy: ahmed._id, dueDate: past(60),  completedAt: past(55)  },
    { project: proj2._id, title: 'Basement B2 Slab',                description: 'B2 level parking slab and columns.',                   phase: 'Basement & Podium',        priority: 'high',     status: 'completed',    assignedTo: usman._id, createdBy: ahmed._id, dueDate: past(30),  completedAt: past(28)  },
    { project: proj2._id, title: 'Ground Floor Columns',            description: 'Ground level columns per structural drawings.',         phase: 'Basement & Podium',        priority: 'high',     status: 'in_progress',  assignedTo: bilal._id, createdBy: ahmed._id, dueDate: future(20) },
    { project: proj2._id, title: 'Ground Floor Slab',               description: 'Ground floor slab with drop panels.',                  phase: 'Basement & Podium',        priority: 'high',     status: 'open',         assignedTo: bilal._id, createdBy: ahmed._id, dueDate: future(40) },
    { project: proj2._id, title: 'Podium Façade Design Approval',   description: 'Get client approval on curtain wall sample.',          phase: 'Basement & Podium',        priority: 'medium',   status: 'pending_approval', assignedTo: usman._id, createdBy: ahmed._id, dueDate: future(7)  },
    { project: proj2._id, title: 'Fire Fighting Riser Installation', description: 'Main fire riser pipe and hose reels in stairwells.',  phase: 'MEP & Façade',             priority: 'medium',   status: 'open',         assignedTo: bilal._id, createdBy: ahmed._id, dueDate: future(180) },
  ]);
  console.log('✅ Tasks created');

  // ─── ATTENDANCE (last 30 days for proj1 workers) ─────────────────────────
  const statusPool = ['present', 'present', 'present', 'present', 'present', 'half_day', 'absent', 'overtime'];
  const attendanceRecords = [];
  const targetWorkers = workers.slice(0, 10); // first 10 workers on proj1

  for (let d = 0; d < 30; d++) {
    const date = new Date(); date.setHours(0, 0, 0, 0); date.setDate(date.getDate() - d);
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0) continue; // skip Sundays

    for (const worker of targetWorkers) {
      const status = dayOfWeek === 6
        ? (Math.random() > 0.4 ? 'absent' : 'half_day')
        : statusPool[Math.floor(Math.random() * statusPool.length)];
      attendanceRecords.push({ project: proj1._id, worker: worker._id, date, status, markedBy: sara._id });
    }
  }
  // Also attendance for proj2 workers (last 15 days)
  const proj2Workers = workers.slice(0, 8);
  for (let d = 0; d < 15; d++) {
    const date = new Date(); date.setHours(0, 0, 0, 0); date.setDate(date.getDate() - d);
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0) continue;
    for (const worker of proj2Workers) {
      const status = statusPool[Math.floor(Math.random() * statusPool.length)];
      attendanceRecords.push({ project: proj2._id, worker: worker._id, date, status, markedBy: bilal._id });
    }
  }

  // Remove duplicate (proj,worker,date) combinations before insert
  const seen = new Set();
  const uniqueAttendance = attendanceRecords.filter(r => {
    const key = `${r.project}_${r.worker}_${r.date.toDateString()}`;
    if (seen.has(key)) return false;
    seen.add(key); return true;
  });
  await Attendance.insertMany(uniqueAttendance);
  console.log(`📅 Attendance created (${uniqueAttendance.length} records)`);

  // ─── TRANSACTIONS ────────────────────────────────────────────────────────
  await Transaction.create([
    // Proj1 – Client receipts
    { project: proj1._id, type: 'client_receipt', category: 'misc', amount: 4500000, description: '30% advance payment on contract signing', paymentMethod: 'bank', status: 'paid', date: new Date('2024-03-05'), createdBy: ahmed._id },
    { project: proj1._id, type: 'client_receipt', category: 'misc', amount: 3000000, description: '20% second installment – on completion of structure', paymentMethod: 'cheque', status: 'paid', date: new Date('2024-12-20'), createdBy: ahmed._id },
    // Proj1 – Material expenses
    { project: proj1._id, type: 'material_purchase', category: 'structure', amount: 580000, description: 'Ordinary Portland Cement – 1000 bags (OPC 53)', vendor: 'Maple Leaf Cement', invoiceNo: 'MLC-2024-0312', paymentMethod: 'bank', status: 'paid', date: new Date('2024-03-15'), createdBy: usman._id },
    { project: proj1._id, type: 'material_purchase', category: 'structure', amount: 420000, description: 'Deformed Steel Bars – Grade 60, 10 tons', vendor: 'Ittefaq Steel Mills', invoiceNo: 'ISM-7741', paymentMethod: 'cheque', status: 'paid', date: new Date('2024-03-18'), createdBy: usman._id },
    { project: proj1._id, type: 'material_purchase', category: 'structure', amount: 210000, description: 'Red Clay Bricks – 50,000 units', vendor: 'Bhopal Brick Kiln', invoiceNo: 'BBK-0091', paymentMethod: 'cash', status: 'paid', date: new Date('2024-04-10'), createdBy: sara._id },
    { project: proj1._id, type: 'material_purchase', category: 'structure', amount: 95000, description: 'Crush, Sand & Bajri – 3 trips', vendor: 'Punjab Aggregates', invoiceNo: 'PA-441', paymentMethod: 'cash', status: 'paid', date: new Date('2024-04-22'), createdBy: sara._id },
    { project: proj1._id, type: 'material_purchase', category: 'structure', amount: 340000, description: 'Cement – 600 bags for first floor slab', vendor: 'Maple Leaf Cement', invoiceNo: 'MLC-2024-0891', paymentMethod: 'bank', status: 'paid', date: new Date('2024-09-12'), createdBy: usman._id },
    { project: proj1._id, type: 'material_purchase', category: 'mep', amount: 185000, description: 'Electrical conduit, wires & boxes – GFS brand', vendor: 'National Electric Supplies', invoiceNo: 'NES-3301', paymentMethod: 'cash', status: 'paid', date: new Date('2025-01-15'), createdBy: usman._id },
    { project: proj1._id, type: 'material_purchase', category: 'mep', amount: 142000, description: 'PVC plumbing pipes, joints & fittings', vendor: 'Master Pipes & Fittings', invoiceNo: 'MPF-8812', paymentMethod: 'cash', status: 'paid', date: new Date('2025-01-20'), createdBy: sara._id },
    { project: proj1._id, type: 'material_purchase', category: 'finishing', amount: 480000, description: 'Imported marble tiles – 2000 sqft (Italian Carrara)', vendor: 'Marble World Lahore', invoiceNo: 'MWL-2025-441', paymentMethod: 'bank', status: 'pending', date: new Date('2025-02-10'), createdBy: ahmed._id },
    // Proj1 – Labour payments
    { project: proj1._id, type: 'labour_payment', category: 'labour', amount: 285000, description: 'Labour wages – March 2024 (foundation team)', paymentMethod: 'cash', status: 'paid', date: new Date('2024-03-31'), worker: workers[0]._id, createdBy: sara._id },
    { project: proj1._id, type: 'labour_payment', category: 'labour', amount: 295000, description: 'Labour wages – April 2024', paymentMethod: 'cash', status: 'paid', date: new Date('2024-04-30'), createdBy: sara._id },
    { project: proj1._id, type: 'labour_payment', category: 'labour', amount: 310000, description: 'Labour wages – May 2024', paymentMethod: 'cash', status: 'paid', date: new Date('2024-05-31'), createdBy: sara._id },
    { project: proj1._id, type: 'labour_payment', category: 'labour', amount: 298000, description: 'Labour wages – June 2024', paymentMethod: 'cash', status: 'paid', date: new Date('2024-06-30'), createdBy: sara._id },
    { project: proj1._id, type: 'advance', category: 'labour', amount: 25000, description: 'Advance payment – Nasir Ahmed (electrician)', paymentMethod: 'easypaisa', status: 'paid', date: new Date('2025-01-12'), worker: workers[2]._id, createdBy: sara._id },
    { project: proj1._id, type: 'misc_expense', category: 'misc', amount: 38000, description: 'Site office rental – 3 months', paymentMethod: 'cash', status: 'paid', date: new Date('2024-03-01'), createdBy: ahmed._id },
    { project: proj1._id, type: 'misc_expense', category: 'misc', amount: 18500, description: 'Safety equipment – helmets, gloves, harnesses', vendor: 'SafetyFirst Pakistan', invoiceNo: 'SF-2024-119', paymentMethod: 'cash', status: 'paid', date: new Date('2024-03-05'), createdBy: sara._id },
    // Proj2 – Client receipts
    { project: proj2._id, type: 'client_receipt', category: 'misc', amount: 15600000, description: '30% advance – Gulberg Tower project commencement', paymentMethod: 'bank', status: 'paid', date: new Date('2024-06-10'), createdBy: ahmed._id },
    { project: proj2._id, type: 'client_receipt', category: 'misc', amount: 10400000, description: '20% on completion of piling works', paymentMethod: 'cheque', status: 'paid', date: new Date('2024-10-25'), createdBy: ahmed._id },
    // Proj2 – Expenses
    { project: proj2._id, type: 'material_purchase', category: 'structure', amount: 1850000, description: 'Piling contractor – 28 bored piles, 18m depth', vendor: 'Foundation Engineers Ltd', invoiceNo: 'FEL-2024-330', paymentMethod: 'bank', status: 'paid', date: new Date('2024-06-20'), createdBy: bilal._id },
    { project: proj2._id, type: 'material_purchase', category: 'structure', amount: 1240000, description: 'High-strength cement – 2000 bags (53-grade)', vendor: 'Lucky Cement', invoiceNo: 'LC-20240711', paymentMethod: 'bank', status: 'paid', date: new Date('2024-07-11'), createdBy: bilal._id },
    { project: proj2._id, type: 'material_purchase', category: 'structure', amount: 2100000, description: 'High-tensile steel – 50 tons (Grade 500)', vendor: 'Pakistan Steel', invoiceNo: 'PS-7761', paymentMethod: 'cheque', status: 'paid', date: new Date('2024-07-25'), createdBy: bilal._id },
    { project: proj2._id, type: 'labour_payment', category: 'labour', amount: 680000, description: 'Labour wages – July 2024 (piling & foundation team)', paymentMethod: 'cash', status: 'paid', date: new Date('2024-07-31'), createdBy: bilal._id },
    { project: proj2._id, type: 'labour_payment', category: 'labour', amount: 720000, description: 'Labour wages – August 2024', paymentMethod: 'cash', status: 'paid', date: new Date('2024-08-31'), createdBy: bilal._id },
  ]);
  console.log('💰 Transactions created');

  // ─── DOCUMENTS ───────────────────────────────────────────────────────────
  await Document.create([
    { project: proj1._id, name: 'Architectural Drawings – Rev C',    category: 'drawing',    createdBy: usman._id, sharedWithClient: true,  activeVersion: 2, versions: [
      { versionNumber: 1, fileUrl: '/uploads/p1/arch_rev_A.pdf', fileName: 'arch_rev_A.pdf', fileSize: 4200000, status: 'superseded',              uploadedBy: usman._id, uploadedAt: new Date('2024-02-10'), notes: 'Initial submission' },
      { versionNumber: 2, fileUrl: '/uploads/p1/arch_rev_C.pdf', fileName: 'arch_rev_C.pdf', fileSize: 5100000, status: 'issued_for_construction',  uploadedBy: usman._id, uploadedAt: new Date('2024-03-01'), notes: 'Client approved Rev C' },
    ]},
    { project: proj1._id, name: 'Structural Design Drawings',        category: 'structural', createdBy: usman._id, sharedWithClient: true,  activeVersion: 1, versions: [
      { versionNumber: 1, fileUrl: '/uploads/p1/structural_v1.pdf', fileName: 'structural_v1.pdf', fileSize: 8300000, status: 'issued_for_construction', uploadedBy: usman._id, uploadedAt: new Date('2024-02-25'), notes: 'SE-stamped drawings' },
    ]},
    { project: proj1._id, name: 'Electrical Single Line Diagram',    category: 'mep',        createdBy: usman._id, sharedWithClient: false, activeVersion: 1, versions: [
      { versionNumber: 1, fileUrl: '/uploads/p1/electrical_sld.pdf', fileName: 'electrical_sld.pdf', fileSize: 2100000, status: 'for_review', uploadedBy: usman._id, uploadedAt: new Date('2025-01-08'), notes: 'Pending WAPDA approval' },
    ]},
    { project: proj1._id, name: 'Bill of Quantities (BOQ)',          category: 'boq',        createdBy: ahmed._id, sharedWithClient: true,  activeVersion: 2, versions: [
      { versionNumber: 1, fileUrl: '/uploads/p1/boq_v1.xlsx', fileName: 'boq_v1.xlsx', fileSize: 310000, status: 'superseded',             uploadedBy: ahmed._id, uploadedAt: new Date('2024-02-15'), notes: 'Draft BOQ' },
      { versionNumber: 2, fileUrl: '/uploads/p1/boq_v2.xlsx', fileName: 'boq_v2.xlsx', fileSize: 345000, status: 'issued_for_construction', uploadedBy: ahmed._id, uploadedAt: new Date('2024-03-12'), notes: 'Final approved BOQ' },
    ]},
    { project: proj1._id, name: 'Site Photographs – Jan 2025',       category: 'photo',      createdBy: sara._id,  sharedWithClient: true,  activeVersion: 1, versions: [
      { versionNumber: 1, fileUrl: '/uploads/p1/site_photos_jan25.zip', fileName: 'site_photos_jan25.zip', fileSize: 45000000, status: 'for_review', uploadedBy: sara._id, uploadedAt: new Date('2025-01-31'), notes: 'Monthly progress photos – 24 images' },
    ]},
    { project: proj2._id, name: 'Architectural Design – Rev B',      category: 'drawing',    createdBy: bilal._id, sharedWithClient: true,  activeVersion: 1, versions: [
      { versionNumber: 1, fileUrl: '/uploads/p2/arch_tower_B.pdf', fileName: 'arch_tower_B.pdf', fileSize: 7800000, status: 'issued_for_construction', uploadedBy: bilal._id, uploadedAt: new Date('2024-05-20'), notes: 'Approved by client after design workshop' },
    ]},
    { project: proj2._id, name: 'Foundation & Piling Report',        category: 'structural', createdBy: bilal._id, sharedWithClient: true,  activeVersion: 1, versions: [
      { versionNumber: 1, fileUrl: '/uploads/p2/piling_report.pdf', fileName: 'piling_report.pdf', fileSize: 3200000, status: 'issued_for_construction', uploadedBy: bilal._id, uploadedAt: new Date('2024-10-30'), notes: 'Post-piling test report – all piles passed' },
    ]},
    { project: proj2._id, name: 'Contractor Agreement – Gulberg',    category: 'contract',   createdBy: ahmed._id, sharedWithClient: false, activeVersion: 1, versions: [
      { versionNumber: 1, fileUrl: '/uploads/p2/contract_signed.pdf', fileName: 'contract_signed.pdf', fileSize: 1800000, status: 'issued_for_construction', uploadedBy: ahmed._id, uploadedAt: new Date('2024-05-30'), notes: 'Signed by both parties' },
    ]},
    { project: proj3._id, name: 'F-10 Concept Design',               category: 'drawing',    createdBy: usman._id, sharedWithClient: true,  activeVersion: 1, versions: [
      { versionNumber: 1, fileUrl: '/uploads/p3/concept_design.pdf', fileName: 'concept_design.pdf', fileSize: 5600000, status: 'for_review', uploadedBy: usman._id, uploadedAt: new Date('2025-03-15'), notes: 'Concept submitted for client review' },
    ]},
    { project: proj4._id, name: 'Completion & Handover Certificate', category: 'inspection', createdBy: bilal._id, sharedWithClient: true,  activeVersion: 1, versions: [
      { versionNumber: 1, fileUrl: '/uploads/p4/handover_cert.pdf', fileName: 'handover_cert.pdf', fileSize: 980000, status: 'issued_for_construction', uploadedBy: bilal._id, uploadedAt: new Date('2024-09-01'), notes: 'Signed handover certificate' },
    ]},
  ]);
  console.log('📄 Documents created');

  // ─── SUMMARY ─────────────────────────────────────────────────────────────
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  ✅ DATABASE SEEDED SUCCESSFULLY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  LOGIN CREDENTIALS');
  console.log('  Owner     : ahmed@buildtrack.com  / password123');
  console.log('  Engineer  : usman@buildtrack.com  / password123');
  console.log('  Supervisor: sara@buildtrack.com  / password123');
  console.log('  Worker    : rafiq@buildtrack.com / password123');
  console.log('  Worker    : nasir@buildtrack.com / password123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch(err => { console.error('❌ Seed failed:', err); process.exit(1); });
