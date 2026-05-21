import type { ShippingConfig } from '../types';

/**
 * Configuracion inicial. Zonas regionales de Republica Dominicana.
 * Todo es editable desde la pantalla de Configuracion.
 */
export const defaultConfig: ShippingConfig = {
  currency: 'RD$',
  rounding: 5,
  zones: [
    { id: 'zone-gsd', name: 'Gran Santo Domingo', baseRate: 250 },
    { id: 'zone-santiago', name: 'Santiago', baseRate: 350 },
    { id: 'zone-cibao', name: 'Cibao / Norte', baseRate: 450 },
    { id: 'zone-este', name: 'Region Este', baseRate: 500 },
    { id: 'zone-sur', name: 'Region Sur', baseRate: 550 },
    { id: 'zone-pickup', name: 'Retiro en tienda', baseRate: 0 },
  ],
  weightTiers: [
    { id: 'tier-light', label: 'Ligero', minKg: 0, maxKg: 1, rate: 0, perKgExtra: 0 },
    { id: 'tier-standard', label: 'Estandar', minKg: 1, maxKg: 5, rate: 150, perKgExtra: 0 },
    { id: 'tier-heavy', label: 'Pesado', minKg: 5, maxKg: 15, rate: 350, perKgExtra: 0 },
    { id: 'tier-over', label: 'Sobrepeso', minKg: 15, maxKg: null, rate: 600, perKgExtra: 40 },
  ],
  freeShipping: {
    enabled: true,
    threshold: 3000,
  },
  surcharges: [
    { id: 'sur-fragile', label: 'Manejo fragil', kind: 'fixed', amount: 150, enabledByDefault: false },
    { id: 'sur-cod', label: 'Contra-entrega (COD)', kind: 'percent', amount: 3, enabledByDefault: false },
    { id: 'sur-express', label: 'Entrega express', kind: 'fixed', amount: 300, enabledByDefault: false },
    { id: 'sur-insurance', label: 'Seguro de envio', kind: 'percent', amount: 2, enabledByDefault: false },
  ],
};

/** Devuelve una copia profunda independiente de la configuracion inicial. */
export function freshDefaultConfig(): ShippingConfig {
  return structuredClone(defaultConfig);
}
