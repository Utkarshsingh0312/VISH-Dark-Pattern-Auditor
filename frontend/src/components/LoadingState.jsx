import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingState({ message = "Auditing live interface..." }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem', textAlign: 'center' }}>
      <Loader2 size={36} color="var(--accent-coral)" style={{ animation: 'spin 1s linear infinite' }} />
      <p style={{ marginTop: '1.25rem', color: 'var(--text-secondary)', fontWeight: 500, fontFamily: 'var(--font-mono)', fontSize: '0.95rem' }}>
        {message}
      </p>
    </div>
  );
}
