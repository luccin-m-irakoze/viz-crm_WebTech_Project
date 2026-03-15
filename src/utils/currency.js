/**
 * Format monetary value as Rwanda Francs (RWF)
 * @param {number} value - Numeric value
 * @param {{ compact?: boolean }} options - compact: use k/M suffix (e.g. 45.0k)
 * @returns {string}
 */
export function formatRwf(value, options = {}) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 'RWF 0';
  if (options.compact && Math.abs(n) >= 1000) {
    return `RWF ${(n / 1000).toFixed(1)}k`;
  }
  return `RWF ${n.toLocaleString()}`;
}
