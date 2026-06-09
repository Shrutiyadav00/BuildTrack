import React, { useEffect, useState, useCallback } from 'react';
import { FileText, Plus, Download, Send, CheckCircle, Trash2, Eye, X, AlertTriangle, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import Paginator from '../../components/Paginator';

// ── PO workflow status (Draft vs Sent) ───────────────────────────────────────
const PO_STATUS_META = {
  draft: { label: 'Draft', color: 'var(--t3)',  bg: 'var(--bg)'      },
  sent:  { label: 'Sent',  color: 'var(--info)', bg: 'var(--info-bg)' },
};

// ── Payment status derived from the raw status field ─────────────────────────
const getPoWorkflow = (status) => status === 'draft' ? 'draft' : 'sent';
const getPayment    = (status) => status === 'paid' ? 'paid' : 'unpaid';

// Keep this for the filter dropdown only
const STATUS_META = {
  draft:   { label: 'Draft'  },
  sent:    { label: 'Sent'   },
  unpaid:  { label: 'Unpaid' },
  paid:    { label: 'Paid'   },
};

const fmt     = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

// ── Confirmation Modal ────────────────────────────────────────────────────────
function ConfirmModal({ modal, onClose }) {
  if (!modal) return null;
  const isDanger = !!modal.danger;
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:1300, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      <div style={{ background:'var(--white)', borderRadius:'var(--r-lg)', padding:'28px 32px', width:'100%', maxWidth:420, boxShadow:'0 20px 60px rgba(0,0,0,.22)' }}>
        <div style={{ display:'flex', alignItems:'flex-start', gap:14, marginBottom:16 }}>
          <div style={{ width:42, height:42, borderRadius:'50%', background: isDanger ? '#fef2f2' : '#fffbeb', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <AlertTriangle size={20} color={isDanger ? 'var(--danger)' : 'var(--warning)'} />
          </div>
          <div>
            <h3 style={{ fontSize:16, fontWeight:800, color:'var(--t1)', margin:0, lineHeight:1.3 }}>{modal.title}</h3>
            <p style={{ fontSize:13, color:'var(--t2)', lineHeight:1.6, marginTop:6, marginBottom:0 }}>{modal.message}</p>
          </div>
        </div>
        <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:22 }}>
          <button onClick={onClose}
            style={{ padding:'9px 22px', border:'1px solid var(--border)', borderRadius:'var(--r)', background:'var(--bg)', cursor:'pointer', fontSize:13, fontWeight:600, color:'var(--t2)' }}>
            Cancel
          </button>
          <button onClick={() => { modal.onConfirm(); onClose(); }}
            style={{ padding:'9px 22px', border:'none', borderRadius:'var(--r)', background: isDanger ? 'var(--danger)' : 'var(--primary)', color:'#fff', cursor:'pointer', fontSize:13, fontWeight:700 }}>
            {modal.confirmLabel || 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── PO View Modal ──────────────────────────────────────────────────────────────
function POViewModal({ po, onClose }) {
  if (!po) return null;
  const meta = STATUS_META[po.status] || STATUS_META.draft;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: 'var(--white)', borderRadius: 'var(--r-lg)', width: '100%', maxWidth: 640, maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>

        {/* Modal header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, background: 'var(--white)', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FileText size={18} color="var(--primary)" />
            <div>
              <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--t1)', fontFamily: 'monospace' }}>{po.poNumber}</div>
              <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 1 }}>{fmtDate(po.createdAt)}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ padding: '3px 12px', borderRadius: 'var(--r-full)', fontSize: 11, fontWeight: 700, background: meta.bg, color: meta.color }}>
              {meta.label}
            </span>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t3)', padding: 4, display: 'flex' }}>
              <X size={18} />
            </button>
          </div>
        </div>

        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Project + Vendor */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ background: 'var(--bg)', borderRadius: 'var(--r)', padding: '12px 14px' }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Project</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)' }}>{po.project?.name || po.project || '—'}</div>
            </div>
            <div style={{ background: 'var(--bg)', borderRadius: 'var(--r)', padding: '12px 14px' }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Vendor</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)' }}>{po.vendor?.companyName || po.vendor || '—'}</div>
              {po.vendor?.phone && <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 2 }}>{po.vendor.phone}</div>}
            </div>
          </div>

          {/* Category badge */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--t3)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category</div>
            <span style={{ padding: '3px 12px', borderRadius: 'var(--r-full)', background: 'var(--bg)', border: '1px solid var(--border)', fontSize: 12, fontWeight: 600, color: 'var(--t2)', textTransform: 'capitalize' }}>
              {po.category}
            </span>
          </div>

          {/* Line items table */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--t3)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Line Items</div>
            <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--r)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '8px 12px', textAlign: 'left',  fontSize: 11, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase' }}>#</th>
                    <th style={{ padding: '8px 12px', textAlign: 'left',  fontSize: 11, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase' }}>Item</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right', fontSize: 11, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase' }}>Qty</th>
                    <th style={{ padding: '8px 12px', textAlign: 'center',fontSize: 11, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase' }}>Unit</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right', fontSize: 11, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase' }}>Rate</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right', fontSize: 11, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(po.items || []).map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '9px 12px', color: 'var(--t4)', fontSize: 12 }}>{idx + 1}</td>
                      <td style={{ padding: '9px 12px', color: 'var(--t1)', fontWeight: 600 }}>{item.name}</td>
                      <td style={{ padding: '9px 12px', textAlign: 'right', color: 'var(--t2)' }}>{item.qty}</td>
                      <td style={{ padding: '9px 12px', textAlign: 'center', color: 'var(--t3)', fontSize: 11 }}>{item.unit || '—'}</td>
                      <td style={{ padding: '9px 12px', textAlign: 'right', color: 'var(--t2)' }}>{fmt(item.rate)}</td>
                      <td style={{ padding: '9px 12px', textAlign: 'right', fontWeight: 700, color: 'var(--t1)' }}>{fmt(item.total || item.qty * item.rate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end', marginTop: 10, paddingRight: 4 }}>
              <div style={{ fontSize: 13, color: 'var(--t3)' }}>
                Subtotal: <strong style={{ color: 'var(--t1)' }}>{fmt(po.subtotal)}</strong>
              </div>
              {po.tax > 0 && (
                <div style={{ fontSize: 13, color: 'var(--t3)' }}>
                  Tax: <strong style={{ color: 'var(--t1)' }}>{fmt(po.tax)}</strong>
                </div>
              )}
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--t1)', borderTop: '2px solid var(--border)', paddingTop: 6, marginTop: 2 }}>
                Grand Total: {fmt(po.totalAmount)}
              </div>
            </div>
          </div>

          {/* Notes */}
          {po.notes && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--t3)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Notes</div>
              <div style={{ background: 'var(--bg)', borderRadius: 'var(--r)', padding: '10px 14px', fontSize: 13, color: 'var(--t2)', lineHeight: 1.5 }}>
                {po.notes}
              </div>
            </div>
          )}

          {/* Footer flags */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 11, color: 'var(--t4)' }}>
            {po.sentToVendor && <span>✓ Sent to vendor</span>}
            {po.sentToClient && <span>✓ Sent to client</span>}
            {po.privateMode  && <span>🔒 Private mode (bank details hidden)</span>}
            {po.paidAt       && <span>Paid on {fmtDate(po.paidAt)}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main PurchaseOrders component ─────────────────────────────────────────────
export default function PurchaseOrders({ vendorFilter, showHeader = true }) {
  const navigate = useNavigate();
  const [pos, setPos]           = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filters, setFilters]   = useState({ status: '', project: '' });
  const [sendModal, setSendModal] = useState(null);
  const [sendForm, setSendForm]   = useState({ vendorEmail: '', clientEmail: '', sendToVendor: false, sendToClient: false });
  const [sending, setSending]     = useState(false);
  const [viewPO, setViewPO]         = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);
  const [poPage, setPoPage]         = useState(1);
  const [poPageSize, setPoPageSize] = useState(10);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.status)  params.append('status',  filters.status);
    if (filters.project) params.append('project', filters.project);
    if (vendorFilter)    params.append('vendor',  vendorFilter);
    api.get(`/purchase-orders?${params}`).then(r => setPos(r.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, [filters, vendorFilter]);

  useEffect(load, [load]);
  useEffect(() => { setPoPage(1); }, [filters, vendorFilter, poPageSize]);
  useEffect(() => {
    api.get('/projects').then(r => setProjects(r.data.data || [])).catch(() => {});
  }, []);

  const downloadPO = (po) => {
    const fmtN = (n) => (n || 0).toLocaleString('en-IN');
    const fmtD = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';

    const statusStyles = {
      paid:   { fg: '#065f46', bg: '#d1fae5', border: '#6ee7b7', label: 'PAID'   },
      sent:   { fg: '#1e40af', bg: '#dbeafe', border: '#93c5fd', label: 'SENT'   },
      unpaid: { fg: '#92400e', bg: '#fef3c7', border: '#fcd34d', label: 'UNPAID' },
      draft:  { fg: '#374151', bg: '#f3f4f6', border: '#d1d5db', label: 'DRAFT'  },
    };
    const st = statusStyles[po.status] || statusStyles.draft;

    const itemRows = (po.items || []).map((item, idx) => `
      <tr class="${idx % 2 === 1 ? 'row-alt' : ''}">
        <td class="num">${idx + 1}</td>
        <td class="item-name">${item.name}</td>
        <td class="r">${item.qty}</td>
        <td class="c unit">${item.unit || '—'}</td>
        <td class="r">₹${fmtN(item.rate)}</td>
        <td class="r total-cell">₹${fmtN(item.total ?? item.qty * item.rate)}</td>
      </tr>`).join('');

    const vendorInfo = [po.vendor?.contactPerson, po.vendor?.phone, po.vendor?.email, po.vendor?.address]
      .filter(Boolean).join(' &nbsp;·&nbsp; ');
    const vendorGst  = po.vendor?.gstNumber ? `<div class="addr-gst">GST: ${po.vendor.gstNumber}</div>` : '';

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${po.poNumber} — Purchase Order</title>
<style>
/* ── Reset & Base ── */
*{margin:0;padding:0;box-sizing:border-box}
html{font-size:14px}
body{font-family:'Segoe UI',system-ui,-apple-system,sans-serif;color:#1e293b;background:#f1f5f9;print-color-adjust:exact;-webkit-print-color-adjust:exact}

/* ── Page wrapper ── */
.page{max-width:820px;margin:32px auto;background:#fff;border-radius:12px;box-shadow:0 4px 32px rgba(0,0,0,.12);overflow:hidden}
@media print{body{background:#fff}.page{margin:0;border-radius:0;box-shadow:none;max-width:100%}}

/* ── Top accent bar ── */
.accent{height:6px;background:linear-gradient(90deg,#4338ca 0%,#6366f1 50%,#818cf8 100%)}

/* ── Header ── */
.hdr{display:flex;justify-content:space-between;align-items:flex-start;padding:36px 44px 28px;border-bottom:1px solid #e2e8f0}
.brand-name{font-size:24px;font-weight:900;color:#4338ca;letter-spacing:-0.5px;line-height:1}
.brand-tagline{font-size:10px;font-weight:600;color:#94a3b8;letter-spacing:2px;text-transform:uppercase;margin-top:5px}
.po-meta{text-align:right}
.po-label{font-size:9.5px;font-weight:700;color:#94a3b8;letter-spacing:2px;text-transform:uppercase;margin-bottom:6px}
.po-number{font-family:'Courier New',Courier,monospace;font-size:20px;font-weight:900;color:#0f172a;letter-spacing:1px}
.po-date-line{font-size:11px;color:#64748b;margin-top:5px}
.status-badge{
  display:inline-block;margin-top:10px;
  padding:5px 16px;border-radius:20px;
  font-size:9.5px;font-weight:800;letter-spacing:1.8px;text-transform:uppercase;
  background:${st.bg};color:${st.fg};border:1.5px solid ${st.border}
}

/* ── Address block ── */
.addr-section{display:grid;grid-template-columns:1fr 1fr;gap:0;border-bottom:1px solid #e2e8f0}
.addr-col{padding:22px 44px}
.addr-col:first-child{border-right:1px solid #e2e8f0;background:#fafafa}
.addr-col:last-child{background:#eef2ff}
.addr-label{font-size:9px;font-weight:800;letter-spacing:2px;text-transform:uppercase;margin-bottom:10px;display:flex;align-items:center;gap:6px}
.addr-col:first-child .addr-label{color:#94a3b8}
.addr-col:last-child  .addr-label{color:#6366f1}
.addr-label::before{content:'';display:inline-block;width:16px;height:2px;border-radius:1px}
.addr-col:first-child .addr-label::before{background:#cbd5e1}
.addr-col:last-child  .addr-label::before{background:#6366f1}
.addr-company{font-size:16px;font-weight:800;color:#0f172a;margin-bottom:5px}
.addr-info{font-size:11.5px;color:#475569;line-height:1.7}
.addr-gst{font-size:10.5px;color:#6366f1;font-weight:700;font-family:'Courier New',monospace;margin-top:6px;background:#eef2ff;padding:3px 8px;border-radius:4px;display:inline-block}

/* ── Meta strip ── */
.meta-strip{display:grid;grid-template-columns:repeat(4,1fr);gap:0;border-bottom:1px solid #e2e8f0}
.meta-cell{padding:16px 24px;border-right:1px solid #e2e8f0}
.meta-cell:last-child{border-right:none}
.meta-lbl{font-size:9px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#94a3b8;margin-bottom:5px}
.meta-val{font-size:13px;font-weight:700;color:#1e293b}
.meta-paid{font-size:10px;color:#059669;font-weight:700;margin-top:3px}

/* ── Table ── */
.tbl-section{padding:28px 44px 0}
.tbl-title{font-size:9px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:#94a3b8;margin-bottom:12px}
.tbl-wrap{border:1px solid #e2e8f0;border-radius:10px;overflow:hidden}
table{width:100%;border-collapse:collapse}
thead tr{background:linear-gradient(135deg,#4338ca 0%,#6366f1 100%)}
th{padding:12px 16px;font-size:9.5px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:rgba(255,255,255,.9);text-align:left}
td{padding:12px 16px;font-size:13px;color:#334155;border-bottom:1px solid #f1f5f9}
tbody tr:last-child td{border-bottom:none}
.row-alt{background:#f8faff}
.num{color:#cbd5e1;font-size:11px;width:32px}
.item-name{font-weight:700;color:#0f172a}
.r{text-align:right}
.c{text-align:center}
.unit{color:#94a3b8;font-size:11px}
.total-cell{font-weight:800;color:#1e293b}

/* ── Totals ── */
.totals-section{padding:20px 44px 28px;display:flex;justify-content:flex-end}
.totals-box{width:300px}
.t-row{display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-bottom:1px dashed #e2e8f0;font-size:13px;color:#64748b}
.t-row:last-of-type{border-bottom:none}
.t-row .val{font-weight:700;color:#1e293b}
.grand-total{
  display:flex;justify-content:space-between;align-items:center;
  margin-top:14px;padding:14px 20px;
  background:linear-gradient(135deg,#4338ca 0%,#6366f1 100%);
  border-radius:10px;color:#fff;
  font-size:15px;font-weight:900;
}

/* ── Notes ── */
.notes-section{margin:0 44px 24px;background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:14px 18px}
.notes-label{font-size:9px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:#92400e;margin-bottom:7px}
.notes-text{font-size:12.5px;color:#78350f;line-height:1.7}

/* ── Footer ── */
.doc-footer{background:#f8fafc;border-top:1px solid #e2e8f0;padding:14px 44px;display:flex;justify-content:space-between;align-items:center;font-size:10px;color:#94a3b8}
.doc-footer .flags{display:flex;gap:14px}
.flag{background:#e0e7ff;color:#4338ca;padding:2px 8px;border-radius:4px;font-weight:700;font-size:9.5px}
</style>
</head>
<body>
<div class="page">

  <!-- Accent bar -->
  <div class="accent"></div>

  <!-- Header -->
  <div class="hdr">
    <div>
      <div class="brand-name">BuildTrack</div>
      <div class="brand-tagline">Construction Management</div>
    </div>
    <div class="po-meta">
      <div class="po-label">Purchase Order</div>
      <div class="po-number">${po.poNumber}</div>
      <div class="po-date-line">Issued: ${fmtD(po.createdAt)}</div>
      <span class="status-badge">${st.label}</span>
    </div>
  </div>

  <!-- Addresses -->
  <div class="addr-section">
    <div class="addr-col">
      <div class="addr-label">From — Buyer</div>
      <div class="addr-company">BuildTrack Construction</div>
      <div class="addr-info">Construction Management Platform<br>India</div>
    </div>
    <div class="addr-col">
      <div class="addr-label">Bill To — Vendor</div>
      <div class="addr-company">${po.vendor?.companyName || '—'}</div>
      <div class="addr-info">${vendorInfo || 'No contact details'}</div>
      ${vendorGst}
    </div>
  </div>

  <!-- Meta strip -->
  <div class="meta-strip">
    <div class="meta-cell">
      <div class="meta-lbl">PO Number</div>
      <div class="meta-val" style="font-family:'Courier New',monospace">${po.poNumber}</div>
    </div>
    <div class="meta-cell">
      <div class="meta-lbl">Project</div>
      <div class="meta-val">${po.project?.name || '—'}</div>
    </div>
    <div class="meta-cell">
      <div class="meta-lbl">Category</div>
      <div class="meta-val" style="text-transform:capitalize">${po.category}</div>
    </div>
    <div class="meta-cell">
      <div class="meta-lbl">Issue Date</div>
      <div class="meta-val">${fmtD(po.createdAt)}</div>
      ${po.paidAt ? `<div class="meta-paid">✓ Paid ${fmtD(po.paidAt)}</div>` : ''}
    </div>
  </div>

  <!-- Line items -->
  <div class="tbl-section">
    <div class="tbl-title">Line Items</div>
    <div class="tbl-wrap">
      <table>
        <thead>
          <tr>
            <th style="width:36px">#</th>
            <th>Item Description</th>
            <th class="r" style="width:70px">Qty</th>
            <th class="c" style="width:68px">Unit</th>
            <th class="r" style="width:110px">Rate (₹)</th>
            <th class="r" style="width:120px">Amount (₹)</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>
    </div>
  </div>

  <!-- Totals -->
  <div class="totals-section">
    <div class="totals-box">
      <div class="t-row"><span>Subtotal</span><span class="val">₹${fmtN(po.subtotal)}</span></div>
      ${po.tax > 0 ? `<div class="t-row"><span>Tax / GST</span><span class="val">₹${fmtN(po.tax)}</span></div>` : ''}
      <div class="grand-total"><span>Grand Total</span><span>₹${fmtN(po.totalAmount)}</span></div>
    </div>
  </div>

  ${po.notes ? `
  <!-- Notes -->
  <div class="notes-section">
    <div class="notes-label">Notes &amp; Terms</div>
    <div class="notes-text">${po.notes}</div>
  </div>` : ''}

  <!-- Footer -->
  <div class="doc-footer">
    <div class="flags">
      ${po.sentToVendor ? '<span class="flag">✓ Sent to Vendor</span>' : ''}
      ${po.sentToClient ? '<span class="flag">✓ Sent to Client</span>' : ''}
      ${po.privateMode  ? '<span class="flag">🔒 Private</span>'        : ''}
    </div>
    <div>This is a computer-generated document · BuildTrack © ${new Date().getFullYear()}</div>
  </div>

</div>
</body>
</html>`;

    // ── Open in new tab → user uses Ctrl+P → Save as PDF ─────────────────────
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const win  = window.open(url, '_blank');
    if (!win) {
      // Fallback if popups blocked: force download
      const a   = document.createElement('a');
      a.href    = url;
      a.download = `${po.poNumber}.html`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 1500);
      toast.success(`${po.poNumber} downloaded`);
    } else {
      setTimeout(() => URL.revokeObjectURL(url), 8000);
      toast.success(`${po.poNumber} opened — press Ctrl+P to save as PDF`);
    }
  };

  const markPaid = (po) => {
    setConfirmModal({
      title:        `Mark ${po.poNumber} as Paid`,
      message:      `This will deduct ${fmt(po.totalAmount)} from the project budget and create a transaction record. This action cannot be easily undone.`,
      confirmLabel: 'Mark as Paid',
      onConfirm:    async () => {
        try {
          await api.put(`/purchase-orders/${po._id}/status`, { status: 'paid' });
          toast.success('PO marked as paid — budget updated');
          load();
        } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
      },
    });
  };

  const unmarkPaid = (po) => {
    setConfirmModal({
      title:        `Undo Payment — ${po.poNumber}`,
      message:      `This will revert ${po.poNumber} back to Unpaid status. The budget deduction will also be reversed.`,
      confirmLabel: 'Undo Payment',
      danger:       true,
      onConfirm:    async () => {
        try {
          await api.put(`/purchase-orders/${po._id}/status`, { status: 'unpaid' });
          toast.success('Payment status reverted to Unpaid');
          load();
        } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
      },
    });
  };

  const deletePO = (po) => {
    setConfirmModal({
      title:        `Delete ${po.poNumber}`,
      message:      `Are you sure you want to permanently delete this draft PO? This cannot be undone.`,
      confirmLabel: 'Delete',
      danger:       true,
      onConfirm:    async () => {
        try {
          await api.delete(`/purchase-orders/${po._id}`);
          toast.success('PO deleted');
          load();
        } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
      },
    });
  };

  const openSend = (po) => {
    setSendModal(po);
    setSendForm({ vendorEmail: po.vendor?.email || '', clientEmail: '', sendToVendor: !!po.vendor?.email, sendToClient: false });
  };

  const doSend = async () => {
    setSending(true);
    try {
      await api.post(`/purchase-orders/${sendModal._id}/send`, sendForm);
      toast.success('PO sent successfully');
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

      {/* Filters — no duplicate button here */}
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
                {['PO #', 'Project', 'Vendor', 'Category', 'Amount', 'Status', 'Payment', 'Date', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', fontSize: 11, fontWeight: 700, color: 'var(--t3)', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pos.slice((poPage-1)*poPageSize, poPage*poPageSize).map((po, i, arr) => {
                const wf      = getPoWorkflow(po.status);
                const payment = getPayment(po.status);
                const wfMeta  = PO_STATUS_META[wf];
                return (
                  <tr key={po._id}
                    style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--border-light)' : 'none' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}>

                    {/* PO # */}
                    <td onClick={() => setViewPO(po)} title="Click to view PO details"
                      style={{ padding: '12px 14px', fontWeight: 700, fontSize: 13, color: 'var(--primary)', fontFamily: 'monospace', cursor: 'pointer', textDecoration: 'underline', textDecorationStyle: 'dotted' }}>
                      {po.poNumber}
                    </td>

                    {/* Project */}
                    <td style={{ padding: '12px 14px', fontSize: 13, color: 'var(--t2)' }}>{po.project?.name || '—'}</td>

                    {/* Vendor */}
                    <td style={{ padding: '12px 14px', fontSize: 13, color: 'var(--t1)' }}>{po.vendor?.companyName || '—'}</td>

                    {/* Category */}
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ padding: '2px 8px', borderRadius: 'var(--r-full)', fontSize: 11, background: 'var(--bg)', color: 'var(--t2)', textTransform: 'capitalize', border: '1px solid var(--border)' }}>{po.category}</span>
                    </td>

                    {/* Amount */}
                    <td style={{ padding: '12px 14px', fontWeight: 700, fontSize: 14, color: 'var(--t1)' }}>{fmt(po.totalAmount)}</td>

                    {/* PO Status — Draft or Sent */}
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: 'var(--r-full)', fontSize: 11, fontWeight: 600, background: wfMeta.bg, color: wfMeta.color }}>
                        {wfMeta.label}
                      </span>
                    </td>

                    {/* Payment Status */}
                    <td style={{ padding: '12px 14px' }}>
                      {payment === 'unpaid' ? (
                        // Clickable → opens confirm modal
                        <button onClick={() => markPaid(po)} title="Click to mark as Paid"
                          style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 'var(--r-full)', border: '1.5px solid var(--warning)', background: 'var(--warning-bg)', color: 'var(--warning)', cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--warning)', flexShrink: 0 }} />
                          Unpaid
                        </button>
                      ) : (
                        // Paid — badge only (click to undo via confirm)
                        <button onClick={() => unmarkPaid(po)} title="Click to undo payment"
                          style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 'var(--r-full)', background: 'var(--success-bg)', color: 'var(--success)', fontSize: 11, fontWeight: 700, border: '1.5px solid var(--success)', cursor: 'pointer' }}>
                          <CheckCircle size={11} /> Paid
                        </button>
                      )}
                    </td>

                    {/* Date */}
                    <td style={{ padding: '12px 14px', fontSize: 12, color: 'var(--t3)' }}>{fmtDate(po.createdAt)}</td>

                    {/* Actions */}
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                        {/* View */}
                        <button onClick={() => setViewPO(po)} title="View PO details"
                          style={{ background: 'var(--primary-light)', border: 'none', borderRadius: 'var(--r)', padding: '4px 8px', cursor: 'pointer', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600 }}>
                          <Eye size={11} /> View
                        </button>
                        {/* Download */}
                        <button onClick={() => downloadPO(po)} title="Download PO document"
                          style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '4px 8px', cursor: 'pointer', color: 'var(--t2)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
                          <Download size={12} />
                        </button>
                        {/* Send — only if not paid */}
                        {po.status !== 'paid' && (
                          <button onClick={() => openSend(po)} title="Send by email"
                            style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '4px 8px', cursor: 'pointer', color: 'var(--t2)', display: 'flex', alignItems: 'center' }}>
                            <Send size={12} />
                          </button>
                        )}
                        {/* Edit — draft only */}
                        {po.status === 'draft' && (
                          <button onClick={() => navigate(`/purchase-orders/${po._id}/edit`)} title="Edit draft PO"
                            style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '4px 8px', cursor: 'pointer', color: 'var(--t2)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600 }}>
                            <Edit2 size={11} /> Edit
                          </button>
                        )}
                        {/* Delete — draft only */}
                        {po.status === 'draft' && (
                          <button onClick={() => deletePO(po)} title="Delete draft"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', padding: 4 }}>
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
        {/* PO Paginator */}
        <Paginator
          page={poPage} total={pos.length} pageSize={poPageSize}
          onPageChange={setPoPage} onPageSizeChange={setPoPageSize}
        />
      </div>

      {/* Confirm Modal */}
      {confirmModal && <ConfirmModal modal={confirmModal} onClose={() => setConfirmModal(null)} />}

      {/* View PO Modal */}
      {viewPO && <POViewModal po={viewPO} onClose={() => setViewPO(null)} />}

      {/* Send modal */}
      {sendModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--white)', borderRadius: 'var(--r-lg)', padding: 28, width: '100%', maxWidth: 440 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--t1)', marginBottom: 20 }}>Send {sendModal.poNumber}</h3>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, marginBottom: 8, cursor: 'pointer' }}>
                <input type="checkbox" checked={sendForm.sendToVendor} onChange={e => setSendForm(f => ({ ...f, sendToVendor: e.target.checked }))} />
                Send to Vendor
              </label>
              {sendForm.sendToVendor && (
                <input value={sendForm.vendorEmail} onChange={e => setSendForm(f => ({ ...f, vendorEmail: e.target.value }))}
                  placeholder="Vendor email address" style={{ width: '100%', padding: '7px 12px', border: '1px solid var(--border)', borderRadius: 'var(--r)', fontSize: 13, boxSizing: 'border-box' }} />
              )}
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, marginBottom: 8, cursor: 'pointer' }}>
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
