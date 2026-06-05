import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', password: '', role: 'owner' });
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
  };

  const set = (f) => (e) => setForm({ ...form, [f]: e.target.value });

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-mark">BT</div>
          <div className="auth-logo-name">BuildTrack</div>
        </div>

        <div className="auth-title">Create account</div>
        <div className="auth-subtitle">Start managing your projects today</div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" value={form.name} onChange={set('name')} required placeholder="Ahmed Khan" />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" value={form.email} onChange={set('email')} required placeholder="you@company.com" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-input" value={form.phone} onChange={set('phone')} placeholder="+92 300 0000000" />
            </div>
            <div className="form-group">
              <label className="form-label">Role</label>
              <select className="form-input" value={form.role} onChange={set('role')}>
                <option value="owner">Owner</option>
                <option value="engineer">Engineer</option>
                <option value="supervisor">Supervisor</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Company</label>
            <input className="form-input" value={form.company} onChange={set('company')} placeholder="Khan Constructions Pvt Ltd" />
          </div>
          <div className="form-group" style={{ marginBottom: 24 }}>
            <label className="form-label">Password</label>
            <input className="form-input" type="password" value={form.password} onChange={set('password')} required minLength={6} placeholder="Min. 6 characters" />
          </div>

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? 'Creating…' : <><span>Create Account</span><ArrowRight size={16} /></>}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
