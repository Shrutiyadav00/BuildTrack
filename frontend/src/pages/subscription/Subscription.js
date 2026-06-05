import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  CreditCard, CheckCircle, Clock, XCircle,
  Zap, Star, Shield, Crown, ArrowRight, RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const PLAN_ICONS = {
  trial:    <Zap size={20} />,
  basic:    <Star size={20} />,
  standard: <Shield size={20} />,
  premium:  <Crown size={20} />,
};

const PLAN_COLORS = {
  trial:    { bg: 'var(--info-bg)',    color: 'var(--info)',    border: '#b3d7f5' },
  basic:    { bg: 'var(--success-bg)', color: 'var(--success)', border: '#a3ddd8' },
  standard: { bg: 'var(--primary-light)', color: 'var(--primary)', border: 'var(--primary-mid)' },
  premium:  { bg: 'var(--purple-bg)',  color: 'var(--purple)',  border: '#d4b3f0' },
};

function StatusBadge({ status }) {
  const map = {
    active:   { label: 'Active',   bg: 'var(--success-bg)', color: 'var(--success)' },
    expired:  { label: 'Expired',  bg: 'var(--danger-bg)',  color: 'var(--danger)'  },
    cancelled:{ label: 'Cancelled',bg: 'var(--warning-bg)', color: 'var(--warning)' },
  };
  const s = map[status] || map.expired;
  return (
    <span style={{
      padding: '3px 10px', borderRadius: 'var(--r-full)',
      fontSize: 12, fontWeight: 600,
      background: s.bg, color: s.color,
    }}>{s.label}</span>
  );
}

