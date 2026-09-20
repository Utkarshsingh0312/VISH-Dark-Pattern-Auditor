import React, { useState, useEffect } from 'react';
import ComparisonChart from '../components/ComparisonChart';
import LoadingState from '../components/LoadingState';
import { getComparisonBenchmarks } from '../services/api';
import { ArrowRight } from 'lucide-react';
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
      <div style={{ marginBottom: '2.5rem' }}>
        <ComparisonChart benchmarks={benchmarks} />
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
