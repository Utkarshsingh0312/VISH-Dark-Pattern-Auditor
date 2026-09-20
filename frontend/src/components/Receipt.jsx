import React from 'react';
import ReceiptItem from './ReceiptItem';
import { FileText, CheckCircle2, Shield, Camera, AlertOctagon, Sparkles, Clock, Lock } from 'lucide-react';
import { formatScore, formatCurrency, formatTime } from '../utils/formatters';
import { getScreenshotUrl } from '../services/api';

export default function Receipt({ result }) {
  const {
    audit_id = 'N/A',
    url = 'Unknown Target',
    audit_type = 'Checkout',
    friction_score = null,
    detections = [],
    estimated_cost = 0,
    estimated_time = 0,
    steps = [],
    is_demo = false,
    is_live_crawl = false,
    vision_source = 'pending',
    stopped_for_safety = false,
    is_blocked = false,
    block_reason = null,
    security_barrier = null,
    created_at = null,
    completed_at = null
  } = result || {};

  const formattedDate = created_at ? new Date(created_at).toLocaleString() : new Date().toLocaleString();

  const getSourceBadge = () => {
    if (is_blocked || vision_source === "blocked") {
      return { text: "AUDIT BLOCKED", color: "badge-amber", icon: AlertOctagon };
    }
    if (is_demo) return { text: "Verified Demo Flow", color: "badge-blue" };
    if (vision_source === "gemini_vision") return { text: "Real Gemini Vision AI", color: "badge-coral", icon: Sparkles };
    return { text: "Mock Vision Fallback", color: "badge-blue" };
  };

  const badge = getSourceBadge();
  const BadgeIcon = badge.icon;

  return (
    <div className="receipt-paper">
      {/* Receipt header */}
      <div className="receipt-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', letterSpacing: '0.15em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            AUDIT RECEIPT
          </span>
          <span
            className={`badge ${badge.color}`}
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.05em',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              border: is_blocked ? '1px solid rgba(245, 158, 11, 0.6)' : undefined,
              backgroundColor: is_blocked ? 'rgba(245, 158, 11, 0.18)' : undefined,
              color: is_blocked ? '#FCD34D' : undefined
            }}
          >
            {BadgeIcon && <BadgeIcon size={13} />}
            {badge.text}
          </span>
        </div>

        <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#F8FAFC', marginBottom: '0.35rem' }}>
          VISH AUDIT REPORT
        </h2>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', wordBreak: 'break-all' }}>
          Target: <span style={{ color: '#F8FAFC', fontWeight: 600 }}>{url}</span>
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
          <span>Scope: <strong>{audit_type}</strong></span>
          <span>Session: <strong>{audit_id}</strong></span>
          <span>Screenshots Audited: <strong>{steps.length}</strong></span>
          {created_at && <span>Timestamp: <strong>{formattedDate}</strong></span>}
          {is_blocked && security_barrier && (
            <span>Security Barrier: <strong style={{ color: '#FCD34D' }}>{security_barrier}</strong></span>
          )}
        </div>
      </div>

      {/* Blocked Challenge Callout */}
      {is_blocked && (
        <div
          style={{
            backgroundColor: 'rgba(245, 158, 11, 0.12)',
            border: '1.5px solid rgba(245, 158, 11, 0.45)',
            borderRadius: 'var(--radius-md)',
            padding: '1.1rem 1.25rem',
            marginBottom: '1.5rem',
            fontSize: '0.84rem',
            color: '#FDE68A',
            display: 'flex',
            gap: '0.85rem',
            alignItems: 'flex-start'
          }}
        >
          <AlertOctagon size={22} color="var(--accent-amber)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
              <strong style={{ fontSize: '0.95rem', color: '#FCD34D' }}>
                AUDIT BLOCKED — Security Verification Required
              </strong>
              {security_barrier && (
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    backgroundColor: 'rgba(245, 158, 11, 0.25)',
                    border: '1px solid rgba(245, 158, 11, 0.5)',
                    padding: '0.2rem 0.55rem',
                    borderRadius: '4px',
                    color: '#FDE68A'
                  }}
                >
                  {security_barrier}
                </span>
              )}
            </div>
            <p style={{ margin: '0 0 0.5rem 0', lineHeight: 1.5, color: '#F1F5F9' }}>
              <strong>Reason:</strong> {block_reason || 'The target website requires a security verification that VISH cannot bypass.'}
            </p>
            <p style={{ margin: '0 0 0.5rem 0', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
              VISH stopped safely because this website requires automated-access verification. We do not bypass security controls, so no unreliable score was generated.
            </p>
            <div style={{ fontSize: '0.75rem', color: '#CBD5E1', borderTop: '1px dashed rgba(245, 158, 11, 0.3)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
              <strong>Compliance Notice:</strong> This audit is uncertified. Under VISH compliance principles, encountering an automated security challenge is <em>NOT</em> a true negative and does not imply the site is clean or dark-pattern free.
            </div>
          </div>
        </div>
      )}

      {/* Safety Notice if stopped */}
      {stopped_for_safety && !is_blocked && (
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
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Camera size={14} color="var(--accent-coral)" />
              Playwright Viewport Evidence ({steps.length} {steps.length === 1 ? 'step' : 'steps'}{is_blocked ? ' audited before block' : ''})
            </span>
            {is_blocked && (
              <span style={{ fontSize: '0.7rem', color: 'var(--accent-amber)', fontWeight: 600 }}>
                Challenge screen captured below
              </span>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem' }}>
            {steps.map((st, idx) => {
              const isLastBlockedStep = is_blocked && (st.is_challenge || idx === steps.length - 1);
              return (
                <div
                  key={st.step_number}
                  style={{
                    backgroundColor: isLastBlockedStep ? 'rgba(245, 158, 11, 0.15)' : 'rgba(0,0,0,0.4)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.4rem',
                    border: isLastBlockedStep ? '1.5px solid rgba(245, 158, 11, 0.6)' : '1px solid var(--border-subtle)',
                    position: 'relative'
                  }}
                >
                  {isLastBlockedStep && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '6px',
                        right: '6px',
                        backgroundColor: '#F59E0B',
                        color: '#0B0F19',
                        fontSize: '0.58rem',
                        fontWeight: 800,
                        padding: '1px 5px',
                        borderRadius: '3px',
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                        zIndex: 2
                      }}
                    >
                      Barrier
                    </div>
                  )}
                  {st.screenshot_url ? (
                    <img
                      src={getScreenshotUrl(st.screenshot_url)}
                      alt={`Step ${st.step_number}`}
                      style={{ width: '100%', height: '85px', objectFit: 'cover', borderRadius: '3px', display: 'block', marginBottom: '0.35rem' }}
                    />
                  ) : (
                    <div style={{ width: '100%', height: '85px', backgroundColor: '#0B0F19', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                      Capture Step {st.step_number}
                    </div>
                  )}
                  <div style={{ fontSize: '0.65rem', color: isLastBlockedStep ? '#FCD34D' : 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: isLastBlockedStep ? 600 : 400 }}>
                    #{st.step_number} {st.action || st.title || 'Visited'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Itemized list of detections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {is_blocked ? (
          <div
            style={{
              textAlign: 'center',
              padding: '2.5rem 1.5rem',
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              border: '1px dashed rgba(245, 158, 11, 0.3)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-secondary)'
            }}
          >
            <Lock size={32} color="var(--accent-amber)" style={{ margin: '0 auto 0.75rem auto', display: 'block', opacity: 0.9 }} />
            <div style={{ fontWeight: 700, color: 'var(--accent-amber)', fontSize: '1.05rem', marginBottom: '0.4rem' }}>
              Audit Blocked — Security Verification Required
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '540px', margin: '0 auto', lineHeight: 1.5 }}>
              The target website requires a security verification that VISH cannot bypass.
              VISH stopped safely because this website requires automated-access verification.
              We do not bypass security controls, so no unreliable score was generated.
            </div>
          </div>
        ) : detections.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-secondary)' }}>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>Zero Dark Patterns Detected</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>This target site satisfied the forensic compliance rubric with no dark pattern friction identified.</div>
          </div>
        ) : (
          detections.map((item, idx) => (
            <ReceiptItem key={idx} item={item} />
          ))
        )}
      </div>

      {/* Totals & Impact */}
      <div className="receipt-total" style={{ marginTop: '1.5rem', borderTop: '2px solid var(--border-subtle)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
            TOTAL FRICTION SCORE
          </div>
          <div style={{ fontSize: '0.75rem', color: is_blocked ? 'var(--accent-amber)' : 'var(--text-muted)', fontWeight: 400 }}>
            {is_blocked ? 'No Friction Score generated (Uncertified)' : 'Published Rubric Limit: 45'}
          </div>
        </div>
        <div
          style={{
            fontSize: is_blocked ? '1.4rem' : '1.85rem',
            color: is_blocked ? 'var(--accent-amber)' : 'var(--accent-coral)',
            fontFamily: 'var(--font-mono)',
            fontWeight: 800,
            textAlign: 'right'
          }}
        >
          {is_blocked ? (
            <div>
              <span style={{ letterSpacing: '0.05em' }}>BLOCKED</span>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-sans)', fontWeight: 400 }}>
                No score generated
              </div>
            </div>
          ) : (
            <>{formatScore(friction_score)} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/ 45</span></>
          )}
        </div>
      </div>

      {/* Footer disclaimer */}
      <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
        Scores are published against our fixed, disclosed forensic rubric (Hidden Cost: 12, Forced Re-auth: 8, Confirmshaming: 7, Roach Motel: 10, Max: 45). Detections below 80% confidence are flagged for human review before final score certification.
      </div>
    </div>
  );
}
