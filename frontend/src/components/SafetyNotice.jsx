import React from 'react';
import { ShieldCheck, Lock, Gauge, UserCheck, Scale } from 'lucide-react';

export default function SafetyNotice() {
  const safetyPillars = [
    {
      icon: Lock,
      title: "No Real Transactions",
      desc: "The agent stops before final payment confirmation on any checkout — it never submits a real purchase or charges a card."
    },
    {
      icon: Gauge,
      title: "Respects Site Rules",
      desc: "Runs at human-like pace within each site's published rate limits and robots.txt."
    },
    {
      icon: UserCheck,
      title: "Account Safety",
      desc: "Authenticated flows run only against a test account supplied by the user or company — never a live account VISH doesn't own."
    },
    {
      icon: Scale,
      title: "Published Disclosed Rubric",
      desc: "Scores are evaluated against a fixed, disclosed rubric — not asserted as fact — with a 14-day dispute window."
    }
  ];

  return (
    <div className="card" style={{ border: '1px solid rgba(56, 189, 248, 0.2)', backgroundColor: 'rgba(15, 23, 42, 0.65)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
        <ShieldCheck size={22} color="var(--accent-blue)" />
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          Safe Audit Architecture (PPT Safety Principles)
        </h3>
        <span className="badge badge-blue" style={{ marginLeft: 'auto' }}>Guaranteed</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
        {safetyPillars.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <div style={{ padding: '0.45rem', borderRadius: 'var(--radius-sm)', background: 'rgba(56, 189, 248, 0.1)', color: 'var(--accent-blue)', marginTop: '0.1rem' }}>
                <Icon size={16} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                  {item.title}
                </h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {item.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
