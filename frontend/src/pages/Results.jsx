import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import FrictionScore from '../components/FrictionScore';
import ImpactCard from '../components/ImpactCard';
import Receipt from '../components/Receipt';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import { useAudit } from '../hooks/useAudit';
import { ArrowLeft, BarChart3, RefreshCw, Share2 } from 'lucide-react';

export default function Results() {
  const { auditId } = useParams();
  const {
    results,
    isLoading,
    error,
    loadExistingAudit
  } = useAudit(auditId);

  useEffect(() => {
    if (auditId) {
      loadExistingAudit(auditId);
    }
  }, [auditId]);

  if (isLoading) {
    return <LoadingState message="Compiling itemized receipt and friction score..." />;
  }

  if (error) {
    return (
      <div style={{ padding: '2rem 0' }}>
        <ErrorState error={error} onRetry={() => loadExistingAudit(auditId)} />
      </div>
    );
  }

  const score = results?.friction_score || 0;
  const cost = results?.estimated_cost || 0;
  const time = results?.estimated_time || 0;

  return (
    <div>
      {/* Top navigation & action bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <Link
          to="/audit"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: 'var(--text-secondary)',
            textDecoration: 'none',
            fontSize: '0.9rem',
            fontWeight: 500
          }}
        >
          <ArrowLeft size={16} /> Back to Audit Console
        </Link>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/comparison" className="btn btn-secondary btn-sm">
            <BarChart3 size={14} /> Compare with Industry Benchmarks
          </Link>
          <Link to="/audit" className="btn btn-primary btn-sm">
            <RefreshCw size={14} /> Run Another Audit
          </Link>
        </div>
      </div>

      {/* Main summary header */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <span style={{ fontSize: '0.75rem', letterSpacing: '0.15em', color: results?.is_blocked ? 'var(--accent-amber)' : 'var(--accent-coral)', fontWeight: 700, textTransform: 'uppercase' }}>
            {results?.is_blocked ? 'SECURITY BARRIER HALTED AUDIT' : 'AUDIT EVALUATION SUMMARY'}
          </span>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, marginTop: '0.25rem', marginBottom: '0.5rem' }}>
            {results?.is_blocked ? 'Audit Blocked Report' : 'Itemized Audit Receipt'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.5 }}>
            {results?.score_summary || "Every point charged, and why, laid out in sequence against the published rubric."}
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <FrictionScore score={score} size="large" label="Final Friction Score" isBlocked={results?.is_blocked || false} />
        </div>
      </div>

      {/* Estimated Impact Cards */}
      <div style={{ marginBottom: '2.5rem' }}>
        <ImpactCard estimatedCost={cost} estimatedMinutes={time} isBlocked={results?.is_blocked || false} />
      </div>

      {/* Itemized Receipt Component */}
      <div style={{ maxWidth: '840px', margin: '0 auto' }}>
        <Receipt result={results} />
      </div>
    </div>
  );
}
