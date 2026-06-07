// ─────────────────────────────────────────────────────────────────────────────
// BUILDTRACK — MOCK API
// Mirrors every real API endpoint so the app works 100% without a backend.
//
// HOW TO SWITCH:
//   Mock mode  → REACT_APP_USE_MOCK=true  in frontend/.env
//   Real API   → REACT_APP_USE_MOCK=false (or remove the line)
//
// All handlers live in this file. mockData.js has the seed data.
// ─────────────────────────────────────────────────────────────────────────────

import {
  MOCK_USERS, MOCK_PROJECTS, MOCK_WORKERS,
  MOCK_TASKS, MOCK_TRANSACTIONS, MOCK_DOCUMENTS, MOCK_ATTENDANCE,
  MOCK_VENDORS, MOCK_PURCHASE_ORDERS, MOCK_SITE_DIARY, MOCK_INVENTORY,
  MOCK_NOTIFICATIONS, MOCK_PAYMENT_SCHEDULES, MOCK_SUBSCRIPTION,
} from './mockData';

// ── Simulate network delay ───────────────────────────────────────────────────
const delay = (ms = 250) => new Promise(r => setTimeout(r, ms));

// ── In-memory stores (persist changes within the session) ────────────────────
let projects         = [...MOCK_PROJECTS];
let workers          = [...MOCK_WORKERS];
let tasks            = [...MOCK_TASKS];
let transactions     = [...MOCK_TRANSACTIONS];
let documents        = [...MOCK_DOCUMENTS];
let attendance       = [...MOCK_ATTENDANCE];
let vendors          = [...MOCK_VENDORS];
let purchaseOrders   = [...MOCK_PURCHASE_ORDERS];
let siteDiary        = [...MOCK_SITE_DIARY];
let inventory        = [...MOCK_INVENTORY];
let notifications    = [...MOCK_NOTIFICATIONS];
let paymentSchedules = [...MOCK_PAYMENT_SCHEDULES];
let users            = [...MOCK_USERS];
let subscription     = { ...MOCK_SUBSCRIPTION };

// ── Response helpers ─────────────────────────────────────────────────────────
const ok    = (data)    => ({ data: { success: true,  data    } });
const okMsg = (message) => ({ data: { success: true,  message } });
const notFound = (msg = 'Not found') => { throw { response: { status: 404, data: { message: msg } } }; };

// ── Vendor/PO helpers ─────────────────────────────────────────────────────────
const populateVendor  = (po) => ({ ...po, vendor: vendors.find(v => v._id === po.vendor) || po.vendor });
const populateProject = (po) => ({ ...po, project: projects.find(p => p._id === po.project) || po.project });
const populatePO      = (po) => populateVendor(populateProject(po));

// ── Notification helper ───────────────────────────────────────────────────────
const pushNotif = (type, title, message, projectId = null) => {
  notifications = [{
    _id: 'n_' + Date.now(), recipient: 'u1', type, title, message,
    relatedProject: projectId, isRead: false, createdAt: new Date().toISOString(),
  }, ...notifications];
};

// ── URL pattern matching ──────────────────────────────────────────────────────
const matchPattern = (pattern, url) => {
  const re = pattern.replace(/:([^/]+)/g, '([^/]+)');
  const m  = url.match(new RegExp(`^${re}$`));
  if (!m) return null;
  const keys   = [...pattern.matchAll(/:([^/]+)/g)].map(k => k[1]);
  const params = {};
  keys.forEach((k, i) => { params[k] = m[i + 1]; });
  return params;
};

