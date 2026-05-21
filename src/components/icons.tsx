/** Iconografia inline. Trazo en currentColor, tematica: entrega interurbana por km. */

interface IconProps {
  size?: number;
  className?: string;
}

function Svg({
  size = 22,
  className,
  children,
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

/** Brujula de navegacion — tab Calculadora */
export function IconCompass(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="9" />
      {/* aguja: punta norte rellena, punta sur hueca */}
      <path d="M12 4.5 L14.5 12 12 19.5 9.5 12 12 4.5Z" />
      <path
        d="M12 4.5 L14.5 12 12 12 9.5 12 12 4.5Z"
        fill="currentColor"
        stroke="none"
      />
      <circle cx="12" cy="12" r="1.2" fill="var(--night-3, #181628)" stroke="none" />
    </Svg>
  );
}

/** Controles deslizantes — tab Configuracion / seccion General */
export function IconSliders(props: IconProps) {
  return (
    <Svg {...props}>
      <line x1="4" y1="7" x2="20" y2="7" />
      <circle cx="9" cy="7" r="2.5" />
      <line x1="4" y1="14.5" x2="20" y2="14.5" />
      <circle cx="16" cy="14.5" r="2.5" />
      <line x1="4" y1="21" x2="20" y2="21" />
      <circle cx="11" cy="21" r="2.5" />
    </Svg>
  );
}

/** Odometro / velocimetro — entrada de km (input hero) */
export function IconOdometer(props: IconProps) {
  return (
    <Svg {...props}>
      {/* arco del medidor */}
      <path d="M4.5 19 a8 8 0 1 1 15 0" />
      {/* marcas de escala */}
      <line x1="4.5" y1="19" x2="6.2" y2="19" />
      <line x1="12" y1="11" x2="12" y2="12.8" />
      <line x1="19.5" y1="19" x2="17.8" y2="19" />
      {/* aguja apuntando a ~2/3 del arco (velocidad media-alta) */}
      <line x1="12" y1="19" x2="17.2" y2="12.5" strokeWidth={2.2} />
      {/* pivote central */}
      <circle cx="12" cy="19" r="2" fill="currentColor" stroke="none" />
    </Svg>
  );
}

/** Carretera interurbana en perspectiva — seccion Tarifas por km */
export function IconRoad(props: IconProps) {
  return (
    <Svg {...props}>
      {/* bordes de la carretera convergiendo al horizonte */}
      <path d="M3 22 L10.5 4" />
      <path d="M21 22 L13.5 4" />
      {/* lineas centrales discontinuas */}
      <line x1="12" y1="8" x2="12" y2="11" />
      <line x1="12" y1="14" x2="12" y2="17" />
      <line x1="12" y1="20" x2="12" y2="22" />
    </Svg>
  );
}

/** Etiqueta de precio — valor de la orden */
export function IconTag(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M3 3.5 h7.5 l10 10 a1.8 1.8 0 0 1 0 2.6 L15 21.6 a1.8 1.8 0 0 1-2.6 0 L2.4 11 V3.5Z" />
      <circle cx="9" cy="9" r="1.6" fill="currentColor" stroke="none" />
    </Svg>
  );
}

/** Caja de regalo — envio gratis */
export function IconGift(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3.5" y="11" width="17" height="10" rx="1.5" />
      <line x1="3.5" y1="11" x2="20.5" y2="11" />
      <line x1="12" y1="11" x2="12" y2="21" />
      {/* lazo izquierdo */}
      <path d="M12 8 C12 6 10 4 8.5 5 C7 6 8 8.5 10 9 C11 9.5 12 9 12 9" />
      {/* lazo derecho */}
      <path d="M12 8 C12 6 14 4 15.5 5 C17 6 16 8.5 14 9 C13 9.5 12 9 12 9" />
    </Svg>
  );
}

/** Cilindro de datos — seccion Datos / backup */
export function IconDatabase(props: IconProps) {
  return (
    <Svg {...props}>
      <ellipse cx="12" cy="6" rx="7.5" ry="3" />
      <path d="M4.5 6 v12 a7.5 3 0 0 0 15 0 V6" />
      <path d="M4.5 12 a7.5 3 0 0 0 15 0" />
    </Svg>
  );
}

/** Rayo — recargos / envio gratis activo */
export function IconBolt(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
    </Svg>
  );
}

/** Checkmark — confirmacion / envio gratis aplicado */
export function IconCheck(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M5 12.5 10 17.5 19.5 6.5" />
    </Svg>
  );
}

/** Mas — agregar elemento */
export function IconPlus(props: IconProps) {
  return (
    <Svg {...props}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </Svg>
  );
}

/** Papelera — eliminar */
export function IconTrash(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 7h16M9.5 7V4.5h5V7M6 7l1 13h10l1-13" />
    </Svg>
  );
}

/** Flecha hacia abajo con linea — exportar */
export function IconDownload(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 3v12M7 11l5 5 5-5M4 20h16" />
    </Svg>
  );
}

/** Flecha hacia arriba con linea — importar */
export function IconUpload(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 16V4M7 9l5-5 5 5M4 20h16" />
    </Svg>
  );
}

/** Flecha circular — restablecer */
export function IconReset(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 12a8 8 0 1 1 2.5 5.8" />
      <path d="M4 20v-5h5" />
    </Svg>
  );
}
