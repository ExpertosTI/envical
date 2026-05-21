import { useEffect, useMemo, useState } from 'react';
import type { ShippingConfig } from '../types';
import {
  amountToFreeShipping,
  calculateQuote,
  findWeightTier,
} from '../lib/shipping-engine';
import { formatMoney } from '../lib/format';
import { Card, Chip, NumberField, Toggle } from '../components/ui';
import { IconBolt, IconCheck, IconPackage, IconTruck } from '../components/icons';

const QUICK_WEIGHTS = [0.5, 1, 2, 5, 10];

export function Calculator({ config }: { config: ShippingConfig }) {
  const [zoneId, setZoneId] = useState<string>(() => config.zones[0]?.id ?? '');
  const [weightKg, setWeightKg] = useState<number>(1);
  const [orderValue, setOrderValue] = useState<number>(0);
  const [surchargeIds, setSurchargeIds] = useState<string[]>(() =>
    config.surcharges.filter((s) => s.enabledByDefault).map((s) => s.id),
  );

  // Si la zona seleccionada fue eliminada en Configuracion, reasigna.
  useEffect(() => {
    if (config.zones.length > 0 && !config.zones.some((z) => z.id === zoneId)) {
      setZoneId(config.zones[0].id);
    }
  }, [config.zones, zoneId]);

  const quote = useMemo(
    () =>
      calculateQuote(config, { zoneId, weightKg, orderValue, surchargeIds }),
    [config, zoneId, weightKg, orderValue, surchargeIds],
  );

  const tier = findWeightTier(config.weightTiers, weightKg);
  const remaining = amountToFreeShipping(config, orderValue);
  const fsEnabled =
    config.freeShipping.enabled && config.freeShipping.threshold > 0;
  const fsProgress = fsEnabled
    ? Math.min(100, (orderValue / config.freeShipping.threshold) * 100)
    : 0;

  function toggleSurcharge(id: string) {
    setSurchargeIds((current) =>
      current.includes(id)
        ? current.filter((x) => x !== id)
        : [...current, id],
    );
  }

  return (
    <div className="view">
      <Card title="Destino" subtitle="Zona de entrega" icon={<IconTruck />}>
        <div className="chips">
          {config.zones.map((zone) => (
            <Chip
              key={zone.id}
              active={zone.id === zoneId}
              onClick={() => setZoneId(zone.id)}
            >
              {zone.name}
            </Chip>
          ))}
          {config.zones.length === 0 && (
            <p className="muted">Agrega zonas en Configuracion.</p>
          )}
        </div>
      </Card>

      <Card title="Paquete" subtitle="Peso a enviar" icon={<IconPackage />}>
        <NumberField
          value={weightKg}
          onChange={setWeightKg}
          suffix="kg"
          ariaLabel="Peso del paquete en kilogramos"
        />
        <div className="chips chips--tight">
          {QUICK_WEIGHTS.map((kg) => (
            <Chip
              key={kg}
              active={weightKg === kg}
              onClick={() => setWeightKg(kg)}
            >
              {kg} kg
            </Chip>
          ))}
        </div>
        {tier && (
          <p className="hintline">
            Escala aplicada: <strong>{tier.label}</strong>
          </p>
        )}
      </Card>

      <Card
        title="Valor de la orden"
        subtitle="Para envio gratis y recargos por porcentaje"
        icon={<IconBolt />}
      >
        <NumberField
          value={orderValue}
          onChange={setOrderValue}
          prefix={config.currency}
          ariaLabel="Valor de la orden"
        />
        {fsEnabled && (
          <div className="freeship">
            <div className="freeship__bar">
              <div
                className="freeship__fill"
                style={{ width: `${fsProgress}%` }}
              />
            </div>
            {remaining > 0 ? (
              <p className="hintline">
                Faltan{' '}
                <strong>{formatMoney(remaining, config.currency)}</strong> para
                envio gratis.
              </p>
            ) : (
              <p className="hintline hintline--ok">
                <IconCheck size={15} /> Envio gratis disponible.
              </p>
            )}
          </div>
        )}
      </Card>

      {config.surcharges.length > 0 && (
        <Card title="Recargos" subtitle="Servicios adicionales" icon={<IconBolt />}>
          <ul className="optlist">
            {config.surcharges.map((surcharge) => (
              <li key={surcharge.id} className="optrow">
                <div className="optrow__text">
                  <span className="optrow__label">{surcharge.label}</span>
                  <span className="optrow__meta">
                    {surcharge.kind === 'percent'
                      ? `${surcharge.amount}% del valor`
                      : formatMoney(surcharge.amount, config.currency)}
                  </span>
                </div>
                <Toggle
                  checked={surchargeIds.includes(surcharge.id)}
                  onChange={() => toggleSurcharge(surcharge.id)}
                  ariaLabel={`Recargo ${surcharge.label}`}
                />
              </li>
            ))}
          </ul>
        </Card>
      )}

      <div className="result">
        <div className="result__head">Cotizacion del envio</div>
        <ul className="result__lines">
          {quote.lines.map((line, index) => (
            <li key={index} className="result__line">
              <span>{line.label}</span>
              <span>{formatMoney(line.amount, config.currency)}</span>
            </li>
          ))}
          {quote.lines.length === 0 && (
            <li className="result__empty">Completa los datos del envio.</li>
          )}
        </ul>

        {quote.warnings.map((warning) => (
          <p key={warning} className="result__warn">
            {warning}
          </p>
        ))}

        <div className="result__totalrow">
          <span className="result__totallabel">Total del envio</span>
          {quote.freeShippingApplied ? (
            <span className="result__totalwrap">
              <span className="result__regular">
                {formatMoney(quote.subtotal, config.currency)}
              </span>
              <strong className="result__total result__total--free">
                {formatMoney(0, config.currency)}
              </strong>
            </span>
          ) : (
            <strong className="result__total">
              {formatMoney(quote.total, config.currency)}
            </strong>
          )}
        </div>

        {quote.freeShippingApplied && (
          <div className="result__badge">
            <IconBolt size={15} /> Envio gratis aplicado
          </div>
        )}
      </div>
    </div>
  );
}
