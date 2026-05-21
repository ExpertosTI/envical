import { useRef, useState } from 'react';
import type {
  ShippingConfig,
  Surcharge,
  SurchargeKind,
  WeightTier,
  Zone,
} from '../types';
import { exportConfig, importConfig, resetConfig } from '../lib/storage';
import { genId } from '../lib/format';
import {
  Button,
  Card,
  Field,
  IconButton,
  NumberField,
  TextField,
  Toggle,
} from '../components/ui';
import {
  IconDownload,
  IconGear,
  IconPackage,
  IconPlus,
  IconReset,
  IconTrash,
  IconTruck,
  IconUpload,
} from '../components/icons';

type Notice = { type: 'ok' | 'error'; text: string };

export function Settings({
  config,
  onChange,
}: {
  config: ShippingConfig;
  onChange: (config: ShippingConfig) => void;
}) {
  const [notice, setNotice] = useState<Notice | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function patch(updates: Partial<ShippingConfig>) {
    onChange({ ...config, ...updates });
  }

  /* ---- Zonas ---- */
  function updateZone(id: string, changes: Partial<Zone>) {
    patch({
      zones: config.zones.map((z) => (z.id === id ? { ...z, ...changes } : z)),
    });
  }
  function addZone() {
    patch({
      zones: [...config.zones, { id: genId(), name: 'Nueva zona', baseRate: 0 }],
    });
  }
  function removeZone(id: string) {
    patch({ zones: config.zones.filter((z) => z.id !== id) });
  }

  /* ---- Escalas de peso ---- */
  function updateTier(id: string, changes: Partial<WeightTier>) {
    patch({
      weightTiers: config.weightTiers.map((t) =>
        t.id === id ? { ...t, ...changes } : t,
      ),
    });
  }
  function addTier() {
    patch({
      weightTiers: [
        ...config.weightTiers,
        {
          id: genId(),
          label: 'Nueva escala',
          minKg: 0,
          maxKg: 1,
          rate: 0,
          perKgExtra: 0,
        },
      ],
    });
  }
  function removeTier(id: string) {
    patch({ weightTiers: config.weightTiers.filter((t) => t.id !== id) });
  }

  /* ---- Recargos ---- */
  function updateSurcharge(id: string, changes: Partial<Surcharge>) {
    patch({
      surcharges: config.surcharges.map((s) =>
        s.id === id ? { ...s, ...changes } : s,
      ),
    });
  }
  function addSurcharge() {
    patch({
      surcharges: [
        ...config.surcharges,
        {
          id: genId(),
          label: 'Nuevo recargo',
          kind: 'fixed',
          amount: 0,
          enabledByDefault: false,
        },
      ],
    });
  }
  function removeSurcharge(id: string) {
    patch({ surcharges: config.surcharges.filter((s) => s.id !== id) });
  }

  /* ---- Datos ---- */
  function handleExport() {
    const blob = new Blob([exportConfig(config)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'envical-config.json';
    anchor.click();
    URL.revokeObjectURL(url);
    setNotice({ type: 'ok', text: 'Configuracion exportada.' });
  }

  async function handleImport(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      const text = await file.text();
      onChange(importConfig(text));
      setNotice({ type: 'ok', text: 'Configuracion importada correctamente.' });
    } catch (error) {
      setNotice({
        type: 'error',
        text: error instanceof Error ? error.message : 'No se pudo importar.',
      });
    }
  }

  function handleReset() {
    const ok = window.confirm(
      'Restablecer la configuracion a los valores iniciales? Se perderan tus cambios.',
    );
    if (!ok) return;
    onChange(resetConfig());
    setNotice({ type: 'ok', text: 'Configuracion restablecida.' });
  }

  return (
    <div className="view">
      <Card title="General" subtitle="Moneda y redondeo" icon={<IconGear />}>
        <div className="grid2">
          <Field label="Moneda" hint="Simbolo mostrado en los montos.">
            <TextField
              value={config.currency}
              onChange={(value) => patch({ currency: value })}
              ariaLabel="Simbolo de moneda"
            />
          </Field>
          <Field label="Redondeo" hint="Multiplo al que se redondea el total. 0 = sin redondeo.">
            <NumberField
              value={config.rounding}
              onChange={(value) => patch({ rounding: value })}
              ariaLabel="Redondeo del total"
            />
          </Field>
        </div>
      </Card>

      <Card
        title="Zonas de entrega"
        subtitle="Tarifa base por destino"
        icon={<IconTruck />}
      >
        <div className="editors">
          {config.zones.map((zone) => (
            <div key={zone.id} className="editor">
              <div className="editor__grid">
                <Field label="Nombre">
                  <TextField
                    value={zone.name}
                    onChange={(value) => updateZone(zone.id, { name: value })}
                    ariaLabel="Nombre de la zona"
                  />
                </Field>
                <Field label="Tarifa base">
                  <NumberField
                    value={zone.baseRate}
                    onChange={(value) => updateZone(zone.id, { baseRate: value })}
                    prefix={config.currency}
                    ariaLabel="Tarifa base de la zona"
                  />
                </Field>
              </div>
              <IconButton
                variant="danger"
                label="Eliminar zona"
                onClick={() => removeZone(zone.id)}
              >
                <IconTrash size={18} />
              </IconButton>
            </div>
          ))}
        </div>
        <Button variant="ghost" onClick={addZone}>
          <IconPlus size={18} /> Agregar zona
        </Button>
      </Card>

      <Card
        title="Escalas de peso"
        subtitle="Tarifa por rango de peso"
        icon={<IconPackage />}
      >
        <div className="editors">
          {config.weightTiers.map((tier) => {
            const open = tier.maxKg == null;
            return (
              <div key={tier.id} className="editor editor--block">
                <div className="editor__top">
                  <TextField
                    value={tier.label}
                    onChange={(value) => updateTier(tier.id, { label: value })}
                    ariaLabel="Nombre de la escala"
                  />
                  <IconButton
                    variant="danger"
                    label="Eliminar escala"
                    onClick={() => removeTier(tier.id)}
                  >
                    <IconTrash size={18} />
                  </IconButton>
                </div>
                <div className="editor__grid editor__grid--4">
                  <Field label="Desde (kg)">
                    <NumberField
                      value={tier.minKg}
                      onChange={(value) => updateTier(tier.id, { minKg: value })}
                      ariaLabel="Peso minimo"
                    />
                  </Field>
                  <Field label="Hasta (kg)">
                    {open ? (
                      <div className="opentier">Sin tope</div>
                    ) : (
                      <NumberField
                        value={tier.maxKg ?? 0}
                        onChange={(value) =>
                          updateTier(tier.id, { maxKg: value })
                        }
                        ariaLabel="Peso maximo"
                      />
                    )}
                  </Field>
                  <Field label="Tarifa">
                    <NumberField
                      value={tier.rate}
                      onChange={(value) => updateTier(tier.id, { rate: value })}
                      prefix={config.currency}
                      ariaLabel="Tarifa de la escala"
                    />
                  </Field>
                  <Field label="Extra / kg">
                    <NumberField
                      value={tier.perKgExtra}
                      onChange={(value) =>
                        updateTier(tier.id, { perKgExtra: value })
                      }
                      prefix={config.currency}
                      ariaLabel="Cargo por kg adicional"
                    />
                  </Field>
                </div>
                <label className="inlinetoggle">
                  <Toggle
                    checked={open}
                    onChange={(checked) =>
                      updateTier(tier.id, {
                        maxKg: checked ? null : tier.minKg + 5,
                      })
                    }
                    ariaLabel="Escala abierta"
                  />
                  <span>Escala abierta (sin tope superior)</span>
                </label>
              </div>
            );
          })}
        </div>
        <Button variant="ghost" onClick={addTier}>
          <IconPlus size={18} /> Agregar escala
        </Button>
      </Card>

      <Card
        title="Envio gratis"
        subtitle="Umbral por valor de orden"
        icon={<IconGear />}
      >
        <label className="inlinetoggle inlinetoggle--lead">
          <Toggle
            checked={config.freeShipping.enabled}
            onChange={(checked) =>
              patch({
                freeShipping: { ...config.freeShipping, enabled: checked },
              })
            }
            ariaLabel="Activar envio gratis"
          />
          <span>Activar envio gratis por monto</span>
        </label>
        <Field
          label="Umbral de envio gratis"
          hint="El envio es gratis cuando el valor de la orden alcanza este monto."
        >
          <NumberField
            value={config.freeShipping.threshold}
            onChange={(value) =>
              patch({
                freeShipping: { ...config.freeShipping, threshold: value },
              })
            }
            prefix={config.currency}
            ariaLabel="Umbral de envio gratis"
          />
        </Field>
      </Card>

      <Card
        title="Recargos"
        subtitle="Servicios adicionales opcionales"
        icon={<IconGear />}
      >
        <div className="editors">
          {config.surcharges.map((surcharge) => (
            <div key={surcharge.id} className="editor editor--block">
              <div className="editor__top">
                <TextField
                  value={surcharge.label}
                  onChange={(value) =>
                    updateSurcharge(surcharge.id, { label: value })
                  }
                  ariaLabel="Nombre del recargo"
                />
                <IconButton
                  variant="danger"
                  label="Eliminar recargo"
                  onClick={() => removeSurcharge(surcharge.id)}
                >
                  <IconTrash size={18} />
                </IconButton>
              </div>
              <div className="editor__grid">
                <Field label="Tipo">
                  <select
                    className="select"
                    value={surcharge.kind}
                    aria-label="Tipo de recargo"
                    onChange={(event) =>
                      updateSurcharge(surcharge.id, {
                        kind: event.target.value as SurchargeKind,
                      })
                    }
                  >
                    <option value="fixed">Monto fijo</option>
                    <option value="percent">% del valor</option>
                  </select>
                </Field>
                <Field
                  label={surcharge.kind === 'percent' ? 'Porcentaje' : 'Monto'}
                >
                  <NumberField
                    value={surcharge.amount}
                    onChange={(value) =>
                      updateSurcharge(surcharge.id, { amount: value })
                    }
                    prefix={
                      surcharge.kind === 'fixed' ? config.currency : undefined
                    }
                    suffix={surcharge.kind === 'percent' ? '%' : undefined}
                    ariaLabel="Monto del recargo"
                  />
                </Field>
              </div>
              <label className="inlinetoggle">
                <Toggle
                  checked={surcharge.enabledByDefault}
                  onChange={(checked) =>
                    updateSurcharge(surcharge.id, { enabledByDefault: checked })
                  }
                  ariaLabel="Activado por defecto"
                />
                <span>Activado por defecto en la calculadora</span>
              </label>
            </div>
          ))}
        </div>
        <Button variant="ghost" onClick={addSurcharge}>
          <IconPlus size={18} /> Agregar recargo
        </Button>
      </Card>

      <Card
        title="Datos"
        subtitle="Respaldo y restablecimiento"
        icon={<IconGear />}
      >
        {notice && (
          <p className={`notice notice--${notice.type}`}>{notice.text}</p>
        )}
        <div className="actions">
          <Button variant="primary" onClick={handleExport}>
            <IconDownload size={18} /> Exportar JSON
          </Button>
          <Button variant="ghost" onClick={() => fileRef.current?.click()}>
            <IconUpload size={18} /> Importar JSON
          </Button>
          <Button variant="danger" onClick={handleReset}>
            <IconReset size={18} /> Restablecer
          </Button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={handleImport}
        />
        <p className="field__hint">
          La configuracion se guarda en este dispositivo (localStorage). Exporta
          un respaldo para moverla a otro equipo.
        </p>
      </Card>
    </div>
  );
}
