import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, BarChart3, Info } from 'lucide-react';

export default function ComparisonChart({ benchmarks = [], currentAuditScore = null }) {
  const maxScale = 45;

  // Default calibration benchmarks if not passed
  const items = benchmarks.length > 0 ? benchmarks : [
    {
      id: "dark_pattern",
      label: "Known dark-pattern flow",
      score: 37,
      type: "hand_scored_target",
      flow_id: "demo_dark_pattern_flow",
      color: "#FF5733",
      isDashed: false
    },
    {
      id: "industry_average",
      label: "Industry-average flow",
      score: 18,
      type: "stretch_goal_reference",
      flow_id: "demo_industry_average",
      color: "#E25241",
      isDashed: true
    },
    {
      id: "honest",
      label: "Honest / one-click flow",
      score: 6,
      type: "hand_scored_target",
      flow_id: "demo_honest_flow",
      color: "#FF7A5C",
      isDashed: false
    }
  ];

  return (
    <div className="card" style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <span style={{ fontSize: '0.75rem', letterSpacing: '0.12em', color: 'var(--accent-coral)', fontWeight: 700, textTransform: 'uppercase' }}>
            MEASURED IMPACT
          </span>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '0.2rem' }}>
            Target Friction Scores — Benchmarked Flows
          </h3>
        </div>
        <span className="badge badge-coral">Rubric Scale: 0–45</span>
      </div>

      {/* Chart Bars */}
      <div style={{ margin: '2rem 0' }}>
        {items.map((item) => {
          const widthPercent = (item.score / maxScale) * 100;
          return (
            <div key={item.id} className="benchmark-row">
              <div className="benchmark-label">
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.label}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {item.isDashed ? 'Stretch-goal reference' : 'Hand-scored target'}
                </div>
              </div>

              <div className="benchmark-bar-wrapper">
                <div
                  className="benchmark-bar"
                  style={{
                    width: `${widthPercent}%`,
                    backgroundColor: item.color,
                    border: item.isDashed ? '2px dashed #CBD5E1' : 'none',
                    opacity: item.isDashed ? 0.8 : 1
                  }}
                >
                  <span>{item.score}</span>
                </div>
              </div>

              <Link
                to={`/results/${item.flow_id}`}
                style={{
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  fontSize: '0.8rem',
                  textDecoration: 'none',
                  padding: '0.3rem 0.6rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-main)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <span>View</span>
                <ExternalLink size={12} />
              </Link>
            </div>
          );
        })}

        {/* Current user audit bar if available */}
        {currentAuditScore !== null && (
          <div className="benchmark-row" style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)' }}>
            <div className="benchmark-label">
              <div style={{ fontWeight: 700, color: 'var(--accent-blue)' }}>Current Live Audit</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Active session</div>
            </div>
            <div className="benchmark-bar-wrapper">
              <div
                className="benchmark-bar"
                style={{
                  width: `${(currentAuditScore / maxScale) * 100}%`,
                  backgroundColor: 'var(--accent-blue)'
                }}
              >
                <span>{currentAuditScore}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Ticks scale */}
      <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: '220px', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
        <span>0</span>
        <span>5</span>
        <span>10</span>
        <span>15</span>
        <span>20</span>
        <span>25</span>
        <span>30</span>
        <span>35</span>
        <span>40</span>
        <span>45</span>
      </div>

      {/* Benchmark Caption citation */}
      <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1.75rem', padding: '1rem', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
        <Info size={16} color="var(--accent-coral)" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong>Calibration Note:</strong> Solid bars are verified against our fixed forensic rubric across standard user journeys. The lighter dashed line represents the estimated industry-average friction baseline (18).
        </div>
      </div>
    </div>
  );
}
