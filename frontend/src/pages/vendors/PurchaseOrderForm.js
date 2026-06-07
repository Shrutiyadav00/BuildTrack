import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import POLineItems from '../../components/vendors/POLineItems';

const CATEGORIES = ['structure', 'labour', 'mep', 'finishing', 'misc'];

const inputStyle = { width: '100%', padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 'var(--r)', fontSize: 13, color: 'var(--t1)', background: 'var(--white)', boxSizing: 'border-box' };
const labelStyle = { fontSize: 12, fontWeight: 600, color: 'var(--t2)', marginBottom: 4, display: 'block' };
const fmt = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;

export default function PurchaseOrderForm() {
  const navigate = useNavigate();
  const [step, setStep]         = useState(1);
  const [projects, setProjects] = useState([]);
  const [vendors, setVendors]   = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    project: '', vendor: '', category: 'misc',
    items: [{ name: '', qty: '', unit: 'nos', rate: '', total: 0 }],
    taxPct: 0, notes: '', privateMode: false,
  });

  useEffect(() => {
    api.get('/projects').then(r => setProjects(r.data.data || [])).catch(() => {});
    api.get('/vendors?active=true').then(r => setVendors(r.data.data || [])).catch(() => {});
  }, []);

  const set = (field, val) => setForm(f => ({ ...f, [field]: val }));

  const subtotal    = form.items.reduce((s, r) => s + (parseFloat(r.total) || 0), 0);
  const taxPct      = parseFloat(form.taxPct) || 0;
  const taxAmount   = Math.round(subtotal * taxPct / 100);
  const totalAmount = subtotal + taxAmount;

  const canNext1 = form.project && form.vendor && form.category;
  const canNext2 = form.items.some(i => i.name && parseFloat(i.qty) > 0 && parseFloat(i.rate) > 0);

  const submit = async () => {
    if (!canNext1 || !canNext2) return toast.error('Please fill in all required fields');
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        tax: taxAmount,        // store rupee amount, not percent
        totalAmount,
        items: form.items.filter(i => i.name).map(i => ({
          name: i.name, qty: parseFloat(i.qty), unit: i.unit, rate: parseFloat(i.rate), total: parseFloat(i.total) || 0,
        })),
      };
      await api.post('/purchase-orders', payload);
      toast.success('Purchase Order created!');
      navigate('/purchase-orders');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create PO');
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    { num: 1, label: 'Select' },
    { num: 2, label: 'Items' },
    { num: 3, label: 'Details' },
  ];

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      {/* Back */}
      <button onClick={() => navigate('/purchase-orders')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t2)', fontSize: 13, marginBottom: 20 }}>
        <ArrowLeft size={14} /> Back to Purchase Orders
      </button>

      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28 }}>
        <FileText size={20} color="var(--primary)" />
        <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--t1)' }}>New Purchase Order</h1>
      </div>

      {/* Step indicator */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 28, gap: 0 }}>
        {steps.map((s, i) => (
          <React.Fragment key={s.num}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 13,
                background: step > s.num ? 'var(--success)' : step === s.num ? 'var(--primary)' : 'var(--bg)',
                color: step >= s.num ? '#fff' : 'var(--t3)',
                border: step < s.num ? '2px solid var(--border)' : 'none',
              }}>
                {step > s.num ? <Check size={14} /> : s.num}
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, color: step === s.num ? 'var(--primary)' : 'var(--t3)' }}>{s.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: 2, background: step > s.num ? 'var(--success)' : 'var(--border)', margin: '0 8px', marginBottom: 18 }} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Card */}
      <div style={{ background: 'var(--white)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)', padding: 28 }}>

        {/* Step 1: Select */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--t1)', marginBottom: 4 }}>Select Project, Vendor & Category</h3>
            <div>
              <label style={labelStyle}>Project *</label>
              <select value={form.project} onChange={e => set('project', e.target.value)} style={inputStyle}>
                <option value="">Select a project...</option>
                {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Vendor *</label>
              <select value={form.vendor} onChange={e => set('vendor', e.target.value)} style={inputStyle}>
                <option value="">Select a vendor...</option>
                {vendors.map(v => <option key={v._id} value={v._id}>{v.companyName} — {v.contactPerson}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Category *</label>
              <select value={form.category} onChange={e => set('category', e.target.value)} style={inputStyle}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
          </div>
        )}

        {/* Step 2: Items */}
        {step === 2 && (
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--t1)', marginBottom: 16 }}>Line Items</h3>
            <POLineItems items={form.items} onChange={items => set('items', items)} />
            <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <label style={{ fontSize: 13, color: 'var(--t2)', fontWeight: 600 }}>Tax %:</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 0, border: '1px solid var(--border)', borderRadius: 'var(--r)', overflow: 'hidden' }}>
                <input
                  type="number" min="0" max="100" step="0.5"
                  value={form.taxPct}
                  onChange={e => set('taxPct', e.target.value)}
                  style={{ width: 80, padding: '7px 10px', border: 'none', fontSize: 13, textAlign: 'right', outline: 'none', background: 'var(--white)' }}
                />
                <span style={{ padding: '7px 10px', background: 'var(--bg)', fontSize: 13, color: 'var(--t3)', fontWeight: 600, borderLeft: '1px solid var(--border)' }}>%</span>
              </div>
              {taxPct > 0 && (
                <span style={{ fontSize: 12, color: 'var(--t3)' }}>= {fmt(taxAmount)}</span>
              )}
            </div>
            <div style={{ marginTop: 12, textAlign: 'right', padding: '12px 0', borderTop: '2px solid var(--border)' }}>
              <div style={{ fontSize: 13, color: 'var(--t2)' }}>Subtotal: <strong>{fmt(subtotal)}</strong></div>
              {taxPct > 0 && (
                <div style={{ fontSize: 13, color: 'var(--t2)', marginTop: 2 }}>
                  Tax ({taxPct}%): <strong>{fmt(taxAmount)}</strong>
                </div>
              )}
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--t1)', marginTop: 6 }}>Total: {fmt(totalAmount)}</div>
            </div>
          </div>
        )}

        {/* Step 3: Details */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--t1)', marginBottom: 4 }}>Final Details</h3>
            <div>
              <label style={labelStyle}>Notes</label>
              <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={3}
                placeholder="Payment terms, delivery instructions, special notes..."
                style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} />
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, cursor: 'pointer' }}>
              <input type="checkbox" checked={form.privateMode} onChange={e => set('privateMode', e.target.checked)} />
              <div>
                <div style={{ fontWeight: 600, color: 'var(--t1)' }}>Private Mode</div>
                <div style={{ fontSize: 11, color: 'var(--t3)' }}>Hide vendor bank details from client-facing copies of this PO</div>
              </div>
            </label>

            {/* Summary */}
            <div style={{ background: 'var(--bg)', borderRadius: 'var(--r)', padding: 16, marginTop: 8 }}>
              <div style={{ fontSize: 12, color: 'var(--t3)', marginBottom: 8, fontWeight: 700, textTransform: 'uppercase' }}>Summary</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  { label: 'Project',  value: projects.find(p => p._id === form.project)?.name || form.project },
                  { label: 'Vendor',   value: vendors.find(v => v._id === form.vendor)?.companyName || form.vendor },
                  { label: 'Category', value: form.category },
                  { label: 'Items',    value: `${form.items.filter(i => i.name).length} line item(s)` },
                  { label: 'Subtotal', value: fmt(subtotal) },
                  ...(taxPct > 0 ? [{ label: `Tax (${taxPct}%)`, value: fmt(taxAmount) }] : []),
                  { label: 'Grand Total', value: fmt(totalAmount) },
                ].map(r => (
                  <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: 'var(--t3)' }}>{r.label}</span>
                    <span style={{ fontWeight: 600, color: 'var(--t1)' }}>{r.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28 }}>
          <button onClick={() => step > 1 ? setStep(s => s - 1) : navigate('/purchase-orders')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', border: '1px solid var(--border)', borderRadius: 'var(--r)', background: 'var(--bg)', cursor: 'pointer', fontSize: 13 }}>
            <ArrowLeft size={13} /> {step === 1 ? 'Cancel' : 'Back'}
          </button>

          {step < 3 ? (
            <button onClick={() => setStep(s => s + 1)} disabled={step === 1 ? !canNext1 : !canNext2}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', border: 'none', borderRadius: 'var(--r)', background: 'var(--primary)', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600, opacity: (step === 1 ? !canNext1 : !canNext2) ? 0.5 : 1 }}>
              Next <ArrowRight size={13} />
            </button>
          ) : (
            <button onClick={submit} disabled={submitting}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', border: 'none', borderRadius: 'var(--r)', background: 'var(--success)', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
              {submitting ? 'Creating...' : <><Check size={13} /> Create PO</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
