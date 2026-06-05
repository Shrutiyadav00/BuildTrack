import React, { useEffect, useState } from 'react';
import { Building2, Phone, Mail, MapPin, ArrowLeft, CreditCard } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import PurchaseOrders from './PurchaseOrders';

export default function VendorDetail() {
  const { id }         = useParams();
  const navigate       = useNavigate();
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/vendors/${id}`)
      .then(r => setVendor(r.data.data))
      .catch(() => navigate('/vendors'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--t3)' }}>Loading...</div>;
  if (!vendor) return null;

  const bd = vendor.bankDetails || {};

  return (
    <div>
      {/* Back */}
      <button onClick={() => navigate('/vendors')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t2)', fontSize: 13, marginBottom: 20 }}>
        <ArrowLeft size={14} /> Back to Vendors
      </button>

      {/* Vendor card */}
      <div style={{ background: 'var(--white)', borderRadius: 'var(--r-lg)', padding: '20px 24px', border: '1px solid var(--border)', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 'var(--r)', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800 }}>
            {vendor.companyName[0].toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--t1)' }}>{vendor.companyName}</div>
            <div style={{ fontSize: 13, color: 'var(--t2)' }}>{vendor.contactPerson}</div>
          </div>
          <span style={{ marginLeft: 'auto', padding: '3px 12px', borderRadius: 'var(--r-full)', fontSize: 11, fontWeight: 600, background: vendor.isActive ? 'var(--success-bg)' : 'var(--bg)', color: vendor.isActive ? 'var(--success)' : 'var(--t3)' }}>
            {vendor.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
          {vendor.phone && <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--t2)' }}><Phone size={13} color="var(--primary)" />{vendor.phone}</div>}
          {vendor.email && <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--t2)' }}><Mail size={13} color="var(--primary)" />{vendor.email}</div>}
          {vendor.address && <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--t2)' }}><MapPin size={13} color="var(--primary)" />{vendor.address}</div>}
        </div>

        {(vendor.gstNumber || vendor.aadharNumber) && (
          <div style={{ display: 'flex', gap: 24, marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border-light)' }}>
            {vendor.gstNumber && <span style={{ fontSize: 12, color: 'var(--t3)' }}>GST: <strong style={{ color: 'var(--t1)', fontFamily: 'monospace' }}>{vendor.gstNumber}</strong></span>}
            {vendor.aadharNumber && <span style={{ fontSize: 12, color: 'var(--t3)' }}>Aadhaar: <strong style={{ color: 'var(--t1)', fontFamily: 'monospace' }}>{vendor.aadharNumber}</strong></span>}
          </div>
        )}
      </div>

      {/* Bank details */}
      {(bd.accountNumber || bd.bankName) && (
        <div style={{ background: 'var(--white)', borderRadius: 'var(--r-lg)', padding: '16px 20px', border: '1px solid var(--border)', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <CreditCard size={15} color="var(--primary)" />
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)' }}>Bank Details</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
            {[
              { label: 'Account Holder', value: bd.accountHolderName },
              { label: 'Bank Name',      value: bd.bankName },
              { label: 'Account No.',    value: bd.accountNumber },
              { label: 'IFSC Code',      value: bd.ifscCode },
            ].filter(r => r.value).map(row => (
              <div key={row.label}>
                <div style={{ fontSize: 10, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{row.label}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--t1)', fontFamily: 'monospace', marginTop: 2 }}>{row.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PO history */}
      <div>
        <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--t1)', marginBottom: 16 }}>Purchase Orders</h3>
        <PurchaseOrders vendorFilter={id} showHeader={false} />
      </div>
    </div>
  );
}
