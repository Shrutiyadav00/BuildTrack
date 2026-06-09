import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  CreditCard, CheckCircle, Clock, XCircle, AlertTriangle,
  Zap, Star, Shield, Crown, ArrowRight, RefreshCw,
  FolderKanban, Calendar, Users,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

// ─── Plan config ──────────────────────────────────────────────────────────────
const PLAN_CONFIG = {
  trial: {
    icon: Zap, color: '#6366f1', bg: '#eef2ff', border: '#c7d2fe',
    badge: null,
  },
  starter: {
    icon: Star, color: '#0ea5e9', bg: '#e0f2fe', border: '#7dd3fc',
    badge: null,
  },
  professional: {
    icon: Shield, color: '#7c3aed', bg: '#ede9fe', border: '#c4b5fd',
    badge: 'Most Popular',
  },
  business: {
    icon: Crown, color: '#d97706', bg: '#fef3c7', border: '#fcd34d',
    badge: 'Best Value',
  },
  // legacy
  basic:    { icon: Star,   color: '#0ea5e9', bg: '#e0f2fe', border: '#7dd3fc', badge: null },
  standard: { icon: Shield, color: '#7c3aed', bg: '#ede9fe', border: '#c4b5fd', badge: null },
  premium:  { icon: Crown,  color: '#d97706', bg: '#fef3c7', border: '#fcd34d', badge: null },
};

const planLabel = (key) => {
  const map = { trial:'Free Trial', starter:'Starter', professional:'Professional', business:'Business',
                basic:'Basic', standard:'Standard', premium:'Premium' };
  return map[key] || key;
};

// ─── Days-remaining progress bar ─────────────────────────────────────────────
function DaysBar({ days, total }) {
  const pct = total > 0 ? Math.max(0, Math.min(100, (days / total) * 100)) : 0;
  const color = pct > 40 ? '#22c55e' : pct > 15 ? '#f59e0b' : '#ef4444';
  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ height: 8, background: '#e5e7eb', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 99, transition: 'width 0.4s' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 11, color: '#6b7280' }}>
        <span style={{ fontWeight: 600, color }}>{days} days left</span>
        <span>{total} day plan</span>
      </div>
    </div>
  );
}

// ─── Stat mini-card ───────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color = 'var(--primary)' }) {
  return (
    <div style={{ background: 'var(--bg)', borderRadius: 'var(--r)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 36, height: 36, borderRadius: 'var(--r)', background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={16} color={color} />
      </div>
      <div>
        <div style={{ fontSize: 11, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 1 }}>{label}</div>
        <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--t1)' }}>{value}</div>
        {sub && <div style={{ fontSize: 11, color: 'var(--t4)', marginTop: 1 }}>{sub}</div>}
      </div>
    </div>
  );
}

