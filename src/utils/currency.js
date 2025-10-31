// Formato precio $

function formatCLP_safe(value) {
  const num = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(num)) return '$0';
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(num);
}
