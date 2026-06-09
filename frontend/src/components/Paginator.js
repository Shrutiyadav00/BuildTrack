import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// ── Reusable Paginator ────────────────────────────────────────────────────────
// Props:
//   page            — current page (1-based)
//   total           — total number of items
//   pageSize        — items per page
//   onPageChange    — (newPage: number) => void
//   onPageSizeChange— (newSize: number) => void
//   sizeOptions     — page size choices (default: [10, 25, 50, 100])
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_SIZES = [10, 25, 50, 100];

export default function Paginator({
  page,
  total,
  pageSize,
  onPageChange,
  onPageSizeChange,
  sizeOptions = DEFAULT_SIZES,
}) {
  if (!total || total <= 0) return null;

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = (page - 1) * pageSize + 1;
  const to   = Math.min(page * pageSize, total);

  const btnBase = {
    width: 30, height: 30,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: '1px solid var(--border)', borderRadius: 'var(--r)',
    background: 'var(--white)', cursor: 'pointer', transition: 'all 0.15s',
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '10px 16px', borderTop: '1px solid var(--border)',
      background: 'var(--bg)', gap: 12, flexWrap: 'wrap',
    }}>
      {/* Left — entry range */}
      <span style={{ fontSize: 12, color: 'var(--t3)' }}>
        Showing{' '}
        <strong style={{ color: 'var(--t1)' }}>{from}</strong>
        {' – '}
        <strong style={{ color: 'var(--t1)' }}>{to}</strong>
        {' of '}
        <strong style={{ color: 'var(--t1)' }}>{total}</strong>
        {' entries'}
      </span>

      {/* Right — rows per page + nav */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Rows per page */}
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--t3)', whiteSpace: 'nowrap' }}>
          Rows per page
          <select
            value={pageSize}
            onChange={e => {
              onPageSizeChange(Number(e.target.value));
              onPageChange(1);
            }}
            style={{
              padding: '4px 6px',
              border: '1px solid var(--border)',
              borderRadius: 'var(--r)',
              fontSize: 12,
              color: 'var(--t1)',
              fontWeight: 600,
              background: 'var(--white)',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            {sizeOptions.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>

        {/* Divider */}
        <div style={{ width: 1, height: 20, background: 'var(--border)' }} />

        {/* Page indicator */}
        <span style={{ fontSize: 12, color: 'var(--t3)', whiteSpace: 'nowrap' }}>
          Page <strong style={{ color: 'var(--t1)' }}>{page}</strong> of <strong style={{ color: 'var(--t1)' }}>{totalPages}</strong>
        </span>

        {/* Prev / Next buttons */}
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            style={{ ...btnBase, opacity: page <= 1 ? 0.35 : 1, cursor: page <= 1 ? 'not-allowed' : 'pointer', color: 'var(--t2)' }}
          >
            <ChevronLeft size={14} />
          </button>
          <button
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            style={{ ...btnBase, opacity: page >= totalPages ? 0.35 : 1, cursor: page >= totalPages ? 'not-allowed' : 'pointer', color: 'var(--t2)' }}
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
