import React, { useState } from 'react';
import { Play, Sparkles, Globe, ArrowRight } from 'lucide-react';
import { BACKEND_BASE } from '../services/api';

export default function AuditInput({ onStartAudit, onStartDemo, isLoading }) {
  const [url, setUrl] = useState('');
  const fixtureBase = BACKEND_BASE || 'http://127.0.0.1:8000';

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
        <button
          type="button"
          onClick={() => onStartDemo('blocked_challenge_flow')}
          className="btn btn-secondary btn-sm"
          disabled={isLoading}
          style={{ borderColor: 'rgba(245, 158, 11, 0.4)', color: '#FCD34D' }}
        >
          <Play size={13} fill="currentColor" /> Security Challenge (Blocked Demo)
        </button>
      </div>

      <div style={{ marginTop: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Live Test Fixtures:
        </span>
        <button
          type="button"
          onClick={() => setUrl(`${fixtureBase}/api/mock_sites/hidden_cost_test.html`)}
          className="badge badge-coral"
          style={{ cursor: 'pointer', border: '1px solid rgba(255, 87, 51, 0.4)', background: 'var(--accent-coral-glow)' }}
          title="Audit Hidden Cost ($4.99 fee at review)"
        >
          Hidden Cost (12 pts)
        </button>
        <button
          type="button"
          onClick={() => setUrl(`${fixtureBase}/api/mock_sites/forced_reauth_test.html`)}
          className="badge badge-amber"
          style={{ cursor: 'pointer', border: '1px solid rgba(245, 158, 11, 0.4)' }}
          title="Audit Forced Re-auth (Password re-entry after total)"
        >
          Forced Re-auth (8 pts)
        </button>
        <button
          type="button"
          onClick={() => setUrl(`${fixtureBase}/api/mock_sites/confirmshaming_test.html`)}
          className="badge badge-blue"
          style={{ cursor: 'pointer', border: '1px solid rgba(56, 189, 248, 0.4)' }}
          title="Audit Confirmshaming (Coercive decline language)"
        >
          Confirmshaming (7 pts)
        </button>
        <button
          type="button"
          onClick={() => setUrl(`${fixtureBase}/api/mock_sites/roach_motel_test.html`)}
          className="badge badge-rose"
          style={{ cursor: 'pointer', border: '1px solid rgba(244, 63, 94, 0.4)' }}
          title="Audit Roach Motel (1-click signup vs phone/mail cancel)"
        >
          Roach Motel (10 pts)
        </button>
        <button
          type="button"
          onClick={() => setUrl(`${fixtureBase}/api/mock_sites/security_challenge_fixture.html`)}
          className="badge badge-amber"
          style={{ cursor: 'pointer', border: '1px solid rgba(245, 158, 11, 0.5)', background: 'rgba(245, 158, 11, 0.15)', color: '#FCD34D' }}
          title="Audit Turnstile / Cloudflare Challenge (Blocked)"
        >
          Cloudflare Turnstile (Blocked)
        </button>
        <button
          type="button"
          onClick={() => setUrl(`${fixtureBase}/api/mock_sites/perimeterx_fixture.html`)}
          className="badge badge-amber"
          style={{ cursor: 'pointer', border: '1px solid rgba(245, 158, 11, 0.5)', background: 'rgba(245, 158, 11, 0.15)', color: '#FCD34D' }}
          title="Audit PerimeterX / Bot Detection (#px-captcha)"
        >
          PerimeterX (Blocked)
        </button>
        <button
          type="button"
          onClick={() => setUrl(`${fixtureBase}/api/mock_sites/http_403_blocked.html`)}
          className="badge badge-amber"
          style={{ cursor: 'pointer', border: '1px solid rgba(245, 158, 11, 0.5)', background: 'rgba(245, 158, 11, 0.15)', color: '#FCD34D' }}
          title="Audit HTTP 403 Forbidden Response (Blocked)"
        >
          HTTP 403 (Blocked)
        </button>
        <button
          type="button"
          onClick={() => setUrl('https://www.wikipedia.org')}
          className="badge badge-emerald"
          style={{ cursor: 'pointer', border: '1px solid rgba(16, 185, 129, 0.4)' }}
          title="Audit Clean Site Flow (Wikipedia)"
        >
          Wikipedia (0 pts)
        </button>
      </div>
    </div>
  );
}
