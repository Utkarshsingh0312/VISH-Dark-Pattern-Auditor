import React, { useState } from 'react';
import { Camera, Eye, Scan, Monitor, ShieldCheck, AlertOctagon, CheckCircle2 } from 'lucide-react';

export default function ScreenshotViewer({ 
  screenshotUrl, 
  currentUrl, 
  pageTitle, 
  actionTaken, 
  isScanning, 
  stepNumber, 
  isLiveCrawl = false,
  visionSource = 'pending',
  stoppedForSafety = false 
}) {
  const [imgError, setImgError] = useState(false);

  const getSourceBadge = () => {
    if (!isLiveCrawl) return { text: "DEMO VIEWPORT", color: "badge-blue" };
    if (visionSource === "gemini_vision") return { text: "REAL GEMINI VISION", color: "badge-coral" };
    if (visionSource === "mock") return { text: "MOCK VISION ANALYSIS", color: "badge-blue" };
    return { text: "LIVE PLAYWRIGHT", color: "badge-coral" };
  };

  const badge = getSourceBadge();

  return (
    <div className="card" style={{ padding: '1rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Browser address header simulation */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          padding: '0.6rem 0.85rem',
          backgroundColor: 'var(--bg-main)',
          borderRadius: 'var(--radius-sm)',
          marginBottom: '0.75rem',
          border: '1px solid var(--border-subtle)',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.8rem',
          color: 'var(--text-secondary)'
        }}
      >
        <div style={{ display: 'flex', gap: '5px' }}>
          <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#EF4444', display: 'inline-block' }} />
          <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#F59E0B', display: 'inline-block' }} />
          <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }} />
        </div>
        <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-primary)', fontWeight: 500 }}>
          {currentUrl || 'https://target-flow.example/checkout'}
        </div>
        <span className={`badge ${badge.color}`} style={{ fontSize: '0.65rem', padding: '0.15rem 0.5rem' }}>
          {badge.text} · Step {stepNumber || 1}
        </span>
      </div>

      {/* Safety Notice Banner if safety stop was triggered */}
      {stoppedForSafety && (
        <div
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.6rem 0.85rem',
            marginBottom: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.8rem',
            color: '#FCA5A5'
          }}
        >
          <AlertOctagon size={16} color="var(--accent-rose)" style={{ flexShrink: 0 }} />
          <span>
            <strong>SAFETY BOUNDARY ENFORCED:</strong> Browser agent detected transactional trigger and halted navigation. Never submits real payment.
          </span>
        </div>
      )}

      {/* Main Viewport Container */}
      <div
        style={{
          flex: 1,
          minHeight: '380px',
          backgroundColor: '#070B13',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-subtle)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden'
        }}
      >
        {isScanning && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              backgroundColor: 'var(--accent-coral)',
              boxShadow: '0 0 12px var(--accent-coral)',
              zIndex: 10,
              animation: 'pulse 1.5s infinite'
            }}
          />
        )}

        {/* Real Screenshot Image if available */}
        {screenshotUrl && !imgError ? (
          <div style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img
              src={screenshotUrl}
              alt={`Audit Viewport Step ${stepNumber}`}
              onError={() => setImgError(true)}
              style={{
                width: '100%',
                height: '100%',
                maxHeight: '440px',
                objectFit: 'contain',
                display: 'block'
              }}
            />
          </div>
        ) : (
          /* Placeholder Canvas when waiting or in demo mode */
          <div style={{ textAlign: 'center', padding: '2rem', maxWidth: '380px' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-highlight)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
                color: isScanning ? 'var(--accent-coral)' : 'var(--text-secondary)'
              }}
            >
              {isScanning ? <Scan size={30} /> : <Monitor size={30} />}
            </div>

            <h4 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '0.4rem' }}>
              {isScanning ? 'Vision Model Inspecting Viewport...' : (pageTitle || 'Playwright Viewport Stream')}
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              {actionTaken || 'Playwright drives Chromium in an isolated context, taking real full-viewport PNG screenshots.'}
            </p>
          </div>
        )}

        {/* Floating live capture tag */}
        <div
          style={{
            position: 'absolute',
            bottom: '0.75rem',
            left: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.3rem 0.7rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'rgba(11, 15, 25, 0.85)',
            backdropFilter: 'blur(8px)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.725rem',
            fontFamily: 'var(--font-mono)'
          }}
        >
          <Camera size={13} color="var(--accent-coral)" />
          <span>{screenshotUrl ? 'Real Viewport PNG' : 'Playwright Active'}</span>
        </div>

        {pageTitle && (
          <div
            style={{
              position: 'absolute',
              bottom: '0.75rem',
              right: '0.75rem',
              maxWidth: '240px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              padding: '0.3rem 0.7rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'rgba(11, 15, 25, 0.85)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.725rem',
              color: 'var(--text-secondary)'
            }}
          >
            Title: <strong style={{ color: 'var(--text-primary)' }}>{pageTitle}</strong>
          </div>
        )}
      </div>

      {/* Action metadata footer */}
      {actionTaken && (
        <div style={{ marginTop: '0.65rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Action: <strong style={{ color: 'var(--text-secondary)' }}>{actionTaken}</strong></span>
          <span>Resolution: <strong>1280 × 800</strong></span>
        </div>
      )}
    </div>
  );
}
