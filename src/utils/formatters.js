// ─── Currency ──────────────────────────────────────────────────
// Formats a number as Indian Rupees
// formatCurrency(1500)   → "₹1,500.00"
// formatCurrency(150000) → "₹1,50,000.00"
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
};

// ─── Short Currency (no decimals) ─────────────────────────────
// Use this for stat cards where space is limited
// formatCurrencyShort(1500) → "₹1,500"
export const formatCurrencyShort = (amount) => {
  if (amount === null || amount === undefined) return '—';
  return '₹' + new Intl.NumberFormat('en-IN').format(Math.round(amount));
};

// ─── Date ─────────────────────────────────────────────────────
// formatDate('2025-01-15') → "15 Jan 2025"
export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

// ─── Date + Time ───────────────────────────────────────────────
// formatDateTime('2025-01-15T10:30:00') → "15 Jan 2025, 10:30 AM"
export const formatDateTime = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// ─── Percentage ────────────────────────────────────────────────
// formatPercent(12.5678) → "12.6%"
export const formatPercent = (val) => {
  if (val === null || val === undefined) return '—';
  return `${parseFloat(val).toFixed(1)}%`;
};

// ─── Health Score Color ────────────────────────────────────────
// Returns Ant Design color string based on score value
// Used for health score tags and progress bars
export const getHealthScoreColor = (score) => {
  if (score >= 70) return '#52c41a';  // green  — healthy
  if (score >= 40) return '#faad14';  // orange — needs attention
  return '#ff4d4f';                   // red    — critical
};

// ─── Risk Level Color ──────────────────────────────────────────
export const getRiskColor = (risk) => {
  const map = {
    LOW:    'success',
    MEDIUM: 'warning',
    HIGH:   'error',
  };
  return map[risk] || 'default';
};

// ─── Truncate Long Text ────────────────────────────────────────
// truncateText('Very long product name here', 30) → "Very long product name here..."
export const truncateText = (text, maxLength = 40) => {
  if (!text) return '—';
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
};