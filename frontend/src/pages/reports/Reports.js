import React, { useEffect, useState } from 'react';
import {
  BarChart2, Download, FileText, TrendingUp, TrendingDown,
  Users, IndianRupee, AlertTriangle, CheckCircle2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import BudgetVsActual from '../../components/dashboard/BudgetVsActual';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const CAT_LABELS = { structure: 'Structure', labour: 'Labour', mep: 'MEP', finishing: 'Finishing', misc: 'Misc' };

const fmt    = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;
const pctBar = (pct, over) => (
  <div style={{ height: 5, borderRadius: 99, background: 'var(--border)', overflow: 'hidden', marginTop: 4 }}>
    <div style={{ height: '100%', width: `${Math.min(pct, 100)}%`, borderRadius: 99, background: over ? 'var(--danger)' : pct > 80 ? 'var(--warning)' : 'var(--success)', transition: 'width 0.4s' }} />
  </div>
);

function downloadCSV(rows, headers, filename) {
  const escape = (v) => {
    const s = String(v ?? '');
    return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [headers.join(','), ...rows.map(r => headers.map(h => escape(r[h])).join(','))];
  const blob  = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url   = URL.createObjectURL(blob);
  const a     = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// ── Stat chip ────────────────────────────────────────────────────────────────
function StatChip({ icon: Icon, label, value, color = 'var(--primary)', bg = 'var(--primary-light)' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: bg, borderRadius: 'var(--r)', padding: '10px 14px', flex: 1, minWidth: 140 }}>
      <div style={{ width: 36, height: 36, borderRadius: 'var(--r)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={16} color={color} />
      </div>
      <div>
        <div style={{ fontSize: 11, color: color, fontWeight: 600, opacity: 0.8 }}>{label}</div>
        <div style={{ fontSize: 15, fontWeight: 800, color: color }}>{value}</div>
      </div>
    </div>
  );
}

export default function Reports() {
  const [projects, setProjects]         = useState([]);
  const [selectedProject, setSP]        = useState('');
  const [month, setMonth]               = useState(new Date().getMonth() + 1);
  const [year,  setYear]                = useState(new Date().getFullYear());
  const [payrollData, setPayrollData]   = useState(null);
  const [budgetData,  setBudgetData]    = useState(null);
  const [loadingPayroll, setLP]         = useState(false);
  const [loadingBudget,  setLB]         = useState(false);
  const [downloading, setDl]            = useState(false);

  useEffect(() => {
    api.get('/projects').then(r => {
      const list = r.data.data || [];
      setProjects(list);
      if (list.length) setSP(list[0]._id);
    }).catch(() => {});
  }, []);

  const loadPayroll = () => {
    if (!selectedProject) return;
    setLP(true);
    api.get(`/reports/payroll/${selectedProject}?month=${month}&year=${year}`)
      .then(r => setPayrollData(r.data.data))
      .catch(() => toast.error('Failed to load payroll data'))
      .finally(() => setLP(false));
  };

  const loadBudget = () => {
    if (!selectedProject) return;
    setLB(true);
    api.get(`/reports/budget/${selectedProject}`)
      .then(r => setBudgetData(r.data.data))
      .catch(() => toast.error('Failed to load budget data'))
      .finally(() => setLB(false));
  };

  const downloadPayrollPDF = async () => {
    if (!selectedProject) return;
    setDl(true);
    try {
      const res = await api.get(`/reports/payroll/${selectedProject}/pdf?month=${month}&year=${year}`, { responseType: 'blob' });
      if (res.data?.data?.message) { toast(res.data.data.message, { icon: 'ℹ️' }); return; }
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a   = document.createElement('a');
      a.href    = url; a.download = `payroll-${MONTHS[month-1]}-${year}.pdf`; a.click();
      window.URL.revokeObjectURL(url);
    } catch { toast('PDF download is available in live mode. Use CSV for now.', { icon: 'ℹ️' }); }
    finally { setDl(false); }
  };

  const downloadPayrollCSV = () => {
    if (!payrollData) return;
    const rows = payrollData.workers.map(w => ({
      Worker: w.name, Trade: w.trade?.replace(/_/g, ' '), 'Pay Type': w.payType,
      Rate: w.rate, Days: w.days, 'Total (INR)': w.total,
    }));
    rows.push({ Worker: 'GRAND TOTAL', Trade: '', 'Pay Type': '', Rate: '', Days: '', 'Total (INR)': payrollData.grandTotal });
    downloadCSV(rows, ['Worker','Trade','Pay Type','Rate','Days','Total (INR)'], `payroll-${MONTHS[month-1]}-${year}.csv`);
    toast.success('CSV downloaded');
  };

  const downloadBudgetCSV = () => {
    if (!budgetData) return;
    const cats = budgetData.categories;
    // Defensive: work from breakdown array if categories object missing
    const source = cats
      ? Object.entries(cats).filter(([, v]) => (v.budget > 0 || v.spent > 0))
      : (budgetData.breakdown || []).map(b => [b.category, b]);

    const rows = source.map(([cat, v]) => ({
      Category: CAT_LABELS[cat] || cat,
      'Budget (INR)': v.budget, 'Spent (INR)': v.spent,
      'Variance (INR)': v.variance, '% Used': v.pct,
    }));
    rows.push({
      Category: 'TOTAL',
      'Budget (INR)': budgetData.budget?.total,
      'Spent (INR)':  budgetData.spent?.total,
      'Variance (INR)': budgetData.overallVariance ?? '',
      '% Used': budgetData.pctUsed ?? '',
    });
    downloadCSV(rows, ['Category','Budget (INR)','Spent (INR)','Variance (INR)','% Used'],
      `budget-${projects.find(p => p._id === selectedProject)?.name || selectedProject}.csv`);
    toast.success('CSV downloaded');
  };

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
  const selProject = projects.find(p => p._id === selectedProject);

  // Safe category iteration from budget report data
  const budgetCats = budgetData?.categories
    ? Object.entries(budgetData.categories).filter(([, v]) => v.budget > 0 || v.spent > 0)
    : (budgetData?.breakdown || []).filter(b => b.budget > 0 || b.spent > 0).map(b => [b.category, b]);

  return (
    <div>
      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <div style={{ width: 40, height: 40, borderRadius: 'var(--r)', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <BarChart2 size={18} color="var(--primary)" />
        </div>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--t1)', lineHeight: 1.2 }}>Reports</h1>
          <p style={{ fontSize: 12, color: 'var(--t3)', marginTop: 1 }}>Payroll & Budget analytics for your projects</p>
        </div>
      </div>

      {/* ── Project selector ─────────────────────────────────────────────────── */}
      <div style={{
        background: 'var(--white)', borderRadius: 'var(--r-lg)',
        border: '1px solid var(--border)', padding: '14px 20px', marginBottom: 24,
        display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
      }}>
        <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--t2)', whiteSpace: 'nowrap' }}>Project:</label>
        <select
          value={selectedProject}
          onChange={e => { setSP(e.target.value); setPayrollData(null); setBudgetData(null); }}
          style={{ flex: 1, minWidth: 200, maxWidth: 360, padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 'var(--r)', fontSize: 13, background: 'var(--white)', color: 'var(--t1)' }}>
          {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
        </select>
        {selProject && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, padding: '4px 10px', background: 'var(--bg)', borderRadius: 'var(--r-full)', color: 'var(--t3)', border: '1px solid var(--border)' }}>
              {selProject.status?.replace(/_/g, ' ')}
            </span>
            <span style={{ fontSize: 12, padding: '4px 10px', background: 'var(--bg)', borderRadius: 'var(--r-full)', color: 'var(--t3)', border: '1px solid var(--border)' }}>
              {selProject.completion}% complete
            </span>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* ══════════════════════════════════════════════════════════════════════
            PAYROLL REPORT
           ══════════════════════════════════════════════════════════════════════ */}
        <div style={{ background: 'var(--white)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)', overflow: 'hidden' }}>
          {/* Card header */}
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg)' }}>
            <div style={{ width: 30, height: 30, borderRadius: 'var(--r)', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={14} color="var(--primary)" />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--t1)' }}>Payroll Report</div>
              <div style={{ fontSize: 11, color: 'var(--t3)' }}>Monthly labour cost breakdown</div>
            </div>
          </div>

          <div style={{ padding: '16px 20px' }}>
            {/* Month + Year selector */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
              <select value={month} onChange={e => setMonth(Number(e.target.value))}
                style={{ padding: '7px 10px', border: '1px solid var(--border)', borderRadius: 'var(--r)', fontSize: 13, flex: 1 }}>
                {MONTHS.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
              </select>
              <select value={year} onChange={e => setYear(Number(e.target.value))}
                style={{ padding: '7px 10px', border: '1px solid var(--border)', borderRadius: 'var(--r)', fontSize: 13, width: 90 }}>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <button onClick={loadPayroll} disabled={!selectedProject || loadingPayroll}
                style={{ padding: '7px 16px', border: 'none', borderRadius: 'var(--r)', background: 'var(--primary)', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', opacity: (!selectedProject || loadingPayroll) ? 0.6 : 1 }}>
                {loadingPayroll ? 'Loading…' : 'Generate'}
              </button>
            </div>

            {!payrollData && !loadingPayroll && (
              <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--t4)' }}>
                <Users size={32} style={{ marginBottom: 8, opacity: 0.3 }} />
                <div style={{ fontSize: 13 }}>Select a period and click Generate</div>
              </div>
            )}

            {payrollData && (
              <>
                {/* Summary chips */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                  <StatChip icon={Users}       label="Workers"    value={payrollData.workers.length}    color="var(--primary)"  bg="var(--primary-light)" />
                  <StatChip icon={IndianRupee} label="Total Cost" value={fmt(payrollData.grandTotal)} color="var(--success)"  bg="var(--success-bg)" />
                </div>

                {/* Table */}
                <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--r)', overflow: 'hidden', marginBottom: 14 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
                        <th style={{ padding: '8px 12px', textAlign: 'left',  fontSize: 10, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase' }}>Worker</th>
                        <th style={{ padding: '8px 12px', textAlign: 'left',  fontSize: 10, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase' }}>Trade</th>
                        <th style={{ padding: '8px 12px', textAlign: 'right', fontSize: 10, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase' }}>Days</th>
                        <th style={{ padding: '8px 12px', textAlign: 'right', fontSize: 10, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase' }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payrollData.workers.length === 0 ? (
                        <tr><td colSpan={4} style={{ padding: 20, textAlign: 'center', color: 'var(--t4)', fontSize: 12 }}>No attendance records this month</td></tr>
                      ) : payrollData.workers.map(w => (
                        <tr key={w._id} style={{ borderBottom: '1px solid var(--border-light)' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                          onMouseLeave={e => e.currentTarget.style.background = ''}>
                          <td style={{ padding: '9px 12px', fontWeight: 600, color: 'var(--t1)' }}>{w.name}</td>
                          <td style={{ padding: '9px 12px', color: 'var(--t3)', textTransform: 'capitalize', fontSize: 12 }}>{w.trade?.replace(/_/g, ' ')}</td>
                          <td style={{ padding: '9px 12px', textAlign: 'right', color: 'var(--t2)', fontWeight: 600 }}>{w.days}</td>
                          <td style={{ padding: '9px 12px', textAlign: 'right', fontWeight: 700, color: 'var(--t1)' }}>{fmt(w.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr style={{ background: 'var(--primary-light)', borderTop: '2px solid var(--primary)' }}>
                        <td colSpan={3} style={{ padding: '9px 12px', fontWeight: 700, color: 'var(--primary)', fontSize: 13 }}>Grand Total</td>
                        <td style={{ padding: '9px 12px', textAlign: 'right', fontWeight: 800, fontSize: 15, color: 'var(--primary)' }}>{fmt(payrollData.grandTotal)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={downloadPayrollPDF} disabled={downloading}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, justifyContent: 'center', padding: '8px', border: '1px solid var(--primary)', borderRadius: 'var(--r)', background: 'var(--primary-light)', color: 'var(--primary)', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                    <FileText size={13} /> {downloading ? 'Downloading…' : 'PDF Report'}
                  </button>
                  <button onClick={downloadPayrollCSV}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, justifyContent: 'center', padding: '8px', border: '1px solid var(--success)', borderRadius: 'var(--r)', background: 'var(--success-bg)', color: 'var(--success)', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                    <Download size={13} /> Export CSV
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════════
            BUDGET VS ACTUAL
           ══════════════════════════════════════════════════════════════════════ */}
        <div style={{ background: 'var(--white)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)', overflow: 'hidden' }}>
          {/* Card header */}
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 30, height: 30, borderRadius: 'var(--r)', background: 'var(--warning-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp size={14} color="var(--warning)" />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--t1)' }}>Budget vs Actual</div>
                <div style={{ fontSize: 11, color: 'var(--t3)' }}>Category-wise spend analysis</div>
              </div>
            </div>
            <button onClick={loadBudget} disabled={!selectedProject || loadingBudget}
              style={{ padding: '6px 14px', border: 'none', borderRadius: 'var(--r)', background: 'var(--primary)', color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600, opacity: (!selectedProject || loadingBudget) ? 0.6 : 1 }}>
              {loadingBudget ? 'Loading…' : 'Load Data'}
            </button>
          </div>

          <div style={{ padding: '16px 20px' }}>
            {!budgetData && !loadingBudget && (
              <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--t4)' }}>
                <BarChart2 size={32} style={{ marginBottom: 8, opacity: 0.3 }} />
                <div style={{ fontSize: 13 }}>Click "Load Data" to view budget breakdown</div>
              </div>
            )}

            {budgetData && (
              <>
                {/* Summary chips */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                  <StatChip icon={IndianRupee}
                    label="Budget" value={fmt(budgetData.budget?.total)}
                    color="var(--primary)" bg="var(--primary-light)" />
                  <StatChip
                    icon={budgetData.overBudget ? TrendingDown : TrendingUp}
                    label="Spent" value={fmt(budgetData.spent?.total)}
                    color={budgetData.overBudget ? 'var(--danger)' : 'var(--success)'}
                    bg={budgetData.overBudget ? '#fff5f5' : 'var(--success-bg)'} />
                </div>

                {/* Alert banner */}
                {budgetData.overBudget ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff5f5', border: '1px solid var(--danger)', borderRadius: 'var(--r)', padding: '8px 12px', marginBottom: 14, fontSize: 12, color: 'var(--danger)', fontWeight: 600 }}>
                    <AlertTriangle size={14} /> Over budget by {fmt(Math.abs(budgetData.overallVariance || 0))} ({budgetData.pctUsed}% used)
                  </div>
                ) : budgetData.pctUsed > 80 ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--warning-bg)', border: '1px solid var(--warning)', borderRadius: 'var(--r)', padding: '8px 12px', marginBottom: 14, fontSize: 12, color: 'var(--warning)', fontWeight: 600 }}>
                    <AlertTriangle size={14} /> {budgetData.pctUsed}% of budget used — approaching limit
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--success-bg)', border: '1px solid var(--success)', borderRadius: 'var(--r)', padding: '8px 12px', marginBottom: 14, fontSize: 12, color: 'var(--success)', fontWeight: 600 }}>
                    <CheckCircle2 size={14} /> On track — {budgetData.pctUsed}% of budget used
                  </div>
                )}

                {/* Recharts bar chart */}
                <BudgetVsActual data={budgetData} />

                {/* Category breakdown table with progress bars */}
                <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--r)', overflow: 'hidden', marginTop: 14 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                      <tr style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
                        {['Category', 'Budget', 'Spent', 'Variance', '% Used'].map(h => (
                          <th key={h} style={{ padding: '7px 10px', textAlign: h === 'Category' ? 'left' : 'right', fontSize: 10, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {budgetCats.map(([cat, v]) => {
                        const over = v.spent > v.budget;
                        return (
                          <tr key={cat} style={{ borderBottom: '1px solid var(--border-light)' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                            onMouseLeave={e => e.currentTarget.style.background = ''}>
                            <td style={{ padding: '8px 10px', color: 'var(--t2)', fontWeight: 600, textTransform: 'capitalize', minWidth: 80 }}>
                              {CAT_LABELS[cat] || cat}
                              {pctBar(v.pct, over)}
                            </td>
                            <td style={{ padding: '8px 10px', textAlign: 'right', color: 'var(--t2)' }}>{fmt(v.budget)}</td>
                            <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: over ? 'var(--danger)' : 'var(--t1)' }}>{fmt(v.spent)}</td>
                            <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: v.variance >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                              {v.variance >= 0 ? '+' : ''}{fmt(v.variance)}
                            </td>
                            <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: over ? 'var(--danger)' : v.pct > 80 ? 'var(--warning)' : 'var(--t2)' }}>
                              {v.pct}%
                            </td>
                          </tr>
                        );
                      })}
                      {/* Totals row */}
                      <tr style={{ background: 'var(--bg)', borderTop: '2px solid var(--border)' }}>
                        <td style={{ padding: '9px 10px', fontWeight: 700, color: 'var(--t1)' }}>Total</td>
                        <td style={{ padding: '9px 10px', textAlign: 'right', fontWeight: 700, color: 'var(--t1)' }}>{fmt(budgetData.budget?.total)}</td>
                        <td style={{ padding: '9px 10px', textAlign: 'right', fontWeight: 800, color: budgetData.overBudget ? 'var(--danger)' : 'var(--t1)', fontSize: 13 }}>{fmt(budgetData.spent?.total)}</td>
                        <td style={{ padding: '9px 10px', textAlign: 'right', fontWeight: 800, fontSize: 13, color: (budgetData.overallVariance ?? 0) >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                          {(budgetData.overallVariance ?? 0) >= 0 ? '+' : ''}{fmt(budgetData.overallVariance ?? 0)}
                        </td>
                        <td style={{ padding: '9px 10px', textAlign: 'right', fontWeight: 700, color: budgetData.overBudget ? 'var(--danger)' : 'var(--t1)' }}>
                          {budgetData.pctUsed}%
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Export CSV */}
                <button onClick={downloadBudgetCSV}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%', justifyContent: 'center', padding: '9px', marginTop: 12, border: '1px solid var(--success)', borderRadius: 'var(--r)', background: 'var(--success-bg)', color: 'var(--success)', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                  <Download size={14} /> Export Budget CSV
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
