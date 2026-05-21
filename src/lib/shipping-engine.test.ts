import { describe, expect, it } from 'vitest';
import {
  amountToFreeShipping,
  calculateQuote,
  findWeightTier,
  roundTo,
} from './shipping-engine';
import { freshDefaultConfig } from './defaults';
import type { QuoteInput } from '../types';

function quote(partial: Partial<QuoteInput> = {}) {
  const config = freshDefaultConfig();
  const input: QuoteInput = {
    zoneId: 'zone-gsd',
    weightKg: 0.5,
    orderValue: 0,
    surchargeIds: [],
    ...partial,
  };
  return calculateQuote(config, input);
}

describe('roundTo', () => {
  it('redondea al multiplo mas cercano', () => {
    expect(roundTo(247, 5)).toBe(245);
    expect(roundTo(248, 5)).toBe(250);
  });
  it('sin paso, conserva 2 decimales', () => {
    expect(roundTo(12.345, 0)).toBe(12.35);
  });
  it('valores no finitos => 0', () => {
    expect(roundTo(Number.NaN, 5)).toBe(0);
  });
});

describe('findWeightTier', () => {
  const tiers = freshDefaultConfig().weightTiers;
  it('asigna la escala por limite superior', () => {
    expect(findWeightTier(tiers, 0.5)?.id).toBe('tier-light');
    expect(findWeightTier(tiers, 1)?.id).toBe('tier-light');
    expect(findWeightTier(tiers, 3)?.id).toBe('tier-standard');
    expect(findWeightTier(tiers, 12)?.id).toBe('tier-heavy');
  });
  it('todo lo que supere el tope cae en la escala abierta', () => {
    expect(findWeightTier(tiers, 999)?.id).toBe('tier-over');
  });
  it('sin escalas devuelve null', () => {
    expect(findWeightTier([], 5)).toBeNull();
  });
});

describe('calculateQuote', () => {
  it('suma tarifa de zona y cargo de peso', () => {
    const result = quote({ zoneId: 'zone-santiago', weightKg: 3 });
    // Santiago 350 + escala estandar 150 = 500
    expect(result.subtotal).toBe(500);
    expect(result.total).toBe(500);
    expect(result.freeShippingApplied).toBe(false);
  });

  it('aplica cargo por kg extra en la escala de sobrepeso', () => {
    // Sobrepeso: rate 600 + 40/kg sobre 15kg. A 20kg => 600 + 40*5 = 800
    const result = quote({ zoneId: 'zone-pickup', weightKg: 20 });
    const weightLine = result.lines.find((l) => l.label.startsWith('Peso'));
    expect(weightLine?.amount).toBe(800);
  });

  it('recargo fijo y porcentual', () => {
    const result = quote({
      zoneId: 'zone-pickup',
      weightKg: 0.5,
      orderValue: 1000,
      surchargeIds: ['sur-fragile', 'sur-cod'],
    });
    // fragil 150 fijo + COD 3% de 1000 = 30
    const fragile = result.lines.find((l) => l.label.includes('fragil'));
    const cod = result.lines.find((l) => l.label.includes('COD'));
    expect(fragile?.amount).toBe(150);
    expect(cod?.amount).toBe(30);
  });

  it('envio gratis al superar el umbral', () => {
    const result = quote({ zoneId: 'zone-sur', weightKg: 10, orderValue: 5000 });
    expect(result.freeShippingApplied).toBe(true);
    expect(result.total).toBe(0);
    expect(result.subtotal).toBeGreaterThan(0);
  });

  it('avisa cuando no hay zona seleccionada', () => {
    const result = quote({ zoneId: 'inexistente' });
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it('redondea el total segun la configuracion', () => {
    const config = freshDefaultConfig();
    config.zones[0].baseRate = 247;
    const result = calculateQuote(config, {
      zoneId: config.zones[0].id,
      weightKg: 0.5,
      orderValue: 0,
      surchargeIds: [],
    });
    expect(result.total).toBe(245);
    expect(result.rounded).toBe(true);
  });
});

describe('amountToFreeShipping', () => {
  it('calcula lo que falta para el envio gratis', () => {
    const config = freshDefaultConfig();
    expect(amountToFreeShipping(config, 2000)).toBe(1000);
    expect(amountToFreeShipping(config, 3500)).toBe(0);
  });
});
