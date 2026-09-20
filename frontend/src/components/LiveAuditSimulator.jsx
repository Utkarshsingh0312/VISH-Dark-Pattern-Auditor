import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, AlertTriangle, ShieldCheck, CheckCircle2, Terminal, ExternalLink, Sparkles } from 'lucide-react';

export default function LiveAuditSimulator() {
  const [currentStep, setCurrentStep] = useState(1);
  const [score, setScore] = useState(7);
  const [isPlaying, setIsPlaying] = useState(true);

  // Cycle through audit simulation
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentStep(prev => (prev >= 3 ? 1 : prev + 1));
    }, 4500);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const stepDetails = {
    1: {
      action: 'Navigating target URL',
      target: 'https://www.tabletopterrain.com',
      title: 'Tabletop Terrain | Public Storefront',
      telemetry: 'DOM content loaded in 1.4s · 0 security challenges encountered',
      finding: null,
      score: 0
    },
    2: {
      action: 'Promotional Modal Triggered',
      target: 'https://www.tabletopterrain.com/#discount-modal',
      title: 'Discount Opt-In Overlay (15% Off)',
      telemetry: 'Modal rendered over viewport · Opt-out decline manipulink captured',
      finding: "Confirmshaming detected: 'No, Thanks! I will pay full price.'",
      score: 7
    },
    3: {
      action: 'Gemini Vision AI Classification Complete',
      target: 'https://www.tabletopterrain.com',
      title: 'VISH Certified Compliance Receipt',
      telemetry: 'Confidence: 98.4% · Score: 07/45 · Estimated friction: 2 min lost',
      finding: 'Confirmed Violation: Coercive guilt framing on refusal path',
      score: 7
    }
  };

  const current = stepDetails[currentStep];

  return (
    <section className="simulator-section">
      <div className="section-header-centered">
        <span className="section-pretitle">REAL-WORLD VALIDATION</span>
        <h2 className="section-title">Live Forensic Audit In Action</h2>
        <p className="section-subtitle">
          Watch VISH autonomously explore and isolate a real confirmed Confirmshaming pattern on a live e-commerce site.
        </p>
      </div>

      <div className="simulator-terminal-card card">
        {/* Terminal Header */}
        <div className="sim-header">
          <div className="sim-dots">
            <span className="sim-dot dot-red"></span>
            <span className="sim-dot dot-yellow"></span>
            <span className="sim-dot dot-green"></span>
          </div>
          <div className="sim-title">
            <Terminal size={14} color="var(--accent-coral)" />
            <span>VISH FORENSIC RUNTIME · AUDIT_ID: <code>audit_tabletop_01</code></span>
          </div>
          <div className="sim-actions">
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => setIsPlaying(!isPlaying)}
              style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem' }}
            >
              {isPlaying ? 'Pause Replay' : 'Resume Replay'}
            </button>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => setCurrentStep(1)}
              style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem' }}
            >
              <RotateCcw size={12} />
            </button>
          </div>
        </div>

        {/* Step Progression Tabs */}
        <div className="sim-stepper">
          {[1, 2, 3].map(stepNum => (
            <button 
              key={stepNum}
              className={`sim-step-tab ${currentStep === stepNum ? 'active' : ''}`}
              onClick={() => {
                setCurrentStep(stepNum);
                setIsPlaying(false);
              }}
            >
              <span className="step-num">0{stepNum}</span>
              <span className="step-label">
                {stepNum === 1 && 'Landing Navigation'}
                {stepNum === 2 && 'Modal Detection'}
                {stepNum === 3 && 'Certified Scoring'}
              </span>
            </button>
          ))}
        </div>

        {/* Interactive Split View */}
        <div className="sim-content-grid">
          {/* Left: Viewport Simulation Frame */}
          <div className="sim-viewport-frame">
            <div className="sim-viewport-bar">
              <span className="viewport-url-badge">
                <span className="url-lock">🔒</span>
                https://www.tabletopterrain.com
              </span>
              <span className="viewport-fps">VIEWPORT: 1280×800</span>
            </div>

            <div className="sim-viewport-display">
              {currentStep === 1 && (
                <div className="viewport-mockup-landing">
                  <div className="mockup-header-bar">
                    <span className="mockup-logo-text">TABLETOP TERRAIN</span>
                    <span className="mockup-nav-links">Terrain · Minis · Sale</span>
                  </div>
                  <div className="mockup-hero-banner">
                    <h4>WARGAMING SCENERY & TERRAIN</h4>
                    <p>High-resolution terrain sets for tabletop wargaming.</p>
                  </div>
                  <div className="mockup-scanner-overlay">
                    <div className="scanner-line"></div>
                    <span className="scanner-label">Scanning public entry flow...</span>
                  </div>
                </div>
              )}

              {(currentStep === 2 || currentStep === 3) && (
                <div className="viewport-mockup-modal">
                  <div className="mockup-backdrop"></div>
                  <div className="mockup-modal-box">
                    <span className="modal-badge-pill">SPECIAL OFFER</span>
                    <h3>YOU'VE GOT 15% OFF</h3>
                    <p>Enter your email for instant savings on your first miniature set.</p>
                    <button className="modal-cta-primary">CLAIM THE DISCOUNT</button>
                    <div className="modal-decline-area target-highlight">
                      <span className="target-reticle"></span>
                      <a href="#decline" className="modal-decline-link">
                        No, Thanks! I'll pay full price.
                      </a>
                      <span className="target-callout-flag">VIOLATION: CONFIRMSHAMING</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Forensic Intelligence Engine Output */}
          <div className="sim-telemetry-panel">
            <div className="telemetry-box">
              <div className="telemetry-label">AUDIT STAGE</div>
              <div className="telemetry-value highlight">{current.action}</div>
            </div>

            <div className="telemetry-box">
              <div className="telemetry-label">PAGE TITLE</div>
              <div className="telemetry-value">{current.title}</div>
            </div>

            <div className="telemetry-box">
              <div className="telemetry-label">AGENT TELEMETRY</div>
              <div className="telemetry-value font-mono" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {current.telemetry}
              </div>
            </div>

            {/* Pattern Extraction Status */}
            <div className="telemetry-detection-card">
              <div className="detection-header">
                <Sparkles size={14} color="var(--accent-coral)" />
                <span>GEMINI VISION AI CLASSIFICATION</span>
              </div>
              {currentStep === 1 ? (
                <div className="detection-status-waiting">
                  <span className="pulsing-radar"></span>
                  <span>Scanning viewport screenshots for 4 dark pattern categories...</span>
                </div>
              ) : (
                <div className="detection-status-found">
                  <div className="detection-row">
                    <span className="row-label">Category:</span>
                    <strong className="row-value" style={{ color: 'var(--accent-coral)' }}>Confirmshaming</strong>
                  </div>
                  <div className="detection-row">
                    <span className="row-label">Evidence:</span>
                    <code className="row-quote">"No, Thanks! I'll pay full price."</code>
                  </div>
                  <div className="detection-row">
                    <span className="row-label">Confidence:</span>
                    <span className="row-value font-mono" style={{ color: 'var(--accent-blue)' }}>98.4% (Certified)</span>
                  </div>
                  <div className="detection-row">
                    <span className="row-label">Friction Penalty:</span>
                    <span className="row-value font-mono" style={{ color: 'var(--accent-coral)', fontWeight: 700 }}>+7 Points</span>
                  </div>
                </div>
              )}
            </div>

            {/* Live Score Counter */}
            <div className="sim-score-banner">
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  TOTAL FRICTION SCORE
                </div>
                <div style={{ fontSize: '1.85rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: currentStep === 1 ? 'var(--text-secondary)' : 'var(--accent-coral)' }}>
                  {currentStep === 1 ? '00 / 45' : '07 / 45'}
                </div>
              </div>
              <div className="sim-safety-badge">
                <ShieldCheck size={16} color="var(--accent-emerald)" />
                <span>0 Real Charges Submitted</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}