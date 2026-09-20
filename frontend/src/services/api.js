/**
 * VISH API Client Service
 */

const RAW_BASE = import.meta.env.VITE_API_BASE_URL || 
  (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')
    ? 'https://vish-dark-pattern-auditor-production.up.railway.app'
    : '');
export const BACKEND_BASE = RAW_BASE ? RAW_BASE.replace(/\/$/, '') : '';
export const API_BASE = BACKEND_BASE ? `${BACKEND_BASE}/api` : '/api';

/**
 * Resolves screenshot URLs: if URL is relative (/api/screenshots/...),
 * prefixes it with BACKEND_BASE so deployed frontend can fetch from deployed backend.
 */
export function getScreenshotUrl(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (BACKEND_BASE && url.startsWith('/')) {
    return `${BACKEND_BASE}${url}`;
  }
  return url;
}

/**
 * Resilient fetch helper:
 * 1. Tries the primary endpoint (API_BASE).
 * 2. If network/DNS fails (e.g. client ISP blocks direct Railway domain),
 *    automatically falls back to relative /api which proxies via Vercel Edge.
 * 3. Formats clear, user-friendly error messages instead of raw "Failed to fetch".
 */
async function requestWithFallback(endpoint, options = {}) {
  const primaryUrl = `${API_BASE}${endpoint}`;
  const fallbackUrl = (API_BASE && API_BASE !== '/api') ? `/api${endpoint}` : null;

  try {
    const res = await fetch(primaryUrl, options);
    return res;
  } catch (primaryErr) {
    if (fallbackUrl) {
      try {
        console.warn(`[VISH API] Direct connection to ${primaryUrl} failed (${primaryErr.message}). Retrying via edge proxy ${fallbackUrl}...`);
        const fallbackRes = await fetch(fallbackUrl, options);
        return fallbackRes;
      } catch (fallbackErr) {
        console.error(`[VISH API] Fallback proxy ${fallbackUrl} also failed:`, fallbackErr);
        throw new Error(
          `Unable to connect to VISH backend service. Direct connection and Vercel edge proxy both failed. Please check network connectivity.`
        );
      }
    }
    throw new Error(
      `Unable to connect to VISH backend (${primaryErr.message}). Please verify that the backend is reachable.`
    );
  }
}

export async function checkHealth() {
  const res = await requestWithFallback('/health');
  if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
  return res.json();
}

export async function createAudit({ url, auditType, testAccountProvided = false, isDemo = false, demoFlowId = null }) {
  const res = await requestWithFallback('/audits', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      url,
      audit_type: auditType,
      test_account_provided: testAccountProvided,
      is_demo: isDemo,
      demo_flow_id: demoFlowId
    })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to create audit' }));
    throw new Error(err.detail || 'Audit creation failed');
  }
  return res.json();
}

export async function getAudit(auditId) {
  const res = await requestWithFallback(`/audits/${auditId}`);
  if (!res.ok) throw new Error(`Failed to load audit: ${res.status}`);
  return res.json();
}

export async function getAuditStatus(auditId) {
  const res = await requestWithFallback(`/audits/${auditId}/status`);
  if (!res.ok) throw new Error(`Failed to fetch status: ${res.status}`);
  return res.json();
}

export async function getAuditResults(auditId) {
  const res = await requestWithFallback(`/audits/${auditId}/results`);
  if (!res.ok) throw new Error(`Failed to fetch results: ${res.status}`);
  return res.json();
}

export async function getComparisonBenchmarks() {
  const res = await requestWithFallback('/comparison');
  if (!res.ok) throw new Error(`Failed to load benchmarks: ${res.status}`);
  return res.json();
}

export async function getRubric() {
  const res = await requestWithFallback('/rubric');
  if (!res.ok) throw new Error(`Failed to load rubric: ${res.status}`);
  return res.json();
}
