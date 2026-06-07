import React, { useEffect, useState } from 'react';
import {
  Building2, Phone, Mail, MapPin, ArrowLeft, CreditCard,
  Shield, Hash, Edit2, ToggleRight, ToggleLeft,
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import PurchaseOrders from './PurchaseOrders';

const InfoRow = ({ icon: Icon, label, value, mono }) => (
  value ? (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
      <div style={{ color: 'var(--primary)', marginTop: 1, flexShrink: 0 }}>
        <Icon size={14} />
      </div>
      <div>
        <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
        <div style={{ fontSize: 13, color: 'var(--t1)', marginTop: 1, fontFamily: mono ? 'monospace' : undefined }}>{value}</div>
      </div>
    </div>
  ) : null
);

export default function VendorDetail() {
  const { id }      = useParams();
  const navigate    = useNavigate();
  const [vendor, setVendor]   = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get(`/vendors/${id}`)
      .then(r => setVendor(r.data.data))
      .catch(() => navigate('/vendors'))
      .finally(() => setLoading(false));
  };
  useEffect(load, [id]);

  const toggle = async () => {
    try {
      if (vendor.isActive) {
        await api.delete(`/vendors/${id}`);
        toast.success('Vendor deactivated');
      } else {
        await api.put(`/vendors/${id}`, { isActive: true });
        toast.success('Vendor activated');
      }
      load();
    } catch { toast.error('Failed to update vendor status'); }
  };

  if (loading) return <div style={{ padding: 60, textAlign: 'center', color: 'var(--t3)' }}>Loading...</div>;
  if (!vendor) return null;

  const bd = vendor.bankDetails || {};
  const hasBankDetails = bd.accountNumber || bd.bankName;

  return (
    <div style={{ maxWidth: 900 }}>
      {/* Back */}
      <button onClick={() => navigate('/vendors')}
        style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t3)', fontSize: 13, marginBottom: 24, padding: 0 }}>
        <ArrowLeft size={14} /> Back to Vendors
      </button>

      {/* ── Header card ─────────────────────────────────────────── */}
      <div style={{
        background: 'var(--white)', borderRadius: 'var(--r-lg)',
        border: '1px solid var(--border)', marginBottom: 16, overflow: 'hidden',
      }}>
        {/* Top band */}
        <div style={{
          background: 'var(--primary)', padding: '4px 0',
          opacity: vendor.isActive ? 1 : 0.4,
        }} />

        <div style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            {/* Avatar + name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 56, height: 56, borderRadius: 'var(--r)',
                background: vendor.isActive ? 'var(--primary-light)' : 'var(--bg)',
                color: vendor.isActive ? 'var(--primary)' : 'var(--t3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, fontWeight: 800, flexShrink: 0,
              }}>
                {vendor.companyName[0].toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: 19, fontWeight: 800, color: 'var(--t1)', lineHeight: 1.2 }}>{vendor.companyName}</div>
                <div style={{ fontSize: 13, color: 'var(--t3)', marginTop: 3 }}>{vendor.contactPerson}</div>
              </div>
            </div>

            {/* Status + actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
              <span style={{
                padding: '4px 12px', borderRadius: 'var(--r-full)', fontSize: 12, fontWeight: 700,
                background: vendor.isActive ? 'var(--success-bg)' : 'var(--bg)',
                color:      vendor.isActive ? 'var(--success)'    : 'var(--t3)',
                border:     `1px solid ${vendor.isActive ? 'var(--success)' : 'var(--border)'}`,
              }}>
                {vendor.isActive ? 'Active' : 'Inactive'}
              </span>
              <button
                onClick={toggle}
                title={vendor.isActive ? 'Deactivate vendor' : 'Reactivate vendor'}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 12px', borderRadius: 'var(--r)',
                  border: '1px solid var(--border)',
                  background: 'var(--bg)', cursor: 'pointer',
                  fontSize: 12, fontWeight: 600, color: 'var(--t2)',
                }}>
                {vendor.isActive ? <ToggleRight size={15} color="var(--success)" /> : <ToggleLeft size={15} />}
                {vendor.isActive ? 'Deactivate' : 'Reactivate'}
              </button>
              <button
                onClick={() => navigate('/vendors')}
                title="Edit this vendor"
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 12px', borderRadius: 'var(--r)',
                  border: '1px solid var(--border)',
                  background: 'var(--bg)', cursor: 'pointer',
                  fontSize: 12, fontWeight: 600, color: 'var(--t2)',
                }}>
                <Edit2 size={13} /> Edit
              </button>
            </div>
          </div>

          {/* Info grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border-light)' }}>
            <InfoRow icon={Phone}    label="Phone"    value={vendor.phone} />
            <InfoRow icon={Mail}     label="Email"    value={vendor.email} />
            <InfoRow icon={MapPin}   label="Address"  value={vendor.address} />
            <InfoRow icon={Shield}   label="GST No."  value={vendor.gstNumber}    mono />
            <InfoRow icon={Hash}     label="Aadhaar"  value={vendor.aadharNumber} mono />
          </div>
        </div>
      </div>

      {/* ── Bank Details ─────────────────────────────────────────── */}
      {hasBankDetails && (
        <div style={{
          background: 'var(--white)', borderRadius: 'var(--r-lg)',
          border: '1px solid var(--border)', padding: '18px 24px', marginBottom: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <CreditCard size={15} color="var(--primary)" />
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--t1)' }}>Bank Details</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
            {[
              { label: 'Account Holder', value: bd.accountHolderName },
              { label: 'Bank Name',      value: bd.bankName },
              { label: 'Account Number', value: bd.accountNumber },
              { label: 'IFSC Code',      value: bd.ifscCode },
            ].filter(r => r.value).map(row => (
              <div key={row.label} style={{ background: 'var(--bg)', borderRadius: 'var(--r)', padding: '10px 14px' }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{row.label}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)', fontFamily: 'monospace' }}>{row.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Purchase Orders ─────────────────────────────────────── */}
      <div style={{
        background: 'var(--white)', borderRadius: 'var(--r-lg)',
        border: '1px solid var(--border)', padding: '18px 24px',
      }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--t1)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Building2 size={15} color="var(--primary)" /> Purchase Orders
        </div>
        <PurchaseOrders vendorFilter={id} showHeader={false} />
      </div>
    </div>
  );
}
