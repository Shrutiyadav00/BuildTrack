import React, { useEffect, useState } from 'react';
import { User, Phone, Mail, Building2, CreditCard, Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';

export default function ClientBuilderProfile() {
  const [builder, setBuilder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/client/builder-profile')
      .then(r => setBuilder(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const copy = (val, label) => { navigator.clipboard.writeText(val); toast.success(`${label} copied!`); };

  if (loading) return <div style={{ padding:40, color:'var(--t3)', textAlign:'center' }}>Loading...</div>;
  if (!builder) return <div style={{ padding:40, color:'var(--t3)', textAlign:'center' }}>Builder info not available.</div>;

  const bd = builder.bankDetails;

  return (
    <div>
      <h2 style={{ fontSize:18, fontWeight:800, color:'var(--t1)', marginBottom:20, display:'flex', alignItems:'center', gap:8 }}>
        <User size={18} color="var(--primary)"/> Builder Profile
      </h2>

      {/* Profile card */}
      <div style={{ background:'var(--white)', borderRadius:'var(--r-lg)', padding:'20px 24px', border:'1px solid var(--border)', marginBottom:16, boxShadow:'var(--shadow-sm)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:16 }}>
          <div style={{ width:52, height:52, borderRadius:'var(--r)', background:'var(--primary-light)', color:'var(--primary)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, fontWeight:800 }}>
            {builder.name?.[0]?.toUpperCase() || 'B'}
          </div>
          <div>
            <div style={{ fontSize:18, fontWeight:800, color:'var(--t1)' }}>{builder.name}</div>
            {builder.company && <div style={{ fontSize:13, color:'var(--t2)' }}>{builder.company}</div>}
          </div>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {builder.phone && (
            <div style={{ display:'flex', alignItems:'center', gap:10, fontSize:14, color:'var(--t2)' }}>
              <Phone size={15} color="var(--primary)"/> {builder.phone}
            </div>
          )}
          {builder.email && (
            <div style={{ display:'flex', alignItems:'center', gap:10, fontSize:14, color:'var(--t2)' }}>
              <Mail size={15} color="var(--primary)"/> {builder.email}
            </div>
          )}
        </div>
      </div>

      {/* Bank details */}
      {bd && (bd.accountNumber || bd.upiId) ? (
        <div style={{ background:'var(--white)', borderRadius:'var(--r-lg)', padding:'20px 24px', border:'1px solid var(--border)', boxShadow:'var(--shadow-sm)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
            <CreditCard size={16} color="var(--primary)"/>
            <span style={{ fontWeight:700, fontSize:14, color:'var(--t1)' }}>Bank Details for Payment</span>
          </div>

          {[
            { label:'Account Holder', value:bd.accountHolderName },
            { label:'Bank Name',      value:bd.bankName          },
            { label:'Account Number', value:bd.accountNumber,    copy:true },
            { label:'IFSC Code',      value:bd.ifscCode,         copy:true },
            { label:'UPI ID',         value:bd.upiId,            copy:true },
          ].filter(r => r.value).map(row => (
            <div key={row.label} style={{
              display:'flex', justifyContent:'space-between', alignItems:'center',
              padding:'10px 0', borderBottom:'1px solid var(--border-light)',
            }}>
              <span style={{ fontSize:12, color:'var(--t3)', minWidth:140 }}>{row.label}</span>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontSize:14, fontWeight:600, color:'var(--t1)', fontFamily:row.copy?'monospace':'inherit' }}>{row.value}</span>
                {row.copy && (
                  <button onClick={() => copy(row.value, row.label)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--primary)', padding:2 }}>
                    <Copy size={13}/>
                  </button>
                )}
              </div>
            </div>
          ))}

          <div style={{ marginTop:14, padding:'10px 14px', background:'var(--info-bg)', borderRadius:'var(--r)', fontSize:12, color:'var(--info)' }}>
            After making payment, please share the transaction reference with your builder for confirmation.
          </div>
        </div>
      ) : (
        <div style={{ background:'var(--bg)', borderRadius:'var(--r-lg)', padding:'20px 24px', border:'1px solid var(--border)', textAlign:'center', color:'var(--t3)', fontSize:13 }}>
          Bank details not added yet. Contact your builder.
        </div>
      )}
    </div>
  );
}
