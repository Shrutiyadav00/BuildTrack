import React, { useEffect, useState } from 'react';
import { Users2, UserPlus, Mail, Phone, Shield, ToggleLeft, ToggleRight, Trash2, Edit2, X, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const ROLE_META = {
  engineer:   { label: 'Engineer',   bg: 'var(--info-bg)',     color: 'var(--info)'    },
  supervisor: { label: 'Supervisor', bg: 'var(--success-bg)',  color: 'var(--success)' },
  manager:    { label: 'Manager',    bg: 'var(--primary-light)',color: 'var(--primary)' },
  worker:     { label: 'Worker',     bg: 'var(--warning-bg)',  color: 'var(--warning)' },
  client:     { label: 'Client',     bg: 'var(--purple-bg)',   color: 'var(--purple)'  },
};

const EMPTY_FORM = { name:'', email:'', phone:'', role:'engineer', clientProjectId:'', tempPassword:'' };

export default function Team() {
  const [users, setUsers]       = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(false);      // invite modal
  const [editUser, setEditUser] = useState(null);       // edit modal
  const [form, setForm]         = useState(EMPTY_FORM);
  const [saving, setSaving]     = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [createdPass, setCreatedPass] = useState(null); // shown after invite

  const fetch = async () => {
    try {
      setLoading(true);
      const [uRes, pRes] = await Promise.all([
        api.get('/users'),
        api.get('/projects'),
      ]);
      setUsers(uRes.data.data);
      setProjects(pRes.data.data);
    } catch { toast.error('Failed to load team'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const openInvite = () => { setForm(EMPTY_FORM); setCreatedPass(null); setModal(true); };
  const closeModal = () => { setModal(false); setEditUser(null); setCreatedPass(null); };

  const handleInvite = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await api.post('/users/invite', form);
      setCreatedPass(res.data.tempPassword);
      await fetch();
      toast.success(`${form.name} invited successfully`);
      setForm(EMPTY_FORM);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invite failed');
    } finally { setSaving(false); }
  };

  const handleToggleActive = async (u) => {
    try {
      await api.put(`/users/${u._id}`, { isActive: !u.isActive });
      toast.success(u.isActive ? 'User deactivated' : 'User activated');
      fetch();
    } catch { toast.error('Update failed'); }
  };

  const openEdit = (u) => {
    setEditUser(u);
    setForm({ name: u.name, phone: u.phone || '', role: u.role, clientProjectId: u.clientProjectId || '', tempPassword: '' });
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
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async (u) => {
    if (!window.confirm(`Deactivate ${u.name}? They won't be able to log in.`)) return;
    try {
      await api.delete(`/users/${u._id}`);
      toast.success('User deactivated');
      fetch();
    } catch { toast.error('Failed to deactivate'); }
  };

  const roleMeta = (role) => ROLE_META[role] || { label: role, bg: 'var(--bg)', color: 'var(--t2)' };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="page-header-text">
          <h1>Team</h1>
          <p>Manage engineers, supervisors, workers and clients in your organization</p>
        </div>
        <button className="btn btn-primary" onClick={openInvite}>
          <UserPlus size={15} /> Invite Member
        </button>
      </div>

      {/* Stats row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))', gap:12, marginBottom:24 }}>
        {Object.entries(ROLE_META).map(([role, meta]) => {
          const count = users.filter(u => u.role === role).length;
          return (
            <div key={role} className="card" style={{ padding:'14px 16px', textAlign:'center' }}>
              <div style={{ fontSize:22, fontWeight:800, color:meta.color }}>{count}</div>
              <div style={{ fontSize:12, color:'var(--t3)', marginTop:2 }}>{meta.label}s</div>
            </div>
          );
        })}
      </div>

      {/* Table */}
      <div className="card">
        {loading ? (
          <div className="empty-state"><div className="empty-title">Loading...</div></div>
        ) : users.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><Users2 size={32} color="var(--primary)" /></div>
            <div className="empty-title">No team members yet</div>
            <div className="empty-desc">Invite engineers, supervisors, workers, or clients to get started.</div>
            <button className="btn btn-primary" style={{marginTop:12}} onClick={openInvite}><UserPlus size={14}/> Invite First Member</button>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Contact</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => {
                  const rm = roleMeta(u.role);
                  return (
                    <tr key={u._id}>
                      <td>
                        <div style={{ fontWeight:600, color:'var(--t1)' }}>{u.name}</div>
                        <div style={{ fontSize:12, color:'var(--t3)' }}>{u.email}</div>
                      </td>
                      <td>
                        <span style={{ padding:'3px 10px', borderRadius:'var(--r-full)', fontSize:12, fontWeight:600, background:rm.bg, color:rm.color }}>
                          {rm.label}
                        </span>
                      </td>
                      <td>
                        <div style={{ display:'flex', flexDirection:'column', gap:3, fontSize:12, color:'var(--t3)' }}>
                          {u.email && <span style={{ display:'flex', alignItems:'center', gap:4 }}><Mail size={11}/>{u.email}</span>}
                          {u.phone && <span style={{ display:'flex', alignItems:'center', gap:4 }}><Phone size={11}/>{u.phone}</span>}
                        </div>
                      </td>
                      <td>
                        <span style={{
                          padding:'3px 10px', borderRadius:'var(--r-full)', fontSize:12, fontWeight:600,
                          background: u.isActive ? 'var(--success-bg)' : 'var(--danger-bg)',
                          color:      u.isActive ? 'var(--success)'    : 'var(--danger)',
                        }}>
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display:'flex', gap:6 }}>
                          <button className="btn" style={{padding:'5px 8px'}} title="Edit" onClick={() => openEdit(u)}>
                            <Edit2 size={13}/>
                          </button>
                          <button className="btn" style={{padding:'5px 8px'}} title={u.isActive ? 'Deactivate' : 'Activate'} onClick={() => handleToggleActive(u)}>
                            {u.isActive ? <ToggleRight size={14} color="var(--success)"/> : <ToggleLeft size={14} color="var(--t3)"/>}
                          </button>
                          <button className="btn" style={{padding:'5px 8px'}} title="Remove" onClick={() => handleDelete(u)}>
                            <Trash2 size={13} color="var(--danger)"/>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Invite Modal ── */}
      {modal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" style={{ maxWidth:480 }} onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <h3>{createdPass ? 'Member Invited!' : 'Invite Team Member'}</h3>
              <button className="modal-close" onClick={closeModal}><X size={16}/></button>
            </div>

            {createdPass ? (
              <div style={{ padding:'20px 24px' }}>
                <div style={{ background:'var(--success-bg)', border:'1px solid #a3ddd8', borderRadius:'var(--r)', padding:'16px', marginBottom:16 }}>
                  <div style={{ fontWeight:700, color:'var(--success)', marginBottom:6 }}>✓ Invitation created</div>
                  <div style={{ fontSize:13, color:'var(--t2)', marginBottom:8 }}>Share these credentials with <strong>{form.name || 'the user'}</strong>:</div>
                  <div style={{ fontSize:13, fontFamily:'monospace', background:'var(--white)', padding:'10px 12px', borderRadius:'var(--r-sm)', border:'1px solid var(--border)' }}>
                    <div>Email: <strong>{form.email}</strong></div>
                    <div style={{ marginTop:4 }}>Password: <strong>{createdPass}</strong></div>
                  </div>
                  <div style={{ fontSize:11, color:'var(--t3)', marginTop:8 }}>Ask them to change their password after first login.</div>
                </div>
                <div style={{ display:'flex', gap:10 }}>
                  <button className="btn btn-primary" onClick={() => { setCreatedPass(null); setForm(EMPTY_FORM); }}>Invite Another</button>
                  <button className="btn" onClick={closeModal}>Done</button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleInvite} style={{ padding:'20px 24px' }}>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input className="form-input" required value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Ramesh Kumar"/>
                </div>
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input className="form-input" type="email" required value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} placeholder="engineer@example.com"/>
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="form-input" value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} placeholder="+91 98765 43210"/>
                </div>
                <div className="form-group">
                  <label className="form-label">Role *</label>
                  <select className="form-input" value={form.role} onChange={e=>setForm(f=>({...f,role:e.target.value}))}>
                    <option value="engineer">Engineer</option>
                    <option value="supervisor">Supervisor</option>
                    <option value="manager">Manager</option>
                    <option value="worker">Worker</option>
                    <option value="client">Client</option>
                  </select>
                </div>
                {form.role === 'client' && (
                  <div className="form-group">
                    <label className="form-label">Assign to Project *</label>
                    <select className="form-input" value={form.clientProjectId} onChange={e=>setForm(f=>({...f,clientProjectId:e.target.value}))}>
                      <option value="">-- Select Project --</option>
                      {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                    </select>
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label">Temporary Password <span style={{color:'var(--t3)',fontSize:11}}>(leave blank to auto-generate)</span></label>
                  <div style={{ position:'relative' }}>
                    <input
                      className="form-input"
                      type={showPass ? 'text' : 'password'}
                      value={form.tempPassword}
                      onChange={e=>setForm(f=>({...f,tempPassword:e.target.value}))}
                      placeholder="Min 6 characters"
                      style={{ paddingRight:36 }}
                    />
                    <button type="button" onClick={()=>setShowPass(v=>!v)} style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--t3)' }}>
                      {showPass ? <EyeOff size={15}/> : <Eye size={15}/>}
                    </button>
                  </div>
                </div>
                <div style={{ display:'flex', gap:10, marginTop:20 }}>
                  <button className="btn btn-primary" type="submit" disabled={saving} style={{ flex:1 }}>
                    {saving ? 'Inviting...' : <><UserPlus size={14}/> Send Invite</>}
                  </button>
                  <button className="btn" type="button" onClick={closeModal}>Cancel</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── Edit Modal ── */}
      {editUser && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" style={{ maxWidth:420 }} onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Member</h3>
              <button className="modal-close" onClick={closeModal}><X size={16}/></button>
            </div>
            <form onSubmit={handleEdit} style={{ padding:'20px 24px' }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/>
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-input" value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))}/>
              </div>
              <div className="form-group">
                <label className="form-label">Role</label>
                <select className="form-input" value={form.role} onChange={e=>setForm(f=>({...f,role:e.target.value}))}>
                  <option value="engineer">Engineer</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="manager">Manager</option>
                  <option value="worker">Worker</option>
                  <option value="client">Client</option>
                </select>
              </div>
              {form.role === 'client' && (
                <div className="form-group">
                  <label className="form-label">Assigned Project</label>
                  <select className="form-input" value={form.clientProjectId} onChange={e=>setForm(f=>({...f,clientProjectId:e.target.value}))}>
                    <option value="">-- Select Project --</option>
                    {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                  </select>
                </div>
              )}
              <div style={{ display:'flex', gap:10, marginTop:20 }}>
                <button className="btn btn-primary" type="submit" disabled={saving} style={{ flex:1 }}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button className="btn" type="button" onClick={closeModal}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
