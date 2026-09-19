import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function ErrorState({ error, onRetry }) {
  return (
    <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem', border: '1px solid rgba(244, 63, 94, 0.3)' }}>
      <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(244, 63, 94, 0.1)', color: 'var(--accent-rose)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
        <AlertTriangle size={24} />
      </div>
      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
        Audit Operation Encountered an Error
      </h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '450px', margin: '0 auto 1.5rem', fontFamily: 'var(--font-mono)' }}>
        {error || 'Unable to communicate with the VISH backend services.'}
      </p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn btn-secondary btn-sm">
          <RefreshCw size={14} /> Retry Request
        </button>
      )}
    </div>
  );
}