export default function Subscription() {
  const { user, updateUser } = useAuth();
  const location = useLocation();
  const isExpiredRedirect = new URLSearchParams(location.search).get('expired') === '1';

  const [sub, setSub]       = useState(null);
  const [plans, setPlans]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [paymentRef, setPaymentRef] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [subRes, planRes] = await Promise.all([
        api.get('/subscription'),
        api.get('/subscription/plans'),
      ]);
      setSub(subRes.data.data);
      setPlans(planRes.data.data);
    } catch (e) {
      // If 402 hits here — show plans anyway
      try {
        const planRes = await api.get('/subscription/plans');
        setPlans(planRes.data.data);
      } catch {}
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleUpgrade = async (planKey) => {
    if (planKey === 'trial') {
      try {
        setUpgrading(true);
        const res = await api.post('/subscription/trial');
        setSub(res.data.data);
        toast.success('Free trial activated! 30 days of full access.');
        updateUser({ subscription: res.data.data });
        await fetchData();
      } catch (e) {
        toast.error(e.response?.data?.message || 'Could not activate trial');
      } finally {
        setUpgrading(false);
      }
      return;
    }
    setSelectedPlan(planKey);
  };

  const handleConfirmUpgrade = async () => {
    if (!selectedPlan) return;
    try {
      setUpgrading(true);
      const res = await api.post('/subscription/upgrade', {
        plan: selectedPlan,
        paymentRef: paymentRef.trim() || undefined,
      });
      setSub(res.data.data);
      toast.success(`Upgraded to ${selectedPlan} plan!`);
      updateUser({ subscription: res.data.data });
      setSelectedPlan(null);
      setPaymentRef('');
      await fetchData();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Upgrade failed');
    } finally {
      setUpgrading(false);
    }
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  }) : '—';

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--t3)' }}>
        <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: 12 }}>Loading subscription...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '28px 20px' }}>

      {/* Expired redirect alert */}
      {isExpiredRedirect && (
        <div style={{
          background: 'var(--danger-bg)', border: '1px solid #f5c6c6',
          borderRadius: 'var(--r)', padding: '14px 18px', marginBottom: 24,
          display: 'flex', alignItems: 'center', gap: 10,
          color: 'var(--danger)', fontSize: 14,
        }}>
          <XCircle size={18} />
          <strong>Subscription expired.</strong>&nbsp;Please choose a plan to continue.
        </div>
      )}

      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <CreditCard size={22} color="var(--primary)" />
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--t1)' }}>Subscription</h1>
        </div>
        <p style={{ color: 'var(--t3)', fontSize: 14 }}>
          Manage your BuildTrack plan
        </p>
      </div>

      {/* Current plan card */}
      {sub && (
        <div style={{
          background: 'var(--white)', border: '1px solid var(--border)',
          borderRadius: 'var(--r-lg)', padding: '20px 24px', marginBottom: 32,
          boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 'var(--r)',
                background: PLAN_COLORS[sub.plan]?.bg || 'var(--primary-light)',
                color: PLAN_COLORS[sub.plan]?.color || 'var(--primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {PLAN_ICONS[sub.plan]}
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--t1)' }}>
                  {sub.plan.charAt(0).toUpperCase() + sub.plan.slice(1)} Plan
                </div>
                <div style={{ fontSize: 12, color: 'var(--t3)' }}>Current subscription</div>
              </div>
            </div>
            <StatusBadge status={sub.status} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16 }}>
            {[
              { label: 'Start Date',      value: fmtDate(sub.startDate) },
              { label: 'End Date',        value: fmtDate(sub.endDate)   },
              { label: 'Days Remaining',  value: sub.daysRemaining > 0 ? `${sub.daysRemaining} days` : 'Expired' },
            ].map(item => (
              <div key={item.label} style={{
                background: 'var(--bg)', borderRadius: 'var(--r)', padding: '12px 14px',
              }}>
                <div style={{ fontSize: 11, color: 'var(--t3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {item.label}
                </div>
                <div style={{
                  fontSize: 14, fontWeight: 700,
                  color: item.label === 'Days Remaining' && sub.daysRemaining <= 7
                    ? (sub.daysRemaining <= 0 ? 'var(--danger)' : 'var(--warning)')
                    : 'var(--t1)',
                }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upgrade confirmation modal */}
      {selectedPlan && (
        <div style={{
          background: 'var(--warning-bg)', border: '1px solid #fcd98a',
          borderRadius: 'var(--r-lg)', padding: '20px 24px', marginBottom: 28,
        }}>
          <h3 style={{ color: 'var(--t1)', marginBottom: 4, fontSize: 15 }}>
            Confirm upgrade to <strong>{selectedPlan}</strong> plan
          </h3>
          <p style={{ color: 'var(--t3)', fontSize: 13, marginBottom: 14 }}>
            Enter your payment reference number (UTR / transaction ID) after making payment.
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <input
              className="form-input"
              placeholder="Payment reference (optional)"
              value={paymentRef}
              onChange={e => setPaymentRef(e.target.value)}
              style={{ flex: 1, minWidth: 200 }}
            />
            <button
              className="btn btn-primary"
              onClick={handleConfirmUpgrade}
              disabled={upgrading}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              {upgrading ? 'Processing...' : <><CheckCircle size={14} /> Confirm Upgrade</>}
            </button>
            <button
              className="btn"
              onClick={() => { setSelectedPlan(null); setPaymentRef(''); }}
              style={{ color: 'var(--t3)' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Plans grid */}
      <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--t1)', marginBottom: 16 }}>
        {sub?.isActive ? 'Upgrade Plan' : 'Choose a Plan'}
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 16 }}>
        {plans.map(plan => {
          const isCurrent  = sub?.plan === plan.key && sub?.isActive;
          const isDisabled = !plan.available || isCurrent;
          const colors     = PLAN_COLORS[plan.key] || PLAN_COLORS.basic;

          return (
            <div key={plan.key} style={{
              background:    'var(--white)',
              border:        `2px solid ${isCurrent ? colors.border : 'var(--border)'}`,
              borderRadius:  'var(--r-lg)',
              padding:       '20px 18px',
              opacity:       isDisabled && !isCurrent ? 0.6 : 1,
              position:      'relative',
              boxShadow:     isCurrent ? 'var(--shadow)' : 'var(--shadow-xs)',
              transition:    'box-shadow var(--ease)',
            }}>
              {isCurrent && (
                <div style={{
                  position: 'absolute', top: -10, right: 14,
                  background: colors.color, color: '#fff',
                  fontSize: 10, fontWeight: 700, padding: '2px 8px',
                  borderRadius: 'var(--r-full)', letterSpacing: '0.05em',
                }}>CURRENT</div>
              )}

              <div style={{
                width: 38, height: 38, borderRadius: 'var(--r)',
                background: colors.bg, color: colors.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 12,
              }}>
                {PLAN_ICONS[plan.key]}
              </div>

              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--t1)', marginBottom: 2 }}>
                {plan.name}
              </div>
              <div style={{ fontSize: 12, color: 'var(--t3)', marginBottom: 10 }}>
                {plan.duration} days
              </div>

              {plan.price === 0 ? (
                <div style={{ fontSize: 18, fontWeight: 800, color: colors.color, marginBottom: 12 }}>
                  Free
                </div>
              ) : (
                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--t1)', marginBottom: 12 }}>
                  ₹{plan.price.toLocaleString()}
                </div>
              )}

              <ul style={{ listStyle: 'none', marginBottom: 16 }}>
                {plan.features.map(f => (
                  <li key={f} style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    fontSize: 12, color: 'var(--t2)', marginBottom: 5,
                  }}>
                    <CheckCircle size={12} color="var(--success)" style={{ flexShrink: 0 }} />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                className="btn btn-primary"
                disabled={isDisabled || upgrading}
                onClick={() => handleUpgrade(plan.key)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: 5, fontSize: 13,
                  opacity: isDisabled ? 0.5 : 1,
                  background: isCurrent ? colors.color : undefined,
                }}
              >
                {isCurrent ? (
                  <><Clock size={13} /> Active</>
                ) : plan.key === 'trial' && !plan.available ? (
                  'Trial Used'
                ) : (
                  <>{plan.key === 'trial' ? 'Start Free Trial' : 'Upgrade'} <ArrowRight size={13} /></>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Bank details for payment */}
      <div style={{
        marginTop: 32, background: 'var(--bg)', borderRadius: 'var(--r-lg)',
        padding: '18px 20px', border: '1px solid var(--border)',
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--t2)', marginBottom: 10 }}>
          Payment Instructions
        </div>
        <div style={{ fontSize: 13, color: 'var(--t3)', lineHeight: 1.7 }}>
          Transfer the plan amount to our bank account and enter the UTR / transaction reference
          when upgrading. Your plan will be activated within 24 hours of confirmation.
          <br />
          <strong style={{ color: 'var(--t2)' }}>Contact:</strong> support@buildtrack.app
        </div>
      </div>
    </div>
  );
}
