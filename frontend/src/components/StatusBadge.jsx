import React from 'react';

export default function StatusBadge({ status }) {
  const getStyle = (st) => {
    switch (st) {
      case 'Complete':
        return { bg: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)', border: 'rgba(16, 185, 129, 0.3)' };
      case 'Audit Blocked':
        return { bg: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-amber)', border: 'rgba(245, 158, 11, 0.4)' };
      case 'Failed':
        return { bg: 'rgba(244, 63, 94, 0.15)', color: 'var(--accent-rose)', border: 'rgba(244, 63, 94, 0.3)' };
      case 'Ready to audit':
        return { bg: 'rgba(148, 163, 184, 0.15)', color: 'var(--text-secondary)', border: 'rgba(148, 163, 184, 0.3)' };
      default:
        return { bg: 'var(--accent-coral-glow)', color: 'var(--accent-coral)', border: 'rgba(255, 87, 51, 0.4)', pulse: true };
    }
  };

  const style = getStyle(status);

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.35rem 0.85rem',
        borderRadius: 'var(--radius-full)',
        backgroundColor: style.bg,
        border: `1px solid ${style.border}`,
        color: style.color,
        fontSize: '0.8rem',
        fontWeight: 600,
        fontFamily: 'var(--font-mono)'
      }}
    >
      <span
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: style.color,
          boxShadow: style.pulse ? `0 0 8px ${style.color}` : 'none'
        }}
      />
      <span>{status}</span>
    </div>
  );
}
