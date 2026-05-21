import { memo } from 'react';
import type { QuoteResult } from '../types';
import { formatMoney } from '../lib/format';

interface PrintTicketProps {
  quote: QuoteResult;
  /** Cambia para forzar re-render con fecha actualizada antes de imprimir. */
  printTick: number;
}

function genTicketId(now: Date): string {
  const d = now.toISOString().slice(0, 10).replace(/-/g, '');
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  return `ENV-${d}-${h}${m}`;
}

export const PrintTicket = memo(function PrintTicket({
  quote,
  printTick,
}: PrintTicketProps) {
  // printTick garantiza que la fecha se recalcula en cada impresion
  const now = new Date(printTick || Date.now());
  const ticketId = genTicketId(now);
  const dateStr = now.toLocaleDateString('es-DO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const timeStr = now.toLocaleTimeString('es-DO', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="ticket" aria-hidden="true">
      <div className="ticket__header">
        <div className="ticket__brand">RENACE.TECH</div>
        <div className="ticket__subtitle">Cotizacion de Envio</div>
      </div>

      <div className="ticket__rule" />

      <div className="ticket__meta">
        <span>{ticketId}</span>
        <span>{dateStr} {timeStr}</span>
      </div>

      <div className="ticket__rule" />

      {quote.lines.map((line, i) => (
        <div key={i} className="ticket__line">
          <span className="ticket__line-label">{line.label}</span>
          <span className="ticket__line-amount">
            {formatMoney(line.amount, quote.currency)}
          </span>
        </div>
      ))}

      {quote.lines.length === 0 && (
        <div className="ticket__line">
          <span>Sin cargos</span>
          <span>{formatMoney(0, quote.currency)}</span>
        </div>
      )}

      {quote.freeShippingApplied && (
        <div className="ticket__line ticket__line--strike">
          <span>Descuento envio gratis</span>
          <span>-{formatMoney(quote.subtotal, quote.currency)}</span>
        </div>
      )}

      <div className="ticket__rule ticket__rule--solid" />

      <div className="ticket__total">
        <span>TOTAL DEL ENVIO</span>
        <span>{formatMoney(quote.total, quote.currency)}</span>
      </div>

      {quote.freeShippingApplied && (
        <div className="ticket__freebadge">*** ENVIO GRATIS ***</div>
      )}

      <div className="ticket__rule" />

      <div className="ticket__footer">
        <div>envios.renace.tech</div>
        <div>Valido solo como cotizacion</div>
      </div>
    </div>
  );
});
