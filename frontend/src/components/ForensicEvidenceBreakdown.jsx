import React, { useState } from 'react';
import { Camera, Search, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck, Crosshair } from 'lucide-react';

export default function ForensicEvidenceBreakdown() {
  const [activeCallout, setActiveCallout] = useState(2);

  const callouts = [
    {
      id: 1,
      tag: '[01] PRIMARY OFFER',
      title: 'Discount Hook',
      desc: '15% Off incentive displayed prominently to capture visitor email.',
      coords: 'Top modal block',
      nature: 'Standard commercial promotion'
    },
    {
      id: 2,
      tag: '[02] MANIPULINK',
      title: 'Coercive Decline Copy',
      desc: '"No, Thanks! I\'ll pay full price." implies the user is foolish for rejecting the offer.',
      coords: 'Bottom decline anchor (x:41, y:616)',
      nature: 'DARK PATTERN: Confirmshaming (+7 pts)'
    },
    {
      id: 3,
      tag: '[03] PRIMARY CTA',
      title: 'High-Contrast Action',
      desc: 'High-contrast white button designed to steer users toward immediate submission.',
      coords: 'Center modal block',
      nature: 'Asymmetric visual hierarchy'
    }
  ];

  return (
    <section className="evidence-breakdown-section">
      <div className="section-header-centered">
        <span className="section-pretitle">VISUAL INTELLIGENCE</span>
        <h2 className="section-title">From Screenshot → Forensic Evidence</h2>
        <p className="section-subtitle">
          How Gemini Vision AI parses rendered viewport pixels to isolate manipulative UX decisions with pinpoint coordinates.
        </p>
      </div>

      <div className="evidence-viewer-card card">
        <div className="evidence-grid">
          {/* Left: Interactive Bounding Box Mockup */}
          <div className="evidence-screenshot-pane">
            <div className="evidence-pane-bar">
              <span className="pane-title font-mono">VIEWPORT EVIDENCE: TABLETOP TERRAIN (STEP #01)</span>
              <span className="pane-status">STATUS: CERTIFIED</span>
            </div>

            <div className="screenshot-display-area">
              <div className="simulated-screenshot-bg">
                {/* Visual Representation of the Captured Modal */}
                <div className="forensic-modal-overlay">
                  <div className="forensic-callout callout-1" onClick={() => setActiveCallout(1)}>
                    <span className="callout-pill">[01]</span>
                  </div>

                  <div className="forensic-modal-content">
                    <div className="forensic-badge">YOU'VE GOT 15% OFF</div>
                    <div className="forensic-heading">WHAT INTERESTS YOU THE MOST? 👇</div>
                    
                    <div className={`forensic-callout callout-3 ${activeCallout === 3 ? 'active' : ''}`} onClick={() => setActiveCallout(3)}>
                      <button className="forensic-cta-btn">CLAIM THE DISCOUNT</button>
                      <span className="callout-pill">[03]</span>
                    </div>

                    <div className={`forensic-callout callout-2 ${activeCallout === 2 ? 'active' : ''}`} onClick={() => setActiveCallout(2)}>
                      <span className="forensic-decline-text">No, Thanks! I'll pay full price.</span>
                      <span className="callout-target-beacon"></span>
                      <span className="callout-pill alert">[02] VIOLATION</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="evidence-instruction">
              <Crosshair size={14} color="var(--accent-coral)" /> Click markers [01], [02], [03] to inspect optical bounding boxes
            </div>
          </div>

          {/* Right: Gemini Analysis Terminal Panel */}
          <div className="evidence-analysis-pane">
            <div className="analysis-header">
              <span className="font-mono" style={{ color: 'var(--accent-blue)', fontSize: '0.8rem', fontWeight: 700 }}>
                GEMINI 2.5 VISION MULTIMODAL INFERENCE
              </span>
              <span className="badge badge-coral">HIGH CONFIDENCE: 98%</span>
            </div>

            <div className="analysis-detail-box">
              <div className="detail-tag">{callouts[activeCallout - 1].tag}</div>
              <h4 className="detail-title">{callouts[activeCallout - 1].title}</h4>
              <p className="detail-desc">{callouts[activeCallout - 1].desc}</p>
              
              <div className="detail-meta-grid">
                <div>
                  <span className="meta-label">Coordinates:</span>
                  <span className="meta-val font-mono">{callouts[activeCallout - 1].coords}</span>
                </div>
                <div>
                  <span className="meta-label">Classification:</span>
                  <span className="meta-val font-mono" style={{ color: activeCallout === 2 ? 'var(--accent-coral)' : 'var(--text-primary)' }}>
                    {callouts[activeCallout - 1].nature}
                  </span>
                </div>
              </div>
            </div>

            {/* Real Gemini Prompt Schema Inspector */}
            <div className="analysis-schema-code font-mono">
              <div className="schema-comment">// Extracted Evidence Payload</div>
              <div className="schema-line">&#123;</div>
              <div className="schema-line indent">"pattern_name": <span className="str">"Confirmshaming"</span>,</div>
              <div className="schema-line indent">"confidence": <span className="num">0.98</span>,</div>
              <div className="schema-line indent">"score_contribution": <span className="num">7</span>,</div>
              <div className="schema-line indent">"evidence": <span className="str">"No, Thanks! I'll pay full price."</span>,</div>
              <div className="schema-line indent">"location": <span className="str">"Promo modal overlay footer"</span></div>
              <div className="schema-line">&#125;</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}