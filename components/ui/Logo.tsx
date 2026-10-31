import { logoPaths } from "./logo-paths";

/** Official HELIBOL lock-up as inline SVG so it inherits currentColor (white on dark, blue on light). */
export function Logo({ className, title = "Helibol" }: { className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 216 72" className={className} fill="currentColor" role="img" aria-label={title}>
      {logoPaths.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}
