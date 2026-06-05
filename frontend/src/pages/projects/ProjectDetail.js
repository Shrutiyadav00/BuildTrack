import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Plus, CheckSquare, Wallet, FileText, LayoutDashboard, ArrowLeft, ClipboardList } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { useSettings } from '../../context/SettingsContext';

const STATUS_BADGE = { active:'badge-green', planning:'badge-yellow', on_hold:'badge-red', completed:'badge-blue', cancelled:'badge-gray' };
const TYPE_COLORS  = { residential:'badge-purple', commercial:'badge-blue', industrial:'badge-orange', infrastructure:'badge-teal' };
const PRIORITY_BADGE = { low:'badge-gray', medium:'badge-blue', high:'badge-yellow', critical:'badge-red' };

export default function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject]    = useState(null);
  const [stats, setStats]        = useState(null);
  const [tasks, setTasks]        = useState([]);
  const [transactions, setTrans] = useState([]);
  const [documents, setDocs]     = useState([]);
  const [tab, setTab]            = useState('overview');
  const [loading, setLoading]    = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskForm, setTaskForm]  = useState({ title:'', priority:'medium', dueDate:'', description:'' });
  const { t, fmt, fmtShort }     = useSettings();

  useEffect(() => {
    Promise.all([
      api.get(`/projects/${id}`),
      api.get(`/dashboard/project/${id}`),
      api.get(`/tasks?projectId=${id}`),
      api.get(`/transactions/${id}`),
      api.get(`/documents/${id}`)
    ]).then(([p, s, tk, tx, d]) => {
      setProject(p.data.data);
      setStats(s.data.data);
      setTasks(tk.data.data);
      setTrans(tx.data.data);
      setDocs(d.data.data);
    }).catch(() => toast.error('Failed to load project'))
      .finally(() => setLoading(false));
  }, [id]);

  const createTask = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tasks', { ...taskForm, project: id });
      toast.success('Task created');
      setShowTaskModal(false);
      setTaskForm({ title:'', priority:'medium', dueDate:'', description:'' });
      const res = await api.get(`/tasks?projectId=${id}`);
      setTasks(res.data.data);
    } catch { toast.error('Failed to create task'); }
  };

  const setTF = (f) => (e) => setTaskForm({ ...taskForm, [f]: e.target.value });

  if (loading) return <div className="loading"><div className="spinner" /><span className="loading-text">{t('loading')}…</span></div>;
  if (!project) return <div className="loading">Project not found</div>;

  const TABS = [
    { key:'overview',  label:t('dashboard'),  Icon:LayoutDashboard },
    { key:'tasks',     label:'Tasks',         Icon:ClipboardList  },
    { key:'finance',   label:t('finance'),    Icon:Wallet         },
    { key:'documents', label:t('documents'),  Icon:FileText       },
  ];

  return (
    <div>
      <div className="page-header">
        <div className="page-header-text">
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
            <Link to="/projects" style={{ color:'var(--t3)', display:'flex', alignItems:'center', gap:4, fontSize:13 }}>
              <ArrowLeft size={13} /> {t('projects')}
            </Link>
          </div>
          <h1 style={{ marginBottom:4 }}>{project.name}</h1>
          {project.address && <p style={{ fontSize:13, color:'var(--t3)', margin:0 }}>{project.address}</p>}
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
          <span className={`badge ${TYPE_COLORS[project.type]||'badge-blue'}`}>{project.type}</span>
          <span className={`badge ${STATUS_BADGE[project.status]||'badge-gray'}`} style={{ fontSize:12.5, padding:'4px 12px' }}>
            {project.status?.replace(/_/g,' ')}
          </span>
        </div>
      </div>

      <div className="tabs" style={{ marginBottom:20 }}>
        {TABS.map(({ key, label, Icon }) => (
          <div key={key} className={`tab ${tab===key?'active':''}`} onClick={() => setTab(key)}
            style={{ display:'flex', alignItems:'center', gap:6 }}>
            <Icon size={14} />{label}
          </div>
        ))}
      </div>

      {tab === 'overview' && (
        <div>
          <div className="stats-grid">
            {[
              { cls:'si-blue',   label:'Total Tasks',   value: stats?.tasks?.total ?? 0 },
              { cls:'si-green',  label:'Completed',     value: stats?.tasks?.completed ?? 0 },
              { cls:'si-purple', label:'On Site Today', value: stats?.todayAttendance ?? 0 },
              { cls:'si-orange', label:`${t('budget')} Remaining`, value: fmtShort(stats?.finance?.budgetRemaining ?? 0), raw:true },
            ].map(({ cls, label, value, raw }) => (
              <div className="stat-card" key={label}>
                <div className={`stat-icon ${cls}`} />
                <div className="stat-body">
                  <div className="stat-value" style={{ fontSize:raw?18:26 }}>{value}</div>
                  <div className="stat-label">{label}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            <div className="card card-pad">
              <h2 style={{ fontSize:15, fontWeight:700, color:'var(--t1)', marginBottom:16 }}>Project Info</h2>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {[
                  [t('type'),    <span className={`badge ${TYPE_COLORS[project.type]||'badge-blue'}`}>{project.type}</span>],
                  [t('budget'),  fmtShort(project.budget?.total)],
                  ['Contract',   project.contractValue ? fmtShort(project.contractValue) : '—'],
                  ['Start',      project.startDate ? new Date(project.startDate).toLocaleDateString('en',{day:'numeric',month:'short',year:'numeric'}) : '—'],
                  ['End',        project.endDate   ? new Date(project.endDate).toLocaleDateString('en',{day:'numeric',month:'short',year:'numeric'}) : '—'],
                ].map(([lbl, val]) => (
                  <div key={lbl} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid var(--border)', paddingBottom:10 }}>
                    <span style={{ fontSize:13, color:'var(--t3)', fontWeight:500 }}>{lbl}</span>
                    <span style={{ fontSize:13.5, color:'var(--t1)', fontWeight:600 }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card card-pad">
              <h2 style={{ fontSize:15, fontWeight:700, color:'var(--t1)', marginBottom:16 }}>Completion</h2>
              <div style={{ marginBottom:20 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                  <span style={{ fontSize:13, color:'var(--t3)', fontWeight:500 }}>Overall Progress</span>
                  <span style={{ fontSize:13.5, fontWeight:700, color:'var(--primary)' }}>{project.completion}%</span>
                </div>
                <div className="progress-bar" style={{ height:10 }}>
                  <div className={`progress-fill ${project.completion>=100?'pf-green':project.completion>=50?'pf-primary':'pf-orange'}`}
                    style={{ width:`${project.completion}%` }} />
                </div>
              </div>
              {project.phases?.map((ph, i) => (
                <div key={i} style={{ marginBottom:8 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                    <span style={{ fontSize:12.5, color:'var(--t2)', fontWeight:600 }}>{ph.name}</span>
                    <span style={{ fontSize:12, color:'var(--t3)' }}>{ph.completion}%</span>
                  </div>
                  <div className="progress-bar" style={{ height:5 }}>
                    <div className="progress-fill pf-primary" style={{ width:`${ph.completion}%`, opacity:0.7 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'tasks' && (
        <div>
          <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:16 }}>
            <button className="btn btn-primary" onClick={() => setShowTaskModal(true)}>
              <Plus size={14} /> Add Task
            </button>
          </div>
          <div className="card">
            <div className="table-wrap">
              <table>
                <thead><tr><th>Title</th><th>Priority</th><th>{t('status')}</th><th>{t('date')}</th></tr></thead>
                <tbody>
                  {tasks.length === 0 ? (
                    <tr><td colSpan={4}>
                      <div className="empty-state">
                        <div className="empty-icon"><CheckSquare size={28} /></div>
                        <div className="empty-title">No tasks yet</div>
                      </div>
                    </td></tr>
                  ) : tasks.map(tk => (
                    <tr key={tk._id}>
                      <td style={{ fontWeight:600 }}>{tk.title}</td>
                      <td><span className={`badge ${PRIORITY_BADGE[tk.priority]||'badge-gray'}`}>{tk.priority}</span></td>
                      <td><span className="badge badge-blue">{tk.status?.replace(/_/g,' ')}</span></td>
                      <td style={{ color:'var(--t2)' }}>{tk.dueDate ? new Date(tk.dueDate).toLocaleDateString('en',{day:'numeric',month:'short'}) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {showTaskModal && (
            <div className="modal-overlay" onClick={() => setShowTaskModal(false)}>
              <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-head">
                  <h2>New Task</h2>
                  <button className="modal-close" onClick={() => setShowTaskModal(false)}>×</button>
                </div>
                <div className="modal-body">
                  <form id="task-form" onSubmit={createTask}>
                    <div className="form-group">
                      <label className="form-label">Title *</label>
                      <input className="form-input" value={taskForm.title} onChange={setTF('title')} required placeholder="e.g. Complete foundation work" />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Priority</label>
                        <select className="form-input" value={taskForm.priority} onChange={setTF('priority')}>
                          {['low','medium','high','critical'].map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">{t('date')}</label>
                        <input className="form-input" type="date" value={taskForm.dueDate} onChange={setTF('dueDate')} />
                      </div>
                    </div>
                    <div className="form-group mb-0">
                      <label className="form-label">{t('description')}</label>
                      <textarea className="form-input" rows={3} value={taskForm.description} onChange={setTF('description')} />
                    </div>
                  </form>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-outline" onClick={() => setShowTaskModal(false)}>{t('cancel')}</button>
                  <button className="btn btn-primary" type="submit" form="task-form"><Plus size={14} /> {t('create')}</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'finance' && (
        <div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:20 }}>
            {[
              { label:t('totalIncome'),   value:stats?.finance?.income,   accent:'var(--success)' },
              { label:t('totalExpenses'), value:stats?.finance?.expenses, accent:'var(--danger)' },
              { label:t('netProfit'),     value:stats?.finance?.profit,   accent:(stats?.finance?.profit??0)>=0?'var(--success)':'var(--danger)' },
            ].map(({ label, value, accent }) => (
              <div key={label} className="card card-pad" style={{ borderTop:`3px solid ${accent}` }}>
                <div style={{ fontSize:12.5, color:'var(--t3)', fontWeight:600, marginBottom:6 }}>{label}</div>
                <div style={{ fontSize:18, fontWeight:800, color:accent }}>{fmt(value ?? 0)}</div>
              </div>
            ))}
          </div>
          <div className="card">
            <div className="table-wrap">
              <table>
                <thead><tr><th>{t('description')}</th><th>{t('type')}</th><th>{t('amount')}</th><th>{t('date')}</th><th>{t('status')}</th></tr></thead>
                <tbody>
                  {transactions.length === 0 ? (
                    <tr><td colSpan={5}><div className="empty-state"><div className="empty-icon">💳</div><div className="empty-title">No transactions</div></div></td></tr>
                  ) : transactions.map(tx => (
                    <tr key={tx._id}>
                      <td style={{ fontWeight:600 }}>{tx.description}</td>
                      <td><span className="badge badge-gray">{tx.type?.replace(/_/g,' ')}</span></td>
                      <td style={{ fontWeight:700 }}>{fmt(tx.amount)}</td>
                      <td style={{ color:'var(--t3)' }}>{new Date(tx.date).toLocaleDateString('en',{day:'numeric',month:'short'})}</td>
                      <td><span className={`badge ${tx.status==='paid'?'badge-green':tx.status==='pending'?'badge-yellow':'badge-gray'}`}>{tx.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === 'documents' && (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead><tr><th>{t('name')}</th><th>Category</th><th>Versions</th><th>Visibility</th></tr></thead>
              <tbody>
                {documents.length === 0 ? (
                  <tr><td colSpan={4}><div className="empty-state"><div className="empty-icon"><FileText size={28} /></div><div className="empty-title">No documents</div></div></td></tr>
                ) : documents.map(d => (
                  <tr key={d._id}>
                    <td style={{ fontWeight:600 }}>{d.name}</td>
                    <td><span className="badge badge-blue">{d.category}</span></td>
                    <td>{d.versions?.length ?? 0}</td>
                    <td>{d.sharedWithClient ? <span className="badge badge-green">Client</span> : <span className="badge badge-gray">Private</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
