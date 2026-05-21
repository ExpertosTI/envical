import type {
  ShippingConfig,
  QuoteInput,
  QuoteLine,
  QuoteResult,
  WeightTier,
} from '../types';

/** Redondea `value` al multiplo de `step` mas cercano. `step <= 0` => 2 decimales. */
export function roundTo(value: number, step: number): number {
  if (!Number.isFinite(value)) return 0;
  if (!step || step <= 0) return Math.round(value * 100) / 100;
  return Math.round(value / step) * step;
}

/**
 * Devuelve la escala de peso aplicable a `weightKg`.
 * Recorre las escalas por `maxKg` ascendente; la escala abierta (maxKg null)
 * actua como tope. Si no hay escalas, devuelve `null`.
 */
export function findWeightTier(
  tiers: WeightTier[],
  weightKg: number,
): WeightTier | null {
  if (tiers.length === 0) return null;
  const sorted = [...tiers].sort((a, b) => a.minKg - b.minKg);
  for (const tier of sorted) {
    if (tier.maxKg == null) return tier;
    if (weightKg <= tier.maxKg) return tier;
  }
  return sorted[sorted.length - 1];
}

function weightChargeFor(tier: WeightTier, weightKg: number): number {
  const extraKg = Math.max(0, weightKg - tier.minKg);
  return Math.max(0, tier.rate + tier.perKgExtra * extraKg);
}

/**
 * Calcula una cotizacion de envio.
 * Funcion pura: no lee ni escribe estado externo.
 *
 * total = tarifaZona + cargoPeso + recargos
 * Si el envio gratis aplica (orderValue >= threshold), total = 0.
 * El total final se redondea segun `config.rounding`.
 */
export function calculateQuote(
  config: ShippingConfig,
  input: QuoteInput,
): QuoteResult {
  const warnings: string[] = [];
  const lines: QuoteLine[] = [];

  const weightKg = Math.max(0, toNumber(input.weightKg));
  const orderValue = Math.max(0, toNumber(input.orderValue));

  const zone = config.zones.find((z) => z.id === input.zoneId);
  if (zone) {
    lines.push({ label: `Zona: ${zone.name}`, amount: Math.max(0, zone.baseRate) });
  } else {
    warnings.push('Selecciona una zona de entrega.');
  }

  const tier = findWeightTier(config.weightTiers, weightKg);
  if (tier) {
    lines.push({
      label: `Peso: ${tier.label} (${formatKg(weightKg)} kg)`,
      amount: weightChargeFor(tier, weightKg),
    });
  } else if (config.weightTiers.length === 0) {
    warnings.push('No hay escalas de peso configuradas.');
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

function formatKg(kg: number): string {
  return Number.isInteger(kg) ? String(kg) : kg.toFixed(2);
}
