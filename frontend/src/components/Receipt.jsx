import React from 'react';
import ReceiptItem from './ReceiptItem';
import { FileText, CheckCircle2, Shield, Camera, AlertOctagon, Sparkles } from 'lucide-react';
import { formatScore, formatCurrency, formatTime } from '../utils/formatters';

export default function Receipt({ result }) {
  const {
    audit_id = 'N/A',
    url = 'Unknown Target',
    audit_type = 'Checkout',
    friction_score = 0,
    detections = [],
    estimated_cost = 0,
    estimated_time = 0,
    steps = [],
    is_demo = false,
    is_live_crawl = false,
    vision_source = 'pending',
    stopped_for_safety = false
  } = result || {};

  const getSourceBadge = () => {
    if (is_demo) return { text: "Demo Flow (PPT Reference)", color: "badge-blue" };
    if (vision_source === "gemini_vision") return { text: "Real Gemini Vision AI", color: "badge-coral", icon: Sparkles };
    return { text: "Mock Vision Fallback", color: "badge-blue" };
  };

  const badge = getSourceBadge();
  const BadgeIcon = badge.icon;

  return (
    <div className="receipt-paper">
      {/* Receipt header */}
      <div className="receipt-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', letterSpacing: '0.15em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            AUDIT RECEIPT
          </span>
          <span className={`badge ${badge.color}`} style={{ fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            {BadgeIcon && <BadgeIcon size={11} />}
            {badge.text}
          </span>
        </div>

        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#F8FAFC', marginBottom: '0.25rem' }}>
          VISH AUDIT REPORT
        </h2>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', wordBreak: 'break-all' }}>
          Target: <span style={{ color: '#F8FAFC' }}>{url}</span>
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <span>Scope: <strong>{audit_type}</strong></span>
          <span>Session: <strong>{audit_id}</strong></span>
          <span>Screenshots Captured: <strong>{steps.length}</strong></span>
        </div>
      </div>

      {/* Safety Notice if stopped */}
      {stopped_for_safety && (
        <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', marginBottom: '1.25rem', fontSize: '0.8rem', color: '#FCA5A5', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <AlertOctagon size={18} color="var(--accent-rose)" style={{ flexShrink: 0 }} />
          <span>
            <strong>Safety Invariant Enforced:</strong> Browser agent stopped before payment confirmation. Zero risk of unauthorized transaction.
          </span>
        </div>
      )}

      {/* Real Browser Step Screenshots Strip */}
      {steps && steps.length > 0 && steps.some(s => s.screenshot_url) && (
        <div style={{ marginBottom: '1.5rem', paddingBottom: '1.25rem', borderBottom: '1px dashed var(--border-subtle)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Camera size={14} color="var(--accent-coral)" /> Playwright Viewport Evidence ({steps.length} steps)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem' }}>
            {steps.map((st) => (
              <div key={st.step_number} style={{ backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 'var(--radius-sm)', padding: '0.4rem', border: '1px solid var(--border-subtle)' }}>
                {st.screenshot_url ? (
                  <img
                    src={st.screenshot_url}
                    alt={`Step ${st.step_number}`}
                    style={{ width: '100%', height: '85px', objectFit: 'cover', borderRadius: '3px', display: 'block', marginBottom: '0.35rem' }}
                  />
                ) : (
                  <div style={{ width: '100%', height: '85px', backgroundColor: '#0B0F19', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                    Capture Step {st.step_number}
                  </div>
                )}
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  #{st.step_number} {st.action || st.title || 'Visited'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Itemized list of detections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {detections.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-secondary)' }}>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>Zero Dark Patterns Detected</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>This target site satisfied the PPT compliance rubric with no dark pattern friction identified.</div>
          </div>
        ) : (
          detections.map((item, idx) => (
            <ReceiptItem key={idx} item={item} />
          ))
        )}
      </div>

      {/* Totals & Impact */}
      <div className="receipt-total">
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            TOTAL FRICTION SCORE
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>
            Published Rubric Limit: 45
          </div>
        </div>
        <div style={{ fontSize: '1.85rem', color: 'var(--accent-coral)', fontFamily: 'var(--font-mono)' }}>
          {formatScore(friction_score)} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/ 45</span>
        </div>
      </div>

      {/* Footer disclaimer from PPT */}
      <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
        Scores are published against the fixed, disclosed rubric from PPT Page 3. Detections below 80% confidence are flagged for human review before final score certification.
      </div>
    </div>
  );
}
