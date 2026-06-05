import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

const UNITS = ['nos', 'bags', 'kg', 'sqft', 'rft', 'liters', 'ton', 'cubic ft'];

const emptyRow = () => ({ name: '', qty: '', unit: 'nos', rate: '', total: 0 });

export default function POLineItems({ items = [], onChange, readOnly = false }) {

  const update = (idx, field, val) => {
    const next = items.map((r, i) => {
      if (i !== idx) return r;
      const updated = { ...r, [field]: val };
      updated.total = (parseFloat(updated.qty) || 0) * (parseFloat(updated.rate) || 0);
      return updated;
    });
    onChange(next);
  };

  const addRow    = () => onChange([...items, emptyRow()]);
  const removeRow = (idx) => onChange(items.filter((_, i) => i !== idx));

  const subtotal = items.reduce((s, r) => s + (r.total || 0), 0);
  const fmt = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;

  const cellStyle = {
    padding: '6px 8px',
    fontSize: 13,
    border: '1px solid var(--border)',
    background: 'var(--white)',
  };
  const inputStyle = {
    width: '100%', border: 'none', background: 'transparent',
    fontSize: 13, color: 'var(--t1)', outline: 'none',
  };

  return (
    <div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: 'var(--bg)' }}>
            {['#', 'Item Name', 'Qty', 'Unit', 'Rate (₹)', 'Total', !readOnly && ''].filter(Boolean).map(h => (
              <th key={h} style={{ ...cellStyle, fontWeight: 700, fontSize: 12, color: 'var(--t2)', textAlign: h === 'Total' || h === 'Rate (₹)' ? 'right' : 'left' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((row, i) => (
            <tr key={i}>
              <td style={{ ...cellStyle, width: 32, color: 'var(--t3)', textAlign: 'center' }}>{i + 1}</td>
              <td style={{ ...cellStyle, minWidth: 160 }}>
                {readOnly ? row.name : (
                  <input style={inputStyle} value={row.name} placeholder="Item description"
                    onChange={e => update(i, 'name', e.target.value)} />
                )}
              </td>
              <td style={{ ...cellStyle, width: 70 }}>
                {readOnly ? row.qty : (
                  <input style={inputStyle} value={row.qty} type="number" min="0" placeholder="0"
                    onChange={e => update(i, 'qty', e.target.value)} />
                )}
              </td>
              <td style={{ ...cellStyle, width: 90 }}>
                {readOnly ? row.unit : (
                  <select style={{ ...inputStyle, cursor: 'pointer' }} value={row.unit}
                    onChange={e => update(i, 'unit', e.target.value)}>
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                )}
              </td>
              <td style={{ ...cellStyle, width: 110, textAlign: 'right' }}>
                {readOnly ? fmt(row.rate) : (
                  <input style={{ ...inputStyle, textAlign: 'right' }} value={row.rate} type="number" min="0" placeholder="0"
                    onChange={e => update(i, 'rate', e.target.value)} />
                )}
              </td>
              <td style={{ ...cellStyle, width: 110, textAlign: 'right', fontWeight: 600 }}>{fmt(row.total)}</td>
              {!readOnly && (
                <td style={{ ...cellStyle, width: 36, textAlign: 'center' }}>
                  <button onClick={() => removeRow(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', padding: 2 }}>
                    <Trash2 size={14} />
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {!readOnly && (
        <button onClick={addRow} style={{
          marginTop: 8, display: 'flex', alignItems: 'center', gap: 6,
          background: 'none', border: '1px dashed var(--border)', borderRadius: 'var(--r)',
          padding: '6px 14px', cursor: 'pointer', fontSize: 13, color: 'var(--primary)', width: '100%',
          justifyContent: 'center',
        }}>
          <Plus size={14} /> Add Item
        </button>
      )}

      <div style={{ marginTop: 12, textAlign: 'right', fontSize: 13, color: 'var(--t2)' }}>
        Subtotal: <strong style={{ color: 'var(--t1)', marginLeft: 8 }}>{fmt(subtotal)}</strong>
      </div>
    </div>
  );
}
