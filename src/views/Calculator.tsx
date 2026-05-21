import { useCallback, useMemo, useState } from 'react';
import type { ShippingConfig } from '../types';
import {
  amountToFreeShipping,
  calculateQuote,
  findKmTier,
} from '../lib/shipping-engine';
import { formatMoney } from '../lib/format';
import { Card, Chip, NumberField, Toggle } from '../components/ui';
import {
  IconBolt,
  IconCheck,
  IconGift,
  IconOdometer,
  IconPrint,
  IconTag,
} from '../components/icons';
import { PrintTicket } from '../components/PrintTicket';

const QUICK_KM = [15, 50, 100, 155, 250];

export function Calculator({ config }: { config: ShippingConfig }) {
  const [distanceKm, setDistanceKm] = useState<number>(0);
  const [orderValue, setOrderValue] = useState<number>(0);
  const [surchargeIds, setSurchargeIds] = useState<string[]>(() =>
    config.surcharges.filter((s) => s.enabledByDefault).map((s) => s.id),
  );
  const [printTick, setPrintTick] = useState(0);

  const quote = useMemo(
    () => calculateQuote(config, { distanceKm, orderValue, surchargeIds }),
    [config, distanceKm, orderValue, surchargeIds],
  );

  const tier = distanceKm > 0 ? findKmTier(config.kmTiers, distanceKm) : null;
  const remaining = amountToFreeShipping(config, orderValue);
  const fsEnabled = config.freeShipping.enabled && config.freeShipping.threshold > 0;
  const fsProgress = fsEnabled
    ? Math.min(100, (orderValue / config.freeShipping.threshold) * 100)
    : 0;

  const toggleSurcharge = useCallback((id: string) => {
    setSurchargeIds((current) =>
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id],
    );
  }, []);

  function handlePrint() {
    setPrintTick(Date.now());
    // rAF asegura que React re-renderice el ticket con fecha fresca antes de imprimir
    requestAnimationFrame(() => requestAnimationFrame(() => window.print()));
  }

  const canPrint = quote.lines.length > 0;

  return (
    <div className="view">
      <Card
        title="Distancia del recorrido"
        subtitle="Kilometros entre origen y destino"
        icon={<IconOdometer />}
      >
        <NumberField
          value={distanceKm}
          onChange={setDistanceKm}
          suffix="km"
          ariaLabel="Distancia en kilometros"
          hero
        />
        <div className="chips chips--tight">
          {QUICK_KM.map((km) => (
            <Chip
              key={km}
              active={distanceKm === km}
              onClick={() => setDistanceKm(km)}
            >
              {km} km
            </Chip>
          ))}
        </div>
        {tier && (
          <p className="hintline">
            Tarifa{' '}
            <strong>{tier.label}</strong>
            {' — '}
            {formatMoney(tier.baseFare, config.currency)} base +{' '}
            {formatMoney(tier.ratePerKm, config.currency)}/km
          </p>
        )}
        {!tier && config.kmTiers.length === 0 && (
          <p className="hintline hintline--warn">
            Agrega tarifas en Configuracion.
          </p>
        )}
      </Card>

      <Card
        title="Valor de la orden"
        subtitle="Para envio gratis y recargos por porcentaje"
        icon={<IconTag />}
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
              <div className="freeship__fill" style={{ width: `${fsProgress}%` }} />
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
        <Card title="Servicios adicionales" subtitle="Opciones del envio" icon={<IconBolt />}>
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
            <li className="result__empty">Ingresa la distancia para cotizar.</li>
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
            <IconGift size={15} /> Envio gratis aplicado
          </div>
        )}

        {canPrint && (
          <button
            type="button"
            className="result__printbtn print-hide"
            onClick={handlePrint}
            aria-label="Imprimir ticket de cotizacion"
          >
            <IconPrint size={16} />
            Imprimir Ticket
          </button>
        )}
      </div>

      <PrintTicket quote={quote} printTick={printTick} />
    </div>
  );
}
