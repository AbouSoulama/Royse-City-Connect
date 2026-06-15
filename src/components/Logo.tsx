const LOGO_SRC = '/logo.jpg';

export function LogoMark({ size = 40, className = '' }: { size?: number; className?: string }) {
  return (
    <img
      src={LOGO_SRC}
      alt="Royse City Connect"
      width={size}
      height={size}
      className={`object-contain shrink-0 ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

export function LogoFull({ height = 120, className = '' }: { height?: number; size?: number; className?: string }) {
  return (
    <img
      src={LOGO_SRC}
      alt="Royse City Connect"
      className={`object-contain ${className}`}
      style={{ height, width: 'auto', maxWidth: 'min(280px, 85vw)' }}
    />
  );
}

export function LogoHeader({ height = 36 }: { height?: number }) {
  return (
    <img
      src={LOGO_SRC}
      alt="Royse City Connect"
      className="object-contain object-left"
      style={{ height, width: 'auto', maxWidth: 160 }}
    />
  );
}
