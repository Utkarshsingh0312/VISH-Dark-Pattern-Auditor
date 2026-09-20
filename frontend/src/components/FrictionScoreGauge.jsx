import React, { useState } from 'react';
import { Activity, DollarSign, Clock, ShieldCheck, Sparkles, AlertTriangle } from 'lucide-react';

export default function FrictionScoreGauge() {
  const [activePatterns, setActivePatterns] = useState({
    confirmshaming: true,
    hiddenCost: false,
    forcedReauth: false,
    roachMotel: false
  });

  const togglePattern = (key) => {
    setActivePatterns(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Calculate score dynamically
  const score = 
    (activePatterns.confirmshaming ? 7 : 0) +
    (activePatterns.hiddenCost ? 12 : 0) +
    (activePatterns.forcedReauth ? 8 : 0) +
    (activePatterns.roachMotel ? 10 : 0);

  // Approximate metrics based on PPT Page 3
  const estCost = activePatterns.hiddenCost ? 4.99 : 0.00;
  const estMinutes = 
    (activePatterns.confirmshaming ? 2 : 0) +
    (activePatterns.hiddenCost ? 2 : 0) +
    (activePatterns.forcedReauth ? 3 : 0) +
    (activePatterns.roachMotel ? 8 : 0);

  const percentage = (score / 45) * 100;
  const strokeDashoffset = 283 - (283 * percentage) / 100;

  return (
    <section className="gauge-section">
      <div className="section-header-centered">
        <span className="section-pretitle">AUTHORITATIVE SCORING</span>
        <h2 className="section-title">The 0–45 Friction Engine</h2>
        <p className="section-subtitle">
          Toggle the 4 published dark-pattern categories below to see how consumer friction aggregates into score, dollars, and minutes lost.
        </p>
      </div>

      <div className="gauge-dashboard-card card">
        <div className="gauge-grid">
          {/* Gauge Dial Visual */}
          <div className="gauge-dial-pane">
            <div className="gauge-svg-container">
              <svg className="gauge-svg" viewBox="0 0 120 120">
                {/* Background Ring */}
                <circle 
                  cx="60" 
                  cy="60" 
                  r="45" 
                  className="gauge-bg-circle"
                />
                {/* Active Progress Arc */}
                <circle 
                  cx="60" 
                  cy="60" 
                  r="45" 
                  className="gauge-progress-arc"
                  style={{
                    strokeDasharray: '283',
                    strokeDashoffset: `${strokeDashoffset}`
                  }}
                />
              </svg>

              <div className="gauge-center-readout">
                <span className="gauge-number font-mono">{String(score).padStart(2, '0')}</span>
                <span className="gauge-max font-mono">/ 45</span>
                <span className="gauge-label">FRICTION</span>
              </div>
            </div>

            <div className="gauge-scale-legend">
              <span className={`scale-pill ${score <= 9 ? 'active' : ''}`}>0–9 Clean</span>
              <span className={`scale-pill ${score > 9 && score <= 24 ? 'active' : ''}`}>10–24 Moderate</span>
              <span className={`scale-pill ${score > 24 ? 'active' : ''}`}>25–45 Severe</span>
            </div>
          </div>

          {/* Interactive Pattern Toggles */}
          <div className="gauge-controls-pane">
            <h3 className="controls-heading">Interactive Category Calibrator</h3>
            <p className="controls-desc">Select observed categories to evaluate cumulative impact:</p>

            <div className="pattern-toggle-list">
              <button 
                type="button"
                className={`pattern-toggle-btn ${activePatterns.confirmshaming ? 'toggle-active' : ''}`}
                onClick={() => togglePattern('confirmshaming')}
              >
                <div className="toggle-left">
                  <span className="toggle-checkbox">{activePatterns.confirmshaming ? '✓' : ''}</span>
                  <div>
                    <strong>Confirmshaming</strong>
                    <span className="toggle-sub">Coercive decline language</span>
                  </div>
                </div>
                <span className="toggle-points font-mono">+7 PTS</span>
              </button>

              <button 
                type="button"
                className={`pattern-toggle-btn ${activePatterns.hiddenCost ? 'toggle-active' : ''}`}
                onClick={() => togglePattern('hiddenCost')}
              >
                <div className="toggle-left">
                  <span className="toggle-checkbox">{activePatterns.hiddenCost ? '✓' : ''}</span>
                  <div>
                    <strong>Hidden Cost</strong>
                    <span className="toggle-sub">Late fee revealed at review</span>
                  </div>
                </div>
                <span className="toggle-points font-mono">+12 PTS</span>
              </button>

              <button 
                type="button"
                className={`pattern-toggle-btn ${activePatterns.forcedReauth ? 'toggle-active' : ''}`}
                onClick={() => togglePattern('forcedReauth')}
              >
                <div className="toggle-left">
                  <span className="toggle-checkbox">{activePatterns.forcedReauth ? '✓' : ''}</span>
                  <div>
                    <strong>Forced Re-auth</strong>
                    <span className="toggle-sub">Password re-entry post pricing</span>
                  </div>
                </div>
                <span className="toggle-points font-mono">+8 PTS</span>
              </button>

              <button 
                type="button"
                className={`pattern-toggle-btn ${activePatterns.roachMotel ? 'toggle-active' : ''}`}
                onClick={() => togglePattern('roachMotel')}
              >
                <div className="toggle-left">
                  <span className="toggle-checkbox">{activePatterns.roachMotel ? '✓' : ''}</span>
                  <div>
                    <strong>Roach Motel</strong>
                    <span className="toggle-sub">Asymmetric cancellation barrier</span>
                  </div>
                </div>
                <span className="toggle-points font-mono">+10 PTS</span>
              </button>
            </div>

            {/* Economic and Time Rollup */}
            <div className="gauge-impact-rollup">
              <div className="rollup-stat">
                <DollarSign size={18} color="var(--accent-coral)" />
                <div>
                  <div className="stat-label">Estimated Extra Cost</div>
                  <div className="stat-val font-mono">${estCost.toFixed(2)}</div>
                </div>
              </div>
              <div className="rollup-stat">
                <Clock size={18} color="var(--accent-blue)" />
                <div>
                  <div className="stat-label">Estimated Time Lost</div>
                  <div className="stat-val font-mono">{estMinutes} Minutes</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}