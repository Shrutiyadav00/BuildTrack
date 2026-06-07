import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, CreditCard, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/**
 * SubscriptionGate — wraps a section/page and shows a locked overlay
 * when the user's subscription is expired or missing.
 *
 * Usage:
 *   <SubscriptionGate>
 *     <SomePage />
 *   </SubscriptionGate>
 *
 * Props:
 *   children     — content to render when subscription is active
 *   fallback     — optional custom expired UI (overrides default)
 *   showBlurred  — if true, shows blurred children behind overlay (default: false)
 */
export default function SubscriptionGate({ children, fallback, showBlurred = false }) {
  const { subscription, hasActiveSub } = useAuth();
  const navigate = useNavigate();

  // Active subscription → render children normally
  if (hasActiveSub) return children;

  if (fallback) return fallback;

  return (
    <div style={{ position: 'relative', minHeight: 300 }}>
      {/* Blurred background content */}
      {showBlurred && (
        <div style={{ filter: 'blur(4px)', pointerEvents: 'none', userSelect: 'none', opacity: 0.4 }}>
          {children}
        </div>
      )}

      {/* Overlay */}
      <div style={{
        position:    showBlurred ? 'absolute' : 'relative',
        inset:       showBlurred ? 0 : undefined,
        display:     'flex',
        alignItems:  'center',
        justifyContent: 'center',
        padding:     40,
        ...(showBlurred ? {} : { minHeight: 300 }),
      }}>
        <div style={{
          background:   'var(--white)',
          border:       '2px solid var(--danger)',
          borderRadius: 'var(--r-lg)',
          padding:      '40px 48px',
          textAlign:    'center',
          maxWidth:     440,
          boxShadow:    'var(--shadow-md)',
        }}>
          <div style={{
            width:        60,
            height:       60,
            borderRadius: 'var(--r-full)',
            background:   'var(--danger-bg)',
            display:      'flex',
            alignItems:   'center',
            justifyContent: 'center',
            margin:       '0 auto 16px',
          }}>
            <Lock size={26} color="var(--danger)" />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 8 }}>
            <AlertTriangle size={16} color="var(--danger)" />
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--danger)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Subscription Expired
            </span>
          </div>

          <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--t1)', marginBottom: 10 }}>
            Feature Locked
          </h3>
          <p style={{ fontSize: 14, color: 'var(--t2)', lineHeight: 1.6, marginBottom: 28 }}>
            Your BuildTrack subscription has expired. Renew your plan to continue accessing this feature and all other premium capabilities.
          </p>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/subscription')}
              style={{
                display:      'flex',
                alignItems:   'center',
                gap:          7,
                padding:      '10px 24px',
                background:   'var(--primary)',
                color:        '#fff',
                border:       'none',
                borderRadius: 'var(--r)',
                cursor:       'pointer',
                fontSize:     14,
                fontWeight:   700,
              }}>
              <CreditCard size={15} /> Renew Subscription
            </button>
            <button
              onClick={() => navigate('/')}
              style={{
                padding:      '10px 20px',
                background:   'var(--bg)',
                color:        'var(--t2)',
                border:       '1px solid var(--border)',
                borderRadius: 'var(--r)',
                cursor:       'pointer',
                fontSize:     14,
              }}>
              Go to Dashboard
            </button>
          </div>

          {subscription?.endDate && (
            <p style={{ fontSize: 11, color: 'var(--t4)', marginTop: 20 }}>
              Expired on {new Date(subscription.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          )}
          {!subscription && (
            <p style={{ fontSize: 11, color: 'var(--t4)', marginTop: 20 }}>
              No active subscription found on your account.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