// ─── Plan card ────────────────────────────────────────────────────────────────
function PlanCard({ plan, isCurrent, trialUsed, upgrading, onSelect }) {
  const cfg = PLAN_CONFIG[plan.key] || PLAN_CONFIG.starter;
  const Icon = cfg.icon;
  const isTrialDisabled = plan.key === 'trial' && (trialUsed || isCurrent);
  const disabled = isCurrent || isTrialDisabled || upgrading;

  return (
    <div style={{
      background: 'var(--white)',
      border: `2px solid ${isCurrent ? cfg.border : 'var(--border)'}`,
      borderRadius: 'var(--r-lg)',
      padding: '22px 20px',
      position: 'relative',
      boxShadow: isCurrent ? '0 4px 20px rgba(0,0,0,0.08)' : 'var(--shadow-xs)',
      display: 'flex',
      flexDirection: 'column',
      transition: 'border-color 0.2s, box-shadow 0.2s',
    }}
    onMouseEnter={e => { if (!isCurrent) e.currentTarget.style.borderColor = cfg.border; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)'; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = isCurrent ? cfg.border : 'var(--border)'; e.currentTarget.style.boxShadow = isCurrent ? '0 4px 20px rgba(0,0,0,0.08)' : 'var(--shadow-xs)'; }}
    >
      {/* Badges */}
      {isCurrent && (
        <div style={{ position: 'absolute', top: -11, left: '50%', transform: 'translateX(-50%)', background: cfg.color, color: '#fff', fontSize: 10, fontWeight: 800, padding: '3px 12px', borderRadius: 99, letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
          ✓ CURRENT PLAN
        </div>
      )}
      {!isCurrent && cfg.badge && (
        <div style={{ position: 'absolute', top: -11, left: '50%', transform: 'translateX(-50%)', background: cfg.color, color: '#fff', fontSize: 10, fontWeight: 800, padding: '3px 12px', borderRadius: 99, letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
          {cfg.badge}
        </div>
      )}

      {/* Icon + name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <div style={{ width: 40, height: 40, borderRadius: 'var(--r)', background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={18} color={cfg.color} />
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--t1)' }}>{plan.name}</div>
          <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 1 }}>{plan.duration} days</div>
        </div>
      </div>

      {/* Price */}
      <div style={{ marginBottom: 6 }}>
        {plan.price === 0 ? (
          <span style={{ fontSize: 26, fontWeight: 900, color: cfg.color }}>Free</span>
        ) : (
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ fontSize: 11, color: 'var(--t3)', marginBottom: 2 }}>₹</span>
            <span style={{ fontSize: 26, fontWeight: 900, color: 'var(--t1)' }}>{plan.price.toLocaleString()}</span>
          </div>
        )}
        <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 1 }}>{plan.description}</div>
      </div>

      {/* Project limit highlight */}
      <div style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 'var(--r)', padding: '7px 12px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
        <FolderKanban size={13} color={cfg.color} />
        <span style={{ fontSize: 12, fontWeight: 700, color: cfg.color }}>
          {plan.maxProjects === -1
            ? 'Unlimited projects'
            : plan.maxProjects != null
              ? `${plan.maxProjects} project${plan.maxProjects !== 1 ? 's' : ''}`
              : 'Projects included'}
        </span>
      </div>

      {/* Features */}
      <ul style={{ listStyle: 'none', marginBottom: 18, flex: 1 }}>
        {plan.features.map(f => (
          <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 7, fontSize: 12.5, color: 'var(--t2)', marginBottom: 6 }}>
            <CheckCircle size={12} color={cfg.color} style={{ flexShrink: 0, marginTop: 2 }} />
            {f}
          </li>
        ))}
      </ul>

      {/* CTA */}
      <button
        disabled={disabled}
        onClick={() => !disabled && onSelect(plan.key)}
        style={{
          width: '100%', padding: '10px 0', border: 'none', borderRadius: 'var(--r)',
          background: isCurrent ? cfg.bg : cfg.color,
          color: isCurrent ? cfg.color : '#fff',
          fontWeight: 700, fontSize: 13, cursor: disabled ? 'default' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          opacity: disabled && !isCurrent ? 0.5 : 1,
          transition: 'opacity 0.2s',
        }}>
        {isCurrent ? (
          <><Clock size={13} /> Active Plan</>
        ) : plan.key === 'trial' && trialUsed ? (
          'Trial Already Used'
        ) : plan.key === 'trial' ? (
          <><Zap size={13} /> Start Free Trial</>
        ) : (
          <>Upgrade Now <ArrowRight size={13} /></>
        )}
      </button>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function Subscription() {
  const { updateUser } = useAuth();
  const location = useLocation();
  const isExpiredRedirect = new URLSearchParams(location.search).get('expired') === '1';

  const [sub, setSub]           = useState(null);
  const [plans, setPlans]       = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [paymentRef, setPaymentRef] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(null);  // plan key chosen for upgrade
  const [confirmStep, setConfirmStep] = useState(false);   // show payment confirm UI

  const fetchData = async () => {
    try {
      setLoading(true);
      const calls = [api.get('/subscription/plans'), api.get('/projects').catch(() => ({ data: { data: [] } }))];
      try {
        const subRes = await api.get('/subscription');
        setSub(subRes.data.data);
      } catch {}
      const [planRes, projRes] = await Promise.all(calls);
      setPlans(planRes.data.data || []);
      setProjects(projRes.data.data || []);
    } catch (e) {
      toast.error('Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []); // eslint-disable-line

  const handleSelect = async (planKey) => {
    if (planKey === 'trial') {
      try {
        setUpgrading(true);
        const res = await api.post('/subscription/trial');
        setSub(res.data.data);
        toast.success('🎉 Free trial activated! 7 days of full access.');
        updateUser?.({ subscription: res.data.data });
        await fetchData();
      } catch (e) {
        toast.error(e.response?.data?.message || 'Could not activate trial');
      } finally { setUpgrading(false); }
      return;
    }
    setSelectedPlan(planKey);
    setConfirmStep(true);
    setPaymentRef('');
  };

  const handleConfirmUpgrade = async () => {
    try {
      setUpgrading(true);
      const res = await api.post('/subscription/upgrade', {
        plan: selectedPlan,
        paymentRef: paymentRef.trim() || undefined,
      });
      setSub(res.data.data);
      const pLabel = planLabel(selectedPlan);
      toast.success(`✅ Upgraded to ${pLabel} plan!`);
      updateUser?.({ subscription: res.data.data });
      setSelectedPlan(null);
      setConfirmStep(false);
      setPaymentRef('');
      await fetchData();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Upgrade failed');
    } finally { setUpgrading(false); }
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

  // Duration for current plan (for progress bar)
  const DURATIONS = { trial: 7, starter: 30, professional: 60, business: 90, basic: 90, standard: 180, premium: 365 };
  const planDuration = sub ? (DURATIONS[sub.plan] || 30) : 30;

  if (loading) {
    return (
      <div style={{ padding: 60, textAlign: 'center', color: 'var(--t3)' }}>
        <RefreshCw size={28} style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: 14, fontSize: 14 }}>Loading subscription…</p>
      </div>
    );
  }

  const trialUsed = plans.find(p => p.key === 'trial')?.available === false;
  const activePaidPlans = plans.filter(p => p.key !== 'trial');

  return (
    <div style={{ maxWidth: 920, margin: '0 auto', padding: '28px 20px' }}>

      {/* ── Expired alert ── */}
      {isExpiredRedirect && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--r-lg)', padding: '14px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10, color: '#dc2626' }}>
          <XCircle size={18} />
          <strong>Subscription expired.</strong>&nbsp; Choose a plan below to restore access.
        </div>
      )}

      {/* ── Page header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <div style={{ width: 44, height: 44, borderRadius: 'var(--r)', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CreditCard size={20} color="var(--primary)" />
        </div>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--t1)', lineHeight: 1 }}>Subscription</h1>
          <p style={{ color: 'var(--t3)', fontSize: 13, marginTop: 3 }}>Manage your BuildTrack plan and billing</p>
        </div>
      </div>

      {/* ── Current plan card ── */}
      {sub ? (() => {
        const cfg = PLAN_CONFIG[sub.plan] || PLAN_CONFIG.starter;
        const Icon = cfg.icon;
        const isExpired = !sub.isActive;
        const days = Math.max(0, sub.daysRemaining || 0);
        return (
          <div style={{ background: 'var(--white)', border: `1px solid ${isExpired ? '#fecaca' : cfg.border}`, borderRadius: 'var(--r-lg)', padding: '20px 24px', marginBottom: 32, boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 48, height: 48, borderRadius: 'var(--r)', background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={22} color={cfg.color} />
                </div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--t1)' }}>
                    {planLabel(sub.plan)} Plan
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 2 }}>
                    {fmtDate(sub.startDate)} → {fmtDate(sub.endDate)}
                  </div>
                </div>
              </div>
              <span style={{ padding: '5px 14px', borderRadius: 99, fontWeight: 700, fontSize: 12, background: isExpired ? '#fef2f2' : '#f0fdf4', color: isExpired ? '#dc2626' : '#16a34a', border: `1px solid ${isExpired ? '#fecaca' : '#bbf7d0'}` }}>
                {isExpired ? '✕ Expired' : '✓ Active'}
              </span>
            </div>

            {/* Days bar */}
            {!isExpired && <DaysBar days={days} total={planDuration} />}
            {isExpired && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#fef2f2', borderRadius: 'var(--r)', border: '1px solid #fecaca', color: '#dc2626', fontSize: 13 }}>
                <AlertTriangle size={14} /> Subscription expired. Please upgrade to restore access.
              </div>
            )}

            {/* Stats */}
            {(() => {
              const currentPlanMeta = plans.find(p => p.key === sub.plan);
              const maxProj = currentPlanMeta?.maxProjects;
              const projLabel = maxProj === -1 ? 'Unlimited' : maxProj != null ? String(maxProj) : '—';
              return (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginTop: 18 }}>
                  <StatCard icon={Calendar} label="Days Remaining" value={isExpired ? 'Expired' : `${days} days`} sub={`of ${planDuration}-day plan`} color={days <= 3 ? '#ef4444' : days <= 7 ? '#f59e0b' : '#22c55e'} />
                  <StatCard icon={FolderKanban} label="Projects Used" value={`${projects.length} / ${projLabel}`} sub="active projects" color="var(--primary)" />
                  <StatCard icon={Users} label="Team Members" value="Unlimited" sub="no restriction" color="#7c3aed" />
                </div>
              );
            })()}
          </div>
        );
      })() : (
        <div style={{ background: '#fef9c3', border: '1px solid #fde68a', borderRadius: 'var(--r-lg)', padding: '18px 22px', marginBottom: 28, fontSize: 14, color: '#92400e', display: 'flex', gap: 10, alignItems: 'center' }}>
          <AlertTriangle size={18} />
          No active subscription. Start your free trial or choose a plan below.
        </div>
      )}

      {/* ── Payment confirmation panel ── */}
      {confirmStep && selectedPlan && (
        <div style={{ background: 'var(--white)', border: '2px solid var(--primary)', borderRadius: 'var(--r-lg)', padding: '22px 24px', marginBottom: 28, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--t1)', marginBottom: 3 }}>
                Confirm upgrade to <span style={{ color: 'var(--primary)' }}>{planLabel(selectedPlan)}</span> plan
              </h3>
              <p style={{ color: 'var(--t3)', fontSize: 13 }}>
                {plans.find(p => p.key === selectedPlan)?.duration} days &nbsp;·&nbsp;
                ₹{(plans.find(p => p.key === selectedPlan)?.price || 0).toLocaleString()}
              </p>
            </div>
            <button onClick={() => { setConfirmStep(false); setSelectedPlan(null); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t3)', fontSize: 20, padding: 4 }}>×</button>
          </div>

          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 'var(--r)', padding: '12px 16px', marginBottom: 16, fontSize: 12.5, color: '#92400e', lineHeight: 1.6 }}>
            <strong>Payment Instructions:</strong><br />
            Transfer ₹{(plans.find(p => p.key === selectedPlan)?.price || 0).toLocaleString()} to the bank account below, then paste the UTR / transaction ID here.
            <br /><strong>Account:</strong> BuildTrack &nbsp;·&nbsp; Bank: HDFC &nbsp;·&nbsp; A/C: 1234567890 &nbsp;·&nbsp; IFSC: HDFC0001234
            &nbsp;·&nbsp; UPI: buildtrack@upi
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <input
              value={paymentRef}
              onChange={e => setPaymentRef(e.target.value)}
              placeholder="Enter UTR / transaction reference (optional for testing)"
              style={{ flex: 1, minWidth: 220, padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 'var(--r)', fontSize: 13, color: 'var(--t1)', background: 'var(--white)' }}
            />
            <button
              onClick={handleConfirmUpgrade}
              disabled={upgrading}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 20px', border: 'none', borderRadius: 'var(--r)', background: 'var(--primary)', color: '#fff', fontWeight: 700, fontSize: 13, cursor: upgrading ? 'not-allowed' : 'pointer', opacity: upgrading ? 0.7 : 1 }}>
              {upgrading ? <><RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} /> Processing…</> : <><CheckCircle size={13} /> Confirm Upgrade</>}
            </button>
          </div>
        </div>
      )}

      {/* ── Free trial card ── */}
      {!trialUsed && (() => {
        const trial = plans.find(p => p.key === 'trial');
        if (!trial) return null;
        const isCurrent = sub?.plan === 'trial' && sub?.isActive;
        return (
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--t2)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Zap size={15} color="#6366f1" /> Start Free
            </h2>
            <div style={{ maxWidth: 320 }}>
              <PlanCard plan={trial} isCurrent={isCurrent} trialUsed={trialUsed} upgrading={upgrading} onSelect={handleSelect} />
            </div>
          </div>
        );
      })()}

      {/* ── Paid plans ── */}
      <div style={{ marginBottom: 12 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--t2)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
          <CreditCard size={15} color="var(--primary)" /> Paid Plans
        </h2>
        <p style={{ fontSize: 12, color: 'var(--t3)', marginBottom: 16 }}>Choose the plan that fits your project load. Upgrade anytime.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 18, marginBottom: 32 }}>
        {activePaidPlans.map(plan => (
          <PlanCard
            key={plan.key}
            plan={plan}
            isCurrent={sub?.plan === plan.key && sub?.isActive}
            trialUsed={trialUsed}
            upgrading={upgrading}
            onSelect={handleSelect}
          />
        ))}
      </div>

      {/* ── Subscription history ── */}
      {sub?.history?.length > 0 && (
        <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: 14, color: 'var(--t1)' }}>
            Subscription History
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
                {['Plan', 'Start', 'End'].map(h => (
                  <th key={h} style={{ padding: '9px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sub.history.map((h, i) => (
                <tr key={i} style={{ borderTop: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '10px 16px', fontWeight: 600, textTransform: 'capitalize' }}>{planLabel(h.plan)}</td>
                  <td style={{ padding: '10px 16px', color: 'var(--t3)' }}>{fmtDate(h.startDate)}</td>
                  <td style={{ padding: '10px 16px', color: 'var(--t3)' }}>{fmtDate(h.endDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
