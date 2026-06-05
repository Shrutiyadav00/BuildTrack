import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../../utils/api';

const CATEGORY_LABELS = {
  structure: 'Structure',
  labour:    'Labour',
  mep:       'MEP',
  finishing: 'Finishing',
  misc:      'Misc',
};

const fmt = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '10px 14px', fontSize: 12 }}>
      <div style={{ fontWeight: 700, marginBottom: 6, color: 'var(--t1)' }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ color: p.fill, marginBottom: 3 }}>
          {p.name}: {fmt(p.value)}
        </div>
      ))}
    </div>
  );
};

export default function BudgetVsActual({ projectId, data: propData }) {
  const [data, setData] = useState(propData || null);
  const [loading, setLoading] = useState(!propData && !!projectId);

  useEffect(() => {
    if (propData) { setData(propData); return; }
    if (!projectId) return;
    setLoading(true);
    api.get(`/reports/budget/${projectId}`)
      .then(r => setData(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [projectId, propData]);

  if (loading) return <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t3)', fontSize: 13 }}>Loading chart...</div>;
  if (!data)   return <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t3)', fontSize: 13 }}>No budget data available.</div>;

  const chartData = Object.keys(CATEGORY_LABELS).map(cat => ({
    name:    CATEGORY_LABELS[cat],
    Budget:  data.budget?.[cat] || 0,
    Spent:   data.spent?.[cat]  || 0,
  })).filter(d => d.Budget > 0 || d.Spent > 0);

  if (!chartData.length) return <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t3)', fontSize: 13 }}>No category budget data yet.</div>;

  return (
    <div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--t3)' }} />
          <YAxis tickFormatter={v => v >= 100000 ? `₹${(v/100000).toFixed(1)}L` : `₹${(v/1000).toFixed(0)}K`} tick={{ fontSize: 10, fill: 'var(--t3)' }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="Budget" fill="#6c8ebf" radius={[3, 3, 0, 0]} />
          <Bar dataKey="Spent"  fill="#e6813e" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
