import type {
  KmTier,
  ShippingConfig,
  QuoteInput,
  QuoteLine,
  QuoteResult,
} from '../types';

/** Redondea `value` al multiplo de `step` mas cercano. `step <= 0` => 2 decimales. */
export function roundTo(value: number, step: number): number {
  if (!Number.isFinite(value)) return 0;
  if (!step || step <= 0) return Math.round(value * 100) / 100;
  return Math.round(value / step) * step;
}

/**
 * Devuelve la escala de km aplicable a `distanceKm`.
 * Recorre las escalas por `minKm` ascendente; la escala abierta (maxKm null)
 * actua como tope. Si no hay escalas, devuelve `null`.
 */
export function findKmTier(
  tiers: KmTier[],
  distanceKm: number,
): KmTier | null {
  if (tiers.length === 0) return null;
  const sorted = [...tiers].sort((a, b) => a.minKm - b.minKm);
  for (const tier of sorted) {
    if (tier.maxKm == null || distanceKm <= tier.maxKm) return tier;
  }
  return sorted[sorted.length - 1];
}

/**
 * Calcula una cotizacion de envio por distancia.
 * Funcion pura: no lee ni escribe estado externo.
 *
 * total = tarifaBase + (tarifaPorKm × km) + recargos
 * Si el envio gratis aplica (orderValue >= threshold), total = 0.
 * El total final se redondea segun `config.rounding`.
 */
export function calculateQuote(
  config: ShippingConfig,
  input: QuoteInput,
): QuoteResult {
  const warnings: string[] = [];
  const lines: QuoteLine[] = [];

  const km = Math.max(0, toNumber(input.distanceKm));
  const orderValue = Math.max(0, toNumber(input.orderValue));

  if (km === 0) {
    warnings.push('Ingresa la distancia en kilometros.');
  } else {
    const tier = findKmTier(config.kmTiers, km);
    if (tier) {
      const distanceCharge = Math.max(0, tier.baseFare + tier.ratePerKm * km);
      lines.push({
        label: `${km % 1 === 0 ? km : km.toFixed(1)} km — ${tier.label}`,
        amount: distanceCharge,
      });
    } else {
      warnings.push('No hay tarifas por km configuradas.');
    }
  }

  for (const id of input.surchargeIds) {
    const surcharge = config.surcharges.find((s) => s.id === id);
    if (!surcharge) continue;
    const amount =
      surcharge.kind === 'percent'
        ? orderValue * (surcharge.amount / 100)
        : surcharge.amount;
    lines.push({
      label:
        surcharge.kind === 'percent'
          ? `${surcharge.label} (${surcharge.amount}% del valor)`
          : surcharge.label,
      amount: Math.max(0, amount),
    });
  }

  const subtotal = lines.reduce((sum, line) => sum + line.amount, 0);

  const freeShippingApplied =
    config.freeShipping.enabled &&
    config.freeShipping.threshold > 0 &&
    orderValue >= config.freeShipping.threshold;

  const rawTotal = freeShippingApplied ? 0 : subtotal;
  const total = roundTo(rawTotal, config.rounding);

  return {
    lines,
    subtotal,
    freeShippingApplied,
    total,
    rounded: Math.abs(total - rawTotal) > 1e-9,
    currency: config.currency,
    warnings,
  };
}

/** Cuanto falta (en valor de orden) para alcanzar el envio gratis. 0 si ya aplica o esta desactivado. */
export function amountToFreeShipping(
  config: ShippingConfig,
  orderValue: number,
): number {
  if (!config.freeShipping.enabled || config.freeShipping.threshold <= 0) return 0;
  return Math.max(0, config.freeShipping.threshold - Math.max(0, toNumber(orderValue)));
}

function toNumber(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}
