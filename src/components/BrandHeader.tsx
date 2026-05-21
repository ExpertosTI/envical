import { IconCompass } from './icons';

/** Cabecera de marca renace.tech. */
export function BrandHeader() {
  return (
    <header className="app__head">
      <div className="brand">
        <span className="brand__mark" aria-hidden="true">
          <IconCompass size={22} />
        </span>
        <span className="brand__text">
          <span className="brand__name">Envios</span>
          <span className="brand__by">renace.tech</span>
        </span>
      </div>
      <span className="brand__tag">POS Shipping</span>
    </header>
  );
}
