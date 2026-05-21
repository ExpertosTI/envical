import type {
  ShippingConfig,
  KmTier,
  Surcharge,
  SurchargeKind,
} from '../types';
import { freshDefaultConfig } from './defaults';
import { genId } from './format';

// v2 porque el modelo cambio de zonas+peso a km-based
const STORAGE_KEY = 'envical.config.v2';

export function loadConfig(): ShippingConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return freshDefaultConfig();
    return sanitizeConfig(JSON.parse(raw));
  } catch {
    return freshDefaultConfig();
  }
}

export function saveConfig(config: ShippingConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
    /* modo privado o cuota excedida */
  }
}

export function resetConfig(): ShippingConfig {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* sin acceso a storage */
  }
  return freshDefaultConfig();
}

export function exportConfig(config: ShippingConfig): string {
  return JSON.stringify(config, null, 2);
}

export function importConfig(json: string): ShippingConfig {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error('El archivo no contiene JSON valido.');
  }
  return sanitizeConfig(parsed);
}

/* ----------------------------------------------------------------------- *
 * Saneamiento estricto. Construye objetos nuevos copiando solo campos
 * conocidos con su tipo esperado. Nunca spread sobre la entrada, asi que
 * __proto__ y constructor jamas se propagan (sin riesgo de prototype pollution).
 * ----------------------------------------------------------------------- */

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('La configuracion tiene un formato invalido.');
  }
  return value as Record<string, unknown>;
}

function str(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() !== '' ? value : fallback;
}

function num(value: unknown, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function nonNegNum(value: unknown, fallback: number): number {
  return Math.max(0, num(value, fallback));
}

function bool(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function sanitizeKmTier(value: unknown): KmTier {
  const o = asRecord(value);
  const maxRaw = o.maxKm;
  const maxKm =
    maxRaw === null || maxRaw === undefined || maxRaw === ''
      ? null
      : nonNegNum(maxRaw, 0);
  return {
    id: str(o.id, genId()),
    label: str(o.label, 'Escala'),
    minKm: nonNegNum(o.minKm, 0),
    maxKm,
    baseFare: nonNegNum(o.baseFare, 0),
    ratePerKm: nonNegNum(o.ratePerKm, 0),
  };
}

function sanitizeSurcharge(value: unknown): Surcharge {
  const o = asRecord(value);
  const kind: SurchargeKind = o.kind === 'percent' ? 'percent' : 'fixed';
  return {
    id: str(o.id, genId()),
    label: str(o.label, 'Recargo'),
    kind,
    amount: nonNegNum(o.amount, 0),
    enabledByDefault: bool(o.enabledByDefault, false),
  };
}

export function sanitizeConfig(value: unknown): ShippingConfig {
  const o = asRecord(value);
  const fallback = freshDefaultConfig();

  const kmTiers = Array.isArray(o.kmTiers)
    ? o.kmTiers.map(sanitizeKmTier)
    : fallback.kmTiers;
  const surcharges = Array.isArray(o.surcharges)
    ? o.surcharges.map(sanitizeSurcharge)
    : fallback.surcharges;

  const freeShippingRaw =
    o.freeShipping && typeof o.freeShipping === 'object'
      ? (o.freeShipping as Record<string, unknown>)
      : {};

  return {
    currency: str(o.currency, fallback.currency),
    rounding: nonNegNum(o.rounding, fallback.rounding),
    kmTiers,
    freeShipping: {
      enabled: bool(freeShippingRaw.enabled, fallback.freeShipping.enabled),
      threshold: nonNegNum(freeShippingRaw.threshold, fallback.freeShipping.threshold),
    },
    surcharges,
  };
}
