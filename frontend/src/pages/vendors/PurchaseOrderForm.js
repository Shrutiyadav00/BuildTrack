import React, { useEffect, useState, useRef } from 'react';
import {
  ArrowLeft, ArrowRight, Check, FileText, ChevronDown,
  Package, HardHat, Zap, Paintbrush, MoreHorizontal, Search, X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../utils/api';
import POLineItems from '../../components/vendors/POLineItems';

// ── Category definitions ──────────────────────────────────────────────────────
const CATEGORIES = [
  { value: 'structure', label: 'Structure',  sub: 'Civil & structural works',           icon: Package,       color: '#ea580c', bg: '#fff7ed', border: '#fed7aa' },
  { value: 'labour',   label: 'Labour',     sub: 'Labour & workforce charges',         icon: HardHat,       color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
  { value: 'mep',      label: 'MEP',        sub: 'Electrical, plumbing & HVAC',        icon: Zap,           color: '#ca8a04', bg: '#fefce8', border: '#fde68a' },
  { value: 'finishing',label: 'Finishing',  sub: 'Tiles, paint, interiors',            icon: Paintbrush,    color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
  { value: 'misc',     label: 'Misc',       sub: 'Miscellaneous & overhead',           icon: MoreHorizontal,color: '#475569', bg: '#f8fafc', border: '#e2e8f0' },
];

const fmt = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;

// ── Searchable Select ─────────────────────────────────────────────────────────
function SearchSelect({ value, onChange, options, placeholder, getLabel, getKey, renderItem }) {
  const [open, setOpen]   = useState(false);
  const [query, setQuery] = useState('');
  const ref               = useRef(null);
  const inputRef          = useRef(null);

  const selected = options.find(o => getKey(o) === value);
  const filtered = query
    ? options.filter(o => getLabel(o).toLowerCase().includes(query.toLowerCase()))
    : options;

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) { setOpen(false); setQuery(''); } };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div
        onClick={() => setOpen(v => !v)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 12px', border: `1px solid ${open ? 'var(--primary)' : 'var(--border)'}`,
          borderRadius: 'var(--r)', background: 'var(--white)', cursor: 'pointer',
          boxShadow: open ? '0 0 0 3px var(--primary-light)' : 'none',
          transition: 'border-color .15s, box-shadow .15s',
        }}>
        <span style={{ fontSize: 13, color: selected ? 'var(--t1)' : 'var(--t4)', fontWeight: selected ? 600 : 400 }}>
          {selected ? getLabel(selected) : placeholder}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {value && (
            <span onClick={e => { e.stopPropagation(); onChange(''); setQuery(''); }}
              style={{ display: 'flex', alignItems: 'center', padding: 2, color: 'var(--t3)', cursor: 'pointer' }}>
              <X size={13} />
            </span>
          )}
          <ChevronDown size={14} color="var(--t3)" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }} />
        </div>
      </div>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
          background: 'var(--white)', border: '1px solid var(--border)',
          borderRadius: 'var(--r-lg)', boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          zIndex: 1200, overflow: 'hidden',
        }}>
          {/* Search box */}
          <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg)' }}>
            <Search size={13} color="var(--t3)" style={{ flexShrink: 0 }} />
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search..."
              style={{ border: 'none', outline: 'none', background: 'none', fontSize: 13, color: 'var(--t1)', width: '100%' }}
            />
          </div>
          {/* Options */}
          <div style={{ maxHeight: 220, overflowY: 'auto' }}>
            {filtered.length === 0 ? (
              <div style={{ padding: '14px 14px', fontSize: 13, color: 'var(--t4)', textAlign: 'center' }}>No results</div>
            ) : filtered.map(opt => (
              <div key={getKey(opt)}
                onClick={() => { onChange(getKey(opt)); setOpen(false); setQuery(''); }}
                style={{
                  padding: '9px 14px', cursor: 'pointer', fontSize: 13,
                  background: getKey(opt) === value ? 'var(--primary-light)' : 'transparent',
                  color: getKey(opt) === value ? 'var(--primary)' : 'var(--t1)',
                  fontWeight: getKey(opt) === value ? 700 : 400,
                  borderBottom: '1px solid var(--border-light)',
                  transition: 'background .1s',
                }}
                onMouseEnter={e => { if (getKey(opt) !== value) e.currentTarget.style.background = 'var(--bg)'; }}
                onMouseLeave={e => { if (getKey(opt) !== value) e.currentTarget.style.background = 'transparent'; }}>
                {renderItem ? renderItem(opt) : getLabel(opt)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function PurchaseOrderForm() {
  const navigate    = useNavigate();
  const { id }      = useParams();                // present when editing
  const isEdit      = !!id;

  const [step, setStep]         = useState(1);
  const [projects, setProjects] = useState([]);
  const [vendors,  setVendors]  = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [loadingPO, setLoadingPO]   = useState(isEdit);

  const [form, setForm] = useState({
    project: '', vendor: '', category: 'misc',
    items: [{ name: '', qty: '', unit: 'nos', rate: '', total: 0 }],
    taxPct: 0, notes: '',
  });

  useEffect(() => {
    api.get('/projects').then(r => setProjects(r.data.data || [])).catch(() => {});
    api.get('/vendors?active=true').then(r => setVendors(r.data.data || [])).catch(() => {});
    if (isEdit) {
      api.get(`/purchase-orders/${id}`).then(r => {
        const po = r.data.data;
        if (po.status !== 'draft') {
          toast.error('Only draft POs can be edited');
          navigate('/purchase-orders');
          return;
        }
        setForm({
          project:  po.project?._id || po.project || '',
          vendor:   po.vendor?._id  || po.vendor  || '',
          category: po.category || 'misc',
          items:    po.items?.map(i => ({ name: i.name, qty: i.qty, unit: i.unit || 'nos', rate: i.rate, total: i.total || i.qty * i.rate }))
                    || [{ name:'', qty:'', unit:'nos', rate:'', total:0 }],
          taxPct:   po.subtotal > 0 ? Math.round(((po.tax || 0) / po.subtotal) * 100) : 0,
          notes:    po.notes || '',
        });
      }).catch(() => toast.error('Failed to load PO'))
        .finally(() => setLoadingPO(false));
    }
  }, [id, isEdit, navigate]);

  const set = (field, val) => setForm(f => ({ ...f, [field]: val }));

  const subtotal    = form.items.reduce((s, r) => s + (parseFloat(r.total) || 0), 0);
  const taxPct      = parseFloat(form.taxPct) || 0;
  const taxAmount   = Math.round(subtotal * taxPct / 100);
  const totalAmount = subtotal + taxAmount;

  const canNext1 = form.project && form.vendor && form.category;
  const canNext2 = form.items.some(i => i.name && parseFloat(i.qty) > 0 && parseFloat(i.rate) > 0);

  const submit = async () => {
    if (!canNext1 || !canNext2) return toast.error('Please fill all required fields');
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        tax: taxAmount,
        totalAmount,
        items: form.items.filter(i => i.name).map(i => ({
          name: i.name, qty: parseFloat(i.qty), unit: i.unit,
          rate: parseFloat(i.rate), total: parseFloat(i.total) || 0,
        })),
      };
      if (isEdit) {
        await api.put(`/purchase-orders/${id}`, payload);
        toast.success('Purchase Order updated!');
      } else {
        await api.post('/purchase-orders', payload);
        toast.success('Purchase Order created!');
      }
      navigate('/purchase-orders');
    } catch (err) {
      toast.error(err.response?.data?.message || (isEdit ? 'Failed to update PO' : 'Failed to create PO'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingPO) return <div className="loading"><div className="spinner" /><span className="loading-text">Loading PO…</span></div>;

  const selProject  = projects.find(p => p._id === form.project);
  const selVendor   = vendors.find(v => v._id === form.vendor);
  const selCategory = CATEGORIES.find(c => c.value === form.category);

  const STEPS = [
    { num: 1, label: 'Select',  desc: 'Project, vendor & category' },
    { num: 2, label: 'Items',   desc: 'Materials & quantities' },
    { num: 3, label: 'Review',  desc: 'Notes & confirm' },
  ];

  return (
    <div>
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
        <button onClick={() => navigate('/purchase-orders')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: '1px solid var(--border)', borderRadius: 'var(--r)', background: 'var(--white)', cursor: 'pointer', fontSize: 13, color: 'var(--t2)', fontWeight: 500 }}>
          <ArrowLeft size={14} /> Back
        </button>
        <div style={{ width: 40, height: 40, borderRadius: 'var(--r)', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <FileText size={18} color="var(--primary)" />
        </div>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--t1)', lineHeight: 1.2 }}>New Purchase Order</h1>
          <p style={{ fontSize: 12, color: 'var(--t3)', marginTop: 1 }}>
            {step === 1 && 'Choose project, vendor and category'}
            {step === 2 && `${selProject?.name || ''} · ${selVendor?.companyName || ''} · ${selCategory?.label || ''}`}
            {step === 3 && `${form.items.filter(i => i.name).length} items · Total: ${fmt(totalAmount)}`}
          </p>
        </div>
      </div>

      {/* ── Step progress ───────────────────────────────────────────── */}
      <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '18px 28px', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {STEPS.map((s, i) => (
            <React.Fragment key={s.num}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: i < STEPS.length - 1 ? 'none' : 1 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: 14, flexShrink: 0,
                  background: step > s.num ? 'var(--success)' : step === s.num ? 'var(--primary)' : 'var(--bg)',
                  color: step >= s.num ? '#fff' : 'var(--t4)',
                  border: step < s.num ? '2px solid var(--border)' : 'none',
                  boxShadow: step === s.num ? '0 0 0 4px var(--primary-light)' : 'none',
                  transition: 'all .2s',
                }}>
                  {step > s.num ? <Check size={16} /> : s.num}
                </div>
                <div style={{ display: i === STEPS.length - 1 ? 'block' : 'block' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: step === s.num ? 'var(--primary)' : step > s.num ? 'var(--success)' : 'var(--t3)' }}>{s.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--t4)', marginTop: 1 }}>{s.desc}</div>
                </div>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ flex: 1, height: 2, background: step > s.num ? 'var(--success)' : 'var(--border)', margin: '0 16px', borderRadius: 2, transition: 'background .3s' }} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ── Content Card ────────────────────────────────────────────── */}
      <div style={{ background: 'var(--white)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)', overflow: 'hidden' }}>

        {/* ══ STEP 1 ══ */}
        {step === 1 && (
          <div>
            <div style={{ padding: '16px 28px', borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--t1)' }}>Select Project, Vendor & Category</div>
              <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 2 }}>Search and choose the project this PO is for</div>
            </div>

            <div style={{ padding: 28 }}>
              {/* Project + Vendor */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--t2)', marginBottom: 8 }}>
                    Project <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  <SearchSelect
                    value={form.project}
                    onChange={v => set('project', v)}
                    options={projects}
                    placeholder="Search project..."
                    getKey={p => p._id}
                    getLabel={p => p.name}
                    renderItem={p => (
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 1 }}>{p.type} · {p.status?.replace(/_/g,' ')}</div>
                      </div>
                    )}
                  />
                  {selProject && (
                    <div style={{ marginTop: 8, padding: '8px 12px', background: 'var(--bg)', borderRadius: 'var(--r)', fontSize: 12, color: 'var(--t3)', border: '1px solid var(--border-light)' }}>
                      📍 {selProject.address} · {selProject.completion}% complete
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--t2)', marginBottom: 8 }}>
                    Vendor <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  <SearchSelect
                    value={form.vendor}
                    onChange={v => set('vendor', v)}
                    options={vendors}
                    placeholder="Search vendor..."
                    getKey={v => v._id}
                    getLabel={v => `${v.companyName} — ${v.contactPerson}`}
                    renderItem={v => (
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{v.companyName}</div>
                        <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 1 }}>{v.contactPerson}{v.phone ? ' · ' + v.phone : ''}</div>
                      </div>
                    )}
                  />
                  {selVendor && (
                    <div style={{ marginTop: 8, padding: '8px 12px', background: 'var(--bg)', borderRadius: 'var(--r)', fontSize: 12, color: 'var(--t3)', border: '1px solid var(--border-light)' }}>
                      📞 {selVendor.phone || '—'} · GST: {selVendor.gstNumber || 'N/A'}
                    </div>
                  )}
                </div>
              </div>

              {/* Category */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--t2)', marginBottom: 12 }}>
                  Category <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
                  {CATEGORIES.map(cat => {
                    const Icon = cat.icon;
                    const active = form.category === cat.value;
                    return (
                      <button key={cat.value} onClick={() => set('category', cat.value)}
                        style={{
                          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                          padding: '16px 10px', border: `2px solid ${active ? cat.color : cat.border}`,
                          borderRadius: 'var(--r-lg)', background: active ? cat.bg : 'var(--white)',
                          cursor: 'pointer', transition: 'all .15s',
                          boxShadow: active ? `0 0 0 3px ${cat.bg}` : 'none',
                        }}>
                        <div style={{ width: 36, height: 36, borderRadius: 'var(--r)', background: active ? cat.bg : 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${cat.border}` }}>
                          <Icon size={16} color={active ? cat.color : 'var(--t3)'} />
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: 12, fontWeight: active ? 700 : 600, color: active ? cat.color : 'var(--t2)' }}>{cat.label}</div>
                          <div style={{ fontSize: 10, color: 'var(--t4)', marginTop: 2, lineHeight: 1.3 }}>{cat.sub}</div>
                        </div>
                        {active && (
                          <div style={{ width: 18, height: 18, borderRadius: '50%', background: cat.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Check size={10} color="#fff" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══ STEP 2 ══ */}
        {step === 2 && (
          <div>
            <div style={{ padding: '16px 28px', borderBottom: '1px solid var(--border)', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--t1)' }}>Line Items</div>
                <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 2 }}>Add materials, quantities and rates</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <span style={{ padding: '4px 10px', background: selCategory?.bg, color: selCategory?.color, borderRadius: 'var(--r-full)', fontSize: 12, fontWeight: 600, border: `1px solid ${selCategory?.border}` }}>
                  {selCategory?.label}
                </span>
                <span style={{ padding: '4px 10px', background: 'var(--bg)', color: 'var(--t2)', borderRadius: 'var(--r-full)', fontSize: 12, border: '1px solid var(--border)' }}>
                  {selVendor?.companyName}
                </span>
              </div>
            </div>

            <div style={{ padding: 28 }}>
              <POLineItems items={form.items} onChange={items => set('items', items)} />

              {/* Tax + totals */}
              <div style={{ marginTop: 20, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--t2)', whiteSpace: 'nowrap' }}>GST / Tax %</label>
                  <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 'var(--r)', overflow: 'hidden' }}>
                    <input type="number" min="0" max="100" step="0.5" value={form.taxPct} onChange={e => set('taxPct', e.target.value)}
                      style={{ width: 80, padding: '8px 10px', border: 'none', fontSize: 13, textAlign: 'right', outline: 'none', background: 'var(--white)', color: 'var(--t1)' }} />
                    <span style={{ padding: '8px 12px', background: 'var(--bg)', fontSize: 13, color: 'var(--t3)', fontWeight: 600, borderLeft: '1px solid var(--border)' }}>%</span>
                  </div>
                </div>

                <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '14px 20px', minWidth: 220 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                    <span style={{ color: 'var(--t3)' }}>Subtotal</span>
                    <span style={{ fontWeight: 600 }}>{fmt(subtotal)}</span>
                  </div>
                  {taxPct > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                      <span style={{ color: 'var(--t3)' }}>GST ({taxPct}%)</span>
                      <span style={{ fontWeight: 600 }}>{fmt(taxAmount)}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 800, color: 'var(--t1)', paddingTop: 8, borderTop: '2px solid var(--border)' }}>
                    <span>Total</span>
                    <span style={{ color: 'var(--primary)' }}>{fmt(totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══ STEP 3 ══ */}
        {step === 3 && (
          <div>
            <div style={{ padding: '16px 28px', borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--t1)' }}>Review & Confirm</div>
              <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 2 }}>Add notes and create the purchase order</div>
            </div>

            <div style={{ padding: 28, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
              {/* Left: Notes */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--t2)', marginBottom: 8 }}>Notes <span style={{ fontWeight: 400, color: 'var(--t4)' }}>(optional)</span></label>
                <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={5}
                  placeholder="Payment terms, delivery instructions, special conditions..."
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 'var(--r)', fontSize: 13, resize: 'vertical', fontFamily: 'inherit', color: 'var(--t1)', background: 'var(--white)', lineHeight: 1.6 }} />
              </div>

              {/* Right: Summary */}
              <div style={{ background: 'var(--bg)', borderRadius: 'var(--r-lg)', padding: 20, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 14 }}>Order Summary</div>
                {[
                  { label: 'Project',   value: selProject?.name || form.project,   mono: false },
                  { label: 'Vendor',    value: selVendor?.companyName || form.vendor, mono: false },
                  { label: 'Category', value: selCategory?.label || form.category, mono: false },
                  { label: 'Items',    value: `${form.items.filter(i => i.name).length} line item(s)`, mono: false },
                  null,
                  { label: 'Subtotal', value: fmt(subtotal), mono: true },
                  ...(taxPct > 0 ? [{ label: `GST (${taxPct}%)`, value: fmt(taxAmount), mono: true }] : []),
                  { label: 'Grand Total', value: fmt(totalAmount), mono: true, big: true },
                ].map((row, i) => row === null ? (
                  <div key={i} style={{ height: 1, background: 'var(--border)', margin: '10px 0' }} />
                ) : (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: row.big ? 0 : 8 }}>
                    <span style={{ fontSize: 12, color: 'var(--t3)' }}>{row.label}</span>
                    <span style={{ fontSize: row.big ? 16 : 13, fontWeight: row.big ? 800 : 600, color: row.big ? 'var(--primary)' : 'var(--t1)', fontFamily: row.mono ? 'var(--font-mono, monospace)' : 'inherit' }}>
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Nav buttons ─────────────────────────────────────────── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 28px', borderTop: '1px solid var(--border)', background: 'var(--bg)' }}>
          <button
            onClick={() => step > 1 ? setStep(s => s - 1) : navigate('/purchase-orders')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', border: '1px solid var(--border)', borderRadius: 'var(--r)', background: 'var(--white)', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--t2)' }}>
            <ArrowLeft size={14} /> {step === 1 ? 'Cancel' : 'Back'}
          </button>

          {step < 3 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={step === 1 ? !canNext1 : !canNext2}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '10px 24px',
                border: 'none', borderRadius: 'var(--r)', cursor: 'pointer', fontSize: 13, fontWeight: 700,
                background: (step === 1 ? !canNext1 : !canNext2) ? 'var(--border)' : 'var(--primary)',
                color: '#fff', transition: 'background .15s',
              }}>
              Next <ArrowRight size={14} />
            </button>
          ) : (
            <button
              onClick={submit}
              disabled={submitting}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 24px', border: 'none', borderRadius: 'var(--r)', background: 'var(--success)', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
              {submitting ? 'Creating…' : <><Check size={14} /> Create Purchase Order</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
