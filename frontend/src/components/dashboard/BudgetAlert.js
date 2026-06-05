import React from 'react';
import { AlertTriangle, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const fmt = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;

export default function BudgetAlert({ alerts = [] }) {
  if (!alerts || alerts.length === 0) return null;

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <AlertTriangle size={15} color="var(--warning)" />
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--t2)' }}>Budget Alerts</span>
        <span style={{ fontSize: 11, padding: '1px 8px', background: 'var(--warning-bg)', color: 'var(--warning)', borderRadius: 'var(--r-full)', fontWeight: 600 }}>
          {alerts.length}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {alerts.map(a => {
          const isRed = a.pct >= 95;
          const color = isRed ? 'var(--danger)' : 'var(--warning)';
          const bg    = isRed ? 'var(--danger-bg, #fff0f0)' : 'var(--warning-bg)';
          return (
            <Link key={a.id} to={`/projects/${a.id}`} style={{ textDecoration: 'none' }}>
              <div style={{ background: bg, borderRadius: 'var(--r)', padding: '10px 14px', border: `1px solid ${color}22`, display: 'flex', alignItems: 'center', gap: 12 }}>
                <TrendingUp size={16} color={color} style={{ flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)', marginBottom: 4 }}>{a.name}</div>
                  <div style={{ height: 6, background: '#e0e0e0', borderRadius: 'var(--r-full)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.min(a.pct, 100)}%`, background: color, borderRadius: 'var(--r-full)' }} />
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color }}>{a.pct}%</div>
                  <div style={{ fontSize: 11, color: 'var(--t3)' }}>{fmt(a.spent)} / {fmt(a.total)}</div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
