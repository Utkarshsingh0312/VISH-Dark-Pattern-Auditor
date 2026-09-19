import React from 'react';
import { Check } from 'lucide-react';

export default function StepTimeline({ currentStepIndex = 1, isComplete = false }) {
  const steps = [
    { num: '01', label: 'Open Target' },
    { num: '02', label: 'Browse Flow' },
    { num: '03', label: 'Capture Screen' },
    { num: '04', label: 'Vision Model' },
    { num: '05', label: 'Tag Patterns' },
    { num: '06', label: 'Score Receipt' }
  ];

  return (
    <div style={{ width: '100%', margin: '1.5rem 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
        {/* Connecting line */}
        <div
          style={{
            position: 'absolute',
            left: '20px',
            right: '20px',
            top: '18px',
            height: '2px',
            backgroundColor: 'var(--border-subtle)',
            zIndex: 0
          }}
        />

        {steps.map((step, idx) => {
          const stepNum = idx + 1;
          const isDone = isComplete || stepNum < currentStepIndex;
          const isCurrent = !isComplete && stepNum === currentStepIndex;

          return (
            <div
              key={step.num}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                zIndex: 1,
                position: 'relative'
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  transition: 'all 0.3s ease',
                  backgroundColor: isDone
                    ? 'var(--accent-coral)'
                    : isCurrent
                    ? 'var(--bg-surface)'
                    : 'var(--bg-surface)',
                  border: isCurrent
                    ? '2px solid var(--accent-coral)'
                    : isDone
                    ? '2px solid var(--accent-coral)'
                    : '2px solid var(--border-subtle)',
                  color: isDone ? '#fff' : isCurrent ? 'var(--accent-coral)' : 'var(--text-muted)',
                  boxShadow: isCurrent ? '0 0 12px rgba(255, 87, 51, 0.4)' : 'none'
                }}
              >
                {isDone ? <Check size={16} strokeWidth={3} /> : step.num}
              </div>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  marginTop: '0.5rem',
                  color: isCurrent ? 'var(--accent-coral)' : isDone ? 'var(--text-primary)' : 'var(--text-muted)',
                  whiteSpace: 'nowrap'
                }}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
