/** Modelo de datos del configurador de envios. */

/** Zona geografica de entrega con su tarifa base. */
export interface Zone {
  id: string;
  name: string;
  /** Tarifa base de la zona, en la moneda configurada. */
  baseRate: number;
}

/** Escala de peso. Las escalas se evaluan ascendentemente por `maxKg`. */
export interface WeightTier {
  id: string;
  label: string;
  /** Limite inferior del rango (kg). Base para `perKgExtra`. */
  minKg: number;
  /** Limite superior del rango (kg). `null` = escala abierta (tope). */
  maxKg: number | null;
  /** Tarifa fija de la escala. */
  rate: number;
  /** Cargo adicional por cada kg por encima de `minKg`. */
  perKgExtra: number;
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
  /** Si arranca activado en la calculadora. */
  enabledByDefault: boolean;
}

/** Configuracion completa del motor de calculo. */
export interface ShippingConfig {
  /** Simbolo de moneda, ej. "RD$". */
  currency: string;
  /** Redondea el total al multiplo mas cercano. 0 = sin redondeo. */
  rounding: number;
  zones: Zone[];
  weightTiers: WeightTier[];
  freeShipping: {
    enabled: boolean;
    /** Valor de orden a partir del cual el envio es gratis. */
    threshold: number;
  };
  surcharges: Surcharge[];
}

/** Entrada para una cotizacion puntual. */
export interface QuoteInput {
  zoneId: string;
  weightKg: number;
  orderValue: number;
  /** Ids de los recargos activos para esta cotizacion. */
  surchargeIds: string[];
}

export interface QuoteLine {
  label: string;
  amount: number;
}

/** Resultado de una cotizacion. */
export interface QuoteResult {
  /** Desglose: zona, peso y cada recargo. */
  lines: QuoteLine[];
  /** Suma del desglose, antes de envio gratis y redondeo. */
  subtotal: number;
  freeShippingApplied: boolean;
  /** Total final (0 si aplica envio gratis), ya redondeado. */
  total: number;
  rounded: boolean;
  currency: string;
  /** Avisos no bloqueantes para el usuario. */
  warnings: string[];
}
