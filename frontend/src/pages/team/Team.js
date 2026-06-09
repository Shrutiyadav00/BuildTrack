import React, { useEffect, useState, useMemo } from 'react';
import {
  Users2, UserPlus, Phone, ToggleLeft, ToggleRight, Trash2,
  Edit2, X, Eye, EyeOff, Search, Copy, Check, RefreshCw,
  AlertTriangle, ShieldCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const ROLE_META = {
  owner:      { label: 'Owner',      bg: '#fef3c7',           color: '#d97706' },
  admin:      { label: 'Admin',      bg: '#e0e7ff',           color: '#4338ca' },
  engineer:   { label: 'Engineer',   bg: 'var(--info-bg)',    color: 'var(--info)'    },
  supervisor: { label: 'Supervisor', bg: 'var(--success-bg)', color: 'var(--success)' },
  manager:    { label: 'Manager',    bg: 'var(--primary-light)',color:'var(--primary)' },
  worker:     { label: 'Worker',     bg: 'var(--warning-bg)', color: 'var(--warning)' },
  client:     { label: 'Client',     bg: '#f0fdf4',           color: '#16a34a'        },
};

const INVITE_ROLES = ['engineer', 'supervisor', 'manager', 'worker', 'client'];

const EMPTY_FORM = { name: '', email: '', phone: '', role: 'engineer', clientProjectId: '', tempPassword: '' };

const inputStyle = {
  width: '100%', padding: '8px 12px', border: '1px solid var(--border)',
  borderRadius: 'var(--r)', fontSize: 13, color: 'var(--t1)',
  background: 'var(--white)', boxSizing: 'border-box',
};
const labelStyle = { fontSize: 12, fontWeight: 600, color: 'var(--t2)', marginBottom: 4, display: 'block' };

// ── Avatar circle ─────────────────────────────────────────────────────────────
function Avatar({ name, size = 36 }) {
  const initials = (name || '?').split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() || '').join('');
  const COLORS = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];
  const bg = COLORS[(name?.charCodeAt(0) || 0) % COLORS.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: bg, color: '#fff', flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: Math.round(size * 0.38), fontWeight: 700,
    }}>
      {initials || '?'}
    </div>
  );
}

// ── Role badge ────────────────────────────────────────────────────────────────
function RoleBadge({ role }) {
  const m = ROLE_META[role] || { label: role, bg: 'var(--bg)', color: 'var(--t2)' };
  return (
    <span style={{ padding: '3px 10px', borderRadius: 'var(--r-full)', fontSize: 11, fontWeight: 700, background: m.bg, color: m.color, whiteSpace: 'nowrap' }}>
      {m.label}
    </span>
  );
}

