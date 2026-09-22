import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, ShieldAlert, Bot, Scale, FileText } from 'lucide-react';
import Hero3DCore from './Hero3DCore';

export default function Hero() {
  return (
    <section className="hero-section-refined">
      {/* Background Ambience Layer */}
      <div className="hero-ambience-glow" />
      <div className="hero-grid-pattern" />

      {/* Main Centered Hero Foreground Content */}
      <div className="hero-content-wrapper">
        <div className="hero-eyebrow-container">
          <span className="hero-eyebrow-badge">
            <span className="eyebrow-dot" />
            DARK PATTERN AUDITOR
          </span>
        </div>

        {/* Centered 3D Circular Model Directly Behind VISH Title */}
        <div className="hero-title-backdrop-wrap">
          <div className="hero-3d-center-stage" aria-hidden="true">
            <Hero3DCore />
          </div>
          <h1 className="hero-brand-title">
            VISH
          </h1>
        </div>

        <h2 className="hero-tagline">
          Every dark pattern, <span className="text-gradient-coral">caught in the act.</span>
        </h2>

        <p className="hero-description">
          Paste a public flow link. Watch an AI walk it like a real user. Get a scored receipt of every manipulation it hit &mdash; live.
        </p>

        <div className="hero-cta-group">
          <Link to="/audit" className="btn btn-primary hero-btn-main">
            <span>Start an Audit</span>
            <ArrowRight size={17} />
          </Link>
          <Link to="/results/demo_dark_pattern_flow" className="btn btn-secondary hero-btn-secondary">
            <Play size={15} fill="currentColor" />
            <span>View Demo</span>
          </Link>
        </div>

        {/* Trust & Product Signals Strip */}
        <div className="trust-signals-strip">
          <div className="trust-signal-item">
            <Bot size={14} className="text-coral" />
            <span>LIVE BROWSER AUDIT</span>
          </div>
          <span className="trust-signal-divider">·</span>
          <div className="trust-signal-item">
            <ShieldAlert size={14} className="text-blue" />
            <span>REAL-TIME DETECTION</span>
          </div>
          <span className="trust-signal-divider">·</span>
          <div className="trust-signal-item">
            <Scale size={14} className="text-emerald" />
            <span>SCORED EVIDENCE</span>
          </div>
          <span className="trust-signal-divider">·</span>
          <div className="trust-signal-item">
            <FileText size={14} className="text-coral" />
            <span>EXPLAINABLE RESULTS</span>
          </div>
        </div>
      </div>
    </section>
  );
}
