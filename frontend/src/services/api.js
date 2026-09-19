/**
 * VISH API Client Service
 */

const RAW_BASE = import.meta.env.VITE_API_BASE_URL || '';
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

export async function checkHealth() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
  return res.json();
}

export async function createAudit({ url, auditType, testAccountProvided = false, isDemo = false, demoFlowId = null }) {
  const res = await fetch(`${API_BASE}/audits`, {
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
  const res = await fetch(`${API_BASE}/audits/${auditId}`);
  if (!res.ok) throw new Error(`Failed to load audit: ${res.status}`);
  return res.json();
}

export async function getAuditStatus(auditId) {
  const res = await fetch(`${API_BASE}/audits/${auditId}/status`);
  if (!res.ok) throw new Error(`Failed to fetch status: ${res.status}`);
  return res.json();
}

export async function getAuditResults(auditId) {
  const res = await fetch(`${API_BASE}/audits/${auditId}/results`);
  if (!res.ok) throw new Error(`Failed to fetch results: ${res.status}`);
  return res.json();
}

export async function getComparisonBenchmarks() {
  const res = await fetch(`${API_BASE}/comparison`);
  if (!res.ok) throw new Error(`Failed to load benchmarks: ${res.status}`);
  return res.json();
}

export async function getRubric() {
  const res = await fetch(`${API_BASE}/rubric`);
  if (!res.ok) throw new Error(`Failed to load rubric: ${res.status}`);
  return res.json();
}
