import { IconCalculator, IconGear } from './icons';

export type TabId = 'calc' | 'config';

const TABS: { id: TabId; label: string; icon: typeof IconCalculator }[] = [
  { id: 'calc', label: 'Calcular', icon: IconCalculator },
  { id: 'config', label: 'Configurar', icon: IconGear },
];

/** Navegacion inferior tipo app, optimizada para uso con el pulgar. */
export function BottomNav({
  active,
  onChange,
}: {
  active: TabId;
  onChange: (tab: TabId) => void;
}) {
  return (
    <nav className="nav" aria-label="Secciones">
      {TABS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          className={`nav__item${active === id ? ' nav__item--active' : ''}`}
          aria-current={active === id ? 'page' : undefined}
          onClick={() => onChange(id)}
        >
          <Icon size={22} />
          <span className="nav__label">{label}</span>
        </button>
      ))}
    </nav>
  );
}
