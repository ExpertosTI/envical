/** Formatea un monto con simbolo de moneda y separadores es-DO. */
export function formatMoney(amount: number, currency: string): string {
  const safe = Number.isFinite(amount) ? amount : 0;
  const rounded = Math.round(safe * 100) / 100;
  const body = rounded.toLocaleString('es-DO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${currency} ${body}`;
}

/** Genera un id unico. Usa crypto.randomUUID cuando esta disponible. */
export function genId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
