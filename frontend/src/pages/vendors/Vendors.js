import React, { useEffect, useState } from 'react';
import { Building2, Plus, Edit2, ToggleLeft, ToggleRight, Phone, Mail, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

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
  const [vendors, setVendors]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(null); // null | { mode:'add'|'edit', data }
  const [form, setForm]         = useState(EMPTY);
  const [saving, setSaving]     = useState(false);

  const load = () => {
    setLoading(true);
    api.get('/vendors').then(r => setVendors(r.data.data)).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openAdd  = () => { setForm(EMPTY); setModal({ mode: 'add' }); };
  const openEdit = (v, e) => { e.stopPropagation(); setForm({ ...EMPTY, ...v, bankDetails: { ...EMPTY.bankDetails, ...(v.bankDetails || {}) } }); setModal({ mode: 'edit', id: v._id }); };

  const setField = (field, val) => setForm(f => ({ ...f, [field]: val }));
  const setBankField = (field, val) => setForm(f => ({ ...f, bankDetails: { ...f.bankDetails, [field]: val } }));

  const save = async () => {
    if (!form.companyName || !form.contactPerson) return toast.error('Company name and contact person are required');
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
        toast.success('Vendor deactivated');
      } else {
        await api.put(`/vendors/${v._id}`, { isActive: true });
        toast.success('Vendor activated');
      }
      load();
    } catch { toast.error('Failed to update vendor'); }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--t1)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Building2 size={20} color="var(--primary)" /> Vendors
        </h1>
        <button onClick={openAdd} style={{
          display: 'flex', alignItems: 'center', gap: 6, background: 'var(--primary)', color: '#fff',
          border: 'none', borderRadius: 'var(--r)', padding: '8px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 600,
        }}>
          <Plus size={14} /> Add Vendor
        </button>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--white)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--t3)' }}>Loading vendors...</div>
        ) : vendors.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--t3)', fontSize: 13 }}>No vendors yet. Add your first vendor.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
                {['Company', 'Contact', 'Phone / Email', 'GST', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', fontSize: 11, fontWeight: 700, color: 'var(--t3)', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {vendors.map((v, i) => (
                <tr key={v._id} onClick={() => navigate(`/vendors/${v._id}`)}
                  style={{ borderBottom: i < vendors.length - 1 ? '1px solid var(--border-light)' : 'none', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--t1)' }}>{v.companyName}</div>
                    {v.address && <div style={{ fontSize: 11, color: 'var(--t3)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}><MapPin size={10} />{v.address}</div>}
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
                      color: v.isActive ? 'var(--success)' : 'var(--t3)',
                    }}>{v.isActive ? 'Active' : 'Inactive'}</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={e => openEdit(v, e)} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '4px 8px', cursor: 'pointer', fontSize: 11, color: 'var(--t2)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Edit2 size={11} /> Edit
                      </button>
                      <button onClick={e => toggle(v, e)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: v.isActive ? 'var(--success)' : 'var(--t3)', padding: 4 }}>
                        {v.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: 'var(--white)', borderRadius: 'var(--r-lg)', padding: 28, width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--t1)', marginBottom: 20 }}>
              {modal.mode === 'add' ? 'Add Vendor' : 'Edit Vendor'}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {[
                { label: 'Company Name *', field: 'companyName', span: 2 },
                { label: 'Contact Person *', field: 'contactPerson' },
                { label: 'Phone', field: 'phone' },
                { label: 'Email', field: 'email' },
                { label: 'GST Number', field: 'gstNumber' },
                { label: 'Aadhaar Number', field: 'aadharNumber' },
                { label: 'Address', field: 'address', span: 2 },
              ].map(({ label, field, span }) => (
                <div key={field} style={{ gridColumn: span ? `span ${span}` : undefined }}>
                  <label style={labelStyle}>{label}</label>
                  <input style={inputStyle} value={form[field] || ''} onChange={e => setField(field, e.target.value)} placeholder={label.replace(' *', '')} />
                </div>
              ))}
            </div>

            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--t2)', marginBottom: 12 }}>Bank Details</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {[
                  { label: 'Account Holder Name', field: 'accountHolderName' },
                  { label: 'Bank Name', field: 'bankName' },
                  { label: 'Account Number', field: 'accountNumber' },
                  { label: 'IFSC Code', field: 'ifscCode' },
                ].map(({ label, field }) => (
                  <div key={field}>
                    <label style={labelStyle}>{label}</label>
                    <input style={inputStyle} value={form.bankDetails[field] || ''} onChange={e => setBankField(field, e.target.value)} placeholder={label} />
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 24 }}>
              <button onClick={() => setModal(null)} style={{ padding: '8px 20px', border: '1px solid var(--border)', borderRadius: 'var(--r)', background: 'var(--bg)', cursor: 'pointer', fontSize: 13 }}>Cancel</button>
              <button onClick={save} disabled={saving} style={{ padding: '8px 20px', border: 'none', borderRadius: 'var(--r)', background: 'var(--primary)', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                {saving ? 'Saving...' : 'Save Vendor'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
