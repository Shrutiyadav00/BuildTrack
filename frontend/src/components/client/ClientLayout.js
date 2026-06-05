import React from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Home, Activity, CreditCard, FileText, User } from 'lucide-react';

export default function ClientLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const initials = user?.name?.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase() || 'C';

  const NAV = [
    { to:'/client',          icon:Home,       label:'Overview',   end:true },
    { to:'/client/activity', icon:Activity,   label:'Activity'         },
    { to:'/client/payments', icon:CreditCard, label:'Payments'         },
    { to:'/client/documents',icon:FileText,   label:'Documents'        },
    { to:'/client/builder',  icon:User,       label:'Builder Info'     },
  ];

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', flexDirection:'column' }}>
      {/* Top bar */}
      <header style={{
        background:'var(--white)', borderBottom:'1px solid var(--border)',
        padding:'0 24px', height:56, display:'flex', alignItems:'center',
        justifyContent:'space-between', position:'sticky', top:0, zIndex:100,
        boxShadow:'var(--shadow-xs)',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{
            width:32, height:32, borderRadius:'var(--r)',
            background:'var(--primary)', color:'#fff',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontWeight:800, fontSize:14,
          }}>BT</div>
          <div>
            <div style={{ fontWeight:800, fontSize:15, color:'var(--t1)', lineHeight:1.1 }}>BuildTrack</div>
            <div style={{ fontSize:10, color:'var(--t3)', lineHeight:1 }}>Client Portal</div>
          </div>
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <span style={{ fontSize:13, color:'var(--t2)', fontWeight:500 }}>{user?.name}</span>
          <div style={{
            width:32, height:32, borderRadius:'var(--r-full)',
            background:'var(--primary-light)', color:'var(--primary)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontWeight:700, fontSize:13,
          }}>{initials}</div>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            style={{
              display:'flex', alignItems:'center', gap:5,
              background:'none', border:'1px solid var(--border)',
              borderRadius:'var(--r-sm)', padding:'5px 10px',
              cursor:'pointer', fontSize:12, color:'var(--t2)',
            }}
          >
            <LogOut size={13}/> Logout
          </button>
        </div>
      </header>

      {/* Navigation tabs */}
      <nav style={{
        background:'var(--white)', borderBottom:'1px solid var(--border)',
        padding:'0 24px', display:'flex', gap:4, overflowX:'auto',
      }}>
        {NAV.map(({ to, icon:Icon, label, end }) => (
          <NavLink
            key={to} to={to} end={end}
            style={({ isActive }) => ({
              display:'flex', alignItems:'center', gap:6,
              padding:'12px 14px', fontSize:13, fontWeight:600,
              color:        isActive ? 'var(--primary)' : 'var(--t3)',
              borderBottom: isActive ? '2px solid var(--primary)' : '2px solid transparent',
              textDecoration:'none', whiteSpace:'nowrap',
              transition:'color var(--ease)',
            })}
          >
            <Icon size={14}/> {label}
          </NavLink>
        ))}
      </nav>

      {/* Content */}
      <main style={{ flex:1, padding:'24px 20px', maxWidth:900, width:'100%', margin:'0 auto' }}>
        {children}
      </main>
    </div>
  );
}
