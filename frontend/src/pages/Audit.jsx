import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuditInput from '../components/AuditInput';
import AuditTypeSelector from '../components/AuditTypeSelector';
import SafetyNotice from '../components/SafetyNotice';
import AuditProgress from '../components/AuditProgress';
import ScreenshotViewer from '../components/ScreenshotViewer';
import PatternFeed from '../components/PatternFeed';
import FrictionScore from '../components/FrictionScore';
import ErrorState from '../components/ErrorState';
import { useAudit } from '../hooks/useAudit';
import { ArrowRight, CheckCircle2, ShieldCheck, AlertOctagon } from 'lucide-react';

export default function Audit() {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState('Checkout');
  const [testAccountProvided, setTestAccountProvided] = useState(false);
  const [targetUrl, setTargetUrl] = useState('');

  const {
    auditId,
    status,
    stepIndex,
    frictionScore,
    detections,
    latestStep,
    isLiveCrawl,
    visionSource,
    paymentDetected,
    stoppedForSafety,
    results,
    isLoading,
    error,
    startAuditFlow
  } = useAudit();

  const handleStartAudit = async (url) => {
    setTargetUrl(url);
    await startAuditFlow({
      url,
      auditType: selectedType,
      testAccountProvided,
      isDemo: false
    });
  };

  const handleStartDemo = async (demoFlowId) => {
    const demoUrl = demoFlowId === 'honest_flow'
      ? 'https://demo.honest-checkout.flow'
      : 'https://demo.dark-pattern-checkout.flow';

    setTargetUrl(demoUrl);
    await startAuditFlow({
      url: demoUrl,
      auditType: selectedType,
      testAccountProvided: true,
      isDemo: true,
      demoFlowId
    });
  };

  const isScanning = ['Analyzing screen', 'Detecting patterns', 'Inspecting page'].includes(status);
  const isComplete = status === 'Complete';

  return (
    <div>
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
          <span style={{ fontSize: '0.75rem', letterSpacing: '0.15em', color: 'var(--accent-coral)', fontWeight: 700, textTransform: 'uppercase' }}>
            REAL PLAYWRIGHT AGENT CONSOLE
          </span>
          {isLiveCrawl && (
            <span className="badge badge-coral" style={{ fontSize: '0.65rem' }}>
              LIVE BROWSER ACTIVE
            </span>
          )}
        </div>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, marginTop: '0.25rem', marginBottom: '0.5rem' }}>
          Drive the Flow. Catch Patterns Live.
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
          VISH drives an automated Chromium browser through the target flow, capturing every manipulation screen-by-screen.
        </p>
      </div>

      {/* URL Input & Demo Selector */}
      <AuditInput
        onStartAudit={handleStartAudit}
        onStartDemo={handleStartDemo}
        isLoading={isLoading}
      />

      {/* Scope Selector */}
      <AuditTypeSelector
        selectedType={selectedType}
        onSelectType={setSelectedType}
        testAccountProvided={testAccountProvided}
        onToggleTestAccount={setTestAccountProvided}
      />

      {/* Live Error Banner if encountered */}
      {error && (
        <div style={{ marginBottom: '2rem' }}>
          <ErrorState error={error} />
        </div>
      )}

      {/* Live Audit Execution Shell */}
      {(targetUrl || status !== 'Ready to audit') && (
        <div style={{ margin: '3rem 0' }}>
          <AuditProgress
            status={status}
            currentStepIndex={stepIndex}
            isComplete={isComplete}
            url={targetUrl}
          />

          {/* Grid with Screenshot Viewer, Score & Pattern Feed */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1.4fr) minmax(300px, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
            {/* Left: Live Screenshot Viewer */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <ScreenshotViewer
                screenshotUrl={latestStep?.screenshot_url}
                currentUrl={latestStep?.url || targetUrl}
                pageTitle={latestStep?.title}
                actionTaken={latestStep?.action}
                isScanning={isScanning}
                stepNumber={stepIndex}
                isLiveCrawl={isLiveCrawl}
                visionSource={visionSource}
                stoppedForSafety={stoppedForSafety}
              />
            </div>

            {/* Right: Live Friction Score and Pattern Feed */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                <FrictionScore score={frictionScore} label={isLiveCrawl ? "Live Playwright Score" : "Live Friction Score"} />
                {isComplete && auditId && (
                  <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
                    <button
                      type="button"
                      onClick={() => navigate(`/results/${auditId}`)}
                      className="btn btn-primary"
                      style={{ width: '100%' }}
                    >
                      View Full Itemized Receipt <ArrowRight size={16} />
                    </button>
                  </div>
                )}
              </div>

              <div style={{ flex: 1, minHeight: '280px' }}>
                <PatternFeed detections={detections} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Safety Notice */}
      <div style={{ marginTop: '3rem' }}>
        <SafetyNotice />
      </div>
    </div>
  );
}
