import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Eye, 
  FileCheck2, 
  Clock
} from 'lucide-react';

export default function LiveAuditPreview() {
  return (
    <div className="audit-preview-container" aria-label="Live Audit Intelligence Preview">
      {/* Top Console Bar */}
      <div className="audit-preview-header">
        <div className="audit-preview-window-dots">
          <span className="window-dot dot-red" />
          <span className="window-dot dot-yellow" />
          <span className="window-dot dot-green" />
        </div>
        
        <div className="audit-preview-url-bar">
          <span className="audit-preview-lock">🔒</span>
          <span className="audit-preview-url-text">tabletopterrain.com/checkout</span>
          <span className="audit-preview-badge-live">
            <span className="live-pulse-dot" />
            <span>LIVE AUDIT</span>
          </span>
        </div>

        <div className="audit-preview-actions">
          <span className="audit-preview-timestamp">STEP 02/03</span>
        </div>
      </div>

      {/* Main Preview Grid */}
      <div className="audit-preview-body">
        {/* Left Side: Telemetry & Detections */}
        <div className="audit-preview-left">
          {/* Scoring Header */}
          <div className="audit-preview-score-row">
            <div>
              <div className="preview-label">CALCULATED FRICTION SCORE</div>
              <div className="preview-score-val">
                <span className="score-num">07</span>
                <span className="score-denom">/ 45</span>
              </div>
            </div>
            
            <div className="preview-status-pill pill-warning">
              <ShieldAlert size={14} />
              <span>CONFIRMED VIOLATION</span>
            </div>
          </div>

          {/* Metric telemetry counters */}
          <div className="audit-preview-metrics">
            <div className="preview-metric-box">
              <div className="preview-metric-label">Taxonomy Risk</div>
              <div className="preview-metric-value text-coral">Confirmshaming</div>
            </div>
            <div className="preview-metric-box">
              <div className="preview-metric-label">Confidence</div>
              <div className="preview-metric-value text-blue">98.4% (Gemini)</div>
            </div>
            <div className="preview-metric-box">
              <div className="preview-metric-label">Payment Safety</div>
              <div className="preview-metric-value text-emerald">Enforced (0-Charge)</div>
            </div>
          </div>

          {/* Detected Patterns List */}
          <div className="preview-detections-list">
            <div className="preview-section-title">
              <span>DETECTED PATTERN EVIDENCE</span>
              <span className="preview-section-tag">Rubric: +7 Pts</span>
            </div>

            <div className="preview-pattern-item active-pattern">
              <div className="pattern-item-header">
                <span className="pattern-indicator dot-coral" />
                <span className="pattern-item-title">Confirmshaming Manipulation</span>
                <span className="pattern-badge-category">Decline Path</span>
              </div>
              <p className="pattern-item-quote">
                &ldquo;No, Thanks! I'll pay full price.&rdquo;
              </p>
              <div className="pattern-item-sub">
                Targeted opt-out guilt framing on 15% discount modal prior to checkout transition.
              </div>
            </div>

            <div className="preview-pattern-item clean-pattern">
              <div className="pattern-item-header">
                <span className="pattern-indicator dot-emerald" />
                <span className="pattern-item-title">Hidden Cost Evaluation</span>
                <span className="pattern-badge-clean">CLEAN</span>
              </div>
              <div className="pattern-item-sub">
                No unannounced packaging or service surcharges injected at checkout step.
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Visual Evidence & Viewport Inspection */}
        <div className="audit-preview-right">
          <div className="viewport-card">
            <div className="viewport-header">
              <div className="viewport-title-group">
                <Eye size={14} className="text-coral" />
                <span>MULTIMODAL VIEWPORT EXTRACTION</span>
              </div>
              <span className="viewport-badge">1280x800 Chromium</span>
            </div>

            {/* Viewport Screen Simulation */}
            <div className="viewport-canvas-mock">
              <div className="mock-scan-sweep" />
              
              <div className="mock-modal-overlay">
                <div className="mock-modal-box">
                  <div className="mock-badge-tag">EXCLUSIVE OFFER</div>
                  <div className="mock-headline">YOU'VE GOT 15% OFF</div>
                  <div className="mock-subtext">Enter your email to unlock your private discount code.</div>
                  
                  <div className="mock-input-field">
                    <span>user@example.com</span>
                  </div>
                  
                  <div className="mock-primary-btn">
                    CLAIM THE DISCOUNT
                  </div>

                  {/* Highlighted Dark Pattern Element */}
                  <div className="mock-decline-callout">
                    <div className="callout-bounding-box" />
                    <span className="callout-text">&ldquo;No, Thanks! I'll pay full price.&rdquo;</span>
                    <span className="callout-pin">CONFIRMSHAMING DETECTED</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Invariant / Evidence Proof */}
            <div className="viewport-footer">
              <div className="footer-proof-item">
                <FileCheck2 size={13} className="text-blue" />
                <span>Forensic Receipt Generated</span>
              </div>
              <div className="footer-proof-item">
                <Clock size={13} className="text-muted" />
                <span>0.8s Classification Pacing</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Telemetry Strip */}
      <div className="audit-preview-footer-strip">
        <div className="footer-telemetry-col">
          <span className="telemetry-dim">AI VISION ENGINE:</span>
          <span className="telemetry-bright">GEMINI 2.5 FLASH MULTIMODAL</span>
        </div>
        <div className="footer-telemetry-col">
          <span className="telemetry-dim">SAFETY INVARIANT:</span>
          <span className="telemetry-bright text-emerald">AUTO-STOP BEFORE PAYMENT GATEWAY</span>
        </div>
        <div className="footer-telemetry-col">
          <span className="telemetry-dim">EVIDENCE ADMISSIBILITY:</span>
          <span className="telemetry-bright">CERTIFIED FTC TAXONOMY RECEIPT</span>
        </div>
      </div>
    </div>
  );
}
