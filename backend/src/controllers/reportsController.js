const PDFDocument = require('pdfkit');
const Worker      = require('../models/Worker');
const Attendance  = require('../models/Attendance');
const Project     = require('../models/Project');
const { getOrgId } = require('../middleware/auth');

// ── Helpers ───────────────────────────────────────────────────────────────────

const MULTIPLIER = { daily: 1, weekly: 5, monthly: 26 }; // working days per pay unit

function daysWorked(records) {
  let count = 0;
  records.forEach(r => {
    if (r.status === 'present')  count += 1;
    if (r.status === 'half_day') count += 0.5;
    if (r.status === 'overtime') count += 1.5;
    // absent = 0
  });
  return count;
}

async function buildPayrollData(projectId, month, year) {
  // Date range for the month
  const start = new Date(year, month - 1, 1);
  const end   = new Date(year, month, 0, 23, 59, 59);

  // Workers assigned to this project
  const workers = await Worker.find({ projects: projectId, isActive: true });

  const rows = await Promise.all(workers.map(async (w) => {
    const records = await Attendance.find({
      project: projectId,
      worker:  w._id,
      date:    { $gte: start, $lte: end },
    });

    const days  = daysWorked(records);
    const daily = w.payType === 'daily'   ? w.rate
                : w.payType === 'weekly'  ? w.rate / 5
                : w.payType === 'monthly' ? w.rate / 26
                : w.rate;
    const total = Math.round(days * daily);

    return {
      _id:       w._id,
      name:      w.name,
      trade:     w.trade,
      payType:   w.payType,
      rate:      w.rate,
      dailyRate: Math.round(daily),
      days,
      total,
      currency:  w.currency || 'INR',
    };
  }));

  const grandTotal = rows.reduce((s, r) => s + r.total, 0);
  return { workers: rows, grandTotal };
}

// ── Controllers ───────────────────────────────────────────────────────────────

// GET /api/reports/payroll/:projectId?month=M&year=Y
exports.getPayrollJSON = async (req, res) => {
  const { projectId } = req.params;
  const month = parseInt(req.query.month) || new Date().getMonth() + 1;
  const year  = parseInt(req.query.year)  || new Date().getFullYear();

  const data = await buildPayrollData(projectId, month, year);
  res.json({ success: true, data: { ...data, month, year, projectId } });
};

// GET /api/reports/payroll/:projectId/pdf?month=M&year=Y
exports.getPayrollPDF = async (req, res) => {
  const { projectId } = req.params;
  const month = parseInt(req.query.month) || new Date().getMonth() + 1;
  const year  = parseInt(req.query.year)  || new Date().getFullYear();

  const project = await Project.findById(projectId);
  const { workers, grandTotal } = await buildPayrollData(projectId, month, year);

  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const monthLabel = `${MONTHS[month - 1]} ${year}`;
  const fmt = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;

  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="payroll-${monthLabel.replace(' ', '-')}.pdf"`);
  doc.pipe(res);

  // ── Header ────────────────────────────────────────────────────────────────
  doc.fontSize(22).font('Helvetica-Bold').fillColor('#1a1a2e')
     .text('PAYROLL REPORT', 50, 50);
  doc.fontSize(11).font('Helvetica').fillColor('#555')
     .text(`Project: ${project?.name || projectId}`, 50, 80)
     .text(`Period:  ${monthLabel}`, 50, 95)
     .text(`Generated: ${new Date().toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })}`, 50, 110);

  doc.moveTo(50, 130).lineTo(545, 130).strokeColor('#ccc').stroke();

  // ── Table header ──────────────────────────────────────────────────────────
  const col = { name: 50, trade: 185, payType: 280, days: 340, dailyRate: 390, total: 470 };
  const rowH = 22;
  let y = 145;

  doc.rect(50, y, 495, rowH).fillColor('#1a1a2e').fill();
  doc.fontSize(9).font('Helvetica-Bold').fillColor('#fff');
  doc.text('Worker',     col.name,     y + 6);
  doc.text('Trade',      col.trade,    y + 6);
  doc.text('Pay Type',   col.payType,  y + 6);
  doc.text('Days',       col.days,     y + 6);
  doc.text('Daily Rate', col.dailyRate,y + 6);
  doc.text('Total',      col.total,    y + 6);
  y += rowH;

  // ── Rows ──────────────────────────────────────────────────────────────────
  workers.forEach((w, i) => {
    const bg = i % 2 === 0 ? '#f8f8f8' : '#ffffff';
    doc.rect(50, y - 3, 495, rowH).fillColor(bg).fill();
    doc.fontSize(9).font('Helvetica').fillColor('#333');
    doc.text(w.name,                col.name,     y);
    doc.text(w.trade,               col.trade,    y);
    doc.text(w.payType,             col.payType,  y);
    doc.text(String(w.days),        col.days,     y);
    doc.text(fmt(w.dailyRate),      col.dailyRate,y);
    doc.text(fmt(w.total),          col.total,    y, { width: 70, align: 'right' });
    y += rowH;
  });

  // ── Grand total ───────────────────────────────────────────────────────────
  doc.moveTo(50, y).lineTo(545, y).strokeColor('#ccc').stroke();
  y += 8;
  doc.rect(370, y - 3, 175, rowH + 4).fillColor('#1a1a2e').fill();
  doc.fontSize(11).font('Helvetica-Bold').fillColor('#fff')
     .text('TOTAL PAYROLL:',  375, y, { width: 85, align: 'right' })
     .text(fmt(grandTotal),   460, y, { width: 80, align: 'right' });
  y += rowH + 10;

  // ── Footer ────────────────────────────────────────────────────────────────
  doc.moveTo(50, 750).lineTo(545, 750).strokeColor('#ccc').stroke();
  doc.fontSize(8).font('Helvetica').fillColor('#aaa')
     .text('This is a computer-generated payroll report.', 50, 758, { align: 'center', width: 495 });

  doc.end();
};

// GET /api/reports/budget/:projectId
exports.getBudgetReport = async (req, res) => {
  const project = await Project.findById(req.params.projectId);
  if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

  const CATS = ['structure', 'labour', 'mep', 'finishing', 'misc'];
  const budget = project.budget || {};
  const spent  = project.budgetSpent || {};

  const categories = {};
  CATS.forEach(cat => {
    const b = budget[cat]  || 0;
    const s = spent[cat]   || 0;
    categories[cat] = { budget: b, spent: s, variance: b - s, pct: b ? Math.round((s / b) * 100) : 0 };
  });

  res.json({
    success: true,
    data: {
      projectId:  project._id,
      projectName: project.name,
      budget: { total: budget.total || 0, ...Object.fromEntries(CATS.map(c => [c, budget[c] || 0])) },
      spent:  { total: spent.total  || 0, ...Object.fromEntries(CATS.map(c => [c, spent[c]  || 0])) },
      categories,
      overallVariance: (budget.total || 0) - (spent.total || 0),
    }
  });
};
