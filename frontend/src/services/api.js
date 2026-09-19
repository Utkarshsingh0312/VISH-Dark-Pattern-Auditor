/**
 * VISH API Client Service
 */

const API_BASE = '/api';

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
