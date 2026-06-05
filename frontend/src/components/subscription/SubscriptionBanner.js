import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, XCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/**
 * SubscriptionBanner
 * Shows a sticky top banner when:
 *  - Subscription is expiring in ≤ 7 days  → orange warning
 *  - Subscription is expired               → red danger
 * Only shown to admin role users.
 */
export default function SubscriptionBanner() {
  const { isAdmin, subscription, subDaysRemaining, isSubExpiringSoon, hasActiveSub } = useAuth();
  const navigate = useNavigate();

  // Only show to admin users who have a subscription loaded
  if (!isAdmin() || !subscription) return null;

  const isExpired = !hasActiveSub;
  const showBanner = isExpired || isSubExpiringSoon;
  if (!showBanner) return null;

  const bannerStyle = {
    display:         'flex',
    alignItems:      'center',
    gap:             10,
    padding:         '9px 20px',
    fontSize:        13,
    fontWeight:      500,
    backgroundColor: isExpired ? 'var(--danger-bg)' : 'var(--warning-bg)',
    borderBottom:    `1px solid ${isExpired ? '#f5c6c6' : '#fcd98a'}`,
    color:           isExpired ? 'var(--danger)' : 'var(--warning)',
  };

  const message = isExpired
    ? 'Your subscription has expired. Renew now to continue using BuildTrack.'
    : `Your subscription expires in ${subDaysRemaining} day${subDaysRemaining === 1 ? '' : 's'}. Renew to avoid interruption.`;

  return (
    <div style={bannerStyle}>
      {isExpired
        ? <XCircle size={15} style={{ flexShrink: 0 }} />
        : <AlertTriangle size={15} style={{ flexShrink: 0 }} />
      }
      <span style={{ flex: 1 }}>{message}</span>
      <button
        onClick={() => navigate('/subscription')}
        style={{
          display:      'flex',
          alignItems:   'center',
          gap:          4,
          padding:      '4px 12px',
          borderRadius: 'var(--r-sm)',
          border:       'none',
          cursor:       'pointer',
          fontSize:     12,
          fontWeight:   600,
          background:   isExpired ? 'var(--danger)' : 'var(--warning)',
          color:        '#fff',
          whiteSpace:   'nowrap',
        }}
      >
        Renew Now <ArrowRight size={12} />
      </button>
    </div>
  );
}
