import React from 'react';
import { ShieldAlert, AlertCircle, Camera, CheckCircle2, MapPin, Sparkles } from 'lucide-react';
import { formatConfidence } from '../utils/formatters';

export default function ReceiptItem({ item }) {
  return (
    <div className="receipt-item-row" style={{ flexDirection: 'column', gap: '0.65rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <span style={{ color: 'var(--accent-coral)', fontWeight: 700 }}>#{item.step_number.toString().padStart(2, '0')}</span>
          <span style={{ color: '#F8FAFC', fontWeight: 600, fontSize: '0.95rem' }}>{item.pattern_name}</span>
          
          {item.analysis_source === 'gemini_vision' && (
            <span className="badge badge-coral" style={{ fontSize: '0.6rem', padding: '0.1rem 0.4rem' }}>
              <Sparkles size={10} /> Gemini Vision
            </span>
          )}
          
          {item.needs_human_review ? (
            <span className="badge badge-amber" style={{ fontSize: '0.65rem', padding: '0.15rem 0.45rem' }}>
              Needs Human Review
            </span>
          ) : (
            <span className="badge badge-emerald" style={{ fontSize: '0.65rem', padding: '0.15rem 0.45rem' }}>
              Verified
            </span>
          )}
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-coral)', fontSize: '1rem' }}>
          +{item.score_contribution} pts
        </div>
      </div>

      {item.location && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <MapPin size={12} color="var(--accent-coral)" />
          <span>Location: <strong style={{ color: 'var(--text-secondary)' }}>{item.location}</strong></span>
        </div>
      )}

      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.4, margin: 0 }}>
        <strong>Why it matters:</strong> {item.description}
      </p>

      <div style={{ width: '100%', padding: '0.5rem 0.75rem', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '4px', borderLeft: '2px solid var(--accent-coral)', fontSize: '0.75rem', color: '#CBD5E1' }}>
        <strong style={{ color: 'var(--accent-coral)' }}>Evidence:</strong> {item.evidence}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '0.7rem', color: 'var(--text-muted)', flexWrap: 'wrap', gap: '0.5rem' }}>
        <span>Confidence: <strong style={{ color: 'var(--text-secondary)' }}>{formatConfidence(item.confidence)}</strong></span>
        <span>Rubric: Published Methodology</span>
      </div>
    </div>
  );
}
