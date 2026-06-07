import React, { useEffect, useState, useCallback } from 'react';
import { Bell, CheckCheck, Trash2, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const TYPE_META = {
  task_completed:       { icon: '✓',  color: 'var(--success)',  label: 'Task' },
  phase_started:        { icon: '▶',  color: 'var(--primary)',  label: 'Phase' },
  payment_requested:    { icon: '₹',  color: 'var(--warning)',  label: 'Payment' },
  payment_received:     { icon: '✓',  color: 'var(--success)',  label: 'Payment' },
  po_created:           { icon: '📋', color: 'var(--info)',     label: 'PO' },
  po_paid:              { icon: '💰', color: 'var(--success)',  label: 'PO' },
  subscription_expiring:{ icon: '⚠',  color: 'var(--warning)',  label: 'Subscription' },
  low_stock:            { icon: '📦', color: 'var(--danger)',   label: 'Inventory' },
  document_shared:      { icon: '📄', color: 'var(--purple)',   label: 'Document' },
  user_invited:         { icon: '👤', color: 'var(--primary)',  label: 'Team' },
  general:              { icon: '•',  color: 'var(--t3)',       label: 'General' },
};

const fmtTime = (d) => {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'Just now';
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hr ago`;
  const days = Math.floor(h / 24);
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const groupByDate = (items) => {
  const groups = {};
  items.forEach(n => {
    const d = new Date(n.createdAt);
    const today = new Date();
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    let key;
    if (d.toDateString() === today.toDateString()) key = 'Today';
    else if (d.toDateString() === yesterday.toDateString()) key = 'Yesterday';
    else key = d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
    if (!groups[key]) groups[key] = [];
    groups[key].push(n);
  });
  return groups;
};

export default function Notifications() {
  const [notifs, setNotifs]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('all'); // all | unread
  const [page, setPage]       = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const PAGE_SIZE = 20;

  const load = useCallback(async (pageNum = 1, append = false) => {
    setLoading(true);
    try {
      const res = await api.get(`/notifications?limit=${PAGE_SIZE}&page=${pageNum}${filter === 'unread' ? '&unread=true' : ''}`);
      const data = res.data.data || [];
      setNotifs(prev => append ? [...prev, ...data] : data);
      setHasMore(data.length === PAGE_SIZE);
      setPage(pageNum);
    } catch {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { load(1, false); }, [load]);

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifs(n => n.map(x => ({ ...x, isRead: true })));
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark all read');
    }
  };

  const markOne = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifs(n => n.map(x => x._id === id ? { ...x, isRead: true } : x));
    } catch {}
  };

  const deleteOne = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifs(n => n.filter(x => x._id !== id));
      toast.success('Notification removed');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const unreadCount = notifs.filter(n => !n.isRead).length;
  const filtered    = filter === 'unread' ? notifs.filter(n => !n.isRead) : notifs;
  const groups      = groupByDate(filtered);

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Bell size={20} color="var(--primary)" />
          <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--t1)' }}>Notifications</h1>
          {unreadCount > 0 && (
            <span style={{ background: 'var(--danger)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 'var(--r-full)' }}>
              {unreadCount} unread
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => load(1, false)}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', border: '1px solid var(--border)', borderRadius: 'var(--r)', background: 'var(--bg)', cursor: 'pointer', fontSize: 13, color: 'var(--t2)' }}>
            <RefreshCw size={13} /> Refresh
          </button>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', border: 'none', borderRadius: 'var(--r)', background: 'var(--primary)', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
              <CheckCheck size={13} /> Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 2, background: 'var(--bg)', borderRadius: 'var(--r)', padding: 3, marginBottom: 20, width: 'fit-content' }}>
        {['all', 'unread'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: '6px 18px', borderRadius: 'var(--r-sm)', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, transition: 'all var(--ease)',
              background: filter === f ? 'var(--white)' : 'transparent',
              color:      filter === f ? 'var(--primary)' : 'var(--t3)',
              boxShadow:  filter === f ? 'var(--shadow-sm)' : 'none',
            }}>
            {f === 'all' ? 'All' : 'Unread'}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading && filtered.length === 0 ? (
        <div style={{ padding: 60, textAlign: 'center', color: 'var(--t3)', fontSize: 13 }}>Loading notifications...</div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: 60, textAlign: 'center', background: 'var(--white)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)' }}>
          <Bell size={36} color="var(--border)" style={{ marginBottom: 12 }} />
          <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--t2)', marginBottom: 4 }}>
            {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
          </div>
          <div style={{ fontSize: 13, color: 'var(--t3)' }}>
            {filter === 'unread' ? "You're all caught up!" : 'Notifications will appear here when there is activity.'}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {Object.entries(groups).map(([dateLabel, items]) => (
            <div key={dateLabel}>
              {/* Date group label */}
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8, paddingLeft: 2 }}>
                {dateLabel}
              </div>
              <div style={{ background: 'var(--white)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)', overflow: 'hidden' }}>
                {items.map((n, idx) => {
                  const meta = TYPE_META[n.type] || TYPE_META.general;
                  return (
                    <div key={n._id}
                      onClick={() => !n.isRead && markOne(n._id)}
                      style={{
                        display:     'flex',
                        alignItems:  'flex-start',
                        gap:         14,
                        padding:     '14px 18px',
                        borderBottom: idx < items.length - 1 ? '1px solid var(--border-light)' : 'none',
                        background:   n.isRead ? 'transparent' : 'var(--primary-light)',
                        cursor:       n.isRead ? 'default' : 'pointer',
                        transition:   'background var(--ease)',
                      }}>

                      {/* Icon bubble */}
                      <div style={{
                        width: 36, height: 36, borderRadius: 'var(--r-full)', flexShrink: 0,
                        background: `${meta.color}20`, color: meta.color,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, marginTop: 1,
                      }}>
                        {meta.icon}
                      </div>

                      {/* Text */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 14, fontWeight: n.isRead ? 500 : 700, color: 'var(--t1)' }}>
                            {n.title}
                          </span>
                          <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 7px', borderRadius: 'var(--r-full)', background: `${meta.color}18`, color: meta.color }}>
                            {meta.label}
                          </span>
                          {!n.isRead && (
                            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--primary)', flexShrink: 0 }} />
                          )}
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--t2)', marginBottom: 4, lineHeight: 1.4 }}>
                          {n.message}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--t4)' }}>
                          {fmtTime(n.createdAt)}
                        </div>
                      </div>

                      {/* Delete button */}
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteOne(n._id); }}
                        title="Remove"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t4)', padding: 4, flexShrink: 0, borderRadius: 'var(--r-sm)', transition: 'color var(--ease)' }}
                        onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--t4)'}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Load more */}
          {hasMore && (
            <div style={{ textAlign: 'center' }}>
              <button
                onClick={() => load(page + 1, true)}
                disabled={loading}
                style={{ padding: '9px 24px', border: '1px solid var(--border)', borderRadius: 'var(--r)', background: 'var(--bg)', cursor: 'pointer', fontSize: 13, color: 'var(--t2)', fontWeight: 600 }}>
                {loading ? 'Loading...' : 'Load more'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
