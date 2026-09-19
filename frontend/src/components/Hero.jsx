import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, CheckCircle2 } from 'lucide-react';

export default function Hero() {
  return (
    <section style={{ textAlign: 'center', padding: '3.5rem 1rem 2rem' }}>
      <div style={{ display: 'inline-flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '1.75rem' }}>
        <span className="badge badge-coral">PROBLEM → SOLUTION</span>
        <span className="badge badge-blue">LIVE & AUTOMATED</span>
        <span className="badge badge-coral">RECEIPT, NOT A FEELING</span>
      </div>

      <h1 style={{ fontSize: 'clamp(3rem, 7vw, 5.5rem)', fontWeight: 800, lineHeight: 1.05, marginBottom: '1rem', letterSpacing: '-0.03em' }}>
        VISH
      </h1>

      <h2 style={{ fontSize: 'clamp(1.25rem, 2.5vw, 1.85rem)', fontWeight: 400, fontStyle: 'italic', color: 'var(--text-secondary)', marginBottom: '1.75rem' }}>
        Every dark pattern, caught in the act.
      </h2>

      <p style={{ maxWidth: '720px', margin: '0 auto 2.5rem', fontSize: '1.15rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
        Paste a public flow link. Watch an AI walk it like a real user. Get a scored receipt of every manipulation it hit — live.
      </p>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '3rem' }}>
        <Link to="/audit" className="btn btn-primary" style={{ padding: '0.85rem 2.25rem', fontSize: '1.05rem' }}>
          Start an Audit <ArrowRight size={18} />
        </Link>
        <Link to="/results/demo_dark_pattern_flow" className="btn btn-secondary" style={{ padding: '0.85rem 2rem', fontSize: '1.05rem' }}>
          <Play size={18} fill="currentColor" /> View Demo
        </Link>
      </div>

      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
        <strong style={{ color: 'var(--accent-coral)', textTransform: 'uppercase' }}>TEAM · BENEFIT BRIDGE</strong> : Utkarsh Singh · Vaishnavi Tripathi · Uday Chauhan · Tushar Agarwal
      </div>
    </section>
  );
}
