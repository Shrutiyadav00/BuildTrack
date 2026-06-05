import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: 'ahmed@buildtrack.com', password: 'password123' });
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await login(form.email, form.password);
      navigate(data.user?.role === 'worker' ? '/worker-dashboard' : '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-mark">BT</div>
          <div className="auth-logo-name">BuildTrack</div>
        </div>

        <div className="auth-title">Welcome back</div>
        <div className="auth-subtitle">Sign in to manage your construction projects</div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email address</label>
            <input className="form-input" type="email" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required placeholder="you@company.com" />
          </div>
          <div className="form-group" style={{ marginBottom: 24 }}>
            <label className="form-label">Password</label>
            <input className="form-input" type="password" value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required placeholder="••••••••" />
          </div>

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? 'Signing in…' : <><span>Sign In</span><ArrowRight size={16} /></>}
          </button>
        </form>

        <div className="auth-footer">
          No account? <Link to="/register" className="auth-link">Create one</Link>
        </div>

        <div style={{ marginTop:20, padding:'12px 14px', background:'var(--primary-light)', borderRadius:'var(--r)', border:'1px solid var(--primary-mid)' }}>
          <p style={{ fontSize:12, fontWeight:700, color:'var(--primary)', marginBottom:4 }}>Demo Credentials</p>
          <p style={{ fontSize:12, color:'var(--t2)', marginBottom:2 }}>Admin: ahmed@buildtrack.com / password123</p>
          <p style={{ fontSize:12, color:'var(--t2)' }}>Worker: ali@buildtrack.com / password123</p>
        </div>
      </div>
    </div>
  );
}
