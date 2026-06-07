import React, { useEffect, useState } from 'react';
import { BarChart2, Download, FileText, PieChart } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import BudgetVsActual from '../../components/dashboard/BudgetVsActual';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const fmt = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;

// Helper — convert array of objects to CSV and trigger download
function downloadCSV(rows, headers, filename) {
  const escape = (v) => {
    const s = String(v ?? '');
    return s.includes(',') || s.includes('"') || s.includes('\n')
      ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [headers.join(','), ...rows.map(r => headers.map(h => escape(r[h])).join(','))];
  const blob  = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url   = URL.createObjectURL(blob);
  const a     = document.createElement('a');
  a.href      = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function Reports() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSP] = useState('');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year,  setYear]  = useState(new Date().getFullYear());
  const [payrollData, setPayrollData] = useState(null);
  const [budgetData, setBudgetData]   = useState(null);
  const [loadingPayroll, setLP] = useState(false);
  const [loadingBudget,  setLB] = useState(false);
  const [downloading, setDl]   = useState(false);

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
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a   = document.createElement('a');
      a.href    = url;
      a.download = `payroll-${MONTHS[month-1]}-${year}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch { toast.error('PDF download failed'); } finally { setDl(false); }
  };

  const downloadPayrollCSV = () => {
    if (!payrollData) return;
    const rows = payrollData.workers.map(w => ({
      Worker: w.name, Trade: w.trade?.replace(/_/g, ' '), 'Pay Type': w.payType,
      'Daily Rate': w.dailyRate, 'Days Worked': w.days, 'Total (INR)': w.total,
    }));
    rows.push({ Worker: 'GRAND TOTAL', Trade: '', 'Pay Type': '', 'Daily Rate': '', 'Days Worked': '', 'Total (INR)': payrollData.grandTotal });
    downloadCSV(rows, ['Worker','Trade','Pay Type','Daily Rate','Days Worked','Total (INR)'],
      `payroll-${MONTHS[month-1]}-${year}.csv`);
    toast.success('CSV downloaded');
  };

  const downloadBudgetCSV = () => {
    if (!budgetData) return;
    const rows = Object.entries(budgetData.categories)
      .filter(([, v]) => v.budget > 0 || v.spent > 0)
      .map(([cat, v]) => ({
        Category: cat.charAt(0).toUpperCase() + cat.slice(1),
        'Budget (INR)': v.budget, 'Spent (INR)': v.spent,
        'Variance (INR)': v.variance, '% Used': v.pct,
      }));
    rows.push({ Category: 'TOTAL', 'Budget (INR)': budgetData.budget.total, 'Spent (INR)': budgetData.spent.total, 'Variance (INR)': budgetData.overallVariance, '% Used': '' });
    downloadCSV(rows, ['Category','Budget (INR)','Spent (INR)','Variance (INR)','% Used'],
      `budget-${projects.find(p => p._id === selectedProject)?.name || selectedProject}.csv`);
    toast.success('CSV downloaded');
  };

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
        <BarChart2 size={20} color="var(--primary)" />
        <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--t1)' }}>Reports</h1>
      </div>

      {/* Project selector */}
      <div style={{ background: 'var(--white)', borderRadius: 'var(--r-lg)', padding: '16px 20px', border: '1px solid var(--border)', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--t2)', whiteSpace: 'nowrap' }}>Project:</label>
        <select value={selectedProject} onChange={e => { setSP(e.target.value); setPayrollData(null); setBudgetData(null); }}
          style={{ padding: '7px 12px', border: '1px solid var(--border)', borderRadius: 'var(--r)', fontSize: 13, background: 'var(--white)', color: 'var(--t1)', minWidth: 200 }}>
          {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* Payroll Report Card */}
        <div style={{ background: 'var(--white)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileText size={16} color="var(--primary)" />
            <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--t1)' }}>Payroll Report</span>
          </div>
          <div style={{ padding: '16px 20px' }}>
            <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
              <select value={month} onChange={e => setMonth(Number(e.target.value))}
                style={{ padding: '7px 10px', border: '1px solid var(--border)', borderRadius: 'var(--r)', fontSize: 13 }}>
                {MONTHS.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
              </select>
              <select value={year} onChange={e => setYear(Number(e.target.value))}
                style={{ padding: '7px 10px', border: '1px solid var(--border)', borderRadius: 'var(--r)', fontSize: 13 }}>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <button onClick={loadPayroll} disabled={!selectedProject || loadingPayroll}
                style={{ padding: '7px 14px', border: 'none', borderRadius: 'var(--r)', background: 'var(--primary)', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                {loadingPayroll ? 'Loading...' : 'Generate'}
              </button>
            </div>

            {payrollData && (
              <div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, marginBottom: 12 }}>
                  <thead>
                    <tr style={{ background: 'var(--bg)' }}>
                      <th style={{ padding: '7px 10px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase' }}>Worker</th>
                      <th style={{ padding: '7px 10px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase' }}>Trade</th>
                      <th style={{ padding: '7px 10px', textAlign: 'right', fontSize: 11, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase' }}>Days</th>
                      <th style={{ padding: '7px 10px', textAlign: 'right', fontSize: 11, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payrollData.workers.length === 0 ? (
                      <tr><td colSpan={4} style={{ padding: 16, textAlign: 'center', color: 'var(--t3)', fontSize: 12 }}>No workers with attendance this month</td></tr>
                    ) : payrollData.workers.map(w => (
                      <tr key={w._id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <td style={{ padding: '8px 10px', fontWeight: 600, color: 'var(--t1)' }}>{w.name}</td>
                        <td style={{ padding: '8px 10px', color: 'var(--t3)', textTransform: 'capitalize' }}>{w.trade?.replace(/_/g, ' ')}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', color: 'var(--t2)' }}>{w.days}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: 'var(--t1)' }}>{fmt(w.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ background: 'var(--bg)' }}>
                      <td colSpan={3} style={{ padding: '8px 10px', fontWeight: 700, color: 'var(--t2)' }}>Grand Total</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 800, fontSize: 15, color: 'var(--t1)' }}>{fmt(payrollData.grandTotal)}</td>
                    </tr>
                  </tfoot>
                </table>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={downloadPayrollPDF} disabled={downloading}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, justifyContent: 'center', padding: '8px', border: '1px solid var(--primary)', borderRadius: 'var(--r)', background: 'var(--primary-light)', color: 'var(--primary)', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                    <Download size={14} /> {downloading ? 'Downloading...' : 'PDF'}
                  </button>
                  <button onClick={downloadPayrollCSV}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, justifyContent: 'center', padding: '8px', border: '1px solid var(--success)', borderRadius: 'var(--r)', background: 'var(--success-bg)', color: 'var(--success)', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                    <Download size={14} /> CSV
                  </button>
                </div>
              </div>
            )}

            {!payrollData && !loadingPayroll && (
              <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--t3)', fontSize: 13 }}>Select a period and click Generate to view payroll.</div>
            )}
          </div>
        </div>

        {/* Budget vs Actual Card */}
        <div style={{ background: 'var(--white)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <PieChart size={16} color="var(--primary)" />
            <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--t1)' }}>Budget vs Actual</span>
          </div>
          <div style={{ padding: '16px 20px' }}>
            <button onClick={loadBudget} disabled={!selectedProject || loadingBudget}
              style={{ padding: '7px 14px', border: 'none', borderRadius: 'var(--r)', background: 'var(--primary)', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
              {loadingBudget ? 'Loading...' : 'Load Budget Data'}
            </button>

            {budgetData && (
              <div>
                <BudgetVsActual data={budgetData} />
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, marginTop: 12 }}>
                  <thead>
                    <tr style={{ background: 'var(--bg)' }}>
                      {['Category', 'Budget', 'Spent', 'Variance'].map(h => (
                        <th key={h} style={{ padding: '6px 10px', textAlign: h === 'Category' ? 'left' : 'right', fontSize: 10, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(budgetData.categories).filter(([, v]) => v.budget > 0 || v.spent > 0).map(([cat, v]) => (
                      <tr key={cat} style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <td style={{ padding: '6px 10px', textTransform: 'capitalize', color: 'var(--t2)' }}>{cat}</td>
                        <td style={{ padding: '6px 10px', textAlign: 'right', color: 'var(--t2)' }}>{fmt(v.budget)}</td>
                        <td style={{ padding: '6px 10px', textAlign: 'right', color: v.spent > v.budget ? 'var(--danger)' : 'var(--t1)', fontWeight: 600 }}>{fmt(v.spent)}</td>
                        <td style={{ padding: '6px 10px', textAlign: 'right', color: v.variance >= 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 700 }}>
                          {v.variance >= 0 ? '+' : ''}{fmt(v.variance)}
                        </td>
                      </tr>
                    ))}
                    <tr style={{ background: 'var(--bg)', fontWeight: 700 }}>
                      <td style={{ padding: '7px 10px', color: 'var(--t1)' }}>Total</td>
                      <td style={{ padding: '7px 10px', textAlign: 'right', color: 'var(--t1)' }}>{fmt(budgetData.budget.total)}</td>
                      <td style={{ padding: '7px 10px', textAlign: 'right', color: budgetData.spent.total > budgetData.budget.total ? 'var(--danger)' : 'var(--t1)' }}>{fmt(budgetData.spent.total)}</td>
                      <td style={{ padding: '7px 10px', textAlign: 'right', color: budgetData.overallVariance >= 0 ? 'var(--success)' : 'var(--danger)', fontSize: 14 }}>
                        {budgetData.overallVariance >= 0 ? '+' : ''}{fmt(budgetData.overallVariance)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {budgetData && (
              <button onClick={downloadBudgetCSV}
                style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%', justifyContent: 'center', padding: '8px', marginTop: 10, border: '1px solid var(--success)', borderRadius: 'var(--r)', background: 'var(--success-bg)', color: 'var(--success)', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                <Download size={14} /> Download CSV
              </button>
            )}

            {!budgetData && !loadingBudget && (
              <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--t3)', fontSize: 13 }}>Click Load Budget Data to view category breakdown.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
