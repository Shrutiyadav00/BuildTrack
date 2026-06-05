import React, { useEffect, useState } from 'react';
import { Activity } from 'lucide-react';
import api from '../../utils/api';

const TYPE_COLOR = {
  task_completed: 'var(--success)', phase_started: 'var(--primary)',
  payment_received: 'var(--success)', attendance: 'var(--info)', general: 'var(--t3)',
};

const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });
const fmtTime = (d) => new Date(d).toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' });

export default function ClientActivity() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/client/activity-feed')
      .then(r => setEvents(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding:40, color:'var(--t3)', textAlign:'center' }}>Loading activity...</div>;

  // Group by date
  const grouped = events.reduce((acc, ev) => {
    const key = fmtDate(ev.date);
    if (!acc[key]) acc[key] = [];
    acc[key].push(ev);
    return acc;
  }, {});

  return (
    <div>
      <h2 style={{ fontSize:18, fontWeight:800, color:'var(--t1)', marginBottom:20, display:'flex', alignItems:'center', gap:8 }}>
        <Activity size={18} color="var(--primary)"/> Activity Feed
      </h2>

      {Object.keys(grouped).length === 0 ? (
        <div style={{ textAlign:'center', padding:60, color:'var(--t3)' }}>No recent activity found.</div>
      ) : (
        Object.entries(grouped).map(([date, evs]) => (
          <div key={date} style={{ marginBottom:24 }}>
            <div style={{
              fontSize:11, fontWeight:700, color:'var(--t3)', textTransform:'uppercase',
              letterSpacing:'0.07em', marginBottom:10, paddingBottom:6,
              borderBottom:'1px solid var(--border)',
            }}>{date}</div>

            <div style={{ display:'flex', flexDirection:'column', gap:1 }}>
              {evs.map((ev, i) => (
                <div key={i} style={{
                  display:'flex', gap:12, alignItems:'flex-start',
                  padding:'10px 12px', borderRadius:'var(--r)',
                  background:'var(--white)', border:'1px solid var(--border-light)',
                  marginBottom:4,
                }}>
                  <div style={{
                    width:32, height:32, borderRadius:'var(--r-full)',
                    background:`${TYPE_COLOR[ev.type]||'var(--t3)'}18`,
                    color:TYPE_COLOR[ev.type]||'var(--t3)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:14, flexShrink:0,
                  }}>{ev.icon}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:'var(--t1)' }}>{ev.title}</div>
                    {ev.description && <div style={{ fontSize:12, color:'var(--t3)', marginTop:2 }}>{ev.description}</div>}
                  </div>
                  <div style={{ fontSize:11, color:'var(--t4)', flexShrink:0, marginTop:2 }}>{fmtTime(ev.date)}</div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