// ── HANDLERS ─────────────────────────────────────────────────────────────────
const handlers = {

  // ── Auth ───────────────────────────────────────────────────────────────────
  'POST /auth/login': async ({ body }) => {
    await delay();
    const user = users.find(u => u.email === body.email);
    if (!user) throw { response: { data: { message: 'Invalid credentials' } } };
    // Attach subscription to admin user so AuthContext has it
    const userWithSub = user._id === 'u1'
      ? { ...user, subscription: { plan: subscription.plan, status: subscription.status, endDate: subscription.endDate, isActive: true, daysRemaining: subscription.daysRemaining } }
      : user;
    return { data: { success: true, token: 'mock_jwt_token_' + user._id, user: userWithSub } };
  },

  'POST /auth/register': async ({ body }) => {
    await delay();
    const newUser = {
      _id: 'u_' + Date.now(), ...body, organizationId: 'u_' + Date.now(), isActive: true,
      subscription: { plan: 'trial', status: 'active', endDate: new Date(Date.now() + 30 * 86400000).toISOString(), isActive: true, daysRemaining: 30 },
    };
    users = [...users, newUser];
    return { data: { success: true, token: 'mock_jwt_token_' + newUser._id, user: newUser } };
  },

  'GET /auth/me': async () => {
    await delay(100);
    const stored = localStorage.getItem('user');
    const u = stored ? JSON.parse(stored) : users[0];
    return ok(u);
  },

  'PUT /auth/me': async ({ body }) => {
    await delay();
    const stored = localStorage.getItem('user');
    const u      = stored ? JSON.parse(stored) : users[0];
    const updated = { ...u, ...body };
    localStorage.setItem('user', JSON.stringify(updated));
    users = users.map(x => x._id === updated._id ? updated : x);
    return ok(updated);
  },

  // ── Subscription ───────────────────────────────────────────────────────────
  'GET /subscription': async () => {
    await delay(100);
    return ok(subscription);
  },

  'GET /subscription/plans': async () => {
    await delay(100);
    return ok([
      { key: 'trial',    label: 'Trial',    price: 0,       duration: 30,  features: ['5 Projects', '2 Team Members', 'Basic Reports'] },
      { key: 'basic',    label: 'Basic',    price: 999,     duration: 90,  features: ['10 Projects', '5 Team Members', 'All Features', 'Vendor Module'] },
      { key: 'standard', label: 'Standard', price: 2499,    duration: 180, features: ['Unlimited Projects', '15 Team Members', 'All Features', 'Priority Support'] },
      { key: 'premium',  label: 'Premium',  price: 3999,    duration: 365, features: ['Unlimited Everything', 'White-Label', '24/7 Support', 'Custom Reports'] },
    ]);
  },

  'POST /subscription/trial': async () => {
    await delay();
    if (subscription.trialUsed) throw { response: { status: 400, data: { message: 'Trial already used' } } };
    subscription = { ...subscription, plan: 'trial', status: 'active', trialUsed: true, daysRemaining: 30 };
    return ok(subscription);
  },

  'POST /subscription/upgrade': async ({ body }) => {
    await delay();
    const durations = { basic: 90, standard: 180, premium: 365 };
    const days = durations[body.plan] || 30;
    subscription = {
      ...subscription, plan: body.plan, status: 'active',
      startDate: new Date().toISOString(),
      endDate:   new Date(Date.now() + days * 86400000).toISOString(),
      daysRemaining: days, paymentRef: body.paymentRef || 'mock_ref_' + Date.now(),
    };
    return ok(subscription);
  },

  // ── Notifications ──────────────────────────────────────────────────────────
  'GET /notifications': async ({ query }) => {
    await delay(150);
    const page  = parseInt(query.page  || '1');
    const limit = parseInt(query.limit || '20');
    let result = [...notifications].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (query.unread === 'true') result = result.filter(n => !n.isRead);
    const total = result.length;
    const data  = result.slice((page - 1) * limit, page * limit);
    return { data: { success: true, data, total, page, pages: Math.ceil(total / limit) } };
  },

  'GET /notifications/unread-count': async () => {
    await delay(80);
    return ok({ count: notifications.filter(n => !n.isRead).length });
  },

  'PUT /notifications/:id/read': async ({ params }) => {
    await delay(100);
    notifications = notifications.map(n => n._id === params.id ? { ...n, isRead: true } : n);
    return okMsg('Marked as read');
  },

  'PUT /notifications/read-all': async () => {
    await delay(150);
    notifications = notifications.map(n => ({ ...n, isRead: true }));
    return okMsg('All marked as read');
  },

  'DELETE /notifications/:id': async ({ params }) => {
    await delay();
    notifications = notifications.filter(n => n._id !== params.id);
    return okMsg('Notification deleted');
  },

  // ── Users (Team Management) ─────────────────────────────────────────────────
  'GET /users': async () => {
    await delay();
    return ok(users.filter(u => u.isActive !== false));
  },

  'GET /users/:id': async ({ params }) => {
    await delay();
    const u = users.find(x => x._id === params.id);
    if (!u) notFound('User not found');
    return ok(u);
  },

  'POST /users/invite': async ({ body }) => {
    await delay();
    const newUser = {
      _id: 'u_' + Date.now(), organizationId: 'u1', isActive: true,
      ...body, createdAt: new Date().toISOString(),
    };
    users = [...users, newUser];
    return { data: { success: true, data: newUser } };
  },

  'PUT /users/:id': async ({ params, body }) => {
    await delay();
    users = users.map(u => u._id === params.id ? { ...u, ...body } : u);
    return ok(users.find(u => u._id === params.id));
  },

  'DELETE /users/:id': async ({ params }) => {
    await delay();
    users = users.map(u => u._id === params.id ? { ...u, isActive: false } : u);
    return okMsg('User deactivated');
  },

  // ── Dashboard ──────────────────────────────────────────────────────────────
  'GET /dashboard': async () => {
    await delay();
    const totalBudget   = projects.reduce((s, p) => s + (p.budget?.total || 0), 0);
    const avgCompletion = projects.length
      ? Math.round(projects.reduce((s, p) => s + p.completion, 0) / projects.length)
      : 0;

    // Budget alerts: projects >80% spent
    const budgetAlerts = projects
      .filter(p => p.budget?.total && p.budgetSpent?.total &&
        (p.budgetSpent.total / p.budget.total) > 0.8)
      .map(p => ({
        id:    p._id,
        name:  p.name,
        pct:   Math.round(p.budgetSpent.total / p.budget.total * 100),
        spent: p.budgetSpent.total,
        total: p.budget.total,
      }));

    // Unpaid PO summary
    const unpaidPOs = purchaseOrders.filter(po => ['draft','sent','unpaid'].includes(po.status));
    const poSummary = {
      count: unpaidPOs.length,
      total: unpaidPOs.reduce((s, po) => s + po.totalAmount, 0),
    };

    // Pending payment requests
    const pendingPayments = paymentSchedules.filter(ps => ps.status === 'requested').length;

    return ok({
      totalProjects:   projects.length,
      activeProjects:  projects.filter(p => p.status === 'active').length,
      totalBudget,
      avgCompletion,
      totalWorkers:    workers.filter(w => w.isActive).length,
      recentProjects:  [...projects].reverse().slice(0, 5),
      budgetAlerts,
      poSummary,
      pendingPayments,
      subscriptionStatus: {
        plan:          subscription.plan,
        daysRemaining: subscription.daysRemaining,
        status:        subscription.status,
      },
    });
  },

  'GET /dashboard/project/:projectId': async ({ params }) => {
    await delay();
    const project = projects.find(p => p._id === params.projectId);
    if (!project) notFound();
    const pTasks  = tasks.filter(t => t.project === params.projectId);
    const pTxns   = transactions.filter(t => t.project === params.projectId);
    const today   = new Date().toDateString();
    const todayAttendance = attendance.filter(
      a => a.project === params.projectId &&
           new Date(a.date).toDateString() === today &&
           ['present','overtime'].includes(a.status)
    ).length;
    const income   = pTxns.filter(t => ['client_receipt','refund'].includes(t.type)).reduce((s,t) => s + t.amount, 0);
    const expenses = pTxns.filter(t => !['client_receipt','refund'].includes(t.type)).reduce((s,t) => s + t.amount, 0);

    // PO summary for this project
    const projectPOs  = purchaseOrders.filter(po => po.project === params.projectId);
    const unpaidProjectPOs = projectPOs.filter(po => ['sent','unpaid'].includes(po.status));

    return ok({
      project,
      tasks:    { total: pTasks.length, completed: pTasks.filter(t => t.status === 'completed').length, open: pTasks.filter(t => t.status === 'open').length },
      finance:  { income, expenses, profit: income - expenses, budgetRemaining: (project.budget?.total || 0) - expenses },
      todayAttendance,
      poSummary: { count: unpaidProjectPOs.length, total: unpaidProjectPOs.reduce((s,po) => s + po.totalAmount, 0) },
    });
  },

  // ── Projects ───────────────────────────────────────────────────────────────
  'GET /projects': async () => { await delay(); return ok(projects); },

  'GET /projects/:id': async ({ params }) => {
    await delay();
    const p = projects.find(p => p._id === params.id);
    if (!p) notFound();
    return ok(p);
  },

  'POST /projects': async ({ body }) => {
    await delay();
    const newP = { _id: 'p_' + Date.now(), completion: 0, status: 'planning', currency: 'INR', phases: [], budgetSpent: { total: 0, structure: 0, labour: 0, mep: 0, finishing: 0, misc: 0 }, ...body, owner: 'u1', createdAt: new Date().toISOString() };
    projects = [...projects, newP];
    return { data: { success: true, data: newP } };
  },

  'PUT /projects/:id': async ({ params, body }) => {
    await delay();
    projects = projects.map(p => p._id === params.id ? { ...p, ...body } : p);
    return ok(projects.find(p => p._id === params.id));
  },

  'DELETE /projects/:id': async ({ params }) => {
    await delay();
    projects = projects.filter(p => p._id !== params.id);
    return okMsg('Project deleted');
  },

  'POST /projects/:id/client-token': async ({ params }) => {
    await delay();
    const token = 'ct_' + Math.random().toString(36).slice(2);
    projects = projects.map(p => p._id === params.id ? { ...p, clientPortalToken: token, clientPortalEnabled: true } : p);
    return { data: { success: true, token } };
  },

  // ── Tasks ──────────────────────────────────────────────────────────────────
  'GET /tasks': async ({ query }) => {
    await delay();
    let result = tasks.filter(t => t.project === query.projectId);
    if (query.status)   result = result.filter(t => t.status === query.status);
    if (query.priority) result = result.filter(t => t.priority === query.priority);
    return ok(result);
  },

  'POST /tasks': async ({ body }) => {
    await delay();
    const newT = { _id: 't_' + Date.now(), status: 'open', priority: 'medium', ...body, createdBy: { _id:'u1', name:'Ahmed Khan' }, createdAt: new Date().toISOString() };
    tasks = [...tasks, newT];
    return { data: { success: true, data: newT } };
  },

  'PUT /tasks/:id': async ({ params, body }) => {
    await delay();
    const completedAt = body.status === 'completed' ? new Date().toISOString() : undefined;
    tasks = tasks.map(t => t._id === params.id ? { ...t, ...body, ...(completedAt ? { completedAt } : {}) } : t);
    return ok(tasks.find(t => t._id === params.id));
  },

  'DELETE /tasks/:id': async ({ params }) => {
    await delay();
    tasks = tasks.filter(t => t._id !== params.id);
    return okMsg('Task deleted');
  },

  // ── Workers ────────────────────────────────────────────────────────────────
  'GET /workers/me': async () => {
    await delay();
    const stored = localStorage.getItem('user');
    const user   = stored ? JSON.parse(stored) : null;
    const worker = workers.find(w => w.userId === user?._id) || workers[0];
    return ok(worker);
  },

  'GET /workers': async () => { await delay(); return ok(workers.filter(w => w.isActive)); },

  'GET /workers/:id': async ({ params }) => {
    await delay();
    return ok(workers.find(w => w._id === params.id));
  },

  'POST /workers': async ({ body }) => {
    await delay();
    const newW = { _id: 'w_' + Date.now(), isActive: true, currency: 'INR', projects: [], payment: { method: 'cash' }, ...body, owner: 'u1', joinDate: new Date().toISOString() };
    workers = [...workers, newW];
    return { data: { success: true, data: newW } };
  },

  'PUT /workers/:id': async ({ params, body }) => {
    await delay();
    const updates = { ...body };
    if (updates.rate != null) updates.rate = Number(updates.rate);
    workers = workers.map(w => w._id === params.id ? { ...w, ...updates } : w);
    return ok(workers.find(w => w._id === params.id));
  },

  'DELETE /workers/:id': async ({ params }) => {
    await delay();
    workers = workers.map(w => w._id === params.id ? { ...w, isActive: false, leftDate: new Date().toISOString() } : w);
    return okMsg('Worker deactivated');
  },

  'GET /workers/:id/payroll': async ({ params }) => {
    await delay();
    const worker    = workers.find(w => w._id === params.id);
    const recs      = attendance.filter(a => a.worker === params.id);
    const mul       = { present: 1, half_day: 0.5, overtime: 1.5, absent: 0 };
    const totalDays = recs.reduce((s, r) => s + (mul[r.status] || 0), 0);
    return ok({ worker, totalDays, totalPay: totalDays * (worker?.rate || 0), records: recs });
  },

  // ── Attendance ─────────────────────────────────────────────────────────────
  'GET /attendance/me': async () => {
    await delay();
    const stored = localStorage.getItem('user');
    const user   = stored ? JSON.parse(stored) : null;
    const worker = workers.find(w => w.userId === user?._id) || workers[0];
    return ok(attendance.filter(a => a.worker === worker._id).sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 90));
  },

  'GET /attendance/:projectId': async ({ params, query }) => {
    await delay();
    let result = attendance.filter(a => a.project === params.projectId);
    if (query.date) {
      const qs = new Date(query.date).toDateString();
      result   = result.filter(a => new Date(a.date).toDateString() === qs);
    }
    if (query.workerId) result = result.filter(a => a.worker === query.workerId);
    return ok(result);
  },

  'POST /attendance/:projectId': async ({ params, body }) => {
    await delay();
    const key      = `att_${params.projectId}_${body.worker}_${new Date(body.date).toDateString()}`;
    const existing = attendance.findIndex(a => a._id === key);
    const record   = { _id: key, project: params.projectId, ...body, markedBy: 'u1' };
    if (existing >= 0) attendance = attendance.map((a, i) => i === existing ? record : a);
    else attendance = [...attendance, record];
    return ok(record);
  },

  'POST /attendance/:projectId/bulk': async ({ params, body }) => {
    await delay();
    const { records, date } = body;
    records.forEach(r => {
      const key    = `att_${params.projectId}_${r.worker}_${new Date(date).toDateString()}`;
      const idx    = attendance.findIndex(a => a._id === key);
      const record = { _id: key, project: params.projectId, worker: r.worker, date, status: r.status, markedBy: 'u1' };
      if (idx >= 0) attendance = attendance.map((a, i) => i === idx ? record : a);
      else attendance = [...attendance, record];
    });
    return okMsg('Attendance saved');
  },

  'PUT /attendance/:id/edit': async ({ params, body }) => {
    await delay();
    attendance = attendance.map(a => a._id === params.id ? { ...a, status: body.status } : a);
    return ok(attendance.find(a => a._id === params.id));
  },

  // ── Transactions ───────────────────────────────────────────────────────────
  'GET /transactions/:projectId/summary': async ({ params }) => {
    await delay();
    const pTxns    = transactions.filter(t => t.project === params.projectId);
    const income   = pTxns.filter(t => ['client_receipt','refund'].includes(t.type)).reduce((s,t) => s + t.amount, 0);
    const expenses = pTxns.filter(t => !['client_receipt','refund'].includes(t.type)).reduce((s,t) => s + t.amount, 0);
    return ok({ income, expenses, profit: income - expenses, transactions: pTxns.length });
  },

  'GET /transactions/:projectId': async ({ params, query }) => {
    await delay();
    let result = transactions.filter(t => t.project === params.projectId);
    if (query.type)     result = result.filter(t => t.type     === query.type);
    if (query.category) result = result.filter(t => t.category === query.category);
    if (query.status)   result = result.filter(t => t.status   === query.status);
    return ok([...result].reverse());
  },

  'POST /transactions/:projectId': async ({ params, body }) => {
    await delay();
    const newT = { _id: 'tx_' + Date.now(), project: params.projectId, status: 'pending', date: new Date().toISOString(), ...body, createdBy: { _id:'u1', name:'Ahmed Khan' } };
    transactions = [...transactions, newT];
    return { data: { success: true, data: newT } };
  },

  'PUT /transactions/:id': async ({ params, body }) => {
    await delay();
    transactions = transactions.map(t => t._id === params.id ? { ...t, ...body } : t);
    return ok(transactions.find(t => t._id === params.id));
  },

  'DELETE /transactions/:id': async ({ params }) => {
    await delay();
    transactions = transactions.filter(t => t._id !== params.id);
    return okMsg('Transaction deleted');
  },

  // ── Documents ──────────────────────────────────────────────────────────────
  'GET /documents/:projectId': async ({ params }) => {
    await delay();
    return ok(documents.filter(d => d.project === params.projectId));
  },

  'POST /documents/:projectId': async ({ params, body }) => {
    await delay();
    const newD = { _id: 'd_' + Date.now(), project: params.projectId, activeVersion: 1, sharedWithClient: false,
      versions: [{ versionNumber: 1, fileName: body.name, fileSize: 0, status: 'for_review', uploadedAt: new Date().toISOString(), notes: body.notes || '' }],
      ...body, createdBy: { _id:'u1', name:'Ahmed Khan' }, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    documents = [...documents, newD];
    return { data: { success: true, data: newD } };
  },

  'POST /documents/:projectId/:id/version': async ({ params, body }) => {
    await delay();
    documents = documents.map(d => {
      if (d._id !== params.id) return d;
      const newVer = { versionNumber: (d.activeVersion || 1) + 1, ...body, uploadedAt: new Date().toISOString() };
      return { ...d, activeVersion: newVer.versionNumber, versions: [...(d.versions||[]), newVer], updatedAt: new Date().toISOString() };
    });
    return ok(documents.find(d => d._id === params.id));
  },

  'PUT /documents/:id/share': async ({ params, body }) => {
    await delay();
    documents = documents.map(d => d._id === params.id ? { ...d, sharedWithClient: body.shared } : d);
    return ok(documents.find(d => d._id === params.id));
  },

  'DELETE /documents/:id': async ({ params }) => {
    await delay();
    documents = documents.filter(d => d._id !== params.id);
    return okMsg('Document deleted');
  },

  // ── Vendors ────────────────────────────────────────────────────────────────
  'GET /vendors': async () => {
    await delay();
    return ok(vendors.filter(v => v.isActive));
  },

  'GET /vendors/:id': async ({ params }) => {
    await delay();
    const v = vendors.find(x => x._id === params.id);
    if (!v) notFound('Vendor not found');
    return ok(v);
  },

  'POST /vendors': async ({ body }) => {
    await delay();
    const newV = {
      _id: 'v_' + Date.now(), owner: 'u1', isActive: true,
      createdAt: new Date().toISOString(), ...body,
      // Mask aadhar if provided
      aadharNumber: body.aadharNumber ? 'XXXX-XXXX-' + String(body.aadharNumber).slice(-4) : undefined,
    };
    vendors = [...vendors, newV];
    return { data: { success: true, data: newV } };
  },

  'PUT /vendors/:id': async ({ params, body }) => {
    await delay();
    vendors = vendors.map(v => v._id === params.id ? { ...v, ...body } : v);
    return ok(vendors.find(v => v._id === params.id));
  },

  'DELETE /vendors/:id': async ({ params }) => {
    await delay();
    vendors = vendors.map(v => v._id === params.id ? { ...v, isActive: false } : v);
    return okMsg('Vendor deactivated');
  },

  // ── Purchase Orders ────────────────────────────────────────────────────────
  'GET /purchase-orders': async ({ query }) => {
    await delay();
    let result = [...purchaseOrders];
    if (query.project) result = result.filter(po => po.project === query.project);
    if (query.status && query.status !== 'all') result = result.filter(po => po.status === query.status);
    if (query.vendor)  result = result.filter(po => po.vendor  === query.vendor);
    return ok(result.map(populatePO).reverse());
  },

  'GET /purchase-orders/:id': async ({ params }) => {
    await delay();
    const po = purchaseOrders.find(x => x._id === params.id);
    if (!po) notFound('PO not found');
    return ok(populatePO(po));
  },

  'POST /purchase-orders': async ({ body }) => {
    await delay();
    // Auto-generate PO number
    const year   = new Date().getFullYear();
    const yearPOs = purchaseOrders.filter(po => po.poNumber?.startsWith(`PO-${year}-`));
    const seq     = yearPOs.length + 1;
    const poNumber = `PO-${year}-${String(seq).padStart(4, '0')}`;

    // Compute item totals
    const items = (body.items || []).map(item => ({
      ...item,
      total: (Number(item.qty) || 0) * (Number(item.rate) || 0),
    }));
    const subtotal    = items.reduce((s, i) => s + i.total, 0);
    const tax         = Number(body.tax) || 0;
    const totalAmount = subtotal + tax;

    const newPO = {
      _id: 'po_' + Date.now(), owner: 'u1', poNumber, status: 'draft',
      items, subtotal, tax, totalAmount,
      createdBy: 'u1', createdAt: new Date().toISOString(), ...body,
      // Override computed fields
      items, subtotal, tax, totalAmount,
    };
    purchaseOrders = [...purchaseOrders, newPO];
    pushNotif('po_created', `${poNumber} Created`, `New PO for ${vendors.find(v => v._id === newPO.vendor)?.companyName || 'vendor'} created.`, newPO.project);
    return { data: { success: true, data: populatePO(newPO) } };
  },

  'PUT /purchase-orders/:id': async ({ params, body }) => {
    await delay();
    const po = purchaseOrders.find(x => x._id === params.id);
    if (!po) notFound();
    if (po.status !== 'draft') throw { response: { status: 400, data: { message: 'Only draft POs can be edited' } } };
    purchaseOrders = purchaseOrders.map(x => x._id === params.id ? { ...x, ...body } : x);
    return ok(populatePO(purchaseOrders.find(x => x._id === params.id)));
  },

  'DELETE /purchase-orders/:id': async ({ params }) => {
    await delay();
    const po = purchaseOrders.find(x => x._id === params.id);
    if (!po) notFound();
    if (po.status !== 'draft') throw { response: { status: 400, data: { message: 'Only draft POs can be deleted' } } };
    purchaseOrders = purchaseOrders.filter(x => x._id !== params.id);
    return okMsg('PO deleted');
  },

  // PDF download — return a placeholder (in real API this streams a PDF)
  'GET /purchase-orders/:id/pdf': async ({ params }) => {
    await delay(500);
    const po = purchaseOrders.find(x => x._id === params.id);
    if (!po) notFound();
    // Return a mock "file URL" — in real app this would stream a PDF
    return ok({ pdfUrl: `#mock-pdf-${po.poNumber}`, message: 'PDF ready (mock)' });
  },

  // Send PO via email
  'POST /purchase-orders/:id/send': async ({ params, body }) => {
    await delay(400);
    const po = purchaseOrders.find(x => x._id === params.id);
    if (!po) notFound();
    purchaseOrders = purchaseOrders.map(x => x._id === params.id ? {
      ...x,
      status: x.status === 'draft' ? 'sent' : x.status,
      sentToVendor: body.sendToVendor ? true : x.sentToVendor,
      sentToClient: body.sendToClient ? true : x.sentToClient,
    } : x);
    return okMsg(`PO sent successfully (mock — no email sent in demo mode)`);
  },

  // Status transitions
  'PUT /purchase-orders/:id/status': async ({ params, body }) => {
    await delay();
    const po = purchaseOrders.find(x => x._id === params.id);
    if (!po) notFound();

    purchaseOrders = purchaseOrders.map(x => x._id === params.id ? {
      ...x, status: body.status,
      ...(body.status === 'paid' ? { paidAt: new Date().toISOString() } : {}),
    } : x);

    // If marking as paid → update project.budgetSpent + create transaction
    if (body.status === 'paid') {
      const vendor = vendors.find(v => v._id === po.vendor);
      projects = projects.map(p => {
        if (p._id !== po.project) return p;
        const spent = { ...(p.budgetSpent || { total: 0, structure: 0, labour: 0, mep: 0, finishing: 0, misc: 0 }) };
        spent.total = (spent.total || 0) + po.totalAmount;
        spent[po.category] = (spent[po.category] || 0) + po.totalAmount;
        return { ...p, budgetSpent: spent };
      });
      transactions = [...transactions, {
        _id: 'tx_' + Date.now(), project: po.project, type: 'material_purchase',
        category: po.category, amount: po.totalAmount, description: `PO ${po.poNumber}`,
        vendor: vendor?.companyName || 'Unknown Vendor', invoiceNo: po.poNumber,
        poRef: po._id, status: 'paid', date: new Date().toISOString(),
        createdBy: { _id: 'u1', name: 'Ahmed Khan' },
      }];
      pushNotif('po_paid', `${po.poNumber} Marked as Paid`,
        `₹${po.totalAmount.toLocaleString()} paid to ${vendor?.companyName || 'vendor'}`, po.project);
    }

    return ok(populatePO(purchaseOrders.find(x => x._id === params.id)));
  },

  // ── Payment Schedules ──────────────────────────────────────────────────────
  'GET /payment-schedules/:projectId': async ({ params }) => {
    await delay();
    return ok(paymentSchedules.filter(ps => ps.project === params.projectId));
  },

  'POST /payment-schedules/:projectId': async ({ params, body }) => {
    await delay();
    const newPS = {
      _id: 'ps_' + Date.now(), project: params.projectId, owner: 'u1',
      status: 'pending', currency: 'INR',
      createdAt: new Date().toISOString(), ...body,
    };
    paymentSchedules = [...paymentSchedules, newPS];
    return { data: { success: true, data: newPS } };
  },

  'PUT /payment-schedules/:id': async ({ params, body }) => {
    await delay();
    paymentSchedules = paymentSchedules.map(ps => ps._id === params.id ? { ...ps, ...body } : ps);
    return ok(paymentSchedules.find(ps => ps._id === params.id));
  },

  'PUT /payment-schedules/:id/request': async ({ params }) => {
    await delay();
    paymentSchedules = paymentSchedules.map(ps => ps._id === params.id
      ? { ...ps, status: 'requested', requestedAt: new Date().toISOString() }
      : ps);
    const ps = paymentSchedules.find(x => x._id === params.id);
    pushNotif('payment_requested', `Payment Requested — ${ps?.milestoneName}`,
      `Client has been notified for ₹${(ps?.amount||0).toLocaleString()} milestone payment.`, ps?.project);
    return ok(paymentSchedules.find(ps => ps._id === params.id));
  },

  'PUT /payment-schedules/:id/received': async ({ params }) => {
    await delay();
    paymentSchedules = paymentSchedules.map(ps => ps._id === params.id
      ? { ...ps, status: 'received', receivedAt: new Date().toISOString() }
      : ps);
    const ps = paymentSchedules.find(x => x._id === params.id);
    pushNotif('payment_received', `Payment Received — ${ps?.milestoneName}`,
      `₹${(ps?.amount||0).toLocaleString()} received from client.`, ps?.project);
    return ok(paymentSchedules.find(ps => ps._id === params.id));
  },

  'DELETE /payment-schedules/:id': async ({ params }) => {
    await delay();
    paymentSchedules = paymentSchedules.filter(ps => ps._id !== params.id);
    return okMsg('Payment schedule deleted');
  },

  // ── Client Portal ──────────────────────────────────────────────────────────
  'GET /client/project': async () => {
    await delay();
    // Logged-in client → p1 (Tariq's project)
    const p = projects.find(x => x._id === 'p1');
    return ok(p);
  },

  'GET /client/activity-feed': async () => {
    await delay(200);
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000);

    // Recent completed tasks
    const recentTasks = tasks
      .filter(t => t.project === 'p1' && t.status === 'completed' && t.completedAt && new Date(t.completedAt) >= sevenDaysAgo)
      .map(t => ({ date: t.completedAt, type: 'task_completed', description: `Task completed: ${t.title}`, icon: 'check' }));

    // Recent site diary entries
    const recentDiary = siteDiary
      .filter(s => s.project === 'p1')
      .slice(0, 5)
      .map(s => ({ date: s.createdAt, type: 'site_diary', description: `Site report: ${s.workDone.slice(0, 80)}...`, icon: 'book', weather: s.weather, workersPresent: s.workersPresent }));

    // Payment events
    const paymentEvents = paymentSchedules
      .filter(ps => ps.project === 'p1' && ps.status !== 'pending')
      .map(ps => ({ date: ps.receivedAt || ps.requestedAt, type: ps.status === 'received' ? 'payment_received' : 'payment_requested', description: ps.status === 'received' ? `Payment received: ${ps.milestoneName} — ₹${ps.amount.toLocaleString()}` : `Payment requested: ${ps.milestoneName}`, icon: 'rupee' }));

    const feed = [...recentTasks, ...recentDiary, ...paymentEvents]
      .filter(e => e.date)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 20);

    return ok(feed);
  },

  'GET /client/payment-schedule': async () => {
    await delay();
    const schedule = paymentSchedules.filter(ps => ps.project === 'p1');
    const totalReceived = schedule.filter(ps => ps.status === 'received').reduce((s, ps) => s + ps.amount, 0);
    const totalPending  = schedule.filter(ps => ps.status !== 'received').reduce((s, ps) => s + ps.amount, 0);
    return ok({ schedule, totalReceived, totalPending });
  },

  'GET /client/builder-profile': async () => {
    await delay(100);
    const admin = users.find(u => u._id === 'u1');
    return ok({
      name:        admin.name,
      company:     admin.company,
      phone:       admin.phone,
      email:       admin.email,
      bankDetails: admin.bankDetails,
    });
  },

  'GET /client/documents': async () => {
    await delay();
    const clientDocs = documents.filter(d => d.project === 'p1' && d.sharedWithClient);
    return ok(clientDocs);
  },

  // ── Site Diary ─────────────────────────────────────────────────────────────
  'GET /site-diary/:projectId': async ({ params, query }) => {
    await delay();
    let result = siteDiary
      .filter(e => e.project === params.projectId)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    const page  = parseInt(query.page  || '1');
    const limit = parseInt(query.limit || '10');
    const total = result.length;
    result = result.slice((page - 1) * limit, page * limit);
    return { data: { success: true, data: result, total, page, pages: Math.ceil(total / limit) } };
  },

  'POST /site-diary/:projectId': async ({ params, body }) => {
    await delay();
    // Check duplicate date
    const existing = siteDiary.find(
      e => e.project === params.projectId &&
           new Date(e.date).toDateString() === new Date(body.date).toDateString()
    );
    if (existing) throw { response: { status: 409, data: { message: 'Entry for this date already exists' } } };

    const newEntry = {
      _id: 'sd_' + Date.now(), project: params.projectId,
      reportedBy: { _id: 'u2', name: 'Usman Ali' },
      ...body, createdAt: new Date().toISOString(),
    };
    siteDiary = [newEntry, ...siteDiary];
    return { data: { success: true, data: newEntry } };
  },

  'GET /site-diary/:projectId/:id': async ({ params }) => {
    await delay(100);
    const entry = siteDiary.find(e => e._id === params.id && e.project === params.projectId);
    if (!entry) notFound('Diary entry not found');
    return ok(entry);
  },

  'PUT /site-diary/:projectId/:id': async ({ params, body }) => {
    await delay();
    siteDiary = siteDiary.map(e =>
      e._id === params.id ? { ...e, ...body, updatedAt: new Date().toISOString() } : e
    );
    return ok(siteDiary.find(e => e._id === params.id));
  },

  // ── Inventory ──────────────────────────────────────────────────────────────
  'GET /inventory/:projectId': async ({ params }) => {
    await delay();
    return ok(inventory.filter(i => i.project === params.projectId));
  },

  'POST /inventory/:projectId': async ({ params, body }) => {
    await delay();
    const newItem = {
      _id: 'inv_' + Date.now(), project: params.projectId, owner: 'u1',
      currentStock: 0, minimumStock: 0, transactions: [],
      createdAt: new Date().toISOString(), ...body,
    };
    inventory = [...inventory, newItem];
    return { data: { success: true, data: newItem } };
  },

  'PUT /inventory/:projectId/:id': async ({ params, body }) => {
    await delay();
    inventory = inventory.map(i => i._id === params.id ? { ...i, ...body } : i);
    return ok(inventory.find(i => i._id === params.id));
  },

  'DELETE /inventory/:projectId/:id': async ({ params }) => {
    await delay();
    inventory = inventory.filter(i => i._id !== params.id);
    return okMsg('Item deleted');
  },

  // Stock IN
  'PUT /inventory/:projectId/:id/in': async ({ params, body }) => {
    await delay();
    inventory = inventory.map(i => {
      if (i._id !== params.id) return i;
      const qty      = Number(body.quantity) || 0;
      const newStock = (i.currentStock || 0) + qty;
      return {
        ...i,
        currentStock: newStock,
        transactions: [...(i.transactions || []), {
          type: 'in', quantity: qty, date: new Date().toISOString(),
          description: body.description || 'Stock received', recordedBy: 'u1',
        }],
      };
    });
    return ok(inventory.find(i => i._id === params.id));
  },

  // Stock OUT
  'PUT /inventory/:projectId/:id/out': async ({ params, body }) => {
    await delay();
    const item = inventory.find(i => i._id === params.id);
    if (!item) notFound();
    const qty      = Number(body.quantity) || 0;
    const newStock = (item.currentStock || 0) - qty;

    inventory = inventory.map(i => {
      if (i._id !== params.id) return i;
      return {
        ...i,
        currentStock: newStock,
        transactions: [...(i.transactions || []), {
          type: 'out', quantity: qty, date: new Date().toISOString(),
          description: body.description || 'Stock consumed', recordedBy: 'u1',
        }],
      };
    });

    // Low stock notification if at or below minimum
    if (newStock <= (item.minimumStock || 0)) {
      pushNotif('low_stock',
        `Low Stock Alert — ${item.itemName}`,
        `Only ${newStock} ${item.unit} remaining (min: ${item.minimumStock}). Reorder required.`,
        item.project
      );
    }

    return ok(inventory.find(i => i._id === params.id));
  },

  // ── Reports ────────────────────────────────────────────────────────────────
  'GET /reports/payroll/:projectId': async ({ params, query }) => {
    await delay(300);
    const project   = projects.find(p => p._id === params.projectId);
    const month     = parseInt(query.month || new Date().getMonth() + 1);
    const year      = parseInt(query.year  || new Date().getFullYear());
    const mul       = { present: 1, half_day: 0.5, overtime: 1.5, absent: 0 };

    const projectWorkers = workers.filter(w => w.projects?.includes(params.projectId));
    const workerRows = projectWorkers.map(w => {
      const recs = attendance.filter(a => {
        const d = new Date(a.date);
        return a.project === params.projectId && a.worker === w._id &&
               d.getMonth() + 1 === month && d.getFullYear() === year;
      });
      const days     = recs.reduce((s, r) => s + (mul[r.status] || 0), 0);
      const total    = w.payType === 'monthly' ? w.rate : days * w.rate;
      return { _id: w._id, name: w.name, trade: w.trade, payType: w.payType, rate: w.rate, days, total };
    });

    const grandTotal = workerRows.reduce((s, r) => s + r.total, 0);
    return ok({ project, month, year, workers: workerRows, grandTotal });
  },

  // PDF — return a mock blob indicator (real API would stream pdfkit)
  'GET /reports/payroll/:projectId/pdf': async ({ params, query }) => {
    await delay(500);
    return ok({ message: 'PDF generation is available in live mode only. Use CSV export in demo mode.' });
  },

  'GET /reports/budget/:projectId': async ({ params }) => {
    await delay(200);
    const project = projects.find(p => p._id === params.projectId);
    if (!project) notFound();

    const budget = project.budget      || { total: 0, structure: 0, labour: 0, mep: 0, finishing: 0, misc: 0 };
    const spent  = project.budgetSpent || { total: 0, structure: 0, labour: 0, mep: 0, finishing: 0, misc: 0 };
    const categories = ['structure', 'labour', 'mep', 'finishing', 'misc'];

    const breakdown = categories.map(cat => ({
      category:  cat,
      budget:    budget[cat] || 0,
      spent:     spent[cat]  || 0,
      variance:  (budget[cat] || 0) - (spent[cat] || 0),
      pct:       budget[cat] ? Math.round((spent[cat] || 0) / budget[cat] * 100) : 0,
    }));

    return ok({
      project:   { _id: project._id, name: project.name },
      budget,
      spent,
      breakdown,
      overBudget: (spent.total || 0) > (budget.total || 0),
      pctUsed:    budget.total ? Math.round((spent.total || 0) / budget.total * 100) : 0,
    });
  },
};

