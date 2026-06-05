import React, { useEffect, useState, useCallback } from 'react';
import { FileText, Plus, Download, Send, CheckCircle, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const STATUS_META = {
  draft:   { label: 'Draft',   color: 'var(--t3)',      bg: 'var(--bg)' },
  sent:    { label: 'Sent',    color: 'var(--info)',     bg: 'var(--info-bg)' },
  unpaid:  { label: 'Unpaid',  color: 'var(--warning)',  bg: 'var(--warning-bg)' },
  paid:    { label: 'Paid',    color: 'var(--success)',  bg: 'var(--success-bg)' },
};

const fmt     = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

export default function PurchaseOrders({ vendorFilter, showHeader = true }) {
  const navigate = useNavigate();
  const [pos, setPos]           = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filters, setFilters]   = useState({ status: '', project: vendorFilter ? '' : '' });
  const [sendModal, setSendModal] = useState(null);
  const [sendForm, setSendForm]   = useState({ vendorEmail: '', clientEmail: '', sendToVendor: false, sendToClient: false });
  const [sending, setSending]     = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.status)  params.append('status',  filters.status);
    if (filters.project) params.append('project', filters.project);
    if (vendorFilter)    params.append('vendor',  vendorFilter);
    api.get(`/purchase-orders?${params}`).then(r => setPos(r.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, [filters, vendorFilter]);

  useEffect(load, [load]);
  useEffect(() => {
    api.get('/projects').then(r => setProjects(r.data.data || [])).catch(() => {});
  }, []);

  const downloadPDF = async (po) => {
    try {
      const res = await api.get(`/purchase-orders/${po._id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a   = document.createElement('a');
      a.href    = url; a.download = `${po.poNumber}.pdf`; a.click();
      window.URL.revokeObjectURL(url);
    } catch { toast.error('PDF download failed'); }
  };

  const markPaid = async (po) => {
    if (!window.confirm(`Mark ${po.poNumber} as PAID? This will deduct ₹${(po.totalAmount||0).toLocaleString('en-IN')} from project budget.`)) return;
    try {
      await api.put(`/purchase-orders/${po._id}/status`, { status: 'paid' });
      toast.success('PO marked as paid');
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const deletePO = async (po) => {
    if (!window.confirm(`Delete draft PO ${po.poNumber}?`)) return;
    try {
      await api.delete(`/purchase-orders/${po._id}`);
      toast.success('PO deleted');
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const openSend = (po) => {
    setSendModal(po);
    setSendForm({ vendorEmail: po.vendor?.email || '', clientEmail: '', sendToVendor: !!po.vendor?.email, sendToClient: false });
  };

  const doSend = async () => {
    setSending(true);
    try {
      const res = await api.post(`/purchase-orders/${sendModal._id}/send`, sendForm);
      if (res.data.errors?.length) {
        res.data.errors.forEach(e => toast.error(e));
      } else {
        toast.success('PO sent successfully');
      }
      setSendModal(null);
      load();
    } catch { toast.error('Send failed'); } finally { setSending(false); }
  };

  return (
    <div>
      {showHeader && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--t1)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileText size={20} color="var(--primary)" /> Purchase Orders
          </h1>
          <button onClick={() => navigate('/purchase-orders/new')} style={{
            display: 'flex', alignItems: 'center', gap: 6, background: 'var(--primary)', color: '#fff',
            border: 'none', borderRadius: 'var(--r)', padding: '8px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 600,
          }}>
            <Plus size={14} /> New PO
          </button>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
          style={{ padding: '7px 12px', border: '1px solid var(--border)', borderRadius: 'var(--r)', fontSize: 13, background: 'var(--white)', color: 'var(--t1)' }}>
          <option value="">All Statuses</option>
          {Object.entries(STATUS_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        {!vendorFilter && (
          <select value={filters.project} onChange={e => setFilters(f => ({ ...f, project: e.target.value }))}
            style={{ padding: '7px 12px', border: '1px solid var(--border)', borderRadius: 'var(--r)', fontSize: 13, background: 'var(--white)', color: 'var(--t1)' }}>
            <option value="">All Projects</option>
            {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select>
        )}
        {showHeader && (
          <button onClick={() => navigate('/purchase-orders/new')} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 'var(--r)', padding: '7px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
            <Plus size={13} /> New PO
          </button>
        )}
      </div>

      {/* Table */}
      <div style={{ background: 'var(--white)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--t3)' }}>Loading...</div>
        ) : pos.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--t3)', fontSize: 13 }}>No purchase orders found.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
                {['PO #', 'Project', 'Vendor', 'Category', 'Amount', 'Status', 'Date', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', fontSize: 11, fontWeight: 700, color: 'var(--t3)', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pos.map((po, i) => {
                const meta = STATUS_META[po.status] || STATUS_META.draft;
                return (
                  <tr key={po._id} style={{ borderBottom: i < pos.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 700, fontSize: 13, color: 'var(--primary)', fontFamily: 'monospace' }}>{po.poNumber}</td>
                    <td style={{ padding: '12px 14px', fontSize: 13, color: 'var(--t2)' }}>{po.project?.name || '—'}</td>
                    <td style={{ padding: '12px 14px', fontSize: 13, color: 'var(--t1)' }}>{po.vendor?.companyName || '—'}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ padding: '2px 8px', borderRadius: 'var(--r-full)', fontSize: 11, background: 'var(--bg)', color: 'var(--t2)' }}>{po.category}</span>
                    </td>
                    <td style={{ padding: '12px 14px', fontWeight: 700, fontSize: 14, color: 'var(--t1)' }}>{fmt(po.totalAmount)}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ padding: '2px 10px', borderRadius: 'var(--r-full)', fontSize: 11, fontWeight: 600, background: meta.bg, color: meta.color }}>{meta.label}</span>
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: 12, color: 'var(--t3)' }}>{fmtDate(po.createdAt)}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => downloadPDF(po)} title="Download PDF" style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '4px 8px', cursor: 'pointer', color: 'var(--t2)', display: 'flex', alignItems: 'center' }}>
                          <Download size={12} />
                        </button>
                        {po.status !== 'paid' && (
                          <button onClick={() => openSend(po)} title="Send by email" style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '4px 8px', cursor: 'pointer', color: 'var(--t2)', display: 'flex', alignItems: 'center' }}>
                            <Send size={12} />
                          </button>
                        )}
                        {(po.status === 'sent' || po.status === 'unpaid') && (
                          <button onClick={() => markPaid(po)} title="Mark as paid" style={{ background: 'var(--success-bg)', border: 'none', borderRadius: 'var(--r)', padding: '4px 8px', cursor: 'pointer', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600 }}>
                            <CheckCircle size={11} /> Paid
                          </button>
                        )}
                        {po.status === 'draft' && (
                          <button onClick={() => deletePO(po)} title="Delete draft" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', padding: 4 }}>
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Send modal */}
      {sendModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--white)', borderRadius: 'var(--r-lg)', padding: 28, width: '100%', maxWidth: 440 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--t1)', marginBottom: 20 }}>Send {sendModal.poNumber}</h3>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, marginBottom: 8 }}>
                <input type="checkbox" checked={sendForm.sendToVendor} onChange={e => setSendForm(f => ({ ...f, sendToVendor: e.target.checked }))} />
                Send to Vendor
              </label>
              {sendForm.sendToVendor && (
                <input value={sendForm.vendorEmail} onChange={e => setSendForm(f => ({ ...f, vendorEmail: e.target.value }))}
                  placeholder="Vendor email address" style={{ width: '100%', padding: '7px 12px', border: '1px solid var(--border)', borderRadius: 'var(--r)', fontSize: 13, boxSizing: 'border-box' }} />
              )}
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, marginBottom: 8 }}>
                <input type="checkbox" checked={sendForm.sendToClient} onChange={e => setSendForm(f => ({ ...f, sendToClient: e.target.checked }))} />
                Send to Client
              </label>
              {sendForm.sendToClient && (
                <input value={sendForm.clientEmail} onChange={e => setSendForm(f => ({ ...f, clientEmail: e.target.value }))}
                  placeholder="Client email address" style={{ width: '100%', padding: '7px 12px', border: '1px solid var(--border)', borderRadius: 'var(--r)', fontSize: 13, boxSizing: 'border-box' }} />
              )}
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setSendModal(null)} style={{ padding: '8px 18px', border: '1px solid var(--border)', borderRadius: 'var(--r)', background: 'var(--bg)', cursor: 'pointer', fontSize: 13 }}>Cancel</button>
              <button onClick={doSend} disabled={sending || (!sendForm.sendToVendor && !sendForm.sendToClient)}
                style={{ padding: '8px 18px', border: 'none', borderRadius: 'var(--r)', background: 'var(--primary)', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                {sending ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
