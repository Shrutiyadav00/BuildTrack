import React, { useState, useEffect } from 'react';
import { Save, CalendarCheck } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import TablePagination from '../../components/TablePagination';

const STATUS_OPTS = ['present','absent','half_day','overtime'];

export default function Attendance() {
  const [projects, setProjects]           = useState([]);
  const [workers, setWorkers]             = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedDate, setSelectedDate]   = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance]       = useState({});
  const [page, setPage]                   = useState(0);
  const [itemsPerPage, setItemsPerPage]   = useState(10);
  const [saving, setSaving]               = useState(false);

  useEffect(() => {
    Promise.all([api.get('/projects'), api.get('/workers')]).then(([p, w]) => {
      setProjects(p.data.data);
      setWorkers(w.data.data);
      if (p.data.data.length > 0) setSelectedProject(p.data.data[0]._id);
    });
  }, []);

  const handleMark = async () => {
    if (!selectedProject) return toast.error('Select a project first');
    setSaving(true);
    try {
      const records = workers.map(w => ({ worker: w._id, status: attendance[w._id] || 'absent' }));
      await api.post(`/attendance/${selectedProject}/bulk`, { records, date: selectedDate });
      toast.success('Attendance saved!');
    } catch { toast.error('Failed to save attendance'); }
    finally { setSaving(false); }
  };

  const mark = (workerId, status) => setAttendance(prev => ({ ...prev, [workerId]: status }));

  const summary = workers.reduce((acc, w) => {
    const s = attendance[w._id] || 'absent';
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <div className="page-header">
        <div className="page-header-text">
          <h1>Attendance</h1>
          <p>Mark daily attendance for workers on site</p>
        </div>
        <button className="btn btn-primary" onClick={handleMark} disabled={saving || !selectedProject}>
          <Save size={14} /> {saving ? 'Saving…' : 'Save Attendance'}
        </button>
      </div>

      {/* Filters */}
      <div className="card card-pad" style={{ marginBottom:16 }}>
        <div className="form-row" style={{ marginBottom:0 }}>
          <div className="form-group" style={{ marginBottom:0 }}>
            <label className="form-label">Project</label>
            <select className="form-input" value={selectedProject} onChange={e => setSelectedProject(e.target.value)}>
              <option value="">Select project…</option>
              {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom:0 }}>
            <label className="form-label">Date</label>
            <input className="form-input" type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Summary chips */}
      {workers.length > 0 && (
        <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
          {[
            { key:'present',  label:'Present',  color:'var(--success)' },
            { key:'absent',   label:'Absent',   color:'var(--danger)' },
            { key:'half_day', label:'Half Day', color:'var(--warning)' },
            { key:'overtime', label:'Overtime', color:'var(--primary)' },
          ].map(({ key, label, color }) => (
            <div key={key} style={{ display:'flex', alignItems:'center', gap:6, background:'var(--white)', border:'1.5px solid var(--border)', borderRadius:'var(--r-full)', padding:'5px 12px', fontSize:12.5, fontWeight:600, color:'var(--t2)', boxShadow:'var(--shadow-xs)' }}>
              <span style={{ width:8, height:8, borderRadius:'50%', background:color, display:'inline-block' }} />
              {label}: {summary[key] || 0}
            </div>
          ))}
        </div>
      )}

      {/* Worker table */}
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Worker</th><th>Trade</th><th style={{ minWidth:320 }}>Attendance Status</th></tr>
            </thead>
            <tbody>
              {workers.length === 0 ? (
                <tr><td colSpan={3}>
                  <div className="empty-state">
                    <div className="empty-icon"><CalendarCheck size={28} /></div>
                    <div className="empty-title">No workers yet</div>
                    <div className="empty-desc">Add workers first to mark attendance</div>
                  </div>
                </td></tr>
              ) : (() => {
                const start = page * itemsPerPage;
                const paginatedWorkers = workers.slice(start, start + itemsPerPage);
                return paginatedWorkers.map(w => {
                  const current = attendance[w._id] || 'absent';
                  return (
                    <tr key={w._id}>
                      <td style={{ fontWeight:600 }}>{w.name}</td>
                      <td><span className="badge badge-blue">{w.trade?.replace('_',' ')}</span></td>
                      <td>
                        <div style={{ display:'flex', gap:6 }}>
                          {STATUS_OPTS.map(s => (
                            <button key={s}
                              onClick={() => mark(w._id, s)}
                              className={`att-btn ${current === s ? `att-${s}` : ''}`}>
                              {s.replace('_',' ')}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                });
              })()}
            </tbody>
          </table>
        </div>
        <TablePagination
          total={workers.length}
          page={page}
          itemsPerPage={itemsPerPage}
          onPageChange={setPage}
          onItemsPerPageChange={(n) => { setItemsPerPage(n); setPage(0); }}
        />
      </div>
    </div>
  );
}
