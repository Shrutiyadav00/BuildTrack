import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Activity, Users2, TrendingUp, ArrowRight, Plus } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { useSettings } from '../../context/SettingsContext';

const STATUS_BADGE = { active:'badge-green', planning:'badge-yellow', on_hold:'badge-red', completed:'badge-blue', cancelled:'badge-gray' };

export default function Dashboard() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const { t, fmt, fmtShort } = useSettings();

  useEffect(() => {
    api.get('/dashboard')
      .then(r => setData(r.data.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="loading"><div className="spinner" /><span className="loading-text">{t('loading')}…</span></div>
  );

  const stats = [
    { icon: Building2,  cls:'si-blue',   label: t('totalProjects'),   value: data?.totalProjects  ?? 0, sub: `${data?.activeProjects ?? 0} currently active` },
    { icon: Activity,   cls:'si-green',  label: t('activeProjects'),  value: data?.activeProjects ?? 0, sub: 'In progress right now' },
    { icon: Users2,     cls:'si-purple', label: t('totalWorkers'),    value: data?.totalWorkers   ?? 0, sub: 'Active workforce' },
    { icon: TrendingUp, cls:'si-orange', label: t('avgCompletion'),   value: `${data?.avgCompletion ?? 0}%`, sub: 'Across all projects' },
  ];

  return (
    <div>
      <div className="page-header">
        <div className="page-header-text">
          <h1>{t('dashboard')}</h1>
          <p>Overview of all your construction projects</p>
        </div>
        <div className="page-header-actions">
          <Link to="/projects" className="btn btn-primary">
            <Plus size={15} /> {t('newProject')}
          </Link>
        </div>
      </div>

      <div className="stats-grid">
        {stats.map(({ icon: Icon, cls, label, value, sub }) => (
          <div className="stat-card" key={label}>
            <div className={`stat-icon ${cls}`}><Icon size={22} /></div>
            <div className="stat-body">
              <div className="stat-value">{value}</div>
              <div className="stat-label">{label}</div>
              <div className="stat-sub">{sub}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:24 }}>
        <div className="card card-pad" style={{ background:'linear-gradient(135deg,#5c6bc0,#7986cb)', border:'none', color:'#fff' }}>
          <div style={{ fontSize:13, fontWeight:600, opacity:0.85, marginBottom:6 }}>{t('portfolioValue')}</div>
          <div style={{ fontSize:28, fontWeight:800, letterSpacing:-1 }}>
            {fmtShort(data?.totalBudget ?? 0)}
          </div>
          <div style={{ fontSize:12, opacity:0.75, marginTop:4 }}>Combined budget across all projects</div>
        </div>
        <div className="card card-pad" style={{ display:'flex', flexDirection:'column', justifyContent:'center' }}>
          <div style={{ fontSize:13, color:'var(--t3)', fontWeight:600, marginBottom:8 }}>Portfolio Completion</div>
          <div style={{ fontSize:26, fontWeight:800, color:'var(--t1)', marginBottom:10 }}>{data?.avgCompletion ?? 0}%</div>
          <div className="progress-bar">
            <div className="progress-fill pf-primary" style={{ width:`${data?.avgCompletion ?? 0}%` }} />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div>
            <h2>Recent Projects</h2>
            <p>Your latest construction projects</p>
          </div>
          <Link to="/projects" className="btn btn-outline btn-sm">
            View All <ArrowRight size={13} />
          </Link>
        </div>
        {!data?.recentProjects?.length ? (
          <div className="empty-state">
            <div className="empty-icon">🏗</div>
            <div className="empty-title">No projects yet</div>
            <div className="empty-desc"><Link to="/projects" className="text-primary">Create your first project</Link></div>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>{t('projects')}</th><th>{t('type')}</th><th>{t('status')}</th><th>{t('budget')}</th><th>Completion</th></tr>
              </thead>
              <tbody>
                {data.recentProjects.map(p => (
                  <tr key={p._id}>
                    <td>
                      <Link to={`/projects/${p._id}`} style={{ fontWeight:600, color:'var(--t1)' }}>{p.name}</Link>
                      {p.address && <div style={{ fontSize:12, color:'var(--t3)', marginTop:2 }}>{p.address}</div>}
                    </td>
                    <td><span className="badge badge-blue">{p.type}</span></td>
                    <td><span className={`badge ${STATUS_BADGE[p.status]||'badge-gray'}`}>{p.status?.replace(/_/g,' ')}</span></td>
                    <td style={{ fontWeight:600 }}>
                      {p.budget?.total ? fmtShort(p.budget.total) : '—'}
                    </td>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:10, minWidth:120 }}>
                        <div className="progress-bar" style={{ flex:1 }}>
                          <div className={`progress-fill ${p.completion>=100?'pf-green':p.completion>=50?'pf-primary':'pf-orange'}`}
                            style={{ width:`${p.completion}%` }} />
                        </div>
                        <span style={{ fontSize:12.5, fontWeight:600, color:'var(--t2)', minWidth:34 }}>{p.completion}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
