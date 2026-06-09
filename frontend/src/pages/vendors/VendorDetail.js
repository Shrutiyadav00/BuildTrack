import React, { useEffect, useState } from 'react';
import {
  Building2, Phone, Mail, MapPin, ArrowLeft, CreditCard,
  Shield, Hash, Edit2, ToggleRight, ToggleLeft, FileText, User,
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import PurchaseOrders from './PurchaseOrders';

// ── Info row inside profile card ──────────────────────────────────────────────
const InfoRow = ({ icon: Icon, label, value, mono }) =>
  value ? (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
      <div style={{ color: 'var(--primary)', marginTop: 1, flexShrink: 0 }}>
        <Icon size={14} />
      </div>
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
        <div style={{ fontSize: 13, color: 'var(--t1)', marginTop: 2, fontFamily: mono ? 'monospace' : undefined }}>{value}</div>
      </div>
    </div>
  ) : null;

// ── Bank detail tile ──────────────────────────────────────────────────────────
const BankTile = ({ label, value }) =>
  value ? (
    <div style={{ background: 'var(--bg)', borderRadius: 'var(--r)', padding: '10px 14px' }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)', fontFamily: 'monospace' }}>{value}</div>
    </div>
  ) : null;

// ── Main component ────────────────────────────────────────────────────────────
export default function VendorDetail() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const [vendor, setVendor]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState('profile');

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
  if (!vendor)  return null;

  const bd = vendor.bankDetails || {};
  const hasBankDetails = bd.accountNumber || bd.bankName;

  const TABS = [
    { key: 'profile', label: 'Profile & Bank', Icon: User      },
    { key: 'orders',  label: 'Purchase Orders', Icon: FileText  },
  ];

  return (
    <div>
      {/* Back */}
      <button onClick={() => navigate('/vendors')}
        style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t3)', fontSize: 13, marginBottom: 20, padding: 0 }}>
        <ArrowLeft size={14} /> Back to Vendors
      </button>

      {/* ── Header card ── */}
      <div style={{ background: 'var(--white)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)', overflow: 'hidden', marginBottom: 6 }}>
        {/* Top colour strip */}
        <div style={{ background: 'var(--primary)', height: 4, opacity: vendor.isActive ? 1 : 0.35 }} />

        <div style={{ padding: '18px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            {/* Avatar + name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 52, height: 52, borderRadius: 'var(--r)',
                background: vendor.isActive ? 'var(--primary-light)' : 'var(--bg)',
                color: vendor.isActive ? 'var(--primary)' : 'var(--t3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, fontWeight: 800, flexShrink: 0,
              }}>
                {vendor.companyName[0].toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--t1)', lineHeight: 1.2 }}>{vendor.companyName}</div>
                <div style={{ fontSize: 13, color: 'var(--t3)', marginTop: 3 }}>{vendor.contactPerson}</div>
              </div>
            </div>

            {/* Status + action buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <span style={{
                padding: '4px 12px', borderRadius: 'var(--r-full)', fontSize: 12, fontWeight: 700,
                background: vendor.isActive ? 'var(--success-bg)' : 'var(--bg)',
                color:      vendor.isActive ? 'var(--success)'    : 'var(--t3)',
                border:     `1px solid ${vendor.isActive ? 'var(--success)' : 'var(--border)'}`,
              }}>
                {vendor.isActive ? 'Active' : 'Inactive'}
              </span>
              <button onClick={toggle}
                title={vendor.isActive ? 'Deactivate vendor' : 'Reactivate vendor'}
                style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 'var(--r)', border: '1px solid var(--border)', background: 'var(--bg)', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: 'var(--t2)' }}>
                {vendor.isActive
                  ? <><ToggleRight size={15} color="var(--success)" /> Deactivate</>
                  : <><ToggleLeft  size={15} /> Reactivate</>}
              </button>
              <button onClick={() => navigate('/vendors')}
                title="Edit vendor"
                style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 'var(--r)', border: '1px solid var(--border)', background: 'var(--bg)', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: 'var(--t2)' }}>
                <Edit2 size={13} /> Edit
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 0, borderBottom: '2px solid var(--border)', paddingBottom: 0 }}>
        {TABS.map(({ key, label, Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '10px 20px', border: 'none', background: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 700,
              color: tab === key ? 'var(--primary)' : 'var(--t3)',
              borderBottom: tab === key ? '2px solid var(--primary)' : '2px solid transparent',
              marginBottom: -2, transition: 'color 0.15s',
            }}>
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* ── Tab content ── */}
      <div style={{ background: 'var(--white)', borderRadius: '0 0 var(--r-lg) var(--r-lg)', border: '1px solid var(--border)', borderTop: 'none', padding: '24px' }}>

        {/* ── Profile & Bank tab ── */}
        {tab === 'profile' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

            {/* Contact info grid */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>Contact Information</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 18 }}>
                <InfoRow icon={Phone}  label="Phone"   value={vendor.phone} />
                <InfoRow icon={Mail}   label="Email"   value={vendor.email} />
                <InfoRow icon={MapPin} label="Address" value={vendor.address} />
                <InfoRow icon={Shield} label="GST No." value={vendor.gstNumber}    mono />
                <InfoRow icon={Hash}   label="Aadhaar" value={vendor.aadharNumber} mono />
              </div>
            </div>

            {/* Bank details */}
            {hasBankDetails ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <CreditCard size={14} color="var(--primary)" />
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Bank Details</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
                  <BankTile label="Account Holder" value={bd.accountHolderName} />
                  <BankTile label="Bank Name"      value={bd.bankName} />
                  <BankTile label="Account Number" value={bd.accountNumber} />
                  <BankTile label="IFSC Code"      value={bd.ifscCode} />
                </div>
              </div>
            ) : (
              <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--t4)', fontSize: 13 }}>
                <CreditCard size={28} style={{ opacity: 0.3, marginBottom: 8 }} />
                <div>No bank details added yet.</div>
                <div style={{ fontSize: 11, marginTop: 4 }}>Edit the vendor to add bank account information.</div>
              </div>
            )}
          </div>
        )}

        {/* ── Purchase Orders tab ── */}
        {tab === 'orders' && (
          <PurchaseOrders vendorFilter={id} showHeader={false} />
        )}
      </div>
    </div>
  );
}
