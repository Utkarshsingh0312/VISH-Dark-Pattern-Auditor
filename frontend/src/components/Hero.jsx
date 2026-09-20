import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, ShieldAlert, Cpu } from 'lucide-react';
import HeroAuditCore from './HeroAuditCore';

export default function Hero() {
  return (
    <section className="hero-container-cinematic" style={{ margin: '1rem 0 4rem' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '3rem',
        alignItems: 'center',
        minHeight: '600px'
      }}>
        {/* Left Column: Mission Briefing */}
        <div style={{ zIndex: 2 }}>
          <div style={{ display: 'inline-flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1.25rem' }}>
            <span className="badge badge-coral" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.75rem' }}>
              <ShieldAlert size={12} />
              <span>FORENSIC AGENTIC SECURITY</span>
            </span>
            <span className="badge badge-blue" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.75rem' }}>
              <Cpu size={12} />
              <span>GEMINI 2.5 VISION AUDITOR</span>
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(2.8rem, 5.5vw, 4.4rem)',
            fontWeight: 900,
            lineHeight: 1.05,
            letterSpacing: '-0.035em',
            marginBottom: '1.25rem'
          }}>
            <span style={{
              background: 'linear-gradient(135deg, #FFFFFF 0%, #CBD5E1 50%, #94A3B8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Autonomous Vision Audits for
            </span>{' '}
            <span style={{
              background: 'linear-gradient(135deg, #FF6B4A 0%, #FF5733 50%, #FF8F6B 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 35px rgba(255, 87, 51, 0.45)'
            }}>
              Dark Patterns.
            </span>
          </h1>

          <p style={{
            fontSize: '1.15rem',
            lineHeight: 1.65,
            color: 'var(--text-secondary)',
            marginBottom: '2rem',
            maxWidth: '560px'
          }}>
            Deploy autonomous browser agents powered by Gemini Vision AI. Traverses full multi-step checkout and signup flows, captures visual DOM evidence, and computes verifiable friction receipts.
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '2.5rem' }}>
            <Link to="/audit" className="btn btn-primary" style={{
              padding: '0.9rem 2.25rem',
              fontSize: '1rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              boxShadow: '0 0 25px rgba(255, 87, 51, 0.4)'
            }}>
              <span>Launch Live Audit</span>
              <ArrowRight size={18} />
            </Link>
            <Link to="/results/demo_dark_pattern_flow" className="btn btn-secondary" style={{
              padding: '0.9rem 1.85rem',
              fontSize: '1rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.12)'
            }}>
              <Play size={16} fill="currentColor" />
              <span>Explore Demo Receipt</span>
            </Link>
          </div>

          {/* Quick Telemetry Strip */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1rem',
            padding: '1.15rem 1.25rem',
            background: 'rgba(15, 23, 42, 0.65)',
            border: '1px solid rgba(255, 255, 255, 0.07)',
            borderRadius: '12px',
            backdropFilter: 'blur(10px)',
            maxWidth: '520px'
          }}>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
                <span>Engine</span>
              </div>
              <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#F8FAFC', marginTop: '0.2rem', fontFamily: 'var(--font-mono)' }}>
                Playwright + Vision
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Rubric
              </div>
              <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--accent-coral)', marginTop: '0.2rem', fontFamily: 'var(--font-mono)' }}>
                0 - 45 Points
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Safety
              </div>
              <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#38BDF8', marginTop: '0.2rem', fontFamily: 'var(--font-mono)' }}>
                Zero Payment
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: 3D Canvas Radar & Core Visualization */}
        <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
          <HeroAuditCore />
        </div>
      </div>

      {/* Team / Accreditation Tagline */}
      <div style={{
        marginTop: '3.5rem',
        padding: '0.85rem 1.5rem',
        borderRadius: '9999px',
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.75rem',
        fontSize: '0.82rem',
        color: 'var(--text-muted)'
      }}>
        <strong style={{ color: 'var(--accent-coral)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          TEAM · BENEFIT BRIDGE
        </strong>
        <span style={{ opacity: 0.3 }}>|</span>
        <span>Utkarsh Singh · Vaishnavi Tripathi · Uday Chauhan · Tushar Agarwal</span>
      </div>
    </section>
  );
}
