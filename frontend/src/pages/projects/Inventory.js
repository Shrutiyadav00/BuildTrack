import React, { useEffect, useState, useCallback } from 'react';
import { Package, Plus, ArrowUp, ArrowDown, AlertTriangle, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const UNITS = ['nos', 'bags', 'kg', 'ton', 'sqft', 'rft', 'liters', 'cubic ft'];

const fmt  = (n) => (n || 0).toLocaleString('en-IN');
const inputStyle = { width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 'var(--r)', fontSize: 13, color: 'var(--t1)', background: 'var(--white)', boxSizing: 'border-box' };
const labelStyle = { fontSize: 12, fontWeight: 600, color: 'var(--t2)', marginBottom: 4, display: 'block' };

export default function Inventory({ projectId }) {
  const [items, setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]   = useState(null); // null | { type: 'add'|'edit'|'in'|'out', item? }
  const [form, setForm]     = useState({});
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    api.get(`/inventory/${projectId}`)
      .then(r => setItems(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [projectId]);

  useEffect(load, [load]);

  const set = (f, v) => setForm(prev => ({ ...prev, [f]: v }));

  const openAdd  = () => { setForm({ itemName: '', unit: 'nos', minimumStock: 0 }); setModal({ type: 'add' }); };
  const openEdit = (item) => { setForm({ itemName: item.itemName, unit: item.unit, minimumStock: item.minimumStock }); setModal({ type: 'edit', item }); };
  const openIn   = (item) => { setForm({ quantity: '', description: '' }); setModal({ type: 'in', item }); };
  const openOut  = (item) => { setForm({ quantity: '', description: '' }); setModal({ type: 'out', item }); };

  const save = async () => {
    setSaving(true);
    try {
      if (modal.type === 'add') {
        await api.post(`/inventory/${projectId}`, { ...form, minimumStock: parseInt(form.minimumStock) || 0 });
        toast.success('Item added');
      } else if (modal.type === 'edit') {
        await api.put(`/inventory/${projectId}/${modal.item._id}`, { ...form, minimumStock: parseInt(form.minimumStock) || 0 });
        toast.success('Item updated');
      } else if (modal.type === 'in') {
        await api.put(`/inventory/${projectId}/${modal.item._id}/in`, { quantity: parseFloat(form.quantity), description: form.description });
        toast.success('Stock added');
      } else if (modal.type === 'out') {
        await api.put(`/inventory/${projectId}/${modal.item._id}/out`, { quantity: parseFloat(form.quantity), description: form.description });
        toast.success('Stock consumed');
      }
      setModal(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally { setSaving(false); }
  };

  const deleteItem = async (item) => {
    if (!window.confirm(`Delete "${item.itemName}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/inventory/${projectId}/${item._id}`);
      toast.success('Item deleted');
      load();
    } catch { toast.error('Failed to delete'); }
  };

  const modalTitle = () => {
    if (!modal) return '';
    if (modal.type === 'add')  return 'Add Inventory Item';
    if (modal.type === 'edit') return `Edit: ${modal.item.itemName}`;
    if (modal.type === 'in')   return `Stock In — ${modal.item.itemName}`;
    if (modal.type === 'out')  return `Stock Out — ${modal.item.itemName}`;
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--t3)' }}>Loading inventory...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Package size={16} color="var(--primary)" />
          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--t1)' }}>Inventory</span>
          <span style={{ fontSize: 12, color: 'var(--t3)' }}>({items.length} items)</span>
        </div>
        <button onClick={openAdd} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 'var(--r)', padding: '7px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
          <Plus size={13} /> Add Item
        </button>
      </div>

      <div style={{ background: 'var(--white)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)', overflow: 'hidden' }}>
        {items.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--t3)', fontSize: 13 }}>No inventory items yet. Add materials to track stock.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
                {['Item', 'Unit', 'Current Stock', 'Min Stock', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', fontSize: 11, fontWeight: 700, color: 'var(--t3)', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => {
                const isLow = item.currentStock <= item.minimumStock;
                return (
                  <tr key={item._id} style={{ borderBottom: i < items.length - 1 ? '1px solid var(--border-light)' : 'none', background: isLow ? 'var(--warning-bg)' : 'transparent' }}>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--t1)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        {isLow && <AlertTriangle size={13} color="var(--warning)" />}
                        {item.itemName}
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: 13, color: 'var(--t3)' }}>{item.unit}</td>
                    <td style={{ padding: '12px 14px', fontSize: 16, fontWeight: 800, color: isLow ? 'var(--warning)' : 'var(--t1)' }}>
                      {fmt(item.currentStock)}
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: 13, color: 'var(--t3)' }}>{fmt(item.minimumStock)}</td>
                    <td style={{ padding: '12px 14px' }}>
                      {isLow ? (
                        <span style={{ padding: '2px 10px', borderRadius: 'var(--r-full)', fontSize: 11, fontWeight: 600, background: 'var(--warning-bg)', color: 'var(--warning)' }}>Low Stock</span>
                      ) : (
                        <span style={{ padding: '2px 10px', borderRadius: 'var(--r-full)', fontSize: 11, fontWeight: 600, background: 'var(--success-bg)', color: 'var(--success)' }}>OK</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => openIn(item)} title="Stock In" style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--success-bg)', border: 'none', borderRadius: 'var(--r)', padding: '4px 8px', cursor: 'pointer', color: 'var(--success)', fontSize: 11, fontWeight: 600 }}>
                          <ArrowUp size={11} /> In
                        </button>
                        <button onClick={() => openOut(item)} title="Stock Out" style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--warning-bg)', border: 'none', borderRadius: 'var(--r)', padding: '4px 8px', cursor: 'pointer', color: 'var(--warning)', fontSize: 11, fontWeight: 600 }}>
                          <ArrowDown size={11} /> Out
                        </button>
                        <button onClick={() => openEdit(item)} title="Edit" style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '4px 6px', cursor: 'pointer', color: 'var(--t2)' }}>
                          <Edit2 size={11} />
                        </button>
                        <button onClick={() => deleteItem(item)} title="Delete" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', padding: 4 }}>
                          <Trash2 size={12} />
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

      {/* Modal */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--white)', borderRadius: 'var(--r-lg)', padding: 28, width: '100%', maxWidth: 400 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--t1)', marginBottom: 20 }}>{modalTitle()}</h3>

            {(modal.type === 'add' || modal.type === 'edit') && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Item Name *</label>
                  <input style={inputStyle} value={form.itemName || ''} onChange={e => set('itemName', e.target.value)} placeholder="e.g. Portland Cement" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={labelStyle}>Unit</label>
                    <select style={inputStyle} value={form.unit || 'nos'} onChange={e => set('unit', e.target.value)}>
                      {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Minimum Stock</label>
                    <input type="number" min="0" style={inputStyle} value={form.minimumStock || ''} onChange={e => set('minimumStock', e.target.value)} placeholder="0" />
                  </div>
                </div>
              </div>
            )}

            {(modal.type === 'in' || modal.type === 'out') && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ padding: '10px 14px', background: 'var(--bg)', borderRadius: 'var(--r)', fontSize: 13, color: 'var(--t2)' }}>
                  Current stock: <strong style={{ color: 'var(--t1)' }}>{fmt(modal.item.currentStock)} {modal.item.unit}</strong>
                </div>
                <div>
                  <label style={labelStyle}>Quantity *</label>
                  <input type="number" min="0.01" step="0.01" style={inputStyle} value={form.quantity || ''} onChange={e => set('quantity', e.target.value)} placeholder="Enter quantity" />
                </div>
                <div>
                  <label style={labelStyle}>Description</label>
                  <input style={inputStyle} value={form.description || ''} onChange={e => set('description', e.target.value)} placeholder="Optional note..." />
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
              <button onClick={() => setModal(null)} style={{ padding: '8px 18px', border: '1px solid var(--border)', borderRadius: 'var(--r)', background: 'var(--bg)', cursor: 'pointer', fontSize: 13 }}>Cancel</button>
              <button onClick={save} disabled={saving} style={{
                padding: '8px 18px', border: 'none', borderRadius: 'var(--r)', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#fff',
                background: modal.type === 'out' ? 'var(--warning)' : modal.type === 'in' ? 'var(--success)' : 'var(--primary)',
              }}>
                {saving ? 'Saving...' : modal.type === 'in' ? 'Add Stock' : modal.type === 'out' ? 'Consume Stock' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
