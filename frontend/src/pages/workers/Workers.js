import React, { useState, useEffect } from 'react';
import { Plus, Pencil, X } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { useSettings } from '../../context/SettingsContext';
import TablePagination from '../../components/TablePagination';

const TRADES = ['mason','electrician','plumber','steel_fixer','helper','driver','carpenter','painter','other'];
const TRADE_BADGE = { mason:'badge-blue', electrician:'badge-yellow', plumber:'badge-teal', steel_fixer:'badge-orange', helper:'badge-gray', driver:'badge-purple', carpenter:'badge-green', painter:'badge-purple', other:'badge-gray' };

const EMPTY_FORM = { name:'', trade:'mason', payType:'daily', rate:'', phone:'', idType:'aadhar', idNumber:'', country:'India' };

const COUNTRIES = ['Afghanistan','Albania','Algeria','Andorra','Angola','Argentina','Armenia','Australia','Austria','Azerbaijan','Bahamas','Bahrain','Bangladesh','Barbados','Belarus','Belgium','Belize','Benin','Bhutan','Bolivia','Bosnia and Herzegovina','Botswana','Brazil','Brunei','Bulgaria','Burkina Faso','Burundi','Cambodia','Cameroon','Canada','Cape Verde','Central African Republic','Chad','Chile','China','Colombia','Comoros','Congo','Costa Rica','Croatia','Cuba','Cyprus','Czech Republic','Denmark','Djibouti','Dominica','Dominican Republic','East Timor','Ecuador','Egypt','El Salvador','Equatorial Guinea','Eritrea','Estonia','Eswatini','Ethiopia','Fiji','Finland','France','Gabon','Gambia','Georgia','Germany','Ghana','Greece','Grenada','Guatemala','Guinea','Guinea-Bissau','Guyana','Haiti','Honduras','Hong Kong','Hungary','Iceland','India','Indonesia','Iran','Iraq','Ireland','Israel','Italy','Ivory Coast','Jamaica','Japan','Jordan','Kazakhstan','Kenya','Kiribati','Kosovo','Kuwait','Kyrgyzstan','Laos','Latvia','Lebanon','Lesotho','Liberia','Libya','Liechtenstein','Lithuania','Luxembourg','Macao','Madagascar','Malawi','Malaysia','Maldives','Mali','Malta','Marshall Islands','Mauritania','Mauritius','Mexico','Micronesia','Moldova','Monaco','Mongolia','Montenegro','Morocco','Mozambique','Myanmar','Namibia','Nauru','Nepal','Netherlands','New Zealand','Nicaragua','Niger','Nigeria','North Korea','North Macedonia','Norway','Oman','Pakistan','Palau','Palestine','Panama','Papua New Guinea','Paraguay','Peru','Philippines','Poland','Portugal','Qatar','Romania','Russia','Rwanda','Saint Kitts and Nevis','Saint Lucia','Saint Vincent and the Grenadines','Samoa','San Marino','Sao Tome and Principe','Saudi Arabia','Senegal','Serbia','Seychelles','Sierra Leone','Singapore','Slovakia','Slovenia','Solomon Islands','Somalia','South Africa','South Korea','South Sudan','Spain','Sri Lanka','Sudan','Suriname','Sweden','Switzerland','Syria','Taiwan','Tajikistan','Tanzania','Thailand','Timor-Leste','Togo','Tonga','Trinidad and Tobago','Tunisia','Turkey','Turkmenistan','Tuvalu','Uganda','Ukraine','United Arab Emirates','United Kingdom','United States','Uruguay','Uzbekistan','Vanuatu','Vatican City','Venezuela','Vietnam','Yemen','Zambia','Zimbabwe'];

