import React, { useState } from 'react';
import { Globe, Bot, Eye, Scale, ArrowRight, ShieldCheck } from 'lucide-react';

export default function InteractiveProcessTrack() {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const steps = [
    {
      num: '01',
      title: 'Paste a link',
      desc: 'Any public signup or checkout flow — or a cancellation flow behind a provided test login.',
      icon: Globe,
      color: 'var(--accent-coral)'
    },
    {
      num: '02',
      title: 'Agent navigates it',
      desc: 'A browser agent clicks through the flow like a real user, stopping before final payment.',
      icon: Bot,
      color: 'var(--accent-blue)'
    },
    {
      num: '03',
      title: 'Screens get tagged',
      desc: 'A vision model classifies each step against a published dark-pattern taxonomy.',
      icon: Eye,
      color: 'var(--accent-emerald)'
    },
    {
      num: '04',
      title: 'Scored receipt',
      desc: 'Every pattern found, in sequence, rolled into one Friction Score.',
      icon: Scale,
      color: 'var(--accent-coral)'
    }
  ];

  return (
    <div className="process-track-wrapper">
      {/* Animated Connecting Line Between Steps */}
      <div className="process-connecting-line" aria-hidden="true">
        <div className="process-connecting-beam" />
      </div>

      <div className="workflow-grid-enhanced">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isHovered = hoveredIdx === idx;
          return (
            <div
              key={step.num}
              className={`workflow-step-card-enhanced ${isHovered ? 'card-hover-active' : ''}`}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <div className="card-top-accent-line" />
              
              <div className="step-card-header">
                <div className="workflow-step-num-pill">{step.num}</div>
                <div className="step-icon-badge" style={{ color: step.color }}>
                  <Icon size={18} />
                </div>
              </div>

              <h3 className="step-title">
                {step.title}
              </h3>

              <p className="step-desc">
                {step.desc}
              </p>

              <div className="step-card-indicator">
                <span className="step-indicator-dot" />
                <span className="step-indicator-label">AUTOMATED STEP</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
