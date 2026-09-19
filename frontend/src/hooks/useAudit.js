import { useState, useEffect, useRef } from 'react';
import { createAudit, getAuditStatus, getAuditResults } from '../services/api';

export function useAudit(auditId = null) {
  const [currentAuditId, setCurrentAuditId] = useState(auditId);
  const [status, setStatus] = useState('Ready to audit');
  const [stepIndex, setStepIndex] = useState(1);
  const [frictionScore, setFrictionScore] = useState(0);
  const [detections, setDetections] = useState([]);
  const [latestStep, setLatestStep] = useState(null);
  const [isLiveCrawl, setIsLiveCrawl] = useState(false);
  const [visionSource, setVisionSource] = useState('pending');
  const [paymentDetected, setPaymentDetected] = useState(false);
  const [stoppedForSafety, setStoppedForSafety] = useState(false);
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const pollingRef = useRef(null);

  // Status progression states for demo simulation
  const DEMO_STATUS_FLOW = [
    'Opening website',
    'Navigating',
    'Capturing screen',
    'Analyzing screen',
    'Detecting patterns',
    'Calculating score',
    'Generating receipt',
    'Complete'
  ];

  const clearPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  const startAuditFlow = async ({ url, auditType, testAccountProvided = false, isDemo = false, demoFlowId = null }) => {
    setIsLoading(true);
    setError(null);
    setStatus('Opening website');
    setStepIndex(1);
    setFrictionScore(0);
    setDetections([]);
    setLatestStep(null);
    setResults(null);
    setIsLiveCrawl(!isDemo);
    setPaymentDetected(false);
    setStoppedForSafety(false);
    clearPolling();

    try {
      const newAudit = await createAudit({
        url,
        auditType,
        testAccountProvided,
        isDemo,
        demoFlowId
      });

      setCurrentAuditId(newAudit.id);

      if (isDemo) {
        // Run pre-calibrated demo progression
        let stage = 0;
        pollingRef.current = setInterval(async () => {
          stage += 1;
          if (stage < DEMO_STATUS_FLOW.length) {
            const nextStatus = DEMO_STATUS_FLOW[stage];
            setStatus(nextStatus);
            setStepIndex(Math.min(6, Math.max(1, Math.ceil((stage / DEMO_STATUS_FLOW.length) * 6))));
            
            if (stage === 3) {
              setFrictionScore(demoFlowId === 'honest_flow' ? 6 : 12);
            }
          } else {
            clearPolling();
            setStatus('Complete');
            setStepIndex(6);
            const finalResult = await getAuditResults(newAudit.id);
            setResults(finalResult);
            setFrictionScore(finalResult.friction_score);
            setDetections(finalResult.detections);
            setIsLoading(false);
          }
        }, 650);
      } else {
        // Real Live Playwright Audit: Poll backend status
        loggerInfo('Started live Playwright audit polling for:', newAudit.id);
        
        pollingRef.current = setInterval(async () => {
          try {
            const statusData = await getAuditStatus(newAudit.id);
            setStatus(statusData.status);
            setStepIndex(statusData.current_step_index || 1);
            setFrictionScore(statusData.friction_score || 0);
            if (statusData.latest_step) {
              setLatestStep(statusData.latest_step);
            }
            if (statusData.vision_source) setVisionSource(statusData.vision_source);
            if (statusData.payment_detected) setPaymentDetected(true);
            if (statusData.stopped_for_safety) setStoppedForSafety(true);

            if (statusData.status === 'Complete') {
              clearPolling();
              const finalResult = await getAuditResults(newAudit.id);
              setResults(finalResult);
              setFrictionScore(finalResult.friction_score);
              setDetections(finalResult.detections);
              if (finalResult.vision_source) setVisionSource(finalResult.vision_source);
              setIsLoading(false);
            } else if (statusData.status === 'Failed') {
              clearPolling();
              setError(statusData.error_message || 'Browser audit execution failed.');
              setIsLoading(false);
            }
          } catch (pollErr) {
            console.warn('Polling error:', pollErr);
          }
        }, 1000);
      }

      return newAudit;
    } catch (err) {
      clearPolling();
      setError(err.message || 'An error occurred during audit');
      setStatus('Failed');
      setIsLoading(false);
      throw err;
    }
  };

  const loadExistingAudit = async (id) => {
    setIsLoading(true);
    setError(null);
    clearPolling();
    try {
      const res = await getAuditResults(id);
      setResults(res);
      setFrictionScore(res.friction_score);
      setDetections(res.detections);
      setIsLiveCrawl(res.is_live_crawl || false);
      setVisionSource(res.vision_source || 'pending');
      setPaymentDetected(res.payment_detected || false);
      setStoppedForSafety(res.stopped_for_safety || false);
      if (res.steps && res.steps.length > 0) {
        setLatestStep(res.steps[res.steps.length - 1]);
      }
      setStatus('Complete');
      setStepIndex(6);
      setCurrentAuditId(id);
    } catch (err) {
      setError(err.message || 'Failed to load audit results');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    return () => clearPolling();
  }, []);

  return {
    auditId: currentAuditId,
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
    startAuditFlow,
    loadExistingAudit
  };
}

function loggerInfo(...args) {
  if (typeof window !== 'undefined' && window.console) {
    console.log('[VISH useAudit]', ...args);
  }
}
