import React from 'react';
import { UserPlus, ShoppingCart, UserX, AlertCircle } from 'lucide-react';

export default function AuditTypeSelector({ selectedType, onSelectType, testAccountProvided, onToggleTestAccount }) {
  const options = [
    {
      id: 'Signup',
      label: 'Signup',
      icon: UserPlus,
      desc: 'Public registration & onboarding flow'
    },
    {
      id: 'Checkout',
      label: 'Checkout',
      icon: ShoppingCart,
      desc: 'Cart, upgrades, hidden fees & add-ons'
    },
    {
      id: 'Cancellation / Account',
      label: 'Cancellation / Account',
      icon: UserX,
      desc: 'Subscription downgrade & account cancellation'
    }
  ];

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Select Audit Scope
      </label>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
        {options.map((opt) => {
          const Icon = opt.icon;
          const isSelected = selectedType === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onSelectType(opt.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isSelected ? 'var(--bg-card)' : 'var(--bg-surface)',
                border: `1.5px solid ${isSelected ? 'var(--accent-coral)' : 'var(--border-subtle)'}`,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease',
                color: 'var(--text-primary)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <Icon size={18} color={isSelected ? 'var(--accent-coral)' : 'var(--text-secondary)'} />
                <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{opt.label}</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                {opt.desc}
              </span>
            </button>
          );
        })}
      </div>

      {selectedType === 'Cancellation / Account' && (
        <div style={{ marginTop: '0.85rem', padding: '0.85rem', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <AlertCircle size={18} color="var(--accent-amber)" />
            <span style={{ fontSize: '0.85rem', color: '#FDE68A' }}>
              <strong>Scope Notice:</strong> Cancellation flows require an owner-supplied test account — VISH never touches unowned live accounts.
            </span>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer', color: 'var(--text-primary)' }}>
            <input
              type="checkbox"
              checked={testAccountProvided}
              onChange={(e) => onToggleTestAccount(e.target.checked)}
              style={{ accentColor: 'var(--accent-coral)' }}
            />
            <span>Test account verified</span>
          </label>
        </div>
      )}
    </div>
  );
}