export default function Workers() {
  const [workers,  setWorkers]   = useState([]);
  const [loading,  setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [page, setPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const { t, fmt } = useSettings();

  useEffect(() => { fetchWorkers(); }, []);

  useEffect(() => {
    const handleClickOutside = () => setShowCountryDropdown(false);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const fetchWorkers = () => {
    api.get('/workers')
      .then(r => setWorkers(r.data.data))
      .catch(() => toast.error('Failed to load workers'))
      .finally(() => setLoading(false));
    setPage(0);
    setItemsPerPage(10);
  };

  const openAddModal = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowCountryDropdown(false);
    setShowModal(true);
  };

  const openEditModal = (worker) => {
    setEditingId(worker._id);
    setForm({
      name: worker.name || '',
      trade: worker.trade || 'mason',
      payType: worker.payType || 'daily',
      rate: worker.rate != null ? String(worker.rate) : '',
      phone: worker.phone || '',
      idType: worker.idType || 'aadhar',
      idNumber: worker.idNumber || '',
      country: worker.country || 'India',
    });
    setShowCountryDropdown(false);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowCountryDropdown(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, rate: Number(form.rate) };
    try {
      if (editingId) {
        await api.put(`/workers/${editingId}`, payload);
        toast.success('Worker updated!');
      } else {
        await api.post('/workers', payload);
        toast.success('Worker added!');
      }
      closeModal();
      fetchWorkers();
    } catch (err) {
      toast.error(err.response?.data?.message || (editingId ? 'Failed to update worker' : 'Failed to add worker'));
    }
  };

  const deactivate = async (id, name) => {
    if (!window.confirm(`Deactivate ${name}?`)) return;
    try {
      await api.delete(`/workers/${id}`);
      toast.success('Worker deactivated');
      fetchWorkers();
    } catch { toast.error('Failed'); }
  };

  const set = (f) => (e) => setForm({ ...form, [f]: e.target.value });

  if (loading) return <div className="loading"><div className="spinner" /><span className="loading-text">Loading workers…</span></div>;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-text">
          <h1>Workers</h1>
          <p>{workers.length} active workers on roster</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <Plus size={15} /> {t('addWorker')}
        </button>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Name</th><th>Trade</th><th>Pay Type</th><th>Rate</th><th>Phone</th><th>ID Type</th><th>Country</th><th></th></tr>
            </thead>
            <tbody>
              {workers.length === 0 ? (
                <tr><td colSpan={8}>
                  <div className="empty-state">
                    <div className="empty-icon">👷</div>
                    <div className="empty-title">No workers yet</div>
                    <div className="empty-desc">Add workers to track attendance and payroll</div>
                  </div>
                </td></tr>
              ) : (() => {
                const start = page * itemsPerPage;
                const paginatedWorkers = workers.slice(start, start + itemsPerPage);
                return paginatedWorkers.map(w => (
                  <tr key={w._id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{w.name}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--t3)', marginTop: 2 }}>
                        Joined {w.joinDate ? new Date(w.joinDate).toLocaleDateString('en-PK',{month:'short',year:'numeric'}) : '—'}
                      </div>
                    </td>
                    <td><span className={`badge ${TRADE_BADGE[w.trade]||'badge-gray'}`}>{w.trade?.replace('_',' ')}</span></td>
                    <td><span className="badge badge-gray">{w.payType}</span></td>
                    <td style={{ fontWeight: 600 }}>{fmt(w.rate)}</td>
                    <td style={{ color: 'var(--t2)' }}>{w.phone || '—'}</td>
                    <td style={{ fontSize: 12.5 }}>{w.idType ? w.idType.replace('_',' ') : '—'}</td>
                    <td style={{ fontSize: 12.5 }}>{w.country || 'India'}</td>
                    <td>
                      <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                        <button type="button" className="btn btn-outline btn-sm" onClick={() => openEditModal(w)}>
                          <Pencil size={12} /> {t('edit')}
                        </button>
                        <button type="button" className="btn btn-danger btn-sm" onClick={() => deactivate(w._id, w.name)}>
                          {t('remove')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ));
              })()}
            </tbody>
          </table>
        </div>
        <TablePagination
          total={workers.length}
          page={page}
          itemsPerPage={itemsPerPage}
          onPageChange={setPage}
          onItemsPerPageChange={(n) => { setItemsPerPage(n); setPage(0); }}
        />
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <h2>{editingId ? t('editWorker') : t('addWorker')}</h2>
              <button type="button" className="modal-close" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              <form id="worker-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input className="form-input" value={form.name} onChange={set('name')} required placeholder="Muhammad Rafiq" />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Trade *</label>
                    <select className="form-input" value={form.trade} onChange={set('trade')}>
                      {TRADES.map(tr => (
                        <option key={tr} value={tr}>{tr.replace('_',' ')}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Pay Type *</label>
                    <select className="form-input" value={form.payType} onChange={set('payType')}>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Rate *</label>
                    <input className="form-input" type="number" value={form.rate} onChange={set('rate')} required placeholder="500" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input className="form-input" value={form.phone} onChange={set('phone')} placeholder="+91 98765 43210" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">ID Type *</label>
                    <select className="form-input" value={form.idType} onChange={set('idType')}>
                      <option value="aadhar">Aadhaar</option>
                      <option value="pan">PAN</option>
                      <option value="cnic">CNIC</option>
                      <option value="passport">Passport</option>
                      <option value="driving_license">Driving License</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">ID Number *</label>
                    <input className="form-input" value={form.idNumber} onChange={set('idNumber')} required placeholder="123456789012" />
                  </div>
                </div>
                <div className="form-group mb-0" style={{ position: 'relative' }}>
                  <label className="form-label">Country *</label>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                      <input
                        className="form-input"
                        type="text"
                        value={form.country}
                        onChange={(e) => {
                          setForm({ ...form, country: e.target.value });
                          setShowCountryDropdown(true);
                        }}
                        onFocus={() => setShowCountryDropdown(true)}
                        placeholder="Search country..."
                        style={{ paddingRight: 32 }}
                      />
                      {form.country && (
                        <button
                          type="button"
                          onClick={() => { setForm({ ...form, country: '' }); }}
                          style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                          <X size={16} color="var(--t3)" />
                        </button>
                      )}
                      {showCountryDropdown && (
                        <div style={{
                          position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--white)', border: '1px solid var(--border)',
                          borderRadius: 'var(--r-md)', marginTop: 4, maxHeight: 240, overflowY: 'auto', zIndex: 10, boxShadow: 'var(--shadow-md)'
                        }}>
                          {COUNTRIES.filter(c => c.toLowerCase().includes(form.country.toLowerCase())).slice(0, 10).map((country, idx) => (
                            <div
                              key={idx}
                              onClick={() => { setForm({ ...form, country }); setShowCountryDropdown(false); }}
                              style={{
                                padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid var(--border)', fontSize: 13.5,
                                background: form.country === country ? 'var(--bg)' : 'transparent', color: 'var(--t1)', fontWeight: form.country === country ? 600 : 400
                              }}
                            >
                              {country}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline" onClick={closeModal}>{t('cancel')}</button>
              <button className="btn btn-primary" type="submit" form="worker-form">
                {editingId ? <>{t('save')}</> : <><Plus size={14} /> {t('addWorker')}</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
