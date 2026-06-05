import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

const PAGE_SIZES = [5, 10, 25, 50];

const btnStyle = (disabled) => ({
  padding: '6px 12px',
  border: '1.5px solid var(--border)',
  borderRadius: 'var(--r-md)',
  background: 'var(--white)',
  cursor: disabled ? 'not-allowed' : 'pointer',
  opacity: disabled ? 0.5 : 1,
  fontSize: 12,
  fontWeight: 600,
  color: 'var(--t1)',
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  transition: 'all 0.2s',
});

const selectStyle = {
  padding: '6px 10px',
  border: '1.5px solid var(--border)',
  borderRadius: 'var(--r-md)',
  background: 'var(--white)',
  fontSize: 12,
  fontWeight: 600,
  color: 'var(--t1)',
  cursor: 'pointer',
  minWidth: 64,
};

export default function TablePagination({
  total,
  page,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  pageSizes = PAGE_SIZES,
}) {
  const { t } = useSettings();

  if (total <= 0) return null;

  const from = page * itemsPerPage + 1;
  const to = Math.min((page + 1) * itemsPerPage, total);
  const canPrev = page > 0;
  const canNext = (page + 1) * itemsPerPage < total;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px',
        borderTop: '1px solid var(--border)',
        gap: 16,
        flexWrap: 'wrap',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <label style={{ fontSize: 12, color: 'var(--t3)', fontWeight: 600, whiteSpace: 'nowrap' }}>
          {t('itemsPerPage')}:
        </label>
        <select
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          style={selectStyle}
          aria-label={t('itemsPerPage')}
        >
          {pageSizes.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>

      <span style={{ fontSize: 12, color: 'var(--t3)', fontWeight: 500 }}>
        {t('showing')} {from}–{to} {t('of')} {total}
      </span>

      <div style={{ display: 'flex', gap: 8 }}>
        <button
          type="button"
          onClick={() => onPageChange(Math.max(0, page - 1))}
          disabled={!canPrev}
          style={btnStyle(!canPrev)}
        >
          <ChevronLeft size={14} /> {t('prev')}
        </button>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={!canNext}
          style={btnStyle(!canNext)}
        >
          {t('next')} <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
