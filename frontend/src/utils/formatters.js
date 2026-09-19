/**
 * VISH Utilities and Formatters
 */

export function formatScore(score) {
  return Math.max(0, Math.min(45, Math.round(score || 0)));
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount || 0);
}

export function formatConfidence(conf) {
  if (conf === null || conf === undefined) return '0%';
  return `${Math.round(conf * 100)}%`;
}

export function formatTime(minutes) {
  if (!minutes || minutes < 1) return '0 min';
  return `${minutes} min`;
}
