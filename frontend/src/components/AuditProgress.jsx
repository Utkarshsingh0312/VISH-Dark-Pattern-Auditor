import React from 'react';
import StatusBadge from './StatusBadge';
import StepTimeline from './StepTimeline';
import { Terminal, Shield } from 'lucide-react';

export default function AuditProgress({ status, currentStepIndex, isComplete, url }) {
  return (
    <div className="card" style={{ marginBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
        <div>
          <span style={{ fontSize: '0.75rem', letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Live Audit Stream
          </span>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.15rem' }}>
            {url ? new URL(url).hostname : 'Automated Session'}
          </h3>
        </div>
        <StatusBadge status={status} />
      </div>

      <StepTimeline currentStepIndex={currentStepIndex} isComplete={isComplete} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1rem', fontFamily: 'var(--font-mono)' }}>
        <span>Agent Mode: <strong>Playwright (Human Pacing)</strong></span>
        <span>Vision Engine: <strong>Gemini Flash (Validation Loop Active)</strong></span>
      </div>
    </div>
  );
}
