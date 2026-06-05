import {
  MOCK_USERS, MOCK_PROJECTS, MOCK_WORKERS,
  MOCK_TASKS, MOCK_TRANSACTIONS, MOCK_DOCUMENTS, MOCK_ATTENDANCE,
} from './mockData';

// Simulate network delay (ms)
const delay = (ms = 250) => new Promise(r => setTimeout(r, ms));

// Simple in-memory store so POST/DELETE updates persist during a session
let projects     = [...MOCK_PROJECTS];
let workers      = [...MOCK_WORKERS];
let tasks        = [...MOCK_TASKS];
let transactions = [...MOCK_TRANSACTIONS];
let documents    = [...MOCK_DOCUMENTS];
let attendance   = [...MOCK_ATTENDANCE];

const ok  = (data) => ({ data: { success: true, data } });
const okMsg = (message) => ({ data: { success: true, message } });

// ── URL pattern matching ─────────────────────────────────────────────────────
const match = (pattern, url) => {
  const re = pattern.replace(/:([^/]+)/g, '([^/]+)');
  const m = url.match(new RegExp(`^${re}$`));
  if (!m) return null;
  const keys = [...pattern.matchAll(/:([^/]+)/g)].map(k => k[1]);
  const params = {};
  keys.forEach((k, i) => { params[k] = m[i + 1]; });
  return params;
};