// ── Router ───────────────────────────────────────────────────────────────────
const parseQueryString = (url) => {
  const [path, qs] = url.split('?');
  const query = {};
  if (qs) qs.split('&').forEach(p => {
    const [k, v] = p.split('=');
    if (k) query[k] = decodeURIComponent(v || '');
  });
  return { path, query };
};

const route = async (method, url, body) => {
  const { path, query } = parseQueryString(url);

  // Sort: exact routes first, then longer patterns first (avoids short-circuit)
  const handlerKeys = Object.keys(handlers).sort((a, b) => {
    const aParam = a.includes(':'), bParam = b.includes(':');
    if (aParam !== bParam) return aParam ? 1 : -1;
    return b.length - a.length;
  });

  for (const key of handlerKeys) {
    const spaceIdx  = key.indexOf(' ');
    const hMethod   = key.slice(0, spaceIdx);
    const hPattern  = key.slice(spaceIdx + 1);
    if (hMethod !== method) continue;
    const params = matchPattern(hPattern, path);
    if (params !== null) {
      return handlers[key]({ params, query, body });
    }
  }
  console.warn(`[MockAPI] No handler for ${method} ${url}`);
  throw new Error(`No mock handler: ${method} ${url}`);
};

// ── Public API (same interface as axios instance) ─────────────────────────────
const mockApi = {
  get:    (url, config)       => route('GET',    url, null),
  post:   (url, data, config) => route('POST',   url, data),
  put:    (url, data, config) => route('PUT',    url, data),
  delete: (url, config)       => route('DELETE', url, null),
};

export default mockApi;
