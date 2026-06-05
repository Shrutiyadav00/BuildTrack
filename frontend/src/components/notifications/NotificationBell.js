import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Bell, CheckCheck, Trash2, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const TYPE_COLORS = {
  task_completed:       'var(--success)',
  phase_started:        'var(--primary)',
  payment_requested:    'var(--warning)',
  payment_received:     'var(--success)',
  po_created:           'var(--info)',
  po_paid:              'var(--success)',
  subscription_expiring:'var(--warning)',
  low_stock:            'var(--danger)',
  document_shared:      'var(--purple)',
  user_invited:         'var(--primary)',
  general:              'var(--t3)',
};

const TYPE_ICONS = {
  task_completed: '✓', phase_started: '▶', payment_requested: '₹',
  payment_received: '✓', po_created: '📋', po_paid: '💰',
  subscription_expiring: '⚠', low_stock: '📦', document_shared: '📄',
  user_invited: '👤', general: '•',
};

const fmtTime = (d) => {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return new Date(d).toLocaleDateString('en-IN', { day:'numeric', month:'short' });
};

export default function NotificationBell() {
  const [count,  setCount]  = useState(0);
  const [notifs, setNotifs] = useState([]);
  const [open,   setOpen]   = useState(false);
  const ref    = useRef(null);
  const navigate = useNavigate();

  const fetchCount = useCallback(async () => {
    try {
      const res = await api.get('/notifications/unread-count');
      setCount(res.data.count);
    } catch {}
  }, []);

  const fetchNotifs = async () => {
    try {
      const res = await api.get('/notifications?limit=10');
      setNotifs(res.data.data || []);
    } catch {}
  };

  // Poll unread count every 60 seconds
  useEffect(() => {
    fetchCount();
    const id = setInterval(fetchCount, 60000);
    return () => clearInterval(id);
  }, [fetchCount]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleOpen = () => {
    setOpen(v => {
      if (!v) fetchNotifs();
      return !v;
    });
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setCount(0);
      setNotifs(n => n.map(x => ({ ...x, isRead: true })));
    } catch {}
  };

  const markOne = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifs(n => n.map(x => x._id === id ? { ...x, isRead: true } : x));
      setCount(c => Math.max(0, c - 1));
    } catch {}
  };

  const deleteOne = async (id, e) => {
    e.stopPropagation();
    try {
      await api.delete(`/notifications/${id}`);
      setNotifs(n => n.filter(x => x._id !== id));
    } catch {}
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Bell button */}
      <button
        onClick={handleOpen}
        style={{
          position:     'relative',
          background:   open ? 'var(--primary-light)' : 'none',
          border:       'none',
          cursor:       'pointer',
          padding:      '7px',
          borderRadius: 'var(--r)',
          color:        open ? 'var(--primary)' : 'var(--t2)',
          display:      'flex',
          alignItems:   'center',
        }}
        title="Notifications"
      >
        <Bell size={18} />
        {count > 0 && (
          <span style={{
            position:   'absolute',
            top:        2,
            right:      2,
            minWidth:   16,
            height:     16,
            background: 'var(--danger)',
            color:      '#fff',
            fontSize:   10,
            fontWeight: 700,
            borderRadius: 'var(--r-full)',
            display:    'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding:    '0 3px',
            lineHeight: 1,
          }}>
            {count > 99 ? '99+' : count}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div style={{
          position:    'absolute',
          top:         '100%',
          right:       0,
          width:       320,
          maxHeight:   420,
          overflowY:   'auto',
          background:  'var(--white)',
          border:      '1px solid var(--border)',
          borderRadius:'var(--r-lg)',
          boxShadow:   'var(--shadow-md)',
          zIndex:      1000,
          marginTop:   6,
        }}>
          {/* Header */}
          <div style={{
            display:     'flex',
            alignItems:  'center',
            justifyContent: 'space-between',
            padding:     '12px 16px',
            borderBottom:'1px solid var(--border)',
            position:    'sticky',
            top:         0,
            background:  'var(--white)',
            zIndex:      1,
          }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--t1)' }}>
              Notifications {count > 0 && <span style={{ color:'var(--danger)' }}>({count})</span>}
            </span>
            <div style={{ display:'flex', gap:6 }}>
              {count > 0 && (
                <button onClick={markAllRead} title="Mark all read" style={{ background:'none', border:'none', cursor:'pointer', color:'var(--primary)', padding:4 }}>
                  <CheckCheck size={15}/>
                </button>
              )}
              <button onClick={() => { setOpen(false); navigate('/notifications'); }} title="View all" style={{ background:'none', border:'none', cursor:'pointer', color:'var(--t3)', padding:4 }}>
                <ExternalLink size={14}/>
              </button>
            </div>
          </div>

          {/* List */}
          {notifs.length === 0 ? (
            <div style={{ padding:'24px 16px', textAlign:'center', color:'var(--t3)', fontSize:13 }}>
              No notifications yet
            </div>
          ) : (
            notifs.map(n => (
              <div
                key={n._id}
                onClick={() => markOne(n._id)}
                style={{
                  padding:     '11px 16px',
                  borderBottom:'1px solid var(--border-light)',
                  background:  n.isRead ? 'transparent' : 'var(--primary-light)',
                  cursor:      'pointer',
                  display:     'flex',
                  gap:         10,
                  alignItems:  'flex-start',
                  transition:  'background var(--ease)',
                }}
              >
                {/* Type icon dot */}
                <div style={{
                  width:        28,
                  height:       28,
                  borderRadius: 'var(--r-full)',
                  background:   `${TYPE_COLORS[n.type]}20`,
                  color:        TYPE_COLORS[n.type],
                  display:      'flex',
                  alignItems:   'center',
                  justifyContent:'center',
                  fontSize:     13,
                  flexShrink:   0,
                  marginTop:    1,
                }}>
                  {TYPE_ICONS[n.type] || '•'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize:13, fontWeight: n.isRead ? 500 : 700, color:'var(--t1)', marginBottom:2 }}>
                    {n.title}
                  </div>
                  <div style={{ fontSize:12, color:'var(--t2)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                    {n.message}
                  </div>
                  <div style={{ fontSize:11, color:'var(--t4)', marginTop:3 }}>
                    {fmtTime(n.createdAt)}
                  </div>
                </div>
                <button
                  onClick={(e) => deleteOne(n._id, e)}
                  style={{ background:'none', border:'none', cursor:'pointer', color:'var(--t4)', padding:2, flexShrink:0 }}
                  title="Remove"
                >
                  <Trash2 size={12}/>
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
