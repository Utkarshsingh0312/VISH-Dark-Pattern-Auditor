import React from 'react';
import { AlertTriangle, UserCheck, ShieldAlert, CheckCircle, Sparkles, MapPin } from 'lucide-react';
import { formatConfidence } from '../utils/formatters';

export default function PatternFeed({ detections = [] }) {
  return (
    <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <ShieldAlert size={18} color="var(--accent-coral)" />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Detected Dark Patterns</h3>
        </div>
        <span className="badge badge-coral" style={{ fontFamily: 'var(--font-mono)' }}>
          {detections.length} Identified
        </span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {detections.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            <CheckCircle size={36} color="var(--border-highlight)" style={{ margin: '0 auto 0.75rem' }} />
            <p style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>No patterns detected</p>
            <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
              Gemini Vision classifies screenshots against the 4 core manipulation categories (Hidden Cost, Forced Re-auth, Confirmshaming, Roach Motel).
            </p>
          </div>
        ) : (
          detections.map((item, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: 'var(--bg-main)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                transition: 'border-color 0.2s ease'
              }}
            >
              {/* Pattern Title & Score */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                      backgroundColor: 'var(--bg-card)',
                      padding: '0.15rem 0.45rem',
                      borderRadius: '4px'
                    }}
                  >
                    Step {item.step_number}
                  </span>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                    {item.pattern_name}
                  </span>
                  {item.analysis_source === 'gemini_vision' ? (
                    <span className="badge badge-coral" style={{ fontSize: '0.6rem', padding: '0.1rem 0.4rem' }}>
                      <Sparkles size={10} /> Gemini Flash
                    </span>
                  ) : (
                    <span className="badge badge-blue" style={{ fontSize: '0.6rem', padding: '0.1rem 0.4rem' }}>
                      Mock Analysis
                    </span>
                  )}
                </div>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    color: 'var(--accent-coral)'
                  }}
                >
                  +{item.score_contribution} pts
                </span>
              </div>

              {/* Location Tag */}
              {item.location && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  <MapPin size={12} color="var(--accent-coral)" />
                  <span>Where: <strong style={{ color: 'var(--text-secondary)' }}>{item.location}</strong></span>
                </div>
              )}

              {/* Why (Explanation) */}
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', lineHeight: 1.4 }}>
                <strong>Why:</strong> {item.description}
              </p>

              {/* Quoted Evidence */}
              <div
                style={{
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-muted)',
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  padding: '0.4rem 0.6rem',
                  borderRadius: '4px',
                  marginBottom: '0.5rem',
                  borderLeft: '2px solid var(--accent-coral)'
                }}
              >
                <strong style={{ color: 'var(--accent-coral)' }}>Evidence:</strong> {item.evidence}
              </div>

              {/* Validation Loop / Confidence */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', flexWrap: 'wrap', gap: '0.4rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>
                  Vision Confidence: <strong style={{ color: 'var(--text-secondary)' }}>{formatConfidence(item.confidence)}</strong>
                </span>

                {item.needs_human_review ? (
                  <span className="badge badge-amber" style={{ fontSize: '0.65rem', padding: '0.2rem 0.5rem' }}>
                    <UserCheck size={12} /> Needs Human Review (&lt; 80%)
                  </span>
                ) : (
                  <span className="badge badge-emerald" style={{ fontSize: '0.65rem', padding: '0.2rem 0.5rem' }}>
                    High Confidence
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
