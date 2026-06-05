import React, { useEffect, useState, useCallback } from 'react';
import { BookOpen, Plus, Sun, Cloud, CloudRain, Thermometer, Wind, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const WEATHER_META = {
  sunny:   { label: 'Sunny',   Icon: Sun,         color: '#f59e0b' },
  cloudy:  { label: 'Cloudy',  Icon: Cloud,       color: '#6b7280' },
  rainy:   { label: 'Rainy',   Icon: CloudRain,   color: '#3b82f6' },
  hot:     { label: 'Hot',     Icon: Thermometer, color: '#ef4444' },
  windy:   { label: 'Windy',   Icon: Wind,        color: '#8b5cf6' },
};

const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

const EMPTY_FORM = { date: new Date().toISOString().slice(0, 10), weather: 'sunny', workDone: '', workersPresent: '', issues: '', materials: '', nextDayPlan: '' };

const inputStyle = { width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 'var(--r)', fontSize: 13, color: 'var(--t1)', background: 'var(--white)', boxSizing: 'border-box' };
const labelStyle = { fontSize: 12, fontWeight: 600, color: 'var(--t2)', marginBottom: 4, display: 'block' };

export default function SiteDiary({ projectId }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(false);
  const [form, setForm]       = useState(EMPTY_FORM);
  const [saving, setSaving]   = useState(false);
  const [expanded, setExpanded] = useState({});

  const load = useCallback(() => {
    setLoading(true);
    api.get(`/site-diary/${projectId}`)
      .then(r => setEntries(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [projectId]);

  useEffect(load, [load]);

  const set = (f, v) => setForm(prev => ({ ...prev, [f]: v }));

  const openModal = () => { setForm({ ...EMPTY_FORM, date: new Date().toISOString().slice(0, 10) }); setModal(true); };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.workDone) return toast.error('Work Done is required');
    setSaving(true);
    try {
      await api.post(`/site-diary/${projectId}`, { ...form, workersPresent: parseInt(form.workersPresent) || 0 });
      toast.success('Diary entry saved');
      setModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save entry');
    } finally { setSaving(false); }
  };

  const toggle = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--t3)' }}>Loading diary...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <BookOpen size={16} color="var(--primary)" />
          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--t1)' }}>Site Diary</span>
          <span style={{ fontSize: 12, color: 'var(--t3)' }}>({entries.length} entries)</span>
        </div>
        <button onClick={openModal} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 'var(--r)', padding: '7px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
          <Plus size={13} /> Add Entry
        </button>
      </div>

      {entries.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--t3)', fontSize: 13, background: 'var(--white)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)' }}>
          No diary entries yet. Add your first daily report.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {entries.map((e) => {
            const weather = WEATHER_META[e.weather] || {};
            const WeatherIcon = weather.Icon || Sun;
            const isOpen = expanded[e._id];
            return (
              <div key={e._id} style={{ background: 'var(--white)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)' }}>
                <div onClick={() => toggle(e._id)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', cursor: 'pointer' }}>
                  <WeatherIcon size={18} color={weather.color || 'var(--t3)'} style={{ flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)' }}>{fmtDate(e.date)}</div>
                    <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 400 }}>
                      {e.workDone}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                    {e.workersPresent > 0 && (
                      <span style={{ fontSize: 12, color: 'var(--t2)' }}>👷 {e.workersPresent} workers</span>
                    )}
                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 'var(--r-full)', background: 'var(--bg)', color: 'var(--t3)' }}>{weather.label}</span>
                    {isOpen ? <ChevronUp size={14} color="var(--t3)" /> : <ChevronDown size={14} color="var(--t3)" />}
                  </div>
                </div>

                {isOpen && (
                  <div style={{ padding: '0 16px 14px', borderTop: '1px solid var(--border-light)', paddingTop: 12 }}>
                    <div style={{ fontSize: 13, color: 'var(--t1)', marginBottom: 8 }}><strong>Work Done:</strong><br />{e.workDone}</div>
                    {e.materials   && <div style={{ fontSize: 12, color: 'var(--t2)', marginBottom: 6 }}><strong>Materials:</strong> {e.materials}</div>}
                    {e.issues      && <div style={{ fontSize: 12, color: 'var(--warning)', marginBottom: 6 }}>⚠ <strong>Issues:</strong> {e.issues}</div>}
                    {e.nextDayPlan && <div style={{ fontSize: 12, color: 'var(--t2)', marginBottom: 6 }}><strong>Next Day Plan:</strong> {e.nextDayPlan}</div>}
                    <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 8 }}>
                      Reported by {e.reportedBy?.name || 'Unknown'} · {new Date(e.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: 'var(--white)', borderRadius: 'var(--r-lg)', padding: 28, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--t1)', marginBottom: 20 }}>New Diary Entry</h3>
            <form onSubmit={submit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Date *</label>
                  <input type="date" style={inputStyle} value={form.date} onChange={e => set('date', e.target.value)} required />
                </div>
                <div>
                  <label style={labelStyle}>Weather</label>
                  <select style={inputStyle} value={form.weather} onChange={e => set('weather', e.target.value)}>
                    {Object.entries(WEATHER_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={labelStyle}>Work Done *</label>
                  <textarea rows={3} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} value={form.workDone} onChange={e => set('workDone', e.target.value)} placeholder="Describe work completed today..." required />
                </div>
                <div>
                  <label style={labelStyle}>Workers Present</label>
                  <input type="number" min="0" style={inputStyle} value={form.workersPresent} onChange={e => set('workersPresent', e.target.value)} placeholder="0" />
                </div>
                <div>
                  <label style={labelStyle}>Materials Used</label>
                  <input style={inputStyle} value={form.materials} onChange={e => set('materials', e.target.value)} placeholder="e.g. 20 bags cement, 2 ton steel" />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={labelStyle}>Issues / Problems</label>
                  <textarea rows={2} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} value={form.issues} onChange={e => set('issues', e.target.value)} placeholder="Any site issues or problems encountered..." />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={labelStyle}>Next Day Plan</label>
                  <textarea rows={2} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} value={form.nextDayPlan} onChange={e => set('nextDayPlan', e.target.value)} placeholder="Planned work for tomorrow..." />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
                <button type="button" onClick={() => setModal(false)} style={{ padding: '8px 18px', border: '1px solid var(--border)', borderRadius: 'var(--r)', background: 'var(--bg)', cursor: 'pointer', fontSize: 13 }}>Cancel</button>
                <button type="submit" disabled={saving} style={{ padding: '8px 18px', border: 'none', borderRadius: 'var(--r)', background: 'var(--primary)', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                  {saving ? 'Saving...' : 'Save Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
