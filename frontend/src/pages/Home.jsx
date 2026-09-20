import React from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import InteractiveProcessTrack from '../components/InteractiveProcessTrack';
import AnimatedCounter from '../components/AnimatedCounter';
import SafetyNotice from '../components/SafetyNotice';
import { 
  ArrowRight, 
  Search, 
  Bot, 
  Eye, 
  FileSpreadsheet, 
  CheckCircle, 
  ShieldAlert, 
  Layers, 
  Scale, 
  Users, 
  Building2,
  Sparkles
} from 'lucide-react';

export default function Home() {
  const methodology = [
    {
      pattern: 'Hidden Cost',
      weight: 'Reversible × monetary impact',
      example: '$4.99 fee shown only at final confirmation'
    },
    {
      pattern: 'Forced Re-auth',
      weight: 'Adds friction after cost is shown',
      example: 'Password re-entry required after the fee appears'
    },
    {
      pattern: 'Confirmshaming',
      weight: 'Coercive language on decline path',
      example: '"No thanks, I like paying full price"'
    },
    {
      pattern: 'Roach Motel',
      weight: 'Entry vs. exit effort asymmetry',
      example: 'One-click signup, phone-call-only cancellation'
    }
  ];

  return (
    <div className="home-page-container">
      {/* 1. Hero Section with 3D VISH Forensic Core */}
      <Hero />

      <div className="section-divider-glow" />

      {/* 2. The Approach: Interactive 4-Step Track with Connection Beam */}
      <section className="home-section" style={{ margin: '4.5rem 0 3.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span className="section-eyebrow">
            THE APPROACH (PPT PAGE 4)
          </span>
          <h2 className="section-heading">
            Four Steps, Fully Automated.
          </h2>
          <p className="section-subtext">
            Scoped to exactly what a browser agent can see — no login required for public flows.
          </p>
        </div>

        <InteractiveProcessTrack />
      </section>

      <div className="section-divider-glow" />

      {/* 3. The Problem Section with Animated Forensic Metrics */}
      <section className="home-section" style={{ margin: '5rem 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem', alignItems: 'center' }}>
          <div>
            <span className="section-eyebrow">
              THE PROBLEM (PPT PAGE 2)
            </span>
            <h2 className="section-heading" style={{ textAlign: 'left', margin: '0.35rem 0 1rem', lineHeight: 1.2 }}>
              You've Felt It. Couldn't Prove It.
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.02rem', lineHeight: 1.65, marginBottom: '1.75rem' }}>
              A one-click signup. A cancellation flow that takes eleven steps, three confirmations, and a phone call. A checkout that adds fees only on the last screen — and by then you've already committed.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div className="card card-stat-glow">
                <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--accent-coral)', fontFamily: 'var(--font-mono)', lineHeight: 1 }}>
                  <AnimatedCounter end={11000} duration={1600} />
                </div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Sites Audited
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Princeton/Chicago Study, 2019
                </div>
              </div>

              <div className="card card-stat-glow">
                <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--accent-blue)', fontFamily: 'var(--font-mono)', lineHeight: 1 }}>
                  <AnimatedCounter end={1} duration={1000} />
                </div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Screen at a time
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  What existing tools check
                </div>
              </div>
            </div>
          </div>

          {/* The Regulatory Signal Card with Cinematic Glass Edge */}
          <div className="card regulatory-card-elevated">
            <div className="card-ambient-light" />
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem' }}>
              <span className="badge badge-coral">
                <ShieldAlert size={12} />
                <span>THE REGULATORY SIGNAL</span>
              </span>
            </div>
            
            <h3 style={{ fontSize: '1.55rem', fontWeight: 800, fontStyle: 'italic', marginBottom: '0.75rem', color: '#FFFFFF', lineHeight: 1.3 }}>
              FTC has sued over it. Regulators are watching.
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.65, marginBottom: '1.5rem' }}>
              Manipulative interface patterns are standard practice, not rare exceptions — and enforcement is catching up. Today, proving manipulation happened to you takes weeks of manual work. VISH scores it in under a minute.
            </p>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '0.85rem' }}>
              SOURCE: Mathur et al., &ldquo;Dark Patterns at Scale&rdquo; (Princeton/Chicago, 2019, 11K sites); FTC v. Amazon Prime cancellation enforcement action, 2023.
            </div>
          </div>
        </div>
      </section>

      <div className="section-divider-glow" />

      {/* 4. The Solution & Rubric Table (PPT Page 3) */}
      <section className="home-section" style={{ margin: '5rem 0' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span className="section-eyebrow">
            THE SOLUTION (PPT PAGE 3)
          </span>
          <h2 className="section-heading">
            A Number, Not a Feeling.
          </h2>
          <p className="section-subtext" style={{ maxWidth: '700px', margin: '0.5rem auto 0' }}>
            VISH reconstructs the exact sequence of interface decisions that caused a user to pay more than they intended — and puts a fixed, published rubric behind the number.
          </p>
        </div>

        <div className="card table-card-elevated" style={{ overflowX: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--accent-coral)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Scoring Methodology — Where the Number Comes From
            </h3>
            <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-blue)', background: 'rgba(56, 189, 248, 0.1)', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
              0 – 45 BOUNDED RUBRIC
            </span>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.92rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                <th style={{ padding: '0.85rem 1rem' }}>Pattern</th>
                <th style={{ padding: '0.85rem 1rem' }}>Weight Basis</th>
                <th style={{ padding: '0.85rem 1rem' }}>Example</th>
              </tr>
            </thead>
            <tbody>
              {methodology.map((m, idx) => (
                <tr key={idx} className="methodology-table-row">
                  <td style={{ padding: '1.1rem 1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{m.pattern}</td>
                  <td style={{ padding: '1.1rem 1rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '0.86rem' }}>{m.weight}</td>
                  <td style={{ padding: '1.1rem 1rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>{m.example}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 5. Safety Notice Invariant */}
      <SafetyNotice />
    </div>
  );
}
