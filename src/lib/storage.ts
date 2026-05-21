import type {
  ShippingConfig,
  Surcharge,
  SurchargeKind,
  WeightTier,
  Zone,
} from '../types';
import { freshDefaultConfig } from './defaults';
import { genId } from './format';

const STORAGE_KEY = 'envical.config.v1';

/** Carga la configuracion desde localStorage, o la inicial si no hay/es invalida. */
export function loadConfig(): ShippingConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return freshDefaultConfig();
    return sanitizeConfig(JSON.parse(raw));
  } catch {
    return freshDefaultConfig();
  }
}

/** Persiste la configuracion en localStorage. Silencioso si el storage falla. */
export function saveConfig(config: ShippingConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
    /* modo privado o cuota excedida: la app sigue funcionando en memoria */
  }
}

/** Borra la configuracion guardada y devuelve la inicial. */
export function resetConfig(): ShippingConfig {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* sin acceso a storage */
  }
  return freshDefaultConfig();
}

/** Serializa la configuracion a JSON legible para exportar. */
export function exportConfig(config: ShippingConfig): string {
  return JSON.stringify(config, null, 2);
}

/**
 * Parsea e importa una configuracion desde JSON.
 * Lanza error si el JSON o la estructura son invalidos.
 */
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
 * Saneamiento estricto.
 * Construye objetos nuevos copiando solo campos conocidos y con su tipo
 * esperado. Nunca usa spread/merge sobre la entrada, asi que claves como
 * __proto__ o constructor jamas se propagan (sin riesgo de prototype
 * pollution) y cualquier dato extrano se descarta.
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

function sanitizeZone(value: unknown): Zone {
  const o = asRecord(value);
  return {
    id: str(o.id, genId()),
    name: str(o.name, 'Zona sin nombre'),
    baseRate: nonNegNum(o.baseRate, 0),
  };
}

function sanitizeTier(value: unknown): WeightTier {
  const o = asRecord(value);
  const maxRaw = o.maxKg;
  const maxKg =
    maxRaw === null || maxRaw === undefined || maxRaw === ''
      ? null
      : nonNegNum(maxRaw, 0);
  return {
    id: str(o.id, genId()),
    label: str(o.label, 'Escala'),
    minKg: nonNegNum(o.minKg, 0),
    maxKg,
    rate: nonNegNum(o.rate, 0),
    perKgExtra: nonNegNum(o.perKgExtra, 0),
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

/** Valida y normaliza una configuracion arbitraria. Lanza error si es irrecuperable. */
export function sanitizeConfig(value: unknown): ShippingConfig {
  const o = asRecord(value);
  const fallback = freshDefaultConfig();

  const zones = Array.isArray(o.zones) ? o.zones.map(sanitizeZone) : fallback.zones;
  const weightTiers = Array.isArray(o.weightTiers)
    ? o.weightTiers.map(sanitizeTier)
    : fallback.weightTiers;
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
    zones,
    weightTiers,
    freeShipping: {
      enabled: bool(freeShippingRaw.enabled, fallback.freeShipping.enabled),
      threshold: nonNegNum(freeShippingRaw.threshold, fallback.freeShipping.threshold),
    },
    surcharges,
  };
}
