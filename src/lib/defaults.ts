import type { ShippingConfig } from '../types';

/**
 * Configuracion inicial. Tarifas interurbanas para Republica Dominicana.
 * Modelo: tarifa base + tasa por km (como Uber).
 * Todo es editable desde la pantalla de Configuracion.
 */
export const defaultConfig: ShippingConfig = {
  currency: 'RD$',
  rounding: 5,
  kmTiers: [
    {
      id: 'tier-local',
      label: 'Local',
      minKm: 0,
      maxKm: 30,
      baseFare: 150,
      ratePerKm: 6,
    },
    {
      id: 'tier-regional',
      label: 'Regional',
      minKm: 30,
      maxKm: 100,
      baseFare: 350,
      ratePerKm: 4,
    },
    {
      id: 'tier-nacional',
      label: 'Nacional',
      minKm: 100,
      maxKm: 300,
      baseFare: 600,
      ratePerKm: 3,
    },
    {
      id: 'tier-largo',
      label: 'Gran distancia',
      minKm: 300,
      maxKm: null,
      baseFare: 900,
      ratePerKm: 2.5,
    },
  ],
  freeShipping: {
    enabled: true,
    threshold: 5000,
  },
  surcharges: [
    {
      id: 'sur-fragile',
      label: 'Manejo fragil',
      kind: 'fixed',
      amount: 150,
      enabledByDefault: false,
    },
    {
      id: 'sur-cod',
      label: 'Contra-entrega (COD)',
      kind: 'percent',
      amount: 3,
      enabledByDefault: false,
    },
    {
      id: 'sur-express',
      label: 'Entrega express',
      kind: 'fixed',
      amount: 300,
      enabledByDefault: false,
    },
    {
      id: 'sur-insurance',
      label: 'Seguro de envio',
      kind: 'percent',
      amount: 2,
      enabledByDefault: false,
    },
  ],
};

export function freshDefaultConfig(): ShippingConfig {
  return structuredClone(defaultConfig);
}
