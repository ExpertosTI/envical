/** Modelo de datos del configurador de envios por km. */

/** Escala de distancia en km con tarifa base + tasa por km. */
export interface KmTier {
  id: string;
  label: string;
  /** Limite inferior del rango (km). */
  minKm: number;
  /** Limite superior del rango (km). `null` = escala abierta (sin tope). */
  maxKm: number | null;
  /** Tarifa base fija de la escala. */
  baseFare: number;
  /** Cargo adicional por cada km recorrido. */
  ratePerKm: number;
}

export type SurchargeKind = 'fixed' | 'percent';

/**
 * Recargo opcional aplicable a una cotizacion.
 * - `fixed`: suma `amount` en moneda.
 * - `percent`: suma `amount`% del valor de la orden.
 */
export interface Surcharge {
  id: string;
  label: string;
  kind: SurchargeKind;
  amount: number;
  enabledByDefault: boolean;
}

/** Configuracion completa del motor de calculo. */
export interface ShippingConfig {
  currency: string;
  rounding: number;
  kmTiers: KmTier[];
  freeShipping: {
    enabled: boolean;
    threshold: number;
  };
  surcharges: Surcharge[];
}

/** Entrada para una cotizacion puntual. */
export interface QuoteInput {
  distanceKm: number;
  orderValue: number;
  surchargeIds: string[];
}

export interface QuoteLine {
  label: string;
  amount: number;
}

/** Resultado de una cotizacion. */
export interface QuoteResult {
  lines: QuoteLine[];
  subtotal: number;
  freeShippingApplied: boolean;
  total: number;
  rounded: boolean;
  currency: string;
  warnings: string[];
}