// ── Password generator ────────────────────────────────────────────────────────
const genPass = () => {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#$!';
  return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

// ─── Role permissions matrix ──────────────────────────────────────────────────
const ROLE_PERMISSIONS = [
  { feature: 'Dashboard',       admin: 'Full access',          engineer: 'Limited (no finance)', worker: '✗', client: '✗' },
  { feature: 'Projects',        admin: 'Full CRUD',            engineer: 'Assigned only, no delete', worker: '✗', client: 'Own project only' },
  { feature: 'Workers',         admin: 'Full CRUD',            engineer: 'View + attendance',    worker: 'Own profile', client: '✗' },
  { feature: 'Attendance',      admin: 'Full access',          engineer: 'Mark for assigned',    worker: 'Own records', client: '✗' },
  { feature: 'Finance',         admin: 'Full access',          engineer: '✗',                    worker: '✗', client: 'Payment history' },
  { feature: 'Vendors',         admin: 'Full access',          engineer: '✗',                    worker: '✗', client: '✗' },
  { feature: 'Purchase Orders', admin: 'Full access',          engineer: '✗',                    worker: '✗', client: '✗' },
  { feature: 'Documents',       admin: 'Full access',          engineer: 'Assigned projects',    worker: '✗', client: 'Shared docs only' },
  { feature: 'Users & Roles',   admin: 'Full CRUD',            engineer: '✗',                    worker: '✗', client: '✗' },
  { feature: 'Site Diary',      admin: 'Full access',          engineer: 'Create & edit',        worker: '✗', client: '✗' },
  { feature: 'Inventory',       admin: 'Full access',          engineer: 'Full access',          worker: '✗', client: '✗' },
  { feature: 'Reports',         admin: 'Full access',          engineer: '✗',                    worker: '✗', client: '✗' },
  { feature: 'Subscription',    admin: 'Full access',          engineer: '✗',                    worker: '✗', client: '✗' },
  { feature: 'Client Portal',   admin: '✗',                    engineer: '✗',                    worker: '✗', client: 'Full client view' },
  { feature: 'Notifications',   admin: 'All types',            engineer: 'Project / task',       worker: 'Attendance', client: 'Payment types' },
];

function cellColor(val) {
  if (val === '✗') return { color: 'var(--t4)', fontStyle: 'italic', fontWeight: 400 };
  if (val.startsWith('Full')) return { color: 'var(--success)', fontWeight: 700 };
  return { color: 'var(--t2)', fontWeight: 500 };
}

// ── Main component ────────────────────────────────────────────────────────────
export default function Team() {
  const [users, setUsers]     = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(null); // 'invite' | 'edit'
  const [editUser, setEditUser] = useState(null);
  const [form, setForm]       = useState(EMPTY_FORM);
  const [saving, setSaving]   = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [createdInfo, setCreatedInfo] = useState(null);
  const [copied, setCopied]   = useState(false);
  const [teamTab, setTeamTab] = useState('users'); // 'users' | 'roles'
  const [confirmModal, setConfirmModal] = useState(null);

  // Filters
  const [search, setSearch]     = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Pagination
  const USERS_PER_PAGE = 10;
  const ROLES_PER_PAGE = 8;
  const [userPage, setUserPage] = useState(1);
  const [rolePage, setRolePage] = useState(1);

  const loadData = async () => {
    try {
      setLoading(true);
      const [uRes, pRes] = await Promise.all([api.get('/users'), api.get('/projects')]);
      setUsers(uRes.data.data || []);
      setProjects(pRes.data.data || []);
    } catch { toast.error('Failed to load team'); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  // ── Client-side filtering ──
  const filtered = useMemo(() => {
    let list = users;
    if (roleFilter)               list = list.filter(u => u.role === roleFilter);
    if (statusFilter === 'active')   list = list.filter(u => u.isActive);
    if (statusFilter === 'inactive') list = list.filter(u => !u.isActive);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(u =>
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.phone?.includes(q)
      );
    }
    return list;
  }, [users, roleFilter, statusFilter, search]);

  // Reset page when filters change
  useEffect(() => { setUserPage(1); }, [search, roleFilter, statusFilter]);

  // Pagination slices
  const totalUserPages = Math.max(1, Math.ceil(filtered.length / USERS_PER_PAGE));
  const paginatedUsers = filtered.slice((userPage - 1) * USERS_PER_PAGE, userPage * USERS_PER_PAGE);

  const totalRolePages = Math.max(1, Math.ceil(ROLE_PERMISSIONS.length / ROLES_PER_PAGE));
  const paginatedRoles = ROLE_PERMISSIONS.slice((rolePage - 1) * ROLES_PER_PAGE, rolePage * ROLES_PER_PAGE);

  // ── Helpers ──
  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const openInvite = () => {
    setForm({ ...EMPTY_FORM, tempPassword: genPass() });
    setCreatedInfo(null);
    setCopied(false);
    setShowPass(false);
    setModal('invite');
  };

  const openEdit = (u) => {
    setEditUser(u);
    setForm({ name: u.name || '', email: u.email || '', phone: u.phone || '', role: u.role, clientProjectId: u.clientProjectId || '', tempPassword: '' });
    setShowPass(false);
    setModal('edit');
  };

  const closeModal = () => { setModal(null); setEditUser(null); setCreatedInfo(null); setCopied(false); };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email) return toast.error('Name and email are required');
    try {
      setSaving(true);
      const res = await api.post('/users/invite', form);
      const password = res.data?.tempPassword || form.tempPassword;
      setCreatedInfo({ name: form.name, email: form.email, password });
      await loadData();
      toast.success(`${form.name} invited successfully`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invite failed');
    } finally { setSaving(false); }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.put(`/users/${editUser._id}`, {
        name: form.name, phone: form.phone, role: form.role,
        clientProjectId: form.role === 'client' ? form.clientProjectId : undefined,
      });
      toast.success('User updated');
      closeModal();
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setSaving(false); }
  };

  const toggleActive = async (u) => {
    try {
      await api.put(`/users/${u._id}`, { isActive: !u.isActive });
      toast.success(u.isActive ? `${u.name} deactivated` : `${u.name} activated`);
      loadData();
    } catch { toast.error('Update failed'); }
  };

  const handleDelete = (u) => {
    setConfirmModal({
      title: `Remove ${u.name}?`,
      message: `They will no longer be able to log in. This action cannot be undone.`,
      confirmLabel: 'Remove User',
      danger: true,
      onConfirm: async () => {
        try {
          await api.delete(`/users/${u._id}`);
          toast.success('User removed');
          loadData();
        } catch { toast.error('Failed'); }
      },
    });
  };

  const copyPass = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div>
      {/* ── Page Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--t1)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Users2 size={20} color="var(--primary)" /> Users &amp; Roles
          </h1>
          <p style={{ fontSize: 12, color: 'var(--t3)', marginTop: 2 }}>
            Manage team members, roles, and access permissions
          </p>
        </div>
        {teamTab === 'users' && (
          <button onClick={openInvite} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 'var(--r)', padding: '8px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
            <UserPlus size={14} /> Invite User
          </button>
        )}
      </div>

      {/* ── Tab bar ── */}
      <div style={{ display: 'flex', borderBottom: '2px solid var(--border)', marginBottom: 20, gap: 0 }}>
        {[
          { key: 'users', label: 'Users', icon: Users2 },
          { key: 'roles', label: 'Roles & Permissions', icon: ShieldCheck },
        ].map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTeamTab(key)}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '10px 20px', border: 'none', background: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: teamTab === key ? 700 : 500,
              color: teamTab === key ? 'var(--primary)' : 'var(--t3)',
              borderBottom: teamTab === key ? '2px solid var(--primary)' : '2px solid transparent',
              marginBottom: -2, transition: 'color .15s, border-color .15s',
            }}>
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* ── ROLES TAB ── */}
      {teamTab === 'roles' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <ShieldCheck size={16} color="var(--primary)" />
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--t1)' }}>Role Permissions Matrix</div>
              <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 1 }}>What each role can access across the system</div>
            </div>
          </div>

          <div style={{ background: 'var(--white)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
                <thead>
                  <tr style={{ background: 'var(--primary)', color: '#fff' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', minWidth: 150 }}>Feature</th>
                    {[
                      { label: 'Admin / Owner', bg: '#fef3c7', color: '#d97706' },
                      { label: 'Engineer / Supervisor', bg: 'var(--info-bg)', color: 'var(--info)' },
                      { label: 'Worker', bg: 'var(--warning-bg)', color: 'var(--warning)' },
                      { label: 'Client', bg: '#f0fdf4', color: '#16a34a' },
                    ].map(({ label }) => (
                      <th key={label} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', minWidth: 160 }}>{label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedRoles.map((row, i) => (
                    <tr key={row.feature}
                      style={{ borderBottom: i < paginatedRoles.length - 1 ? '1px solid var(--border-light)' : 'none', background: i % 2 === 0 ? 'var(--white)' : 'var(--bg)' }}>
                      <td style={{ padding: '10px 16px', fontWeight: 700, fontSize: 13, color: 'var(--t1)', borderRight: '1px solid var(--border-light)' }}>{row.feature}</td>
                      {[row.admin, row.engineer, row.worker, row.client].map((val, ci) => (
                        <td key={ci} style={{ padding: '10px 16px', fontSize: 12.5, ...cellColor(val) }}>{val}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Roles pagination */}
          {totalRolePages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, padding: '0 4px' }}>
              <div style={{ fontSize: 12, color: 'var(--t3)' }}>
                Showing {(rolePage - 1) * ROLES_PER_PAGE + 1}–{Math.min(rolePage * ROLES_PER_PAGE, ROLE_PERMISSIONS.length)} of {ROLE_PERMISSIONS.length} features
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <button onClick={() => setRolePage(p => Math.max(1, p - 1))} disabled={rolePage === 1}
                  style={{ padding: '5px 12px', border: '1px solid var(--border)', borderRadius: 'var(--r)', background: 'var(--white)', cursor: rolePage === 1 ? 'default' : 'pointer', color: rolePage === 1 ? 'var(--t4)' : 'var(--t1)', fontSize: 13 }}>‹ Prev</button>
                {Array.from({ length: totalRolePages }, (_, i) => i + 1).map(pg => (
                  <button key={pg} onClick={() => setRolePage(pg)}
                    style={{ padding: '5px 10px', border: '1px solid var(--border)', borderRadius: 'var(--r)', background: pg === rolePage ? 'var(--primary)' : 'var(--white)', color: pg === rolePage ? '#fff' : 'var(--t2)', fontWeight: pg === rolePage ? 700 : 400, cursor: 'pointer', fontSize: 13 }}>{pg}</button>
                ))}
                <button onClick={() => setRolePage(p => Math.min(totalRolePages, p + 1))} disabled={rolePage === totalRolePages}
                  style={{ padding: '5px 12px', border: '1px solid var(--border)', borderRadius: 'var(--r)', background: 'var(--white)', cursor: rolePage === totalRolePages ? 'default' : 'pointer', color: rolePage === totalRolePages ? 'var(--t4)' : 'var(--t1)', fontSize: 13 }}>Next ›</button>
              </div>
            </div>
          )}

          <div style={{ marginTop: 16, padding: '12px 16px', background: 'var(--info-bg)', border: '1px solid var(--info)', borderRadius: 'var(--r)', fontSize: 12, color: 'var(--info)', lineHeight: 1.6 }}>
            <strong>Note:</strong> Role assignments are made when inviting users (Users tab). Permissions listed here are enforced by the system — they cannot be customised per-user. Contact support to add custom role configurations.
          </div>
        </div>
      )}

      {/* ── USERS TAB ── */}
      {teamTab === 'users' && (<div>

      {/* ── Role stat chips (clickable filter) ── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap', alignItems: 'center' }}>
        {Object.entries(ROLE_META).map(([role, meta]) => {
          const count = users.filter(u => u.role === role).length;
          if (!count) return null;
          const active = roleFilter === role;
          return (
            <div key={role} onClick={() => setRoleFilter(r => r === role ? '' : role)}
              style={{ padding: '5px 14px', borderRadius: 'var(--r-full)', fontSize: 12, fontWeight: 700, background: meta.bg, color: meta.color, cursor: 'pointer', userSelect: 'none', border: `2px solid ${active ? meta.color : 'transparent'}`, transition: 'border-color 0.15s' }}>
              {count} {meta.label}{count !== 1 ? 's' : ''}
            </div>
          );
        })}
        {roleFilter && (
          <button onClick={() => setRoleFilter('')} style={{ padding: '5px 12px', borderRadius: 'var(--r-full)', fontSize: 12, background: 'none', border: '1px dashed var(--border)', cursor: 'pointer', color: 'var(--t4)' }}>
            × Clear
          </button>
        )}
      </div>

      {/* ── Filter bar ── */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200, maxWidth: 320 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--t4)', pointerEvents: 'none' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, email, phone…"
            style={{ ...inputStyle, paddingLeft: 30 }} />
        </div>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
          style={{ padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 'var(--r)', fontSize: 13, background: 'var(--white)', color: 'var(--t1)' }}>
          <option value="">All Roles</option>
          {Object.entries(ROLE_META).map(([r, m]) => <option key={r} value={r}>{m.label}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          style={{ padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 'var(--r)', fontSize: 13, background: 'var(--white)', color: 'var(--t1)' }}>
          <option value="all">All Status</option>
          <option value="active">Active only</option>
          <option value="inactive">Inactive only</option>
        </select>
      </div>

      {/* ── Table ── */}
      <div style={{ background: 'var(--white)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--t3)' }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 56, textAlign: 'center' }}>
            <Users2 size={36} color="var(--border)" />
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--t3)', marginTop: 12 }}>
              {users.length === 0 ? 'No team members yet' : 'No users match your filters'}
            </div>
            {users.length === 0 && (
              <button onClick={openInvite} style={{ marginTop: 14, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 20px', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 'var(--r)', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                <UserPlus size={14} /> Invite First Member
              </button>
            )}
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
                {['Member', 'Role', 'Contact', 'Assigned Project', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', fontSize: 11, fontWeight: 700, color: 'var(--t3)', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map((u, i) => {
                const proj = projects.find(p => p._id === u.clientProjectId);
                const isInactive = !u.isActive;
                return (
                  <tr key={u._id}
                    style={{ borderBottom: i < paginatedUsers.length - 1 ? '1px solid var(--border-light)' : 'none', background: isInactive ? '#fafafa' : '' }}
                    onMouseEnter={e => e.currentTarget.style.background = isInactive ? '#f3f4f6' : 'var(--bg)'}
                    onMouseLeave={e => e.currentTarget.style.background = isInactive ? '#fafafa' : ''}>

                    {/* Member */}
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ position: 'relative' }}>
                          <Avatar name={u.name} />
                          {isInactive && (
                            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(255,255,255,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <span style={{ fontSize: 14, color: 'var(--t3)' }}>✕</span>
                            </div>
                          )}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14, color: isInactive ? 'var(--t3)' : 'var(--t1)', textDecoration: isInactive ? 'line-through' : 'none' }}>{u.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 1 }}>{u.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td style={{ padding: '12px 16px' }}>
                      <RoleBadge role={u.role} />
                    </td>

                    {/* Contact */}
                    <td style={{ padding: '12px 16px' }}>
                      {u.phone
                        ? <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--t3)' }}><Phone size={10} />{u.phone}</div>
                        : <span style={{ fontSize: 12, color: 'var(--t4)' }}>—</span>
                      }
                    </td>

                    {/* Assigned Project */}
                    <td style={{ padding: '12px 16px' }}>
                      {u.role === 'client' && proj ? (
                        <span style={{ background: 'var(--bg)', padding: '3px 10px', borderRadius: 'var(--r)', border: '1px solid var(--border)', fontSize: 11, color: 'var(--t2)', fontWeight: 600 }}>{proj.name}</span>
                      ) : (
                        <span style={{ fontSize: 12, color: 'var(--t4)' }}>—</span>
                      )}
                    </td>

                    {/* Status */}
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        padding: '3px 10px', borderRadius: 'var(--r-full)', fontSize: 11, fontWeight: 700,
                        background: u.isActive ? 'var(--success-bg)' : 'var(--bg)',
                        color:      u.isActive ? 'var(--success)'    : 'var(--t3)',
                        border:     `1px solid ${u.isActive ? 'var(--success)' : 'var(--border)'}`,
                      }}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <button onClick={() => openEdit(u)} title="Edit user"
                          style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '4px 8px', cursor: 'pointer', fontSize: 11, color: 'var(--t2)', fontWeight: 600 }}>
                          <Edit2 size={11} /> Edit
                        </button>
                        <button onClick={() => toggleActive(u)} title={u.isActive ? 'Deactivate' : 'Reactivate'}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}>
                          {u.isActive
                            ? <ToggleRight size={20} color="var(--success)" />
                            : <ToggleLeft size={20} color="var(--t4)" />}
                        </button>
                        <button onClick={() => handleDelete(u)} title="Remove user"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--danger)', display: 'flex', alignItems: 'center' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Users pagination */}
      {!loading && filtered.length > 0 && totalUserPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, padding: '0 4px' }}>
          <div style={{ fontSize: 12, color: 'var(--t3)' }}>
            Showing {(userPage - 1) * USERS_PER_PAGE + 1}–{Math.min(userPage * USERS_PER_PAGE, filtered.length)} of {filtered.length} users
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={() => setUserPage(p => Math.max(1, p - 1))} disabled={userPage === 1}
              style={{ padding: '5px 12px', border: '1px solid var(--border)', borderRadius: 'var(--r)', background: 'var(--white)', cursor: userPage === 1 ? 'default' : 'pointer', color: userPage === 1 ? 'var(--t4)' : 'var(--t1)', fontSize: 13 }}>‹ Prev</button>
            {Array.from({ length: totalUserPages }, (_, i) => i + 1).map(pg => (
              <button key={pg} onClick={() => setUserPage(pg)}
                style={{ padding: '5px 10px', border: '1px solid var(--border)', borderRadius: 'var(--r)', background: pg === userPage ? 'var(--primary)' : 'var(--white)', color: pg === userPage ? '#fff' : 'var(--t2)', fontWeight: pg === userPage ? 700 : 400, cursor: 'pointer', fontSize: 13 }}>{pg}</button>
            ))}
            <button onClick={() => setUserPage(p => Math.min(totalUserPages, p + 1))} disabled={userPage === totalUserPages}
              style={{ padding: '5px 12px', border: '1px solid var(--border)', borderRadius: 'var(--r)', background: 'var(--white)', cursor: userPage === totalUserPages ? 'default' : 'pointer', color: userPage === totalUserPages ? 'var(--t4)' : 'var(--t1)', fontSize: 13 }}>Next ›</button>
          </div>
        </div>
      )}

      </div>)} {/* end users tab */}

      {/* ── Confirm Modal ── */}
      {confirmModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: 'var(--white)', borderRadius: 'var(--r-lg)', padding: '28px 32px', maxWidth: 420, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,.25)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 18 }}>
              <AlertTriangle size={22} color="var(--danger)" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--t1)', marginBottom: 6 }}>{confirmModal.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.5 }}>{confirmModal.message}</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setConfirmModal(null)}
                style={{ padding: '8px 18px', border: '1px solid var(--border)', borderRadius: 'var(--r)', background: 'var(--bg)', cursor: 'pointer', fontSize: 13 }}>
                Cancel
              </button>
              <button onClick={() => { confirmModal.onConfirm(); setConfirmModal(null); }}
                style={{ padding: '8px 18px', border: 'none', borderRadius: 'var(--r)', background: 'var(--danger)', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
                {confirmModal.confirmLabel || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Invite Modal ── */}
      {modal === 'invite' && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: 'var(--white)', borderRadius: 'var(--r-lg)', width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' }}>

            {/* Modal header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <UserPlus size={16} color="var(--primary)" />
                <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--t1)' }}>
                  {createdInfo ? 'User Invited!' : 'Invite Team Member'}
                </span>
              </div>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t3)', padding: 4, display: 'flex' }}>
                <X size={16} />
              </button>
            </div>

            {createdInfo ? (
              /* ── Success screen ── */
              <div style={{ padding: 24 }}>
                <div style={{ background: 'var(--success-bg)', border: '1px solid var(--success)', borderRadius: 'var(--r)', padding: 16, marginBottom: 20 }}>
                  <div style={{ fontWeight: 700, color: 'var(--success)', fontSize: 14, marginBottom: 8 }}>
                    ✓ {createdInfo.name} has been added to your team
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--t2)', marginBottom: 12 }}>
                    Share these login credentials securely with them:
                  </div>
                  <div style={{ background: 'var(--white)', borderRadius: 'var(--r)', padding: '14px 16px', border: '1px solid var(--border)' }}>
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>Email / Login</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)', fontFamily: 'monospace' }}>{createdInfo.email}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>Temporary Password</div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--t1)', fontFamily: 'monospace', letterSpacing: 1 }}>{createdInfo.password}</div>
                        <button onClick={() => copyPass(createdInfo.password)} style={{ display: 'flex', alignItems: 'center', gap: 4, background: copied ? 'var(--success-bg)' : 'var(--bg)', border: `1px solid ${copied ? 'var(--success)' : 'var(--border)'}`, borderRadius: 'var(--r)', padding: '5px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: copied ? 'var(--success)' : 'var(--t2)', transition: 'all 0.2s' }}>
                          {copied ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy</>}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 10, lineHeight: 1.5 }}>
                    ⚠️ Ask them to change their password after first login.
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => { setCreatedInfo(null); setForm({ ...EMPTY_FORM, tempPassword: genPass() }); setCopied(false); }}
                    style={{ flex: 1, padding: '9px 18px', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 'var(--r)', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                    Invite Another
                  </button>
                  <button onClick={closeModal}
                    style={{ padding: '9px 18px', border: '1px solid var(--border)', borderRadius: 'var(--r)', background: 'var(--bg)', cursor: 'pointer', fontSize: 13 }}>
                    Done
                  </button>
                </div>
              </div>
            ) : (
              /* ── Invite form ── */
              <form onSubmit={handleInvite} style={{ padding: 24 }}>
                {/* Name + Phone */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={labelStyle}>Full Name *</label>
                    <input style={inputStyle} required value={form.name} onChange={e => setF('name', e.target.value)} placeholder="Ramesh Kumar" />
                  </div>
                  <div>
                    <label style={labelStyle}>Phone</label>
                    <input style={inputStyle} value={form.phone} onChange={e => setF('phone', e.target.value)} placeholder="+91 98765 43210" />
                  </div>
                </div>

                {/* Email */}
                <div style={{ marginTop: 14 }}>
                  <label style={labelStyle}>Email Address *</label>
                  <input style={inputStyle} type="email" required value={form.email} onChange={e => setF('email', e.target.value)} placeholder="ramesh@example.com" />
                </div>

                {/* Role + Project */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 14 }}>
                  <div>
                    <label style={labelStyle}>Role *</label>
                    <select style={inputStyle} value={form.role} onChange={e => setF('role', e.target.value)}>
                      {INVITE_ROLES.map(r => <option key={r} value={r}>{ROLE_META[r]?.label || r}</option>)}
                    </select>
                  </div>
                  {form.role === 'client' ? (
                    <div>
                      <label style={labelStyle}>Assign to Project *</label>
                      <select style={inputStyle} value={form.clientProjectId} onChange={e => setF('clientProjectId', e.target.value)}>
                        <option value="">Select project…</option>
                        {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                      </select>
                    </div>
                  ) : <div />}
                </div>

                {/* Password */}
                <div style={{ marginTop: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <label style={labelStyle}>Temporary Password</label>
                    <button type="button" onClick={() => setF('tempPassword', genPass())}
                      style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: 'var(--primary)', fontWeight: 600 }}>
                      <RefreshCw size={11} /> Regenerate
                    </button>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input
                      style={{ ...inputStyle, fontFamily: showPass ? 'monospace' : undefined, paddingRight: 72, letterSpacing: showPass ? 1 : undefined }}
                      type={showPass ? 'text' : 'password'}
                      value={form.tempPassword}
                      onChange={e => setF('tempPassword', e.target.value)}
                      placeholder="Auto-generated"
                    />
                    <button type="button" onClick={() => setShowPass(v => !v)}
                      style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t3)', display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, fontWeight: 600 }}>
                      {showPass ? <><EyeOff size={13} /> Hide</> : <><Eye size={13} /> Show</>}
                    </button>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--t4)', marginTop: 4 }}>
                    Auto-generated — edit or regenerate as needed. User should change it after first login.
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
                  <button type="submit" disabled={saving}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px 18px', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 'var(--r)', cursor: saving ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 600, opacity: saving ? 0.7 : 1 }}>
                    <UserPlus size={14} /> {saving ? 'Inviting…' : 'Send Invite'}
                  </button>
                  <button type="button" onClick={closeModal}
                    style={{ padding: '9px 18px', border: '1px solid var(--border)', borderRadius: 'var(--r)', background: 'var(--bg)', cursor: 'pointer', fontSize: 13 }}>
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── Edit Modal ── */}
      {modal === 'edit' && editUser && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: 'var(--white)', borderRadius: 'var(--r-lg)', width: '100%', maxWidth: 440 }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Avatar name={editUser.name} size={32} />
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--t1)' }}>Edit User</div>
                  <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 1 }}>{editUser.email}</div>
                </div>
              </div>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t3)', padding: 4, display: 'flex' }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleEdit} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={labelStyle}>Full Name</label>
                <input style={inputStyle} value={form.name} onChange={e => setF('name', e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Phone</label>
                <input style={inputStyle} value={form.phone} onChange={e => setF('phone', e.target.value)} placeholder="+91 98765 43210" />
              </div>
              <div>
                <label style={labelStyle}>Role</label>
                <select style={inputStyle} value={form.role} onChange={e => setF('role', e.target.value)}>
                  {INVITE_ROLES.map(r => <option key={r} value={r}>{ROLE_META[r]?.label || r}</option>)}
                </select>
              </div>
              {form.role === 'client' && (
                <div>
                  <label style={labelStyle}>Assigned Project</label>
                  <select style={inputStyle} value={form.clientProjectId} onChange={e => setF('clientProjectId', e.target.value)}>
                    <option value="">Select project…</option>
                    {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                  </select>
                </div>
              )}
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="submit" disabled={saving}
                  style={{ flex: 1, padding: '9px 18px', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 'var(--r)', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
                <button type="button" onClick={closeModal}
                  style={{ padding: '9px 18px', border: '1px solid var(--border)', borderRadius: 'var(--r)', background: 'var(--bg)', cursor: 'pointer', fontSize: 13 }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
