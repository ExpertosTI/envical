import { describe, expect, it } from 'vitest';
import {
  amountToFreeShipping,
  calculateQuote,
  findKmTier,
  roundTo,
} from './shipping-engine';
import { freshDefaultConfig } from './defaults';
import type { QuoteInput } from '../types';

function quote(partial: Partial<QuoteInput> = {}) {
  const config = freshDefaultConfig();
  const input: QuoteInput = {
    distanceKm: 50,
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

describe('findKmTier', () => {
  const tiers = freshDefaultConfig().kmTiers;
  it('asigna la escala segun la distancia', () => {
    expect(findKmTier(tiers, 15)?.id).toBe('tier-local');
    expect(findKmTier(tiers, 30)?.id).toBe('tier-local');
    expect(findKmTier(tiers, 50)?.id).toBe('tier-regional');
    expect(findKmTier(tiers, 100)?.id).toBe('tier-regional');
    expect(findKmTier(tiers, 150)?.id).toBe('tier-nacional');
  });
  it('todo lo que supere el tope cae en la escala abierta', () => {
    expect(findKmTier(tiers, 999)?.id).toBe('tier-largo');
  });
  it('sin escalas devuelve null', () => {
    expect(findKmTier([], 50)).toBeNull();
  });
});

describe('calculateQuote', () => {
  it('calcula: tarifaBase + tarifaPorKm * km', () => {
    // tier-regional: baseFare 350 + 4/km * 50km = 550; rounded to 5 => 550
    const result = quote({ distanceKm: 50 });
    expect(result.subtotal).toBe(550);
    expect(result.total).toBe(550);
    expect(result.freeShippingApplied).toBe(false);
  });

  it('escala local: baseFare + ratePerKm * km', () => {
    // tier-local: 150 + 6 * 20 = 270
    const result = quote({ distanceKm: 20 });
    expect(result.subtotal).toBe(270);
  });

  it('escala abierta (gran distancia)', () => {
    // tier-largo: 900 + 2.5 * 400 = 1900
    const result = quote({ distanceKm: 400 });
    expect(result.subtotal).toBe(1900);
  });

  it('recargo fijo y porcentual', () => {
    const result = quote({
      distanceKm: 0,
      orderValue: 1000,
      surchargeIds: ['sur-fragile', 'sur-cod'],
    });
    const fragile = result.lines.find((l) => l.label.includes('fragil'));
    const cod = result.lines.find((l) => l.label.includes('COD'));
    expect(fragile?.amount).toBe(150);
    expect(cod?.amount).toBe(30);
  });

  it('envio gratis al superar el umbral', () => {
    const result = quote({ distanceKm: 200, orderValue: 5000 });
    expect(result.freeShippingApplied).toBe(true);
    expect(result.total).toBe(0);
    expect(result.subtotal).toBeGreaterThan(0);
  });

  it('avisa cuando la distancia es 0', () => {
    const result = quote({ distanceKm: 0 });
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it('redondea el total segun la configuracion', () => {
    const config = freshDefaultConfig();
    config.kmTiers[0].baseFare = 147;
    config.kmTiers[0].ratePerKm = 0;
    // baseFare 147 + 0 * km = 147; rounded to 5 => 145
    const result = calculateQuote(config, {
      distanceKm: 10,
      orderValue: 0,
      surchargeIds: [],
    });
    expect(result.total).toBe(145);
    expect(result.rounded).toBe(true);
  });
});

describe('amountToFreeShipping', () => {
  it('calcula lo que falta para el envio gratis', () => {
    const config = freshDefaultConfig();
    expect(amountToFreeShipping(config, 3000)).toBe(2000);
    expect(amountToFreeShipping(config, 5500)).toBe(0);
  });
});
