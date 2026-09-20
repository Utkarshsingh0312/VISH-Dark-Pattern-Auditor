import React, { useState } from 'react';
import { Globe, Bot, Camera, Sparkles, Scale, Receipt, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function PipelineFlow() {
  const [activeNode, setActiveNode] = useState(3);

  const pipelineNodes = [
    {
      step: '01',
      title: 'Target URL',
      subtitle: 'Public Flow Ingestion',
      desc: 'Accepts any public checkout, registration, or pricing flow URL. Zero credentials needed.',
      icon: Globe,
      color: 'var(--accent-coral)',
      status: 'INGESTED'
    },
    {
      step: '02',
      title: 'Browser Agent',
      subtitle: 'Playwright Sandbox',
      desc: 'Autonomous Chromium instance walks the interface with human-like pacing and modal exploration.',
      icon: Bot,
      color: 'var(--accent-blue)',
      status: 'NAVIGATING'
    },
    {
      step: '03',
      title: 'Viewport State',
      subtitle: 'Lossless Capture',
      desc: 'Captures full DOM viewport state after each meaningful transition before final payment.',
      icon: Camera,
      color: 'var(--accent-emerald)',
      status: 'CAPTURED'
    },
    {
      step: '04',
      title: 'Gemini Vision',
      subtitle: 'Multimodal AI Model',
      desc: 'Inspects visual screens to isolate manipulative language, hidden charges, and asymmetric friction.',
      icon: Sparkles,
      color: 'var(--accent-coral)',
      status: 'CLASSIFYING'
    },
    {
      step: '05',
      title: 'Friction Engine',
      subtitle: '0–45 Scoring Rubric',
      desc: 'Calculates mathematically bounded score and estimates excess minutes and dollars lost.',
      icon: Scale,
      color: 'var(--accent-amber)',
      status: 'CALCULATING'
    },
    {
      step: '06',
      title: 'Certified Receipt',
      subtitle: 'Forensic Audit Report',
      desc: 'Produces an itemized, chronological evidence receipt admissible for compliance review.',
      icon: Receipt,
      color: '#A855F7',
      status: 'CERTIFIED'
    }
  ];

  return (
    <section className="pipeline-section">
      <div className="section-header-centered">
        <span className="section-pretitle">THE ARCHITECTURE</span>
        <h2 className="section-title">Automated Forensic Audit Pipeline</h2>
        <p className="section-subtitle">
          From public link to itemized compliance receipt in under 45 seconds. No guesswork, no browser plugins, no manual effort.
        </p>
      </div>

      <div className="pipeline-grid-container">
        {/* Animated Connecting Line Bus */}
        <div className="pipeline-track">
          <div className="pipeline-track-pulse"></div>
        </div>

        <div className="pipeline-nodes-grid">
          {pipelineNodes.map((node, idx) => {
            const Icon = node.icon;
            const isCurrent = activeNode === idx;
            return (
              <div 
                key={node.step}
                className={`pipeline-node-card card-interactive ${isCurrent ? 'node-active' : ''}`}
                onMouseEnter={() => setActiveNode(idx)}
                style={{
                  '--node-accent': node.color
                }}
              >
                <div className="node-top-bar">
                  <span className="node-step-tag">STEP {node.step}</span>
                  <span className="node-status-badge">{node.status}</span>
                </div>

                <div className="node-icon-capsule">
                  <Icon size={24} color={node.color} />
                </div>

                <h3 className="node-title">{node.title}</h3>
                <div className="node-subtitle">{node.subtitle}</div>
                <p className="node-desc">{node.desc}</p>

                <div className="node-footer-indicator">
                  <div className="indicator-dot"></div>
                  <span>ACTIVE STAGE</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}