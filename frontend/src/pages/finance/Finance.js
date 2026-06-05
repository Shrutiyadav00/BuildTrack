import React, { useState, useEffect } from 'react';
import { Plus, TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { useSettings } from '../../context/SettingsContext';
import TablePagination from '../../components/TablePagination';

export default function Finance() {
  const [projects, setProjects]   = useState([]);
  const [selectedProject, setSP]  = useState('');
  const [transactions, setTrans]  = useState([]);
  const [page, setPage]           = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [summary, setSummary]     = useState(null);
  const [loading, setLoading]     = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ type:'material_purchase', category:'misc', amount:'', description:'', paymentMethod:'cash', vendor:'' });
  const { t, fmt } = useSettings();

  useEffect(() => {
    api.get('/projects').then(res => {
      setProjects(res.data.data);
      if (res.data.data.length > 0) setSP(res.data.data[0]._id);
    });
  }, []);

  useEffect(() => {
    if (!selectedProject) return;
    setLoading(true);
    setPage(0);
    Promise.all([
      api.get(`/transactions/${selectedProject}`),
      api.get(`/transactions/${selectedProject}/summary`)
    ]).then(([tx, s]) => {
      setTrans(tx.data.data);
      setSummary(s.data.data);
    }).catch(() => toast.error('Failed to load transactions'))
      .finally(() => setLoading(false));
  }, [selectedProject]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/transactions/${selectedProject}`, { ...form, amount: Number(form.amount) });
      toast.success('Transaction added!');
      setShowModal(false);
      setForm({ type:'material_purchase', category:'misc', amount:'', description:'', paymentMethod:'cash', vendor:'' });
      setPage(0);
      const [tx, s] = await Promise.all([
        api.get(`/transactions/${selectedProject}`),
        api.get(`/transactions/${selectedProject}/summary`)
      ]);
      setTrans(tx.data.data);
      setSummary(s.data.data);
    } catch { toast.error('Failed to add transaction'); }
  };

  const set = (f) => (e) => setForm({ ...form, [f]: e.target.value });
  const isIncome = (type) => type === 'client_receipt' || type === 'refund';

  return (
    <div>
      <div className="page-header">
        <div className="page-header-text">
          <h1>{t('finance')}</h1>
          <p>Track income, expenses, and project profitability</p>
        </div>
        <div style={{ display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>
          <select className="form-input" style={{ width:'auto', minWidth:180 }}
            value={selectedProject} onChange={e => setSP(e.target.value)}>
            {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select>
          <button className="btn btn-primary" onClick={() => setShowModal(true)} disabled={!selectedProject}>
            <Plus size={14} /> {t('addTransaction')}
          </button>
        </div>
      </div>

      {summary && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px,1fr))', gap:16, marginBottom:20 }}>
          {[
            { icon: TrendingUp,   cls:'si-green',  label: t('totalIncome'),   value: summary.income,        accent:'var(--success)', prefix:'+' },
            { icon: TrendingDown, cls:'si-red',     label: t('totalExpenses'), value: summary.expenses,      accent:'var(--danger)',  prefix:'-' },
            { icon: DollarSign,   cls:'si-blue',    label: t('netProfit'),     value: summary.profit,        accent:(summary.profit??0)>=0?'var(--success)':'var(--danger)', prefix:(summary.profit??0)>=0?'+':'' },
            { icon: Activity,     cls:'si-purple',  label: t('transactions'),  value: summary.transactions,  isCount:true },
          ].map(({ icon: Icon, cls, label, value, accent, prefix, isCount }) => (
            <div key={label} className="fin-card" style={{ borderTop:`3px solid ${accent||'var(--primary)'}` }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                <span style={{ fontSize:12.5, color:'var(--t3)', fontWeight:600 }}>{label}</span>
                <div className={`stat-icon ${cls}`} style={{ width:32, height:32, minWidth:32 }}><Icon size={16} /></div>
              </div>
              {isCount
                ? <div style={{ fontSize:26, fontWeight:800, color:'var(--t1)' }}>{value}</div>
                : <div style={{ fontSize:18, fontWeight:800, color:accent }}>
                    {prefix}{fmt(Math.abs(value ?? 0))}
                  </div>
              }
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <div className="loading"><div className="spinner" /><span className="loading-text">{t('loading')}…</span></div>
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>{t('description')}</th><th>{t('type')}</th><th>{t('amount')}</th><th>Method</th><th>{t('date')}</th><th>{t('status')}</th></tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr><td colSpan={6}>
                    <div className="empty-state">
                      <div className="empty-icon">💳</div>
                      <div className="empty-title">No transactions yet</div>
                      <div className="empty-desc">Add income and expenses to track project finances</div>
                    </div>
                  </td></tr>
                ) : (() => {
                  const start = page * itemsPerPage;
                  const paginatedTx = transactions.slice(start, start + itemsPerPage);
                  return paginatedTx.map(tx => (
                    <tr key={tx._id}>
                      <td>
                        <div style={{ fontWeight:600 }}>{tx.description}</div>
                        {tx.vendor && <div style={{ fontSize:11.5, color:'var(--t3)', marginTop:2 }}>{tx.vendor}</div>}
                      </td>
                      <td><span className="badge badge-gray">{tx.type?.replace(/_/g,' ')}</span></td>
                      <td style={{ fontWeight:700, color:isIncome(tx.type)?'var(--success)':'var(--t1)' }}>
                        {isIncome(tx.type)?'+':'-'} {fmt(tx.amount)}
                      </td>
                      <td style={{ color:'var(--t2)', textTransform:'capitalize' }}>{tx.paymentMethod}</td>
                      <td style={{ color:'var(--t3)' }}>{new Date(tx.date).toLocaleDateString('en', { day:'numeric', month:'short', year:'numeric' })}</td>
                      <td><span className={`badge ${tx.status==='paid'?'badge-green':tx.status==='pending'?'badge-yellow':'badge-gray'}`}>{tx.status}</span></td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
          </div>
          <TablePagination
            total={transactions.length}
            page={page}
            itemsPerPage={itemsPerPage}
            onPageChange={setPage}
            onItemsPerPageChange={(n) => { setItemsPerPage(n); setPage(0); }}
          />
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <h2>{t('addTransaction')}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <form id="tx-form" onSubmit={handleCreate}>
                <div className="form-group">
                  <label className="form-label">{t('description')} *</label>
                  <input className="form-input" value={form.description} onChange={set('description')} required placeholder="e.g. Cement purchase" />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">{t('type')} *</label>
                    <select className="form-input" value={form.type} onChange={set('type')}>
                      {['material_purchase','labour_payment','advance','misc_expense','client_receipt','refund'].map(v => (
                        <option key={v} value={v}>{v.replace(/_/g,' ')}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select className="form-input" value={form.category} onChange={set('category')}>
                      {['structure','labour','mep','finishing','misc'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">{t('amount')} *</label>
                    <input className="form-input" type="number" value={form.amount} onChange={set('amount')} required placeholder="150000" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Payment Method</label>
                    <select className="form-input" value={form.paymentMethod} onChange={set('paymentMethod')}>
                      {['cash','bank','easypaisa','jazzcash','cheque','upi'].map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group mb-0">
                  <label className="form-label">Vendor / Party</label>
                  <input className="form-input" value={form.vendor} onChange={set('vendor')} placeholder="Supplier name (optional)" />
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>{t('cancel')}</button>
              <button className="btn btn-primary" type="submit" form="tx-form"><Plus size={14} /> {t('add')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
