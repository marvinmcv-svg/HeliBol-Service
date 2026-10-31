import { Magnetic } from "@/components/motion/Magnetic";
import { visibleSocials } from "@/content/socials";

export function SocialIcons() {
  return (
    <ul className="flex flex-wrap gap-2">
      {visibleSocials().map((s) => (
        <li key={s.name}>
          <Magnetic>
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.name}
              className="flex size-11 items-center justify-center rounded-full border border-white/15 text-white/80 transition-colors hover:border-hb-blue hover:bg-hb-blue hover:text-white"
            >
              <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
                <path d={s.path} />
              </svg>
            </a>
          </Magnetic>
        </li>
      ))}
    </ul>
  );
}
