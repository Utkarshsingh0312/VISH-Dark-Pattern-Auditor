import React, { useState, useEffect } from 'react';
import ComparisonChart from '../components/ComparisonChart';
import LoadingState from '../components/LoadingState';
import { getComparisonBenchmarks } from '../services/api';
import { CheckCircle2, Award, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Comparison() {
  const [benchmarks, setBenchmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getComparisonBenchmarks();
        setBenchmarks(data.benchmarks || []);
      } catch (err) {
        console.warn('Using local fallback benchmarks:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return <LoadingState message="Loading benchmark data..." />;
  }

  return (
    <div>
      <div style={{ marginBottom: '2.5rem' }}>
        <span style={{ fontSize: '0.75rem', letterSpacing: '0.15em', color: 'var(--accent-coral)', fontWeight: 700, textTransform: 'uppercase' }}>
          PROOF BY CONTRAST
        </span>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, marginTop: '0.25rem', marginBottom: '0.5rem' }}>
          Industry Benchmark Comparisons
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
          Evaluating real digital interfaces side-by-side using the fixed, published 0–45 Friction Score rubric.
        </p>
      </div>

      {/* Comparison Chart */}
      <div style={{ marginBottom: '3rem' }}>
        <ComparisonChart benchmarks={benchmarks} />
      </div>

      {/* Two Audiences, One Engine & Architecture Roadmap */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        {/* MVP Targets Card */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Award size={20} color="var(--accent-coral)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
              Core Forensic Architecture
            </h3>
          </div>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
            <li style={{ display: 'flex', gap: '0.6rem', color: 'var(--text-secondary)' }}>
              <CheckCircle2 size={16} color="var(--accent-coral)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span><strong>2 flows picked & hand-scored:</strong> Known dark-pattern (37) & Honest flow (6).</span>
            </li>
            <li style={{ display: 'flex', gap: '0.6rem', color: 'var(--text-secondary)' }}>
              <CheckCircle2 size={16} color="var(--accent-coral)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span><strong>Live Playwright agent + Vision-LLM:</strong> Tagging visible screen-by-screen.</span>
            </li>
            <li style={{ display: 'flex', gap: '0.6rem', color: 'var(--text-secondary)' }}>
              <CheckCircle2 size={16} color="var(--accent-coral)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span><strong>Friction Score engine:</strong> Published, fixed 0–45 rubric with explainable criteria.</span>
            </li>
            <li style={{ display: 'flex', gap: '0.6rem', color: 'var(--text-secondary)' }}>
              <CheckCircle2 size={16} color="var(--accent-coral)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span><strong>Receipt UI:</strong> Step-by-step receipt with contrast bar-chart comparison.</span>
            </li>
          </ul>
        </div>

        {/* Stretch Goals Card */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Clock size={20} color="var(--accent-blue)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
              Stretch Goals (If Time Remains)
            </h3>
          </div>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
            <li style={{ display: 'flex', gap: '0.6rem', color: 'var(--text-secondary)' }}>
              <span style={{ color: 'var(--accent-blue)', fontWeight: 700 }}>→</span>
              <span><strong>Third flow:</strong> Industry-average flow (18) if initial two land early.</span>
            </li>
            <li style={{ display: 'flex', gap: '0.6rem', color: 'var(--text-secondary)' }}>
              <span style={{ color: 'var(--accent-blue)', fontWeight: 700 }}>→</span>
              <span><strong>Live audience URL:</strong> Judge-provided URL attempted live, best-effort.</span>
            </li>
            <li style={{ display: 'flex', gap: '0.6rem', color: 'var(--text-secondary)' }}>
              <span style={{ color: 'var(--accent-blue)', fontWeight: 700 }}>→</span>
              <span><strong>Extra dark patterns:</strong> Extended taxonomy tagging (Misdirection, Sneaking).</span>
            </li>
            <li style={{ display: 'flex', gap: '0.6rem', color: 'var(--text-secondary)' }}>
              <span style={{ color: 'var(--accent-blue)', fontWeight: 700 }}>→</span>
              <span><strong>Polish:</strong> Animated transitions on receipt and bar-chart comparisons.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* CTA to start audit */}
      <div className="card" style={{ textAlign: 'center', padding: '2.5rem 1.5rem', backgroundColor: 'var(--bg-card)' }}>
        <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          Ready to audit your own checkout or signup flow?
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Test your site against the published 0–45 Friction Score rubric and get an itemized compliance receipt.
        </p>
        <Link to="/audit" className="btn btn-primary">
          Start an Audit Now <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
