/** Iconografia inline. Trazo en currentColor, sin dependencias externas. */

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

export function IconCalculator(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="5" y="3" width="14" height="18" rx="2.5" />
      <line x1="9" y1="7" x2="15" y2="7" />
      <line x1="9" y1="11" x2="9" y2="11" />
      <line x1="12" y1="11" x2="12" y2="11" />
      <line x1="15" y1="11" x2="15" y2="11" />
      <line x1="9" y1="14.5" x2="9" y2="14.5" />
      <line x1="12" y1="14.5" x2="12" y2="14.5" />
      <line x1="15" y1="14.5" x2="15" y2="17.5" />
      <line x1="9" y1="17.5" x2="12" y2="17.5" />
    </Svg>
  );
}

export function IconGear(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 2.5v3M12 18.5v3M21.5 12h-3M5.5 12h-3M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1M18.7 18.7l-2.1-2.1M7.4 7.4 5.3 5.3" />
    </Svg>
  );
}

export function IconPackage(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 3 20 7.5v9L12 21 4 16.5v-9L12 3Z" />
      <path d="M4 7.5 12 12l8-4.5M12 12v9" />
      <circle cx="12" cy="7.5" r="1.4" fill="currentColor" stroke="none" />
    </Svg>
  );
}

export function IconTruck(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M3 6.5h10v9H3zM13 9.5h4l3 3v3h-7z" />
      <circle cx="7" cy="17.5" r="1.8" />
      <circle cx="16.5" cy="17.5" r="1.8" />
    </Svg>
  );
}

export function IconPlus(props: IconProps) {
  return (
    <Svg {...props}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </Svg>
  );
}

export function IconTrash(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 7h16M9.5 7V4.5h5V7M6 7l1 13h10l1-13" />
    </Svg>
  );
}

export function IconDownload(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 3v12M7 11l5 5 5-5M4 20h16" />
    </Svg>
  );
}

export function IconUpload(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 16V4M7 9l5-5 5 5M4 20h16" />
    </Svg>
  );
}

export function IconReset(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 12a8 8 0 1 1 2.5 5.8" />
      <path d="M4 20v-5h5" />
    </Svg>
  );
}

export function IconBolt(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
    </Svg>
  );
}

export function IconCheck(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M5 12.5 10 17.5 19.5 6.5" />
    </Svg>
  );
}
