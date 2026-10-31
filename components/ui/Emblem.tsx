import { emblemPaths, emblemViewBox } from "./emblem-paths";

export function Emblem({ className, title }: { className?: string; title?: string }) {
  return (
    <svg
      viewBox={emblemViewBox}
      className={className}
      fill="currentColor"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title && <title>{title}</title>}
      {emblemPaths.map((d) => (
        <path key={d.slice(0, 16)} d={d} />
      ))}
    </svg>
  );
}
