import React, { useState, useEffect } from 'react';
import { LogOut, User, CalendarCheck, DollarSign, Briefcase, TrendingUp } from 'lucide-react';
import TablePagination from '../../components/TablePagination';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const STATUS_CLS = { present:'att-present', absent:'att-absent', half_day:'att-half_day', overtime:'att-overtime' };

export default function WorkerDashboard() {
  const { user, logout } = useAuth();
  const { t, fmt }       = useSettings();
  const navigate         = useNavigate();
  const [worker, setWorker]     = useState(null);
  const [attendance, setAtt]    = useState([]);
  const [loading, setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, profile, earnings, attendance, salary
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState(''); // For specific date picker
  const [showDatePicker, setShowDatePicker] = useState(false); // Show/hide calendar picker
  const [overviewPage, setOverviewPage] = useState(0); // Pagination for overview table
  const [attendancePage, setAttendancePage] = useState(0); // Pagination for attendance table
  const [itemsPerPage, setItemsPerPage] = useState(10); // Items per page selection

  useEffect(() => {
    Promise.all([
      api.get('/workers/me'),
      api.get('/attendance/me'),
    ]).then(([w, a]) => {
      setWorker(w.data.data);
      setAtt(a.data.data || []);
    }).catch(() => toast.error('Failed to load your profile'))
      .finally(() => setLoading(false));
  }, []);

  // Reset pagination when date/filters change
  useEffect(() => {
    setOverviewPage(0);
    setAttendancePage(0);
  }, [selectedMonth, selectedYear, selectedDate]);

  const handleLogout = () => { logout(); navigate('/login'); };

  const initials = user?.name?.split(' ').map(c => c[0]).join('').slice(0,2).toUpperCase() || 'W';

  /* Compute quick stats from attendance array */
  const stats = attendance.reduce((acc, r) => {
    if (r.status === 'present')  { acc.present++;  acc.days += 1; }
    if (r.status === 'half_day') { acc.halfDay++;  acc.days += 0.5; }
    if (r.status === 'overtime') { acc.overtime++; acc.days += 1.5; }
    return acc;
  }, { present: 0, halfDay: 0, overtime: 0, days: 0 });

  const dailyRate  = worker?.rate ?? 0;
  const totalEarned = Math.round(stats.days * dailyRate);
  
  const thisMonth  = attendance.filter(r => {
    const d = new Date(r.date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const daysThisMonth = thisMonth.reduce((acc, r) => {
    if (r.status === 'present')  return acc + 1;
    if (r.status === 'half_day') return acc + 0.5;
    if (r.status === 'overtime') return acc + 1.5;
    return acc;
  }, 0);

  // Filter for selected month/year
  const monthAttendanceRaw = attendance.filter(r => {
    const d = new Date(r.date);
    return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
  });
  
  // Remove duplicates - keep only one record per date
  const uniqueByDate = new Map();
  monthAttendanceRaw.forEach(record => {
    const dateKey = new Date(record.date).toDateString();
    if (!uniqueByDate.has(dateKey)) {
      uniqueByDate.set(dateKey, record);
    }
  });
  const monthAttendance = Array.from(uniqueByDate.values());

  const monthStats = monthAttendance.reduce((acc, r) => {
    if (r.status === 'present')  { acc.present++;  acc.days += 1; }
    if (r.status === 'half_day') { acc.halfDay++;  acc.days += 0.5; }
    if (r.status === 'overtime') { acc.overtime++; acc.days += 1.5; }
    return acc;
  }, { present: 0, halfDay: 0, overtime: 0, days: 0 });

  const monthEarning = Math.round(monthStats.days * dailyRate);

  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  // Calendar generator
  const generateCalendarDays = () => {
    const firstDay = new Date(selectedYear, selectedMonth, 1);
    const lastDay = new Date(selectedYear, selectedMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    const days = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handleDateClick = (day) => {
    if (day) {
      const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      setSelectedDate(dateStr);
      setShowDatePicker(false);
    }
  };

  // Get year range for selector
  const currentYear = new Date().getFullYear();
  const yearRange = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

  if (loading) return (
    <div className="loading"><div className="spinner" /><span className="loading-text">{t('loading')}…</span></div>
  );

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', padding:'0' }}>

      {/* Top bar */}
      <header style={{ background:'var(--white)', borderBottom:'1.5px solid var(--border)', padding:'0 24px', height:60, display:'flex', alignItems:'center', justifyContent:'space-between', boxShadow:'var(--shadow-sm)', position:'sticky', top:0, zIndex:100 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div className="sidebar-logo-mark" style={{ fontSize:13 }}>BT</div>
          <div>
            <div style={{ fontWeight:800, fontSize:14.5, color:'var(--t1)', lineHeight:1.1 }}>BuildTrack</div>
            <div style={{ fontSize:11, color:'var(--t3)', fontWeight:500 }}>{t('workerPortal')}</div>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div className="avatar" style={{ width:32, height:32, fontSize:12 }}>{initials}</div>
          <div style={{ display:'flex', flexDirection:'column' }}>
            <span style={{ fontSize:13, fontWeight:600, color:'var(--t1)' }}>{user?.name}</span>
            <span style={{ fontSize:11, color:'var(--t3)', textTransform:'capitalize' }}>{worker?.trade?.replace('_',' ') || t('workers')}</span>
          </div>
          <button className="btn-logout" title={t('logout')} onClick={handleLogout}><LogOut size={14} /></button>
        </div>
      </header>

      <div style={{ maxWidth:1200, margin:'0 auto', padding:'24px 16px' }}>

        {/* Welcome */}
        <div style={{ marginBottom:24 }}>
          <h1 style={{ fontSize:22, fontWeight:800, color:'var(--t1)' }}>Worker Portal</h1>
          <p style={{ color:'var(--t3)', marginTop:4 }}>
            {new Date().toLocaleDateString('en', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', gap:8, marginBottom:24, borderBottom:'1.5px solid var(--border)', overflowX:'auto', paddingBottom:0 }}>
          {[
            { id:'overview', label:'Overview', icon:'📊' },
            { id:'profile', label:'Profile', icon:'👤' },
            { id:'earnings', label:'All Earnings', icon:'💰' },
            { id:'attendance', label:'Attendance', icon:'📅' },
            { id:'salary', label:'Monthly Salary', icon:'💵' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding:'12px 16px',
                border:'none',
                background:'none',
                borderBottom: activeTab === tab.id ? '2.5px solid var(--primary)' : 'none',
                color: activeTab === tab.id ? 'var(--primary)' : 'var(--t3)',
                fontWeight: activeTab === tab.id ? 600 : 500,
                fontSize:13,
                cursor:'pointer',
                whiteSpace:'nowrap',
                transition:'all 0.2s'
              }}
            >
              <span style={{ marginRight:6 }}>{tab.icon}</span>{tab.label}
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <>
            {/* Stats */}
            <div className="stats-grid" style={{ marginBottom:24 }}>
              {[
                { icon: CalendarCheck, cls:'si-blue',   label: 'Total Days',       value: stats.days },
                { icon: TrendingUp,    cls:'si-green',  label: 'This Month',   value: daysThisMonth },
                { icon: DollarSign,    cls:'si-orange', label: 'Total Earnings',   value: fmt(totalEarned), raw: true },
                { icon: Briefcase,     cls:'si-purple', label: 'Assigned Projects',value: worker?.projects?.length ?? 0 },
              ].map(({ icon: Icon, cls, label, value, raw }) => (
                <div className="stat-card" key={label}>
                  <div className={`stat-icon ${cls}`}><Icon size={20} /></div>
                  <div className="stat-body">
                    <div className="stat-value" style={{ fontSize: raw ? 18 : 26 }}>{value}</div>
                    <div className="stat-label">{label}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:24 }}>

              {/* Profile card */}
              <div className="card card-pad">
                <h2 style={{ fontSize:15, fontWeight:700, color:'var(--t1)', marginBottom:16, display:'flex', alignItems:'center', gap:8 }}>
                  <User size={16} color="var(--primary)" /> My Profile
                </h2>
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  {[
                    ['Name',    user?.name],
                    ['Trade',   worker?.trade?.replace('_',' ')],
                    ['Pay Type', worker?.payType],
                    ['Rate',    worker?.rate ? `${fmt(worker.rate)} / ${worker?.payType}` : '—'],
                    ['Phone',   worker?.phone || '—'],
                    ['Status',  worker?.isActive ? 'Active' : 'Inactive'],
                  ].map(([lbl, val]) => (
                    <div key={lbl} style={{ display:'flex', justifyContent:'space-between', borderBottom:'1px solid var(--border-light)', paddingBottom:8 }}>
                      <span style={{ fontSize:12.5, color:'var(--t3)', fontWeight:500 }}>{lbl}</span>
                      <span style={{ fontSize:13, color:'var(--t1)', fontWeight:600, textTransform:'capitalize' }}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Earnings breakdown */}
              <div className="card card-pad">
                <h2 style={{ fontSize:15, fontWeight:700, color:'var(--t1)', marginBottom:16, display:'flex', alignItems:'center', gap:8 }}>
                  <DollarSign size={16} color="var(--success)" /> This Month
                </h2>
                {[
                  { label: 'Present',  days: monthStats.present,  mult: 1,   color: 'var(--success)' },
                  { label: 'Half Day', days: monthStats.halfDay,  mult: 0.5, color: 'var(--warning)' },
                  { label: 'Overtime', days: monthStats.overtime, mult: 1.5, color: 'var(--primary)' },
                ].map(({ label, days, mult, color }) => (
                  <div key={label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'1px solid var(--border-light)' }}>
                    <div>
                      <span style={{ fontSize:13, fontWeight:600, color:'var(--t1)' }}>{label}</span>
                      <span style={{ fontSize:12, color:'var(--t3)', marginLeft:8 }}>{days} days × {mult}x</span>
                    </div>
                    <span style={{ fontSize:13.5, fontWeight:700, color }}>{fmt(days * dailyRate * mult)}</span>
                  </div>
                ))}
                <div style={{ display:'flex', justifyContent:'space-between', padding:'12px 0 0', marginTop:4 }}>
                  <span style={{ fontSize:14, fontWeight:700, color:'var(--t1)' }}>Total This Month</span>
                  <span style={{ fontSize:16, fontWeight:800, color:'var(--success)' }}>{fmt(monthEarning)}</span>
                </div>
              </div>
            </div>

            {/* Recent Attendance */}
            <div className="card">
              <div className="card-head">
                <div>
                  <h2>Recent Attendance</h2>
                  <p>Last 30 days</p>
                </div>
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr><th>Date</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {attendance.length === 0 ? (
                      <tr><td colSpan={2}>
                        <div className="empty-state">
                          <div className="empty-icon"><CalendarCheck size={24} /></div>
                          <div className="empty-title">No Attendance</div>
                          <div className="empty-desc">No records yet</div>
                        </div>
                      </td></tr>
                    ) : (() => {
                      const start = overviewPage * itemsPerPage;
                      const paginatedData = attendance.slice(start, start + itemsPerPage);
                      return paginatedData.map((r, i) => (
                        <tr key={i}>
                          <td style={{ color:'var(--t2)' }}>
                            {new Date(r.date).toLocaleDateString('en', { weekday:'short', day:'numeric', month:'short', year:'numeric' })}
                          </td>
                          <td>
                            <span className={`att-btn ${STATUS_CLS[r.status] || ''}`} style={{ cursor:'default', pointerEvents:'none' }}>
                              {r.status?.replace('_',' ')}
                            </span>
                          </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
              <TablePagination
                total={attendance.length}
                page={overviewPage}
                itemsPerPage={itemsPerPage}
                onPageChange={setOverviewPage}
                onItemsPerPageChange={(n) => { setItemsPerPage(n); setOverviewPage(0); }}
              />
              
            </div>
          </>
        )}

        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <div className="card card-pad">
            <h2 style={{ fontSize:18, fontWeight:700, color:'var(--t1)', marginBottom:24 }}>My Complete Profile</h2>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24 }}>
              <div>
                <h3 style={{ fontSize:14, fontWeight:700, color:'var(--t1)', marginBottom:16 }}>Personal Information</h3>
                <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  {[
                    ['Name', user?.name],
                    ['Email', user?.email],
                    ['Phone', user?.phone || worker?.phone || '—'],
                    ['Trade', worker?.trade?.replace('_',' ')],
                    ['ID Type', worker?.idType?.replace('_',' ') || '—'],
                    ['ID Number', worker?.idNumber || '—'],
                  ].map(([lbl, val]) => (
                    <div key={lbl} style={{ borderBottom:'1px solid var(--border-light)', paddingBottom:12 }}>
                      <div style={{ fontSize:11, color:'var(--t3)', fontWeight:600, marginBottom:4 }}>{lbl}</div>
                      <div style={{ fontSize:14, color:'var(--t1)', fontWeight:600 }}>{val}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 style={{ fontSize:14, fontWeight:700, color:'var(--t1)', marginBottom:16 }}>Employment Details</h3>
                <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  {[
                    ['Country', worker?.country || 'India'],
                    ['Pay Type', worker?.payType],
                    ['Daily Rate', `${fmt(worker?.rate)} ${worker?.currency}`],
                    ['Payment Method', worker?.payment?.method || 'Cash'],
                    ['Status', worker?.isActive ? '✅ Active' : '❌ Inactive'],
                    ['Joined', worker?.joinDate ? new Date(worker.joinDate).toLocaleDateString('en-IN') : '—'],
                  ].map(([lbl, val]) => (
                    <div key={lbl} style={{ borderBottom:'1px solid var(--border-light)', paddingBottom:12 }}>
                      <div style={{ fontSize:11, color:'var(--t3)', fontWeight:600, marginBottom:4 }}>{lbl}</div>
                      <div style={{ fontSize:14, color:'var(--t1)', fontWeight:600 }}>{val}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* EARNINGS TAB */}
        {activeTab === 'earnings' && (
          <div className="card card-pad">
            <h2 style={{ fontSize:18, fontWeight:700, color:'var(--t1)', marginBottom:24 }}>All Earnings History</h2>
            
            {/* Date Picker */}
            <div style={{ padding:'16px', background:'var(--bg)', borderRadius:'var(--r-md)', marginBottom:16, position:'relative' }}>
              <button
                onClick={() => setShowDatePicker(!showDatePicker)}
                style={{
                  width:'100%',
                  padding:'12px 16px',
                  border:'1.5px solid var(--border)',
                  borderRadius:'var(--r-md)',
                  background:'var(--white)',
                  fontSize:14,
                  fontWeight:600,
                  color:'var(--t1)',
                  cursor:'pointer',
                  display:'flex',
                  alignItems:'center',
                  justifyContent:'space-between',
                  transition:'all 0.2s'
                }}
              >
                <span>
                  {selectedDate 
                    ? new Date(selectedDate).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })
                    : `${monthNames[selectedMonth]} ${selectedYear}`}
                </span>
                <span>{showDatePicker ? '▲' : '▼'}</span>
              </button>

              {/* Calendar Picker */}
              {showDatePicker && (
                <div style={{
                  position:'absolute',
                  top:'60px',
                  left:'16px',
                  background:'var(--white)',
                  border:'1.5px solid var(--border)',
                  borderRadius:'var(--r-md)',
                  padding:'16px',
                  zIndex:1000,
                  boxShadow:'var(--shadow-md)',
                  minWidth:320
                }}>
                  {/* Year Selector */}
                  <div style={{ marginBottom:16 }}>
                    <label style={{ fontSize:11, fontWeight:600, color:'var(--t3)', display:'block', marginBottom:8 }}>Year</label>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                      style={{
                        width:'100%',
                        padding:'8px 12px',
                        border:'1.5px solid var(--border)',
                        borderRadius:'var(--r-md)',
                        fontSize:13,
                        fontWeight:500,
                        background:'var(--white)',
                        cursor:'pointer'
                      }}
                    >
                      {yearRange.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>

                  {/* Month Selector */}
                  <div style={{ marginBottom:16 }}>
                    <label style={{ fontSize:11, fontWeight:600, color:'var(--t3)', display:'block', marginBottom:8 }}>Month</label>
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                      style={{
                        width:'100%',
                        padding:'8px 12px',
                        border:'1.5px solid var(--border)',
                        borderRadius:'var(--r-md)',
                        fontSize:13,
                        fontWeight:500,
                        background:'var(--white)',
                        cursor:'pointer'
                      }}
                    >
                      {monthNames.map((month, idx) => (
                        <option key={idx} value={idx}>{month}</option>
                      ))}
                    </select>
                  </div>

                  {/* Calendar Grid */}
                  <div style={{ marginBottom:16 }}>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap:6, marginBottom:12 }}>
                      {dayLabels.map(day => (
                        <div key={day} style={{ textAlign:'center', fontSize:11, fontWeight:700, color:'var(--t3)', padding:'8px 0' }}>
                          {day}
                        </div>
                      ))}
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap:6 }}>
                      {calendarDays.map((day, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleDateClick(day)}
                          disabled={!day}
                          style={{
                            padding:'8px 0',
                            border:'1px solid var(--border-light)',
                            borderRadius:'var(--r-md)',
                            background: day ? 'var(--white)' : 'transparent',
                            color: day ? 'var(--t1)' : 'var(--t3)',
                            fontSize:13,
                            fontWeight:500,
                            cursor: day ? 'pointer' : 'default',
                            opacity: day ? 1 : 0.5,
                            transition:'all 0.2s'
                          }}
                          onMouseOver={(e) => {
                            if (day) e.target.style.background = 'rgba(59, 130, 246, 0.1)';
                          }}
                          onMouseOut={(e) => {
                            if (day) e.target.style.background = 'var(--white)';
                          }}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display:'flex', gap:8 }}>
                    <button
                      onClick={() => setShowDatePicker(false)}
                      style={{
                        flex:1,
                        padding:'8px 12px',
                        background:'var(--bg)',
                        border:'1.5px solid var(--border)',
                        borderRadius:'var(--r-md)',
                        fontSize:12,
                        fontWeight:600,
                        cursor:'pointer',
                        color:'var(--t1)'
                      }}
                    >
                      Close
                    </button>
                    {selectedDate && (
                      <button
                        onClick={() => { setSelectedDate(''); setShowDatePicker(false); }}
                        style={{
                          flex:1,
                          padding:'8px 12px',
                          background:'var(--danger)',
                          color:'white',
                          border:'none',
                          borderRadius:'var(--r-md)',
                          fontSize:12,
                          fontWeight:600,
                          cursor:'pointer'
                        }}
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Earnings stats for selected month */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:16, marginBottom:24 }}>
              {[
                { label: 'Present Days', value: monthStats.present, color: 'var(--success)' },
                { label: 'Half Days', value: monthStats.halfDay, color: 'var(--warning)' },
                { label: 'Overtime Days', value: monthStats.overtime, color: 'var(--primary)' },
                { label: 'Total Days', value: monthStats.days, color: 'var(--info)' },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ background:'var(--white)', border:'1.5px solid var(--border)', borderRadius:'var(--r-md)', padding:16, textAlign:'center' }}>
                  <div style={{ fontSize:24, fontWeight:800, color }}>{value}</div>
                  <div style={{ fontSize:12, color:'var(--t3)', marginTop:4 }}>{label}</div>
                </div>
              ))}
            </div>

            {/* Detailed earnings breakdown */}
            <div style={{ background:'var(--white)', border:'1.5px solid var(--border)', borderRadius:'var(--r-md)', padding:16 }}>
              <h3 style={{ fontSize:14, fontWeight:700, color:'var(--t1)', marginBottom:16 }}>Earnings Breakdown</h3>
              <div>
                {[
                  { label: 'Present Days', days: monthStats.present, mult: 1, color: 'var(--success)' },
                  { label: 'Half Days (0.5x)', days: monthStats.halfDay, mult: 0.5, color: 'var(--warning)' },
                  { label: 'Overtime Days (1.5x)', days: monthStats.overtime, mult: 1.5, color: 'var(--primary)' },
                ].map(({ label, days, mult, color }) => (
                  <div key={label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 0', borderBottom:'1px solid var(--border-light)' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                      <div style={{ width:12, height:12, background:color, borderRadius:3 }} />
                      <div>
                        <div style={{ fontSize:13, fontWeight:600, color:'var(--t1)' }}>{label}</div>
                        <div style={{ fontSize:12, color:'var(--t3)' }}>{days} days × {fmt(dailyRate)} × {mult}x</div>
                      </div>
                    </div>
                    <span style={{ fontSize:14, fontWeight:700, color }}>{fmt(days * dailyRate * mult)}</span>
                  </div>
                ))}
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px 0 0', marginTop:8, borderTop:'2px solid var(--primary)' }}>
                  <span style={{ fontSize:15, fontWeight:700, color:'var(--t1)' }}>Total Earning for {selectedDate ? new Date(selectedDate).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' }) : `${monthNames[selectedMonth]} ${selectedYear}`}</span>
                  <span style={{ fontSize:18, fontWeight:800, color:'var(--success)' }}>{fmt(monthEarning)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ATTENDANCE TAB */}
        {activeTab === 'attendance' && (
          <div className="card">
            <div className="card-head">
              <div>
                <h2>Attendance Records</h2>
                <p>Pick a date from calendar to filter attendance</p>
              </div>
            </div>

            {/* Date Picker */}
            <div style={{ padding:'16px', background:'var(--bg)', borderRadius:'var(--r-md)', margin:'16px', position:'relative' }}>
              <button
                onClick={() => setShowDatePicker(!showDatePicker)}
                style={{
                  width:'100%',
                  padding:'12px 16px',
                  border:'1.5px solid var(--border)',
                  borderRadius:'var(--r-md)',
                  background:'var(--white)',
                  fontSize:14,
                  fontWeight:600,
                  color:'var(--t1)',
                  cursor:'pointer',
                  display:'flex',
                  alignItems:'center',
                  justifyContent:'space-between',
                  transition:'all 0.2s'
                }}
              >
                <span>
                  {selectedDate 
                    ? new Date(selectedDate).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })
                    : 'Select Date...'}
                </span>
                <span>{showDatePicker ? '▲' : '▼'}</span>
              </button>

              {/* Calendar Picker */}
              {showDatePicker && (
                <div style={{
                  position:'absolute',
                  top:'60px',
                  left:'16px',
                  background:'var(--white)',
                  border:'1.5px solid var(--border)',
                  borderRadius:'var(--r-md)',
                  padding:'16px',
                  zIndex:1000,
                  boxShadow:'var(--shadow-md)',
                  minWidth:320
                }}>
                  {/* Year Selector */}
                  <div style={{ marginBottom:16 }}>
                    <label style={{ fontSize:11, fontWeight:600, color:'var(--t3)', display:'block', marginBottom:8 }}>Year</label>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                      style={{
                        width:'100%',
                        padding:'8px 12px',
                        border:'1.5px solid var(--border)',
                        borderRadius:'var(--r-md)',
                        fontSize:13,
                        fontWeight:500,
                        background:'var(--white)',
                        cursor:'pointer'
                      }}
                    >
                      {yearRange.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>

                  {/* Month Selector */}
                  <div style={{ marginBottom:16 }}>
                    <label style={{ fontSize:11, fontWeight:600, color:'var(--t3)', display:'block', marginBottom:8 }}>Month</label>
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                      style={{
                        width:'100%',
                        padding:'8px 12px',
                        border:'1.5px solid var(--border)',
                        borderRadius:'var(--r-md)',
                        fontSize:13,
                        fontWeight:500,
                        background:'var(--white)',
                        cursor:'pointer'
                      }}
                    >
                      {monthNames.map((month, idx) => (
                        <option key={idx} value={idx}>{month}</option>
                      ))}
                    </select>
                  </div>

                  {/* Calendar Grid */}
                  <div style={{ marginBottom:16 }}>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap:6, marginBottom:12 }}>
                      {dayLabels.map(day => (
                        <div key={day} style={{ textAlign:'center', fontSize:11, fontWeight:700, color:'var(--t3)', padding:'8px 0' }}>
                          {day}
                        </div>
                      ))}
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap:6 }}>
                      {calendarDays.map((day, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleDateClick(day)}
                          disabled={!day}
                          style={{
                            padding:'8px 0',
                            border:'1px solid var(--border-light)',
                            borderRadius:'var(--r-md)',
                            background: day ? 'var(--white)' : 'transparent',
                            color: day ? 'var(--t1)' : 'var(--t3)',
                            fontSize:13,
                            fontWeight:500,
                            cursor: day ? 'pointer' : 'default',
                            opacity: day ? 1 : 0.5,
                            transition:'all 0.2s',
                            '&:hover': day ? { background:'var(--primary-light)' } : {}
                          }}
                          onMouseOver={(e) => {
                            if (day) e.target.style.background = 'rgba(59, 130, 246, 0.1)';
                          }}
                          onMouseOut={(e) => {
                            if (day) e.target.style.background = 'var(--white)';
                          }}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display:'flex', gap:8 }}>
                    <button
                      onClick={() => setShowDatePicker(false)}
                      style={{
                        flex:1,
                        padding:'8px 12px',
                        background:'var(--bg)',
                        border:'1.5px solid var(--border)',
                        borderRadius:'var(--r-md)',
                        fontSize:12,
                        fontWeight:600,
                        cursor:'pointer',
                        color:'var(--t1)'
                      }}
                    >
                      Close
                    </button>
                    {selectedDate && (
                      <button
                        onClick={() => { setSelectedDate(''); setShowDatePicker(false); }}
                        style={{
                          flex:1,
                          padding:'8px 12px',
                          background:'var(--danger)',
                          color:'white',
                          border:'none',
                          borderRadius:'var(--r-md)',
                          fontSize:12,
                          fontWeight:600,
                          cursor:'pointer'
                        }}
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Selected date display */}
            {selectedDate && (
              <div style={{ padding:'12px 16px', margin:'0 16px 16px', background:'rgba(59, 130, 246, 0.1)', borderRadius:'var(--r-md)', fontSize:13, fontWeight:600, color:'var(--primary)' }}>
                📅 Showing attendance for: <strong>{new Date(selectedDate).toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}</strong>
              </div>
            )}

            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Date</th><th>Status</th><th>Earnings</th></tr>
                </thead>
                <tbody>
                  {(() => {
                    let filteredAttendance = monthAttendance;
                    
                    // If specific date is selected, filter to that date only
                    if (selectedDate) {
                      const selectedDateObj = new Date(selectedDate);
                      filteredAttendance = monthAttendance.filter(r => {
                        const recordDate = new Date(r.date);
                        return recordDate.toDateString() === selectedDateObj.toDateString();
                      });
                    }

                    const sortedRecords = filteredAttendance.sort((a, b) => new Date(b.date) - new Date(a.date));
                    const start = attendancePage * itemsPerPage;
                    const paginatedRecords = sortedRecords.slice(start, start + itemsPerPage);

                    return paginatedRecords.length === 0 ? (
                      <tr><td colSpan={3}>
                        <div className="empty-state">
                          <div className="empty-icon"><CalendarCheck size={24} /></div>
                          <div className="empty-title">No Records</div>
                          <div className="empty-desc">
                            {selectedDate 
                              ? `No attendance for ${new Date(selectedDate).toLocaleDateString('en-IN')}` 
                              : `No attendance for ${monthNames[selectedMonth]} ${selectedYear}`}
                          </div>
                        </div>
                      </td></tr>
                    ) : paginatedRecords.map((r, i) => {
                      const mult = r.status === 'present' ? 1 : r.status === 'half_day' ? 0.5 : r.status === 'overtime' ? 1.5 : 0;
                      return (
                        <tr key={i}>
                          <td style={{ color:'var(--t2)' }}>
                            {new Date(r.date).toLocaleDateString('en', { weekday:'short', day:'numeric', month:'short', year:'numeric' })}
                          </td>
                          <td>
                            <span className={`att-btn ${STATUS_CLS[r.status] || ''}`} style={{ cursor:'default', pointerEvents:'none' }}>
                              {r.status?.replace('_',' ')}
                            </span>
                          </td>
                          <td style={{ fontWeight:600, color:'var(--success)' }}>{fmt(dailyRate * mult)}</td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>
            {(() => {
              let filteredAttendance = monthAttendance;
              if (selectedDate) {
                const selectedDateObj = new Date(selectedDate);
                filteredAttendance = monthAttendance.filter(r => {
                  const recordDate = new Date(r.date);
                  return recordDate.toDateString() === selectedDateObj.toDateString();
                });
              }
              const totalRecords = filteredAttendance.length;
              return (
                <TablePagination
                  total={totalRecords}
                  page={attendancePage}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setAttendancePage}
                  onItemsPerPageChange={(n) => { setItemsPerPage(n); setAttendancePage(0); }}
                />
              );
              
            })()}
          </div>
        )}

        {/* SALARY TAB */}
        {activeTab === 'salary' && (
          <div className="card card-pad">
            <h2 style={{ fontSize:18, fontWeight:700, color:'var(--t1)', marginBottom:24 }}>Monthly Salary Summary</h2>

            {/* Date Picker */}
            <div style={{ padding:'16px', background:'var(--bg)', borderRadius:'var(--r-md)', marginBottom:24, position:'relative' }}>
              <button
                onClick={() => setShowDatePicker(!showDatePicker)}
                style={{
                  width:'100%',
                  padding:'12px 16px',
                  border:'1.5px solid var(--border)',
                  borderRadius:'var(--r-md)',
                  background:'var(--white)',
                  fontSize:14,
                  fontWeight:600,
                  color:'var(--t1)',
                  cursor:'pointer',
                  display:'flex',
                  alignItems:'center',
                  justifyContent:'space-between',
                  transition:'all 0.2s'
                }}
              >
                <span>
                  {selectedDate 
                    ? new Date(selectedDate).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })
                    : `${monthNames[selectedMonth]} ${selectedYear}`}
                </span>
                <span>{showDatePicker ? '▲' : '▼'}</span>
              </button>

              {/* Calendar Picker */}
              {showDatePicker && (
                <div style={{
                  position:'absolute',
                  top:'60px',
                  left:'16px',
                  background:'var(--white)',
                  border:'1.5px solid var(--border)',
                  borderRadius:'var(--r-md)',
                  padding:'16px',
                  zIndex:1000,
                  boxShadow:'var(--shadow-md)',
                  minWidth:320
                }}>
                  {/* Year Selector */}
                  <div style={{ marginBottom:16 }}>
                    <label style={{ fontSize:11, fontWeight:600, color:'var(--t3)', display:'block', marginBottom:8 }}>Year</label>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                      style={{
                        width:'100%',
                        padding:'8px 12px',
                        border:'1.5px solid var(--border)',
                        borderRadius:'var(--r-md)',
                        fontSize:13,
                        fontWeight:500,
                        background:'var(--white)',
                        cursor:'pointer'
                      }}
                    >
                      {yearRange.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>

                  {/* Month Selector */}
                  <div style={{ marginBottom:16 }}>
                    <label style={{ fontSize:11, fontWeight:600, color:'var(--t3)', display:'block', marginBottom:8 }}>Month</label>
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                      style={{
                        width:'100%',
                        padding:'8px 12px',
                        border:'1.5px solid var(--border)',
                        borderRadius:'var(--r-md)',
                        fontSize:13,
                        fontWeight:500,
                        background:'var(--white)',
                        cursor:'pointer'
                      }}
                    >
                      {monthNames.map((month, idx) => (
                        <option key={idx} value={idx}>{month}</option>
                      ))}
                    </select>
                  </div>

                  {/* Calendar Grid */}
                  <div style={{ marginBottom:16 }}>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap:6, marginBottom:12 }}>
                      {dayLabels.map(day => (
                        <div key={day} style={{ textAlign:'center', fontSize:11, fontWeight:700, color:'var(--t3)', padding:'8px 0' }}>
                          {day}
                        </div>
                      ))}
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap:6 }}>
                      {calendarDays.map((day, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleDateClick(day)}
                          disabled={!day}
                          style={{
                            padding:'8px 0',
                            border:'1px solid var(--border-light)',
                            borderRadius:'var(--r-md)',
                            background: day ? 'var(--white)' : 'transparent',
                            color: day ? 'var(--t1)' : 'var(--t3)',
                            fontSize:13,
                            fontWeight:500,
                            cursor: day ? 'pointer' : 'default',
                            opacity: day ? 1 : 0.5,
                            transition:'all 0.2s'
                          }}
                          onMouseOver={(e) => {
                            if (day) e.target.style.background = 'rgba(59, 130, 246, 0.1)';
                          }}
                          onMouseOut={(e) => {
                            if (day) e.target.style.background = 'var(--white)';
                          }}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display:'flex', gap:8 }}>
                    <button
                      onClick={() => setShowDatePicker(false)}
                      style={{
                        flex:1,
                        padding:'8px 12px',
                        background:'var(--bg)',
                        border:'1.5px solid var(--border)',
                        borderRadius:'var(--r-md)',
                        fontSize:12,
                        fontWeight:600,
                        cursor:'pointer',
                        color:'var(--t1)'
                      }}
                    >
                      Close
                    </button>
                    {selectedDate && (
                      <button
                        onClick={() => { setSelectedDate(''); setShowDatePicker(false); }}
                        style={{
                          flex:1,
                          padding:'8px 12px',
                          background:'var(--danger)',
                          color:'white',
                          border:'none',
                          borderRadius:'var(--r-md)',
                          fontSize:12,
                          fontWeight:600,
                          cursor:'pointer'
                        }}
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div style={{ background:'var(--white)', border:'1.5px solid var(--border)', borderRadius:'var(--r-md)', padding:24 }}>
              <div style={{ marginBottom:24 }}>
                <div style={{ fontSize:12, color:'var(--t3)', fontWeight:600, marginBottom:8 }}>SALARY PERIOD</div>
                <div style={{ fontSize:20, fontWeight:800, color:'var(--t1)' }}>
                  {selectedDate ? new Date(selectedDate).toLocaleDateString('en-IN', { month:'long', year:'numeric' }) : `${monthNames[selectedMonth]} ${selectedYear}`}
                </div>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:24, paddingBottom:24, borderBottom:'1.5px solid var(--border)' }}>
                <div>
                  <div style={{ fontSize:12, color:'var(--t3)', fontWeight:600, marginBottom:8 }}>WORKING DAYS</div>
                  <div style={{ fontSize:28, fontWeight:800, color:'var(--primary)' }}>{monthStats.days}</div>
                </div>
                <div>
                  <div style={{ fontSize:12, color:'var(--t3)', fontWeight:600, marginBottom:8 }}>DAILY RATE</div>
                  <div style={{ fontSize:28, fontWeight:800, color:'var(--t1)' }}>{fmt(dailyRate)}</div>
                </div>
              </div>

              <div style={{ marginBottom:24 }}>
                <h3 style={{ fontSize:14, fontWeight:700, color:'var(--t1)', marginBottom:16 }}>Salary Calculation</h3>
                {[
                  { label: 'Present Days', days: monthStats.present, mult: 1, color: 'var(--success)' },
                  { label: 'Half Days', days: monthStats.halfDay, mult: 0.5, color: 'var(--warning)' },
                  { label: 'Overtime Days', days: monthStats.overtime, mult: 1.5, color: 'var(--primary)' },
                ].map(({ label, days, mult, color }) => (
                  <div key={label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 0', borderBottom:'1px solid var(--border-light)' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                      <div style={{ width:12, height:12, background:color, borderRadius:3 }} />
                      <div>
                        <div style={{ fontSize:13, fontWeight:600, color:'var(--t1)' }}>{label}</div>
                        <div style={{ fontSize:12, color:'var(--t3)' }}>{days} × {fmt(dailyRate)} × {mult}x</div>
                      </div>
                    </div>
                    <span style={{ fontSize:14, fontWeight:700, color }}>{fmt(days * dailyRate * mult)}</span>
                  </div>
                ))}
              </div>

              <div style={{ background:'var(--primary)', color:'white', borderRadius:'var(--r-md)', padding:20, textAlign:'center' }}>
                <div style={{ fontSize:12, fontWeight:600, marginBottom:8, opacity:0.9 }}>NET SALARY FOR {selectedDate ? new Date(selectedDate).toLocaleDateString('en-IN', { month:'long', year:'numeric' }).toUpperCase() : `${monthNames[selectedMonth].toUpperCase()} ${selectedYear}`}</div>
                <div style={{ fontSize:32, fontWeight:800 }}>{fmt(monthEarning)}</div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
