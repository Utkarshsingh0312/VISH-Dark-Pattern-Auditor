import React from 'react';
import { formatScore } from '../utils/formatters';

export default function FrictionScore({ score = 0, size = 'default', label = 'Friction Score', isBlocked = false }) {
  const numScore = formatScore(score);

  // Color mapping based on PPT calibration
  // Honest ~6 (green/blue), Average ~18 (amber), Dark Pattern ~37 (coral/red)
  const getColor = (s) => {
    if (isBlocked) return { main: 'var(--accent-amber)', text: '#F59E0B', border: 'rgba(245, 158, 11, 0.4)' };
    if (s <= 10) return { main: 'var(--accent-emerald)', text: '#10B981', border: 'rgba(16, 185, 129, 0.4)' };
    if (s <= 22) return { main: 'var(--accent-amber)', text: '#F59E0B', border: 'rgba(245, 158, 11, 0.4)' };
    return { main: 'var(--accent-coral)', text: '#FF5733', border: 'rgba(255, 87, 51, 0.5)' };
  };

  const color = getColor(numScore);
  const isLarge = size === 'large';

  return (
    <div style={{ textAlign: 'center' }}>
      <div
        className="score-circle"
        style={{
          width: isLarge ? '180px' : '130px',
          height: isLarge ? '180px' : '130px',
          borderColor: color.main,
          boxShadow: `0 0 25px ${color.border}`,
          backgroundColor: 'rgba(11, 15, 25, 0.8)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {isBlocked ? (
          <>
            <span
              className="score-value"
              style={{
                fontSize: isLarge ? '1.8rem' : '1.35rem',
                color: color.text,
                fontWeight: 800,
                letterSpacing: '0.05em'
              }}
            >
              BLOCKED
            </span>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Anti-Bot Active
            </span>
          </>
        ) : (
          <>
            <span
              className="score-value"
              style={{
                fontSize: isLarge ? '3.5rem' : '2.5rem',
                color: color.text
              }}
            >
              {numScore}
            </span>
            <span className="score-max" style={{ fontSize: isLarge ? '1rem' : '0.85rem' }}>
              / 45
            </span>
          </>
        )}
      </div>

      <div style={{ marginTop: '0.85rem' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)' }}>
          {isBlocked ? 'Audit Blocked' : label}
        </span>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
          {isBlocked ? 'Security Barrier Encountered (0/45 Not Certified)' : 'Published PPT Rubric Scale (0–45)'}
        </p>
      </div>
    </div>
  );
}
