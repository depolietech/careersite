const LINES = Array.from({ length: 12 }, (_, i) => ({
  x2: 24 + 20 * Math.cos((i * 30 * Math.PI) / 180),
  y2: 24 + 20 * Math.sin((i * 30 * Math.PI) / 180),
}));

interface StarburstProps {
  size?: number;
  color?: string;
  className?: string;
}

export function Starburst({ size = 48, color = "#3FBA6F", className }: StarburstProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      {LINES.map((l, i) => (
        <line
          key={i}
          x1="24" y1="24"
          x2={l.x2} y2={l.y2}
          stroke={color} strokeWidth="1.5" strokeLinecap="round"
        />
      ))}
    </svg>
  );
}
