import React, { useState } from 'react';
import { Play, Sparkles, Globe, ArrowRight } from 'lucide-react';

export default function AuditInput({ onStartAudit, onStartDemo, isLoading }) {
  const [url, setUrl] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!url.trim()) return;
    onStartAudit(url.trim());
  };

  return (
    <div style={{ marginBottom: '2rem' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
          <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
            <Globe size={18} />
          </div>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste a public signup or checkout URL..."
            required
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '0.95rem 1rem 0.95rem 2.85rem',
              backgroundColor: 'var(--bg-surface)',
              border: '1.5px solid var(--border-subtle)',
              borderRadius: 'var(--radius-full)',
              color: 'var(--text-primary)',
              fontSize: '1rem',
              outline: 'none',
              transition: 'border-color 0.2s ease',
              fontFamily: 'var(--font-sans)'
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--accent-coral)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border-subtle)'}
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={isLoading || !url.trim()}
          style={{ opacity: isLoading ? 0.7 : 1, minWidth: '150px' }}
        >
          {isLoading ? 'Auditing...' : (
            <>
              Start Audit <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>

      <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Sparkles size={15} color="var(--accent-coral)" /> Or try a pre-calibrated demo flow:
        </span>
        <button
          type="button"
          onClick={() => onStartDemo('dark_pattern_flow')}
          className="btn btn-secondary btn-sm"
          disabled={isLoading}
        >
          <Play size={13} fill="currentColor" /> Known Dark-Pattern Flow (Target 37)
        </button>
        <button
          type="button"
          onClick={() => onStartDemo('honest_flow')}
          className="btn btn-secondary btn-sm"
          disabled={isLoading}
        >
          <Play size={13} fill="currentColor" /> Honest / One-Click Flow (Target 6)
        </button>
      </div>
    </div>
  );
}
