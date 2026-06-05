import React, { useEffect, useState } from 'react';
import { CreditCard, Clock, CheckCircle, AlertCircle, TrendingDown } from 'lucide-react';
import api from '../../utils/api';

const STATUS_META = {
  pending:   { label:'Pending',   icon:Clock,         color:'var(--t3)',      bg:'var(--bg)'         },
  requested: { label:'Due Now',   icon:AlertCircle,   color:'var(--warning)', bg:'var(--warning-bg)' },
  received:  { label:'Received',  icon:CheckCircle,   color:'var(--success)', bg:'var(--success-bg)' },
};

const fmt = (n) => `₹${(n||0).toLocaleString('en-IN')}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }) : '—';

export default function ClientPayments() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/client/payment-schedule')
      .then(r => setData(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding:40, color:'var(--t3)', textAlign:'center' }}>Loading payments...</div>;
  if (!data)   return <div style={{ padding:40, color:'var(--t3)', textAlign:'center' }}>No payment data.</div>;

  const { schedules, summary } = data;
  const paidPct = summary.contractValue ? Math.round(summary.totalPaid / summary.contractValue * 100) : 0;

  return (
    <div>
      <h2 style={{ fontSize:18, fontWeight:800, color:'var(--t1)', marginBottom:20, display:'flex', alignItems:'center', gap:8 }}>
        <CreditCard size={18} color="var(--primary)"/> Payment Schedule
      </h2>

      {/* Summary cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:12, marginBottom:24 }}>
        {[
          { label:'Total Paid',          value:fmt(summary.totalPaid),         color:'var(--success)' },
          { label:'Pending / Due',       value:fmt(summary.totalPending),       color:'var(--warning)' },
          { label:'Contract Value',      value:fmt(summary.contractValue),      color:'var(--primary)' },
          { label:'Remaining Balance',   value:fmt(summary.remainingBalance),   color:'var(--t2)'      },
        ].map(s => (
          <div key={s.label} style={{ background:'var(--white)', borderRadius:'var(--r-lg)', padding:'14px 16px', border:'1px solid var(--border)' }}>
            <div style={{ fontSize:11, color:'var(--t3)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:4 }}>{s.label}</div>
            <div style={{ fontSize:18, fontWeight:800, color:s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      {summary.contractValue > 0 && (
        <div style={{ background:'var(--white)', borderRadius:'var(--r-lg)', padding:'16px 20px', border:'1px solid var(--border)', marginBottom:24 }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
            <span style={{ fontSize:13, fontWeight:600, color:'var(--t2)' }}>Payment Progress</span>
            <span style={{ fontSize:13, fontWeight:700, color:'var(--success)' }}>{paidPct}%</span>
          </div>
          <div style={{ height:10, background:'var(--border)', borderRadius:'var(--r-full)', overflow:'hidden' }}>
            <div style={{ height:'100%', width:`${paidPct}%`, background:'var(--success)', borderRadius:'var(--r-full)', transition:'width 0.5s' }}/>
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', marginTop:4, fontSize:11, color:'var(--t3)' }}>
            <span>Paid: {fmt(summary.totalPaid)}</span>
            <span>Remaining: {fmt(summary.remainingBalance)}</span>
          </div>
        </div>
      )}

      {/* Milestones table */}
      <div style={{ background:'var(--white)', borderRadius:'var(--r-lg)', border:'1px solid var(--border)', overflow:'hidden' }}>
        <div style={{ padding:'14px 20px', borderBottom:'1px solid var(--border)', fontWeight:700, fontSize:14, color:'var(--t1)' }}>
          Milestones
        </div>
        {schedules.length === 0 ? (
          <div style={{ padding:32, textAlign:'center', color:'var(--t3)', fontSize:13 }}>No milestones created yet.</div>
        ) : (
          <div>
            {schedules.map((s, i) => {
              const meta = STATUS_META[s.status] || STATUS_META.pending;
              const Icon = meta.icon;
              return (
                <div key={s._id} style={{
                  display:'flex', alignItems:'center', gap:14,
                  padding:'14px 20px',
                  borderBottom: i < schedules.length-1 ? '1px solid var(--border-light)' : 'none',
                  background: s.status === 'requested' ? 'var(--warning-bg)' : 'transparent',
                }}>
                  <div style={{
                    width:36, height:36, borderRadius:'var(--r)',
                    background:meta.bg, color:meta.color,
                    display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
                  }}>
                    <Icon size={16}/>
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:14, fontWeight:600, color:'var(--t1)' }}>{s.milestoneName}</div>
                    <div style={{ fontSize:12, color:'var(--t3)' }}>
                      {s.dueDate ? `Due: ${fmtDate(s.dueDate)}` : 'No due date'}
                      {s.percentOfContract ? ` · ${s.percentOfContract}% of contract` : ''}
                    </div>
                    {s.status === 'received' && s.receivedAt && (
                      <div style={{ fontSize:11, color:'var(--success)', marginTop:2 }}>✓ Received on {fmtDate(s.receivedAt)}</div>
                    )}
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontSize:16, fontWeight:800, color:'var(--t1)' }}>{fmt(s.amount)}</div>
                    <span style={{
                      padding:'2px 8px', borderRadius:'var(--r-full)', fontSize:11, fontWeight:600,
                      background:meta.bg, color:meta.color,
                    }}>{meta.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
