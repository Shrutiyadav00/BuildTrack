import React, { useState, useEffect } from 'react';
import { Upload, FileText, Eye, EyeOff } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import TablePagination from '../../components/TablePagination';

const CAT_BADGE = { drawing:'badge-blue', layout:'badge-teal', structural:'badge-orange', mep:'badge-purple', boq:'badge-yellow', contract:'badge-red', permit:'badge-green', photo:'badge-gray', inspection:'badge-blue', other:'badge-gray' };

export default function Documents() {
  const [projects, setProjects]         = useState([]);
  const [selectedProject, setSP]        = useState('');
  const [documents, setDocs]            = useState([]);
  const [page, setPage]                 = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading]           = useState(false);
  const [showModal, setShowModal]       = useState(false);
  const [form, setForm]                 = useState({ name:'', category:'other', notes:'' });
  const [file, setFile]                 = useState(null);

  useEffect(() => {
    api.get('/projects').then(res => {
      setProjects(res.data.data);
      if (res.data.data.length > 0) setSP(res.data.data[0]._id);
    });
  }, []);

  useEffect(() => {
    if (!selectedProject) return;
    setLoading(true);
    setPage(0);
    api.get(`/documents/${selectedProject}`)
      .then(res => setDocs(res.data.data))
      .catch(() => toast.error('Failed to load documents'))
      .finally(() => setLoading(false));
  }, [selectedProject]);

  const handleUpload = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('category', form.category);
      if (form.notes) fd.append('notes', form.notes);
      if (file) fd.append('file', file);
      await api.post(`/documents/${selectedProject}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Document uploaded!');
      setShowModal(false);
      setForm({ name:'', category:'other', notes:'' });
      setFile(null);
      setPage(0);
      const res = await api.get(`/documents/${selectedProject}`);
      setDocs(res.data.data);
    } catch { toast.error('Failed to upload document'); }
  };

  const set = (f) => (e) => setForm({ ...form, [f]: e.target.value });

  return (
    <div>
      <div className="page-header">
        <div className="page-header-text">
          <h1>Documents</h1>
          <p>Manage drawings, contracts, and project files</p>
        </div>
        <div style={{ display:'flex', gap:10, alignItems:'center' }}>
          <select className="form-input" style={{ width:'auto', minWidth:200 }}
            value={selectedProject} onChange={e => setSP(e.target.value)}>
            {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select>
          <button className="btn btn-primary" onClick={() => setShowModal(true)} disabled={!selectedProject}>
            <Upload size={14} /> Upload
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" /><span className="loading-text">Loading…</span></div>
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Name</th><th>Category</th><th>Versions</th><th>Active</th><th>Visibility</th></tr>
              </thead>
              <tbody>
                {documents.length === 0 ? (
                  <tr><td colSpan={5}>
                    <div className="empty-state">
                      <div className="empty-icon"><FileText size={28} /></div>
                      <div className="empty-title">No documents yet</div>
                      <div className="empty-desc">Upload drawings, contracts, BOQs, and other project files</div>
                    </div>
                  </td></tr>
                ) : (() => {
                  const start = page * itemsPerPage;
                  const paginatedDocs = documents.slice(start, start + itemsPerPage);
                  return paginatedDocs.map(d => (
                    <tr key={d._id}>
                      <td>
                        <div style={{ fontWeight:600 }}>{d.name}</div>
                        {d.versions?.[0]?.notes && (
                          <div style={{ fontSize:11.5, color:'var(--t3)', marginTop:2 }}>{d.versions[0].notes}</div>
                        )}
                      </td>
                      <td><span className={`badge ${CAT_BADGE[d.category]||'badge-gray'}`}>{d.category}</span></td>
                      <td style={{ color:'var(--t2)', fontWeight:600 }}>
                        {d.versions?.length ?? 0}
                      </td>
                      <td style={{ color:'var(--t3)', fontFamily:'monospace', fontSize:12.5 }}>
                        v{d.activeVersion ?? 1}
                      </td>
                      <td>
                        {d.sharedWithClient
                          ? <span className="badge badge-green" style={{ display:'inline-flex', alignItems:'center', gap:4 }}>
                              <Eye size={11} /> Client
                            </span>
                          : <span className="badge badge-gray" style={{ display:'inline-flex', alignItems:'center', gap:4 }}>
                              <EyeOff size={11} /> Private
                            </span>
                        }
                      </td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
          </div>
          <TablePagination
            total={documents.length}
            page={page}
            itemsPerPage={itemsPerPage}
            onPageChange={setPage}
            onItemsPerPageChange={(n) => { setItemsPerPage(n); setPage(0); }}
          />
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <h2>Upload Document</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <form id="doc-form" onSubmit={handleUpload}>
                <div className="form-group">
                  <label className="form-label">Document Name *</label>
                  <input className="form-input" value={form.name} onChange={set('name')} required placeholder="e.g. Ground Floor Layout Plan" />
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-input" value={form.category} onChange={set('category')}>
                    {['drawing','layout','structural','mep','boq','contract','permit','photo','inspection','other'].map(c => (
                      <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">File</label>
                  <input className="form-input" type="file" onChange={e => setFile(e.target.files[0])}
                    style={{ paddingTop:6, paddingBottom:6 }} />
                </div>
                <div className="form-group mb-0">
                  <label className="form-label">Notes</label>
                  <textarea className="form-input" rows={2} value={form.notes} onChange={set('notes')} placeholder="Version notes or description…" />
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" type="submit" form="doc-form"><Upload size={14} /> Upload</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
