import React from 'react';
import { Link } from 'react-router-dom';
import { Terminal, ShieldCheck, ArrowRight, CheckCircle2, FileText, Lock } from 'lucide-react';

export default function ReceiptPreview() {
  return (
    <section className="receipt-preview-section">
      <div className="section-header-centered">
        <span className="section-pretitle">THE ARTIFACT</span>
        <h2 className="section-title">The Scored Compliance Receipt</h2>
        <p className="section-subtitle">
          Every audit produces a cryptographic forensic receipt itemizing each caught manipulation, visual evidence, and total friction score.
        </p>
      </div>

      <div className="receipt-container-card">
        <div className="receipt-paper">
          {/* Top Jagged Receipt Border */}
          <div className="receipt-header-strip">
            <div className="receipt-barcode">||| | |||| | || ||||| || | ||| |||| |</div>
            <div className="receipt-brand font-mono">VISH AUDIT RECEIPT // CERTIFIED</div>
            <div className="receipt-meta font-mono">AUDIT: #VSH-7729-01 · DOMAIN: tabletopterrain.com</div>
          </div>

          <div className="receipt-body">
            <div className="receipt-line-item">
              <span className="item-label">TARGET URL:</span>
              <span className="item-value font-mono">https://www.tabletopterrain.com</span>
            </div>
            <div className="receipt-line-item">
              <span className="item-label">AUDIT SCOPE:</span>
              <span className="item-value font-mono">Signup & Marketing Onboarding</span>
            </div>
            <div className="receipt-line-item">
              <span className="item-label">VISION MODEL:</span>
              <span className="item-value font-mono">Gemini 2.5 Vision AI (Active Client)</span>
            </div>
            <div className="receipt-line-item">
              <span className="item-label">STEPS AUDITED:</span>
              <span className="item-value font-mono">3 Full Viewport Frames</span>
            </div>

            <div className="receipt-divider">----------------------------------------------------</div>

            <div className="receipt-detection-item">
              <div className="detection-item-top">
                <span className="det-cat">01. CONFIRMSHAMING</span>
                <span className="det-pts font-mono">+07 PTS</span>
              </div>
              <div className="det-quote font-mono">
                "No, Thanks! I'll pay full price."
              </div>
              <div className="det-sub font-mono">
                Location: Modal footer decline manipulink (Confidence: 98.4%)
              </div>
            </div>

            <div className="receipt-divider">----------------------------------------------------</div>

            <div className="receipt-totals-grid">
              <div className="total-row">
                <span>TOTAL FRICTION SCORE:</span>
                <span className="total-num font-mono">07 / 45</span>
              </div>
              <div className="total-row sub">
                <span>ESTIMATED DOLLARS LOST:</span>
                <span className="font-mono">$0.00</span>
              </div>
              <div className="total-row sub">
                <span>ESTIMATED TIME LOST:</span>
                <span className="font-mono">2 MINUTES</span>
              </div>
            </div>

            <div className="receipt-verification-stamp">
              <div className="stamp-box">
                <ShieldCheck size={20} color="var(--accent-coral)" />
                <div className="stamp-text font-mono">
                  VERIFIED BY VISH AGENTIC ENGINE · ZERO PAYMENT CHARGES SUBMITTED
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="receipt-cta-banner">
          <div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Audit Your Own Flows Today</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              Paste any live signup, pricing, or checkout URL and generate a scored receipt in seconds.
            </p>
          </div>
          <Link to="/audit" className="btn btn-primary btn-glow" style={{ padding: '0.85rem 2rem' }}>
            <span>Start Live Audit</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}