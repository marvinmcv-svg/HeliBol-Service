/**
 * "38 AÑOS" anniversary mark — redrawn in the shape of HLB30YRS.svg (three tapered
 * wing feathers either side of the numeral) because the original says 30.
 */
export function WingBadge({ years, label, className }: { years: number; label: string; className?: string }) {
  const feathers = [
    { y: 23, w: 22 },
    { y: 29, w: 18 },
    { y: 35, w: 13 },
  ];
  return (
    <svg
      viewBox="0 0 120 72"
      className={className}
      role="img"
      aria-label={`${years} ${label}`}
      fill="currentColor"
    >
      {feathers.map(({ y, w }) => (
        <g key={y}>
          <path d={`M${36 - w} ${y} L36 ${y} L34 ${y + 4} L${36 - w + 5} ${y + 4} Z`} />
          <path d={`M${84 + w} ${y} L84 ${y} L86 ${y + 4} L${84 + w - 5} ${y + 4} Z`} />
        </g>
      ))}
      <text
        x="60"
        y="40"
        textAnchor="middle"
        fontSize="26"
        fontWeight="600"
        fontFamily="var(--font-clash), sans-serif"
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {years}
      </text>
      <text
        x="60"
        y="58"
        textAnchor="middle"
        fontSize="10"
        letterSpacing="4"
        fontWeight="600"
        fontFamily="var(--font-inter-tight), sans-serif"
      >
        {label}
      </text>
    </svg>
  );
}
