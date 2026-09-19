import React from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
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
  Building2 
} from 'lucide-react';

export default function Home() {
  const workflowSteps = [
    {
      num: '01',
      title: 'Paste a link',
      desc: 'Any public signup or checkout flow — or a cancellation flow behind a provided test login.'
    },
    {
      num: '02',
      title: 'Agent navigates it',
      desc: 'A browser agent clicks through the flow like a real user, stopping before final payment.'
    },
    {
      num: '03',
      title: 'Screens get tagged',
      desc: 'A vision model classifies each step against a published dark-pattern taxonomy.'
    },
    {
      num: '04',
      title: 'Scored receipt',
      desc: 'Every pattern found, in sequence, rolled into one Friction Score.'
    }
  ];

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
    <div>
      <Hero />

      {/* Workflow Section (PPT Page 4) */}
      <section style={{ margin: '4rem 0 3rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span style={{ fontSize: '0.75rem', letterSpacing: '0.15em', color: 'var(--accent-coral)', fontWeight: 700, textTransform: 'uppercase' }}>
            THE APPROACH (PPT PAGE 4)
          </span>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '0.25rem' }}>
            Four Steps, Fully Automated.
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.5rem' }}>
            Scoped to exactly what a browser agent can see — no login required for public flows.
          </p>
        </div>

        <div className="workflow-grid">
          {workflowSteps.map((step) => (
            <div key={step.num} className="workflow-step-card card-interactive">
              <div className="workflow-step-num">{step.num}</div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                {step.title}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* The Problem Section (PPT Page 2) */}
      <section style={{ margin: '4.5rem 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.75rem', letterSpacing: '0.15em', color: 'var(--accent-coral)', fontWeight: 700, textTransform: 'uppercase' }}>
              THE PROBLEM (PPT PAGE 2)
            </span>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, margin: '0.25rem 0 1rem', lineHeight: 1.2 }}>
              You've Felt It. Couldn't Prove It.
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              A one-click signup. A cancellation flow that takes eleven steps, three confirmations, and a phone call. A checkout that adds fees only on the last screen — and by then you've already committed.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="card" style={{ padding: '1.25rem' }}>
                <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--accent-coral)', fontFamily: 'var(--font-mono)', lineHeight: 1 }}>
                  11,000
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.4rem', textTransform: 'uppercase' }}>
                  Sites Audited
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  Princeton/Chicago Study, 2019
                </div>
              </div>

              <div className="card" style={{ padding: '1.25rem' }}>
                <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--accent-blue)', fontFamily: 'var(--font-mono)', lineHeight: 1 }}>
                  1
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.4rem', textTransform: 'uppercase' }}>
                  Screen at a time
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  What existing tools check
                </div>
              </div>
            </div>
          </div>

          {/* The Regulatory Signal */}
          <div className="card" style={{ padding: '2rem', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-highlight)' }}>
            <span className="badge badge-coral" style={{ marginBottom: '1rem' }}>
              THE REGULATORY SIGNAL
            </span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, fontStyle: 'italic', marginBottom: '0.5rem', color: '#fff' }}>
              FTC has sued over it. Regulators are watching.
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              Manipulative interface patterns are standard practice, not rare exceptions — and enforcement is catching up. Today, proving manipulation happened to you takes weeks of manual work. VISH scores it in under a minute.
            </p>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
              SOURCE: Mathur et al., "Dark Patterns at Scale" (Princeton/Chicago, 2019, 11K sites); FTC v. Amazon Prime cancellation enforcement action, 2023.
            </div>
          </div>
        </div>
      </section>

      {/* The Solution & Rubric Table (PPT Page 3) */}
      <section style={{ margin: '4.5rem 0' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span style={{ fontSize: '0.75rem', letterSpacing: '0.15em', color: 'var(--accent-coral)', fontWeight: 700, textTransform: 'uppercase' }}>
            THE SOLUTION (PPT PAGE 3)
          </span>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '0.25rem' }}>
            A Number, Not a Feeling.
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '700px', margin: '0.5rem auto 0' }}>
            VISH reconstructs the exact sequence of interface decisions that caused a user to pay more than they intended — and puts a fixed, published rubric behind the number.
          </p>
        </div>

        <div className="card" style={{ padding: '1.75rem', overflowX: 'auto' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--accent-coral)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Scoring Methodology — Where the Number Comes From
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Pattern</th>
                <th style={{ padding: '0.75rem 1rem' }}>Weight Basis</th>
                <th style={{ padding: '0.75rem 1rem' }}>Example</th>
              </tr>
            </thead>
            <tbody>
              {methodology.map((m, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{m.pattern}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>{m.weight}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>{m.example}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Safety Notice */}
      <SafetyNotice />
    </div>
  );
}