// ── HANDLERS ─────────────────────────────────────────────────────────────────
const handlers = {

  // Auth ─────────────────────────────────────────────────────────────────────
  'POST /auth/login': async ({ body }) => {
    await delay();
    const user = MOCK_USERS.find(u => u.email === body.email);
    if (!user) throw { response: { data: { message: 'Invalid credentials' } } };
    return { data: { success: true, token: 'mock_jwt_token_' + user._id, user } };
  },
  'POST /auth/register': async ({ body }) => {
    await delay();
    const newUser = { _id: 'u_new_' + Date.now(), ...body };
    return { data: { success: true, token: 'mock_jwt_token_' + newUser._id, user: newUser } };
  },
  'GET /auth/me': async () => {
    await delay(100);
    const stored = localStorage.getItem('user');
    return ok(stored ? JSON.parse(stored) : MOCK_USERS[0]);
  },

  // Dashboard ────────────────────────────────────────────────────────────────
  'GET /dashboard': async () => {
    await delay();
    const totalBudget = projects.reduce((s, p) => s + (p.budget?.total || 0), 0);
    const avgCompletion = projects.length
      ? Math.round(projects.reduce((s, p) => s + p.completion, 0) / projects.length)
      : 0;
    return ok({
      totalProjects: projects.length,
      activeProjects: projects.filter(p => p.status === 'active').length,
      totalBudget,
      avgCompletion,
      totalWorkers: workers.filter(w => w.isActive).length,
      recentProjects: [...projects].reverse().slice(0, 5),
    });
  },
  'GET /dashboard/project/:projectId': async ({ params }) => {
    await delay();
    const project = projects.find(p => p._id === params.projectId);
    if (!project) throw { response: { status: 404 } };
    const pTasks = tasks.filter(t => t.project === params.projectId);
    const pTxns  = transactions.filter(t => t.project === params.projectId);
    const today  = new Date().toDateString();
    const todayAttendance = attendance.filter(
      a => a.project === params.projectId &&
           new Date(a.date).toDateString() === today &&
           ['present','overtime'].includes(a.status)
    ).length;
    const income   = pTxns.filter(t => ['client_receipt','refund'].includes(t.type)).reduce((s,t) => s + t.amount, 0);
    const expenses = pTxns.filter(t => !['client_receipt','refund'].includes(t.type)).reduce((s,t) => s + t.amount, 0);
    return ok({
      project,
      tasks: { total: pTasks.length, completed: pTasks.filter(t => t.status === 'completed').length, open: pTasks.filter(t => t.status === 'open').length },
      finance: { income, expenses, profit: income - expenses, budgetRemaining: (project.budget?.total || 0) - expenses },
      todayAttendance,
    });
  },

  // Projects ─────────────────────────────────────────────────────────────────
  'GET /projects': async () => { await delay(); return ok(projects); },
  'GET /projects/:id': async ({ params }) => {
    await delay();
    const p = projects.find(p => p._id === params.id);
    if (!p) throw { response: { status: 404 } };
    return ok(p);
  },
  'POST /projects': async ({ body }) => {
    await delay();
    const newP = { _id: 'p_' + Date.now(), completion: 0, status: 'planning', currency: 'PKR', phases: [], ...body, owner: 'u1', createdAt: new Date().toISOString() };
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

  // Tasks ────────────────────────────────────────────────────────────────────
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
    tasks = tasks.map(t => t._id === params.id ? { ...t, ...body, ...(body.status === 'completed' ? { completedAt: new Date().toISOString() } : {}) } : t);
    return ok(tasks.find(t => t._id === params.id));
  },
  'DELETE /tasks/:id': async ({ params }) => {
    await delay();
    tasks = tasks.filter(t => t._id !== params.id);
    return okMsg('Task deleted');
  },

  // Workers ──────────────────────────────────────────────────────────────────
  'GET /workers': async () => { await delay(); return ok(workers.filter(w => w.isActive)); },
  'GET /workers/:id': async ({ params }) => { await delay(); return ok(workers.find(w => w._id === params.id)); },
  'POST /workers': async ({ body }) => {
    await delay();
    const newW = { _id: 'w_' + Date.now(), isActive: true, currency: 'PKR', projects: [], payment: { method: 'cash' }, ...body, owner: 'u1', joinDate: new Date().toISOString() };
    workers = [...workers, newW];
    return { data: { success: true, data: newW } };
  },
  'PUT /workers/:id': async ({ params, body }) => {
    await delay();
    const updates = { ...body };
    if (updates.rate != null) updates.rate = Number(updates.rate);
    workers = workers.map(w => w._id === params.id ? { ...w, ...updates } : w);
    const updated = workers.find(w => w._id === params.id);
    if (!updated) return { data: { success: false, message: 'Worker not found' }, status: 404 };
    return ok(updated);
  },
  'DELETE /workers/:id': async ({ params }) => {
    await delay();
    workers = workers.map(w => w._id === params.id ? { ...w, isActive: false, leftDate: new Date().toISOString() } : w);
    return okMsg('Worker deactivated');
  },
  'GET /workers/:id/payroll': async ({ params, query }) => {
    await delay();
    const worker = workers.find(w => w._id === params.id);
    const recs = attendance.filter(a => a.worker === params.id);
    const mul = { present: 1, half_day: 0.5, overtime: 1.5, absent: 0 };
    const totalDays = recs.reduce((s, r) => s + (mul[r.status] || 0), 0);
    return ok({ worker, totalDays, totalPay: totalDays * (worker?.rate || 0), records: recs });
  },

  // Attendance ───────────────────────────────────────────────────────────────
  'GET /attendance/:projectId': async ({ params, query }) => {
    await delay();
    let result = attendance.filter(a => a.project === params.projectId);
    if (query.date) {
      const qs = new Date(query.date).toDateString();
      result = result.filter(a => new Date(a.date).toDateString() === qs);
    }
    if (query.workerId) result = result.filter(a => a.worker === query.workerId);
    return ok(result);
  },
  'POST /attendance/:projectId': async ({ params, body }) => {
    await delay();
    const key = `att_${params.projectId}_${body.worker}_${new Date(body.date).toDateString()}`;
    const existing = attendance.findIndex(a => a._id === key);
    const record = { _id: key, project: params.projectId, ...body, markedBy: 'u1' };
    if (existing >= 0) attendance = attendance.map((a, i) => i === existing ? record : a);
    else attendance = [...attendance, record];
    return ok(record);
  },
  'POST /attendance/:projectId/bulk': async ({ params, body }) => {
    await delay();
    const { records, date } = body;
    records.forEach(r => {
      const key = `att_${params.projectId}_${r.worker}_${new Date(date).toDateString()}`;
      const idx = attendance.findIndex(a => a._id === key);
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

  // Transactions ─────────────────────────────────────────────────────────────
  'GET /transactions/:projectId/summary': async ({ params }) => {
    await delay();
    const pTxns = transactions.filter(t => t.project === params.projectId);
    const income   = pTxns.filter(t => ['client_receipt','refund'].includes(t.type)).reduce((s,t) => s + t.amount, 0);
    const expenses = pTxns.filter(t => !['client_receipt','refund'].includes(t.type)).reduce((s,t) => s + t.amount, 0);
    return ok({ income, expenses, profit: income - expenses, transactions: pTxns.length });
  },
  'GET /transactions/:projectId': async ({ params, query }) => {
    await delay();
    let result = transactions.filter(t => t.project === params.projectId);
    if (query.type)     result = result.filter(t => t.type === query.type);
    if (query.category) result = result.filter(t => t.category === query.category);
    if (query.status)   result = result.filter(t => t.status === query.status);
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

  // Documents ────────────────────────────────────────────────────────────────
  'GET /documents/:projectId': async ({ params }) => {
    await delay();
    return ok(documents.filter(d => d.project === params.projectId));
  },
  'POST /documents/:projectId': async ({ params, body }) => {
    await delay();
    const newD = { _id: 'd_' + Date.now(), project: params.projectId, activeVersion: 1, versions: [{ versionNumber: 1, fileName: body.name, fileSize: 0, status: 'for_review', uploadedAt: new Date().toISOString(), notes: body.notes }], sharedWithClient: false, ...body, createdBy: { _id:'u1', name:'Ahmed Khan' }, createdAt: new Date().toISOString() };
    documents = [...documents, newD];
    return { data: { success: true, data: newD } };
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

  // Worker self-service ───────────────────────────────────────────────────────
  'GET /workers/me': async () => {
    await delay();
    const stored = localStorage.getItem('user');
    const user = stored ? JSON.parse(stored) : null;
    const worker = workers.find(w => w.userId === user?._id) || workers[0];
    return ok(worker);
  },
  'GET /attendance/me': async () => {
    await delay();
    const stored = localStorage.getItem('user');
    const user = stored ? JSON.parse(stored) : null;
    const worker = workers.find(w => w.userId === user?._id) || workers[0];
    return ok(attendance.filter(a => a.worker === worker._id).sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 90));
  },
};

// ── Router ───────────────────────────────────────────────────────────────────
const parseQueryString = (url) => {
  const [path, qs] = url.split('?');
  const query = {};
  if (qs) qs.split('&').forEach(p => { const [k, v] = p.split('='); query[k] = decodeURIComponent(v || ''); });
  return { path, query };
};

const route = async (method, url, body) => {
  const { path, query } = parseQueryString(url);

  // Exact (no :params) routes first, then by descending length to avoid short-circuit
  const handlerKeys = Object.keys(handlers).sort((a, b) => {
    const aParam = a.includes(':'), bParam = b.includes(':');
    if (aParam !== bParam) return aParam ? 1 : -1;
    return b.length - a.length;
  });

  for (const key of handlerKeys) {
    const [hMethod, hPattern] = key.split(' ');
    if (hMethod !== method) continue;
    const params = match(hPattern, path);
    if (params !== null) {
      return handlers[key]({ params, query, body });
    }
  }
  throw new Error(`No mock handler found for ${method} ${url}`);
};

// ── Public API (same interface as axios) ─────────────────────────────────────
const mockApi = {
  get:    (url, config)         => route('GET',    url, null),
  post:   (url, data, config)   => route('POST',   url, data),
  put:    (url, data, config)   => route('PUT',    url, data),
  delete: (url, config)         => route('DELETE', url, null),
};

export default mockApi;
