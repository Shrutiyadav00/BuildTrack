import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ChevronRight, Briefcase } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { useSettings } from '../../context/SettingsContext';

const STATUS_BADGE = { active:'badge-green', planning:'badge-yellow', on_hold:'badge-red', completed:'badge-blue', cancelled:'badge-gray' };
const TYPE_COLORS  = { residential:'badge-purple', commercial:'badge-blue', industrial:'badge-orange', infrastructure:'badge-teal' };

export default function Projects() {
  const [projects, setProjects]  = useState([]);
  const [loading, setLoading]    = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name:'', type:'residential', description:'', address:'', startDate:'', endDate:'', budgetTotal:'' });
  const { t, fmt, fmtShort } = useSettings();

  useEffect(() => { fetchProjects(); }, []);

  const fetchProjects = () => {
    api.get('/projects')
      .then(r => setProjects(r.data.data))
      .catch(() => toast.error('Failed to load projects'))
      .finally(() => setLoading(false));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/projects', {
        name: form.name, type: form.type, description: form.description,
        address: form.address, startDate: form.startDate, endDate: form.endDate,
        budget: { total: Number(form.budgetTotal) },
      });
      toast.success('Project created!');
      setShowModal(false);
      setForm({ name:'', type:'residential', description:'', address:'', startDate:'', endDate:'', budgetTotal:'' });
      fetchProjects();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to create'); }
  };

  const set = (f) => (e) => setForm({ ...form, [f]: e.target.value });

  if (loading) return <div className="loading"><div className="spinner" /><span className="loading-text">{t('loading')}…</span></div>;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-text">
          <h1>{t('projects')}</h1>
          <p>{projects.length} total project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={15} /> {t('newProject')}
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="card"><div className="empty-state">
          <div className="empty-icon">🏗</div>
          <div className="empty-title">No projects yet</div>
          <div className="empty-desc">Create your first construction project to get started</div>
        </div></div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {projects.map(p => (
            <Link key={p._id} to={`/projects/${p._id}`} style={{ textDecoration:'none' }}>
              <div className="card card-pad" style={{ display:'flex', alignItems:'center', gap:16, cursor:'pointer', transition:'var(--ease)' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow='var(--shadow)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow=''}>
                <div className="stat-icon si-blue" style={{ flexShrink:0 }}><Briefcase size={20} /></div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3, flexWrap:'wrap' }}>
                    <span style={{ fontWeight:700, fontSize:15, color:'var(--t1)' }}>{p.name}</span>
                    <span className={`badge ${TYPE_COLORS[p.type]||'badge-blue'}`}>{p.type}</span>
                    <span className={`badge ${STATUS_BADGE[p.status]||'badge-gray'}`}>{p.status?.replace(/_/g,' ')}</span>
                  </div>
                  {p.address && <div style={{ fontSize:12.5, color:'var(--t3)', marginBottom:6 }}>{p.address}</div>}
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div className="progress-bar" style={{ width:160 }}>
                      <div className={`progress-fill ${p.completion>=100?'pf-green':p.completion>=50?'pf-primary':'pf-orange'}`}
                        style={{ width:`${p.completion}%` }} />
                    </div>
                    <span style={{ fontSize:12, color:'var(--t3)', fontWeight:600 }}>{p.completion}%</span>
                  </div>
                </div>
                <div style={{ textAlign:'right', flexShrink:0 }}>
                  <div style={{ fontSize:15, fontWeight:700, color:'var(--t1)' }}>
                    {p.budget?.total ? fmtShort(p.budget.total) : '—'}
                  </div>
                  <div style={{ fontSize:12, color:'var(--t3)', marginTop:2 }}>{t('budget')}</div>
                </div>
                <ChevronRight size={16} color="var(--t4)" />
              </div>
            </Link>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <h2>{t('newProject')}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <form id="proj-form" onSubmit={handleCreate}>
                <div className="form-group">
                  <label className="form-label">{t('name')} *</label>
                  <input className="form-input" value={form.name} onChange={set('name')} required placeholder="e.g. DHA Phase 9 Villa" />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">{t('type')} *</label>
                    <select className="form-input" value={form.type} onChange={set('type')}>
                      <option value="residential">Residential</option>
                      <option value="commercial">Commercial</option>
                      <option value="industrial">Industrial</option>
                      <option value="infrastructure">Infrastructure</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('budget')}</label>
                    <input className="form-input" type="number" value={form.budgetTotal} onChange={set('budgetTotal')} placeholder="12500000" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">{t('address')}</label>
                  <input className="form-input" value={form.address} onChange={set('address')} placeholder="Block C, DHA Phase 9, Lahore" />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Start {t('date')}</label>
                    <input className="form-input" type="date" value={form.startDate} onChange={set('startDate')} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">End {t('date')}</label>
                    <input className="form-input" type="date" value={form.endDate} onChange={set('endDate')} />
                  </div>
                </div>
                <div className="form-group mb-0">
                  <label className="form-label">{t('description')}</label>
                  <textarea className="form-input" rows={3} value={form.description} onChange={set('description')} placeholder="Brief project description…" />
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>{t('cancel')}</button>
              <button className="btn btn-primary" type="submit" form="proj-form"><Plus size={14} /> {t('create')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
