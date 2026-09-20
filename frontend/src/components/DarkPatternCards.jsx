import React, { useState } from 'react';
import { DollarSign, KeyRound, MessageSquareWarning, DoorClosed, AlertCircle, ArrowUpRight } from 'lucide-react';

export default function DarkPatternCards() {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const categories = [
    {
      id: 'hidden-cost',
      number: '01',
      name: 'Hidden Cost',
      points: '+12',
      weightBasis: 'Reversible × monetary impact',
      example: '$4.99 processing fee added only at the final review screen after user committed time.',
      icon: DollarSign,
      accent: 'var(--accent-coral)',
      impact: '$4.00 – $15.00 extra cost'
    },
    {
      id: 'forced-reauth',
      number: '02',
      name: 'Forced Re-auth',
      points: '+8',
      weightBasis: 'Adds friction after cost is revealed',
      example: 'Password re-entry or SMS prompt required only after the fee appears, preventing price comparison.',
      icon: KeyRound,
      accent: 'var(--accent-blue)',
      impact: '3+ extra minutes lost'
    },
    {
      id: 'confirmshaming',
      number: '03',
      name: 'Confirmshaming',
      points: '+7',
      weightBasis: 'Coercive language on decline path',
      example: '"No thanks, I like paying full price" or "No, I don\'t care about savings" on opt-out buttons.',
      icon: MessageSquareWarning,
      accent: 'var(--accent-coral)',
      impact: 'Psychological compliance pressure'
    },
    {
      id: 'roach-motel',
      number: '04',
      name: 'Roach Motel',
      points: '+10',
      weightBasis: 'Entry vs. exit effort asymmetry',
      example: 'One-click subscription activation, but cancellation requires phone calls during business hours.',
      icon: DoorClosed,
      accent: 'var(--accent-amber)',
      impact: '8+ extra minutes lost'
    }
  ];

  return (
    <section className="taxonomy-section">
      <div className="section-header-centered">
        <span className="section-pretitle">THE AUTHORITATIVE TAXONOMY</span>
        <h2 className="section-title">What VISH Looks For</h2>
        <p className="section-subtitle">
          Calibrated strictly against the published 0–45 friction scale. We do not invent categories or infer invisible intent.
        </p>
      </div>

      <div className="taxonomy-cards-grid">
        {categories.map((cat, idx) => {
          const Icon = cat.icon;
          const isHovered = hoveredIdx === idx;
          return (
            <div
              key={cat.id}
              className={`taxonomy-card card-interactive ${isHovered ? 'taxonomy-hovered' : ''}`}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              style={{
                '--cat-accent': cat.accent
              }}
            >
              <div className="taxonomy-top">
                <span className="taxonomy-num font-mono">{cat.number}</span>
                <span className="taxonomy-points-badge font-mono">{cat.points} PTS</span>
              </div>

              <div className="taxonomy-icon-wrapper">
                <Icon size={26} color={cat.accent} />
              </div>

              <h3 className="taxonomy-title">{cat.name}</h3>

              <div className="taxonomy-weight-block">
                <span className="weight-label">WEIGHT BASIS:</span>
                <span className="weight-text font-mono">{cat.weightBasis}</span>
              </div>

              <p className="taxonomy-example">
                <strong>Example:</strong> {cat.example}
              </p>

              <div className="taxonomy-footer">
                <span className="taxonomy-impact-tag">{cat.impact}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}