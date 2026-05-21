import { useEffect, useState, type ReactNode } from 'react';

/* --------------------------------------------------------------------- *
 * Primitivas de interfaz reutilizables.
 * --------------------------------------------------------------------- */

export function Card({
  title,
  subtitle,
  icon,
  children,
}: {
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="card">
      {title && (
        <header className="card__head">
          {icon && <span className="card__icon">{icon}</span>}
          <div className="card__headtext">
            <h2 className="card__title">{title}</h2>
            {subtitle && <p className="card__sub">{subtitle}</p>}
          </div>
        </header>
      )}
      <div className="card__body">{children}</div>
    </section>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="field">
      <span className="field__label">{label}</span>
      {children}
      {hint && <span className="field__hint">{hint}</span>}
    </label>
  );
}

export function TextField({
  value,
  onChange,
  placeholder,
  ariaLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  ariaLabel?: string;
}) {
  return (
    <input
      className="input"
      type="text"
      value={value}
      placeholder={placeholder}
      aria-label={ariaLabel}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

function sanitizeNumeric(raw: string): string {
  const cleaned = raw.replace(/[^0-9.]/g, '');
  const firstDot = cleaned.indexOf('.');
  if (firstDot === -1) return cleaned;
  return (
    cleaned.slice(0, firstDot + 1) +
    cleaned.slice(firstDot + 1).replace(/\./g, '')
  );
}

function draftToNum(draft: string): number {
  if (draft === '' || draft === '.') return 0;
  const n = Number(draft);
  return Number.isFinite(n) ? n : 0;
}

export function NumberField({
  value,
  onChange,
  min = 0,
  prefix,
  suffix,
  placeholder,
  ariaLabel,
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  prefix?: string;
  suffix?: string;
  placeholder?: string;
  ariaLabel?: string;
}) {
  const [draft, setDraft] = useState<string>(() => String(value));

  // Resincroniza solo cuando el valor cambia desde fuera (ej. chips rapidos).
  useEffect(() => {
    if (draftToNum(draft) !== value) setDraft(String(value));
    // deps intencionalmente acotadas a `value`
  }, [value]);

  function commit(next: string) {
    setDraft(next);
    onChange(Math.max(min, draftToNum(next)));
  }

  return (
    <div className="numfield">
      {prefix && <span className="numfield__affix">{prefix}</span>}
      <input
        className="numfield__input"
        type="text"
        inputMode="decimal"
        value={draft}
        placeholder={placeholder}
        aria-label={ariaLabel}
        onChange={(event) => commit(sanitizeNumeric(event.target.value))}
        onBlur={() => setDraft(String(Math.max(min, draftToNum(draft))))}
      />
      {suffix && <span className="numfield__affix">{suffix}</span>}
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  ariaLabel,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      className={`toggle${checked ? ' toggle--on' : ''}`}
      onClick={() => onChange(!checked)}
    >
      <span className="toggle__knob" />
    </button>
  );
}

export function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className={`chip${active ? ' chip--active' : ''}`}
      aria-pressed={active}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function Button({
  variant = 'ghost',
  onClick,
  children,
  type = 'button',
}: {
  variant?: 'primary' | 'ghost' | 'danger';
  onClick?: () => void;
  children: ReactNode;
  type?: 'button' | 'submit';
}) {
  return (
    <button type={type} className={`btn btn--${variant}`} onClick={onClick}>
      {children}
    </button>
  );
}

export function IconButton({
  onClick,
  label,
  variant = 'ghost',
  children,
}: {
  onClick: () => void;
  label: string;
  variant?: 'ghost' | 'danger';
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className={`iconbtn iconbtn--${variant}`}
      onClick={onClick}
      aria-label={label}
      title={label}
    >
      {children}
    </button>
  );
}
