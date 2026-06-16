const LOGO_SRC = '/logo.jpg';

const imgProps = {
  decoding: 'async' as const,
  fetchPriority: 'high' as const,
  className: 'img-crisp',
};

export function LogoMark({ size = 40, className = '' }: { size?: number; className?: string }) {
  return (
    <img
      src={LOGO_SRC}
      alt="Royse City Connect"
      width={size}
      height={size}
      {...imgProps}
      className={`object-contain shrink-0 img-crisp ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

export function LogoFull({ height = 120, className = '' }: { height?: number; size?: number; className?: string }) {
  return (
    <img
      src={LOGO_SRC}
      alt="Royse City Connect"
      {...imgProps}
      className={`object-contain img-crisp ${className}`}
      style={{ height, width: 'auto', maxWidth: 'min(300px, 88vw)' }}
    />
  );
}

export function LogoHeader({ height = 36 }: { height?: number }) {
  return (
    <img
      src={LOGO_SRC}
      alt="Royse City Connect"
      {...imgProps}
      className="object-contain object-left img-crisp"
      style={{ height, width: 'auto', maxWidth: 'min(140px, 38vw)' }}
    />
  );
}

/** Props for content images (posts, events, etc.) */
export function contentImageProps(alt = '') {
  return {
    alt,
    loading: 'lazy' as const,
    decoding: 'async' as const,
    className: 'img-content w-full object-cover',
  };
}
