import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import {
  LayoutDashboard, FolderKanban, HardHat,
  CalendarCheck, Wallet, FolderOpen, Users2, LogOut,
  Settings, X, Menu, Globe, ChevronDown,
} from 'lucide-react';

// roles: 'all' means every non-client/non-worker logged-in user can see it
// roles: array means only those specific roles
const NAV_ITEMS = [
  { to:'/',           icon:LayoutDashboard, key:'dashboard',  roles:'all' },
  { to:'/projects',   icon:FolderKanban,    key:'projects',   roles:'all' },
  { to:'/workers',    icon:HardHat,         key:'workers',    roles:['super_admin','admin','owner','engineer','supervisor','manager'] },
  { to:'/attendance', icon:CalendarCheck,   key:'attendance', roles:['super_admin','admin','owner','engineer','supervisor','manager'] },
  { to:'/finance',    icon:Wallet,          key:'finance',    roles:['super_admin','admin','owner'] },
  { to:'/documents',  icon:FolderOpen,      key:'documents',  roles:'all' },
  { to:'/team',       icon:Users2,          key:'team',       roles:['super_admin','admin','owner'] },
];

export default function Layout({ children }) {
  const { user, logout }      = useAuth();
  const { t, fmt, country, currency, language, setCountry, setCurrency, setLanguage,
          allCurrencies, allCountries, allLanguages, availableLanguages } = useSettings();
  const navigate              = useNavigate();
  const [menuOpen, setMenu]   = useState(false);
  const [settingsOpen, setSO] = useState(false);
  const settingsRef           = useRef(null);

  const initials = user?.name?.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase() || 'U';

  /* Close settings panel on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target)) setSO(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* Close mobile menu on nav */
  const handleNav = () => setMenu(false);

  return (
    <div className="app-layout">

      {/* Mobile top bar */}
      <div className="mobile-topbar">
        <button className="hamburger" onClick={() => setMenu(v => !v)} aria-label="menu">
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div className="sidebar-logo-mark" style={{ fontSize:12 }}>BT</div>
          <span style={{ fontWeight:800, fontSize:15, color:'var(--t1)' }}>BuildTrack</span>
        </div>
        <button className="hamburger" onClick={() => setSO(v => !v)} aria-label="settings">
          <Globe size={18} />
        </button>
      </div>

      {/* Sidebar overlay backdrop (mobile) */}
      {menuOpen && <div className="sidebar-backdrop" onClick={() => setMenu(false)} />}

      {/* Sidebar */}
      <aside className={`sidebar${menuOpen ? ' sidebar-open' : ''}`}>

        <div className="sidebar-logo">
          <div className="sidebar-logo-mark">BT</div>
          <div>
            <div className="sidebar-logo-name">BuildTrack</div>
            <span className="sidebar-logo-sub">Construction ERP</span>
          </div>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-section-label">{t('mainMenu')}</div>
          <nav>
            {NAV_ITEMS
              .filter(item =>
                item.roles === 'all' ||
                (user && item.roles.includes(user.role))
              )
              .slice(0, 4)
              .map(({ to, icon: Icon, key }) => (
                <NavLink key={to} to={to} end={to==='/'} onClick={handleNav}
                  className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
                  <span className="nav-icon"><Icon size={17} /></span>
                  {t(key)}
                </NavLink>
              ))
            }
          </nav>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-section-label">{t('management')}</div>
          <nav>
            {NAV_ITEMS
              .filter(item =>
                item.roles === 'all' ||
                (user && item.roles.includes(user.role))
              )
              .slice(4)
              .map(({ to, icon: Icon, key }) => (
                <NavLink key={to} to={to} onClick={handleNav}
                  className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
                  <span className="nav-icon"><Icon size={17} /></span>
                  {t(key)}
                </NavLink>
              ))
            }
          </nav>
        </div>

        {/* Settings shortcut */}
        <div className="sidebar-section" style={{ marginTop:'auto', paddingTop:0 }}>
          <button className="nav-item" style={{ width:'100%', background:'none', border:'none', textAlign:'left' }}
            onClick={() => setSO(v => !v)}>
            <span className="nav-icon"><Settings size={17} /></span>
            {t('settings')}
            <span style={{ marginLeft:'auto', fontSize:10, color:'var(--t4)' }}>
              {allCurrencies[currency]?.flag} {allLanguages[language]?.nativeName?.slice(0,4)}
            </span>
          </button>
        </div>

        <div className="sidebar-footer">
          <div className="avatar">{initials}</div>
          <div className="user-info">
            <div className="user-name">{user?.name}</div>
            <div className="user-role">{user?.role}</div>
          </div>
          <button className="btn-logout" title={t('logout')}
            onClick={() => { logout(); navigate('/login'); }}>
            <LogOut size={14} />
          </button>
        </div>

      </aside>

      {/* Settings Panel */}
      {settingsOpen && (
        <div className="settings-overlay" onClick={() => setSO(false)}>
          <div className="settings-panel" ref={settingsRef} onClick={e => e.stopPropagation()}>
            <div className="settings-head">
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <Globe size={16} color="var(--primary)" />
                <span style={{ fontWeight:700, fontSize:15 }}>{t('settings')}</span>
              </div>
              <button className="modal-close" onClick={() => setSO(false)}>×</button>
            </div>

            <div className="settings-body">

              {/* Country */}
              <div className="form-group">
                <label className="form-label">{t('country')}</label>
                <div className="select-wrap">
                  <select className="form-input" value={country} onChange={e => setCountry(e.target.value)}>
                    {Object.entries(allCountries).map(([code, info]) => (
                      <option key={code} value={code}>{info.flag} {info.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="select-arrow" />
                </div>
              </div>

              {/* Language */}
              <div className="form-group">
                <label className="form-label">{t('language')}</label>
                <div className="select-wrap">
                  <select className="form-input" value={language} onChange={e => setLanguage(e.target.value)}>
                    {availableLanguages.map(code => (
                      <option key={code} value={code}>
                        {allLanguages[code]?.nativeName} ({allLanguages[code]?.name})
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="select-arrow" />
                </div>
                <div style={{ fontSize:11.5, color:'var(--t3)', marginTop:5 }}>
                  Languages available for <strong>{allCountries[country]?.name}</strong>
                </div>
              </div>

              {/* Currency */}
              <div className="form-group mb-0">
                <label className="form-label">{t('currency')}</label>
                <div className="select-wrap">
                  <select className="form-input" value={currency} onChange={e => setCurrency(e.target.value)}>
                    {Object.entries(allCurrencies).map(([code, info]) => (
                      <option key={code} value={code}>
                        {info.flag} {code} — {info.name} ({info.symbol})
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="select-arrow" />
                </div>
                <div className="currency-preview">
                  <span>Preview:</span>
                  <strong>{fmt(125000)}</strong>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      <main className="main-content">{children}</main>
    </div>
  );
}
