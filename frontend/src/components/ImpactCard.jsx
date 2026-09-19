import React from 'react';
import { DollarSign, Clock, AlertTriangle } from 'lucide-react';
import { formatCurrency, formatTime } from '../utils/formatters';

export default function ImpactCard({ estimatedCost = 0, estimatedMinutes = 0 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', width: '100%' }}>
      {/* Extra Dollar Cost */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
        <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(255, 87, 51, 0.12)', color: 'var(--accent-coral)' }}>
          <DollarSign size={24} />
        </div>
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Estimated Extra Cost
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
            {formatCurrency(estimatedCost)}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
            Undisclosed fees & auto-renewals
          </div>
        </div>
      </div>

      {/* Extra Time Lost */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
        <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(56, 189, 248, 0.12)', color: 'var(--accent-blue)' }}>
          <Clock size={24} />
        </div>
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Estimated Time Lost
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
            {formatTime(estimatedMinutes)}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
            Forced steps & friction loops
          </div>
        </div>
      </div>
    </div>
  );
}
