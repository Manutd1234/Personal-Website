const spriteParts = {
  circuit: (
    <>
      <rect x="28" y="20" width="40" height="8" className="sprite-dark" />
      <rect x="20" y="28" width="56" height="40" className="sprite-main" />
      <rect x="28" y="68" width="16" height="12" className="sprite-main" />
      <rect x="56" y="68" width="16" height="12" className="sprite-main" />
      <rect x="12" y="36" width="8" height="24" className="sprite-accent" />
      <rect x="76" y="36" width="8" height="24" className="sprite-accent" />
      <rect x="32" y="40" width="8" height="8" className="sprite-eye" />
      <rect x="56" y="40" width="8" height="8" className="sprite-eye" />
      <rect x="40" y="56" width="16" height="4" className="sprite-dark" />
      <rect x="44" y="12" width="8" height="8" className="sprite-accent" />
    </>
  ),
  signal: (
    <>
      <rect x="36" y="20" width="28" height="8" className="sprite-dark" />
      <rect x="28" y="28" width="44" height="44" className="sprite-main" />
      <rect x="12" y="36" width="16" height="8" className="sprite-accent" />
      <rect x="4" y="44" width="24" height="8" className="sprite-main" />
      <rect x="72" y="36" width="16" height="8" className="sprite-accent" />
      <rect x="72" y="44" width="24" height="8" className="sprite-main" />
      <rect x="36" y="72" width="8" height="12" className="sprite-dark" />
      <rect x="56" y="72" width="8" height="12" className="sprite-dark" />
      <rect x="36" y="40" width="8" height="8" className="sprite-eye" />
      <rect x="56" y="40" width="8" height="8" className="sprite-eye" />
      <rect x="44" y="56" width="12" height="4" className="sprite-dark" />
      <rect x="44" y="12" width="12" height="8" className="sprite-accent" />
    </>
  ),
  stack: (
    <>
      <rect x="20" y="20" width="60" height="56" className="sprite-dark" />
      <rect x="28" y="12" width="44" height="8" className="sprite-accent" />
      <rect x="28" y="28" width="44" height="16" className="sprite-main" />
      <rect x="28" y="52" width="44" height="16" className="sprite-main" />
      <rect x="36" y="32" width="8" height="8" className="sprite-eye" />
      <rect x="56" y="32" width="8" height="8" className="sprite-eye" />
      <rect x="36" y="56" width="28" height="4" className="sprite-accent" />
      <rect x="12" y="36" width="8" height="28" className="sprite-main" />
      <rect x="80" y="36" width="8" height="28" className="sprite-main" />
      <rect x="28" y="76" width="16" height="12" className="sprite-dark" />
      <rect x="56" y="76" width="16" height="12" className="sprite-dark" />
    </>
  ),
};

export default function PixelSprite({ type = 'circuit', label }) {
  return (
    <svg
      aria-hidden={label ? undefined : 'true'}
      aria-label={label}
      className={`pixel-sprite pixel-sprite-${type}`}
      role={label ? 'img' : undefined}
      shapeRendering="crispEdges"
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
    >
      {spriteParts[type] || spriteParts.circuit}
    </svg>
  );
}
