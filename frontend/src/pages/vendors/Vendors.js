import React, { useEffect, useState, useMemo } from 'react';
import { Building2, Plus, Edit2, ToggleLeft, ToggleRight, Phone, Mail, MapPin, Search, X, CreditCard, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import Paginator from '../../components/Paginator';

const EMPTY = {
  companyName: '', contactPerson: '', email: '', phone: '',
  gstNumber: '', aadharNumber: '', address: '',
  bankDetails: { accountHolderName: '', bankName: '', accountNumber: '', ifscCode: '' },
};

const inputStyle = {
  width: '100%', padding: '8px 12px', border: '1px solid var(--border)',
  borderRadius: 'var(--r)', fontSize: 13, color: 'var(--t1)',
  background: 'var(--white)', boxSizing: 'border-box',
};
const labelStyle = { fontSize: 12, fontWeight: 600, color: 'var(--t2)', marginBottom: 4, display: 'block' };

export default function Vendors() {
  const navigate = useNavigate();
  const [allVendors, setAllVendors] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [modal, setModal]           = useState(null);
  const [form, setForm]             = useState(EMPTY);
  const [saving, setSaving]         = useState(false);
  const [errors, setErrors]         = useState({});
  const [search, setSearch]         = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'inactive'
  const [vendorPage, setVendorPage]         = useState(1);
  const [vendorPageSize, setVendorPageSize] = useState(10);

  const load = () => {
    setLoading(true);
    // Fetch all vendors (active + inactive)
    api.get('/vendors').then(r => setAllVendors(r.data.data || [])).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openAdd  = () => { setForm(EMPTY); setErrors({}); setModal({ mode: 'add' }); };
  const openEdit = (v, e) => {
    e.stopPropagation();
    setForm({ ...EMPTY, ...v, bankDetails: { ...EMPTY.bankDetails, ...(v.bankDetails || {}) } });
    setErrors({});
    setModal({ mode: 'edit', id: v._id });
  };

  const setField    = (field, val) => {
    setForm(f => ({ ...f, [field]: val }));
    if (errors[field]) setErrors(e => ({ ...e, [field]: '' }));
  };
  const setBankField = (field, val) => setForm(f => ({ ...f, bankDetails: { ...f.bankDetails, [field]: val } }));

  const save = async () => {
    const errs = {};
    if (!form.companyName?.trim())   errs.companyName   = 'Company name is required';
    if (!form.contactPerson?.trim()) errs.contactPerson = 'Contact person is required';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      if (modal.mode === 'add') {
        await api.post('/vendors', form);
        toast.success('Vendor added');
      } else {
        await api.put(`/vendors/${modal.id}`, form);
        toast.success('Vendor updated');
      }
      setModal(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save vendor');
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (v, e) => {
    e.stopPropagation();
    try {
      if (v.isActive) {
        await api.delete(`/vendors/${v._id}`);
        toast.success(`${v.companyName} deactivated`);
      } else {
        await api.put(`/vendors/${v._id}`, { isActive: true });
        toast.success(`${v.companyName} activated`);
      }
      load();
    } catch { toast.error('Failed to update vendor status'); }
  };

  // Client-side filtering
  const vendors = useMemo(() => {
    let list = allVendors;
    if (statusFilter === 'active')   list = list.filter(v => v.isActive);
    if (statusFilter === 'inactive') list = list.filter(v => !v.isActive);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(v =>
        v.companyName?.toLowerCase().includes(q) ||
        v.email?.toLowerCase().includes(q) ||
        v.contactPerson?.toLowerCase().includes(q) ||
        v.phone?.includes(q)
      );
    }
    return list;
  }, [allVendors, statusFilter, search]);

  // Reset to page 1 when filters change
  useEffect(() => { setVendorPage(1); }, [search, statusFilter, vendorPageSize]);

  const activeCount   = allVendors.filter(v =>  v.isActive).length;
  const inactiveCount = allVendors.filter(v => !v.isActive).length;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--t1)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Building2 size={20} color="var(--primary)" /> Vendors
          </h1>
          <p style={{ fontSize: 12, color: 'var(--t3)', marginTop: 2 }}>
            {activeCount} active · {inactiveCount} inactive
          </p>
        </div>
        <button onClick={openAdd} style={{
          display: 'flex', alignItems: 'center', gap: 6, background: 'var(--primary)', color: '#fff',
          border: 'none', borderRadius: 'var(--r)', padding: '8px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 600,
        }}>
          <Plus size={14} /> Add Vendor
        </button>
      </div>

      {/* ── Filter bar ── */}
      <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>

        {/* Search input */}
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--t4)', pointerEvents: 'none' }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search vendor name, email or phone…"
            style={{ ...inputStyle, paddingLeft: 34, paddingTop: 8, paddingBottom: 8, borderRadius: 'var(--r)', background: 'var(--bg)', border: '1px solid transparent', outline: 'none', transition: 'border-color 0.15s' }}
            onFocus={e  => e.target.style.borderColor = 'var(--primary)'}
            onBlur={e   => e.target.style.borderColor = 'transparent'}
          />
          {search && (
            <button onClick={() => setSearch('')}
              style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t4)', fontSize: 15, lineHeight: 1, padding: 2 }}>
              ×
            </button>
          )}
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 28, background: 'var(--border)', flexShrink: 0 }} />

        {/* Status pill toggles */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '0.05em', marginRight: 2 }}>Status</span>
          {[
            { key: 'all',      label: 'All',      count: allVendors.length },
            { key: 'active',   label: 'Active',   count: activeCount,   activeColor: 'var(--success)',   activeBg: 'var(--success-bg)' },
            { key: 'inactive', label: 'Inactive', count: inactiveCount, activeColor: 'var(--t3)',        activeBg: 'var(--bg)' },
          ].map(({ key, label, count, activeColor, activeBg }) => {
            const isOn = statusFilter === key;
            const color  = isOn ? (activeColor || 'var(--primary)') : 'var(--t3)';
            const bg     = isOn ? (activeBg    || 'var(--primary-light)') : 'transparent';
            const border = isOn ? `1px solid ${activeColor || 'var(--primary)'}` : '1px solid var(--border)';
            return (
              <button key={key} onClick={() => setStatusFilter(key)}
                style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 'var(--r-full)', border, background: bg, cursor: 'pointer', fontSize: 12, fontWeight: 700, color, transition: 'all 0.15s', userSelect: 'none' }}>
                {label}
                <span style={{ background: isOn ? 'rgba(0,0,0,0.08)' : 'var(--bg)', borderRadius: 20, padding: '0px 6px', fontSize: 11, fontWeight: 800 }}>{count}</span>
              </button>
            );
          })}
        </div>

        {/* Active filter indicator */}
        {(search || statusFilter !== 'all') && (
          <>
            <div style={{ width: 1, height: 28, background: 'var(--border)', flexShrink: 0 }} />
            <button onClick={() => { setSearch(''); setStatusFilter('all'); }}
              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 'var(--r-full)', border: '1px dashed var(--border)', background: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--t3)', fontWeight: 600 }}>
              × Clear filters
            </button>
          </>
        )}
      </div>

      {/* Table */}
      <div style={{ background: 'var(--white)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--t3)' }}>Loading vendors...</div>
        ) : vendors.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--t3)', fontSize: 13 }}>
            {allVendors.length === 0 ? 'No vendors yet. Add your first vendor.' : 'No vendors match your filters.'}
          </div>
        ) : (
          <>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
                  {['Company', 'Contact', 'Phone / Email', 'GST', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', fontSize: 11, fontWeight: 700, color: 'var(--t3)', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {vendors.slice((vendorPage-1)*vendorPageSize, vendorPage*vendorPageSize).map((v, i, arr) => (
                  <tr key={v._id}
                    onClick={() => navigate(`/vendors/${v._id}`)}
                    style={{
                      borderBottom: i < arr.length - 1 ? '1px solid var(--border-light)' : 'none',
                      cursor: 'pointer',
                      opacity: v.isActive ? 1 : 0.55,
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--t1)' }}>{v.companyName}</div>
                      {v.address && (
                        <div style={{ fontSize: 11, color: 'var(--t3)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                          <MapPin size={10} />{v.address}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--t2)' }}>{v.contactPerson}</td>
                    <td style={{ padding: '12px 16px' }}>
                      {v.phone && <div style={{ fontSize: 13, color: 'var(--t2)', display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={11} />{v.phone}</div>}
                      {v.email && <div style={{ fontSize: 11, color: 'var(--t3)', display: 'flex', alignItems: 'center', gap: 4 }}><Mail size={10} />{v.email}</div>}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--t3)', fontFamily: 'monospace' }}>{v.gstNumber || '—'}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        padding: '2px 10px', borderRadius: 'var(--r-full)', fontSize: 11, fontWeight: 600,
                        background: v.isActive ? 'var(--success-bg)' : 'var(--bg)',
                        color:      v.isActive ? 'var(--success)'    : 'var(--t3)',
                      }}>{v.isActive ? 'Active' : 'Inactive'}</span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={e => openEdit(v, e)}
                          title="Edit vendor details"
                          style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '4px 8px', cursor: 'pointer', fontSize: 11, color: 'var(--t2)', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Edit2 size={11} /> Edit
                        </button>
                        <button
                          onClick={e => toggle(v, e)}
                          title={v.isActive ? 'Deactivate vendor (they will still appear in records)' : 'Reactivate vendor'}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: v.isActive ? 'var(--success)' : 'var(--t4)', padding: 4, display: 'flex', alignItems: 'center' }}>
                          {v.isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Paginator
              page={vendorPage} total={vendors.length} pageSize={vendorPageSize}
              onPageChange={setVendorPage} onPageSizeChange={setVendorPageSize}
            />
          </>
        )}
      </div>

      {/* ── Add / Edit Modal ── */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
          onClick={() => setModal(null)}>
          <div style={{ background: 'var(--white)', borderRadius: 'var(--r-lg)', width: '100%', maxWidth: 620, maxHeight: '92vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.18)' }}
            onClick={e => e.stopPropagation()}>

            {/* ── Modal header ── */}
            <div style={{ borderRadius: 'var(--r-lg) var(--r-lg) 0 0', overflow: 'hidden' }}>
              {/* Colour band */}
              <div style={{ height: 4, background: 'var(--primary)' }} />
              <div style={{ padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 'var(--r)', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Building2 size={18} color="var(--primary)" />
                  </div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--t1)' }}>
                      {modal.mode === 'add' ? 'Add New Vendor' : 'Edit Vendor'}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 1 }}>
                      {modal.mode === 'add' ? 'Fill in the details to register a new vendor' : `Editing ${form.companyName || 'vendor'}`}
                    </div>
                  </div>
                </div>
                <button onClick={() => setModal(null)}
                  style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg)', border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t3)', flexShrink: 0 }}>
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* ── Form body ── */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 24 }}>

              {/* Section 1 — Basic Info */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <div style={{ width: 26, height: 26, borderRadius: 6, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <User size={13} color="var(--primary)" />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)' }}>Company & Contact</span>
                  <div style={{ flex: 1, height: 1, background: 'var(--border)', marginLeft: 4 }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  {/* Company Name — full width */}
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={labelStyle}>Company Name</label>
                    <input
                      style={{ ...inputStyle, borderColor: errors.companyName ? 'var(--danger)' : undefined }}
                      value={form.companyName || ''}
                      onChange={e => setField('companyName', e.target.value)}
                      placeholder="e.g. Sharma Constructions Pvt. Ltd."
                    />
                    {errors.companyName && <div style={{ fontSize: 11, color: 'var(--danger)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 3 }}>⚠ {errors.companyName}</div>}
                  </div>
                  <div>
                    <label style={labelStyle}>Contact Person</label>
                    <input
                      style={{ ...inputStyle, borderColor: errors.contactPerson ? 'var(--danger)' : undefined }}
                      value={form.contactPerson || ''}
                      onChange={e => setField('contactPerson', e.target.value)}
                      placeholder="Full name"
                    />
                    {errors.contactPerson && <div style={{ fontSize: 11, color: 'var(--danger)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 3 }}>⚠ {errors.contactPerson}</div>}
                  </div>
                  <div>
                    <label style={labelStyle}>Phone</label>
                    <input style={inputStyle} value={form.phone || ''} onChange={e => setField('phone', e.target.value)} placeholder="+91 98765 43210" />
                  </div>
                  <div>
                    <label style={labelStyle}>Email</label>
                    <input style={inputStyle} type="email" value={form.email || ''} onChange={e => setField('email', e.target.value)} placeholder="vendor@example.com" />
                  </div>
                  <div>
                    <label style={labelStyle}>GST Number</label>
                    <input style={{ ...inputStyle, fontFamily: 'monospace' }} value={form.gstNumber || ''} onChange={e => setField('gstNumber', e.target.value)} placeholder="07AABCM6789D4Z9" />
                  </div>
                  <div>
                    <label style={labelStyle}>Aadhaar Number</label>
                    <input style={{ ...inputStyle, fontFamily: 'monospace' }} value={form.aadharNumber || ''} onChange={e => setField('aadharNumber', e.target.value)} placeholder="XXXX XXXX XXXX" />
                  </div>
                  {/* Address — full width */}
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={labelStyle}>Address</label>
                    <input style={inputStyle} value={form.address || ''} onChange={e => setField('address', e.target.value)} placeholder="Shop / office address" />
                  </div>
                </div>
              </div>

              {/* Section 2 — Bank Details */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <div style={{ width: 26, height: 26, borderRadius: 6, background: '#eef9f5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <CreditCard size={13} color="var(--success)" />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)' }}>Bank Details</span>
                  <span style={{ fontSize: 11, color: 'var(--t4)', fontWeight: 500 }}>(optional — for payments)</span>
                  <div style={{ flex: 1, height: 1, background: 'var(--border)', marginLeft: 4 }} />
                </div>

                <div style={{ background: 'var(--bg)', borderRadius: 'var(--r)', padding: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  {[
                    { label: 'Account Holder Name', field: 'accountHolderName', placeholder: 'As per bank records' },
                    { label: 'Bank Name',           field: 'bankName',          placeholder: 'e.g. HDFC Bank'       },
                    { label: 'Account Number',      field: 'accountNumber',     placeholder: '0000000000000',        mono: true },
                    { label: 'IFSC Code',           field: 'ifscCode',          placeholder: 'HDFC0001234',          mono: true },
                  ].map(({ label, field, placeholder, mono }) => (
                    <div key={field}>
                      <label style={labelStyle}>{label}</label>
                      <input
                        style={{ ...inputStyle, background: 'var(--white)', fontFamily: mono ? 'monospace' : undefined }}
                        value={form.bankDetails[field] || ''}
                        onChange={e => setBankField(field, e.target.value)}
                        placeholder={placeholder}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Footer ── */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', background: 'var(--bg)', borderRadius: '0 0 var(--r-lg) var(--r-lg)' }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setModal(null)}
                  style={{ padding: '9px 20px', border: '1px solid var(--border)', borderRadius: 'var(--r)', background: 'var(--white)', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--t2)' }}>
                  Cancel
                </button>
                <button onClick={save} disabled={saving}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 22px', border: 'none', borderRadius: 'var(--r)', background: saving ? 'var(--t4)' : 'var(--primary)', color: '#fff', cursor: saving ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 700, transition: 'background 0.15s' }}>
                  {saving ? 'Saving…' : modal.mode === 'add' ? <><Plus size={14} /> Add Vendor</> : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
