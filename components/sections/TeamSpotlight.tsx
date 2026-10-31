"use client";
import { motion, useReducedMotion } from "motion/react";
import { Plus } from "lucide-react";
import Image from "next/image";
import { useRef, useState, type PointerEvent } from "react";
import { img, video, type ImageKey } from "@/content/media";
import { cn } from "@/lib/utils";

type Person = { role: string; tag: string; body: string };
type Media = { image: ImageKey } | { video: keyof typeof video; poster: ImageKey };

const media: Media[] = [
  { video: "cockpit", poster: "bw-headon" },
  { image: "team-hangar" },
  { image: "rescue-skid" },
  { video: "crew", poster: "logistics-camp" },
];

/**
 * "Our people" role cards. Hover/focus (or tap on touch) lifts the card, follows the pointer with a
 * soft spotlight, plays the clip, and slides the bio up. Cards are roles, not named individuals,
 * until Helibol supplies portraits and names (TODO.md #10).
 */
export function TeamSpotlight({ people }: { people: Person[] }) {
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {people.map((p, i) => (
        <TeamCard key={p.role} person={p} media={media[i % media.length]!} i={i} />
      ))}
    </ul>
  );
}

function TeamCard({ person, media: m, i }: { person: Person; media: Media; i: number }) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLLIElement>(null);
  const vid = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(false);
  const [loadVideo, setLoadVideo] = useState(false);
  const pointerFocus = useRef(false);

  const on = () => {
    setActive(true);
    if ("video" in m && !reduced) {
      setLoadVideo(true);
      requestAnimationFrame(() => vid.current?.play().catch(() => {}));
    }
  };
  const off = () => {
    setActive(false);
    vid.current?.pause();
  };
  const move = (e: PointerEvent) => {
    const r = ref.current!.getBoundingClientRect();
    ref.current!.style.setProperty("--mx", `${e.clientX - r.left}px`);
    ref.current!.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  const poster = img("video" in m ? m.poster : m.image);

  return (
    <motion.li
      ref={ref}
      initial={reduced ? false : { opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: i * 0.1 }}
      className={cn("[--mx:50%] [--my:30%]", i % 2 === 1 && "lg:translate-y-12")}
    >
      <article
        tabIndex={0}
        onPointerEnter={(e) => e.pointerType === "mouse" && on()}
        onPointerLeave={(e) => e.pointerType === "mouse" && off()}
        onPointerMove={move}
        onPointerDown={() => (pointerFocus.current = true)}
        onPointerUp={(e) => {
          if (e.pointerType !== "mouse") (active ? off : on)();
          setTimeout(() => (pointerFocus.current = false), 0);
        }}
        onFocus={() => !pointerFocus.current && on()}
        onBlur={off}
        aria-label={`${person.role}. ${person.body}`}
        className={cn(
          "relative isolate block aspect-[3/4] cursor-default overflow-hidden rounded-[28px] bg-hb-night [mask-image:radial-gradient(white,black)] text-white outline-offset-4 transition-[transform,box-shadow] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
          active && !reduced && "-translate-y-2 shadow-[0_40px_80px_-30px_rgba(6,19,31,0.7)]",
        )}
      >
        <div
          className={cn(
            "absolute inset-0 transition-transform duration-[1.4s] ease-[cubic-bezier(0.16,1,0.3,1)]",
            active && !reduced && "scale-[1.08]",
          )}
        >
          <Image
            src={poster.src}
            alt=""
            fill
            sizes="(min-width:1024px) 25vw, (min-width:640px) 50vw, 100vw"
            placeholder="blur"
            blurDataURL={poster.blurDataURL}
            className={cn(
              "object-cover transition-[filter] duration-700",
              active ? "grayscale-0" : "grayscale-[0.35]",
            )}
            style={{ objectPosition: poster.position }}
          />
          {"video" in m && loadVideo && (
            <video
              ref={vid}
              className={cn(
                "absolute inset-0 size-full object-cover transition-opacity duration-700",
                active ? "opacity-100" : "opacity-0",
              )}
              muted
              loop
              playsInline
              preload="metadata"
              aria-hidden
            >
              <source src={video[m.video].mp4} type="video/mp4" />
            </video>
          )}
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 [background:radial-gradient(420px_circle_at_var(--mx)_var(--my),rgba(242,162,58,0.22),transparent_45%)]"
          style={{ opacity: active ? 1 : 0 }}
        />
        <div
          aria-hidden
          className={cn(
            "absolute inset-0 bg-gradient-to-t from-hb-night via-hb-night/40 to-transparent transition-opacity duration-700",
            active ? "opacity-100" : "opacity-80",
          )}
        />
        <div className="absolute inset-x-0 bottom-0 p-6">
          <p className="eyebrow text-hb-sunset">{person.tag}</p>
          <div className="mt-2 flex items-end justify-between gap-3">
            <h3 className="text-2xl leading-tight font-medium">{person.role}</h3>
            <span
              aria-hidden
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-full border border-white/30 transition-transform duration-500",
                active && "rotate-45 bg-white text-hb-night",
              )}
            >
              <Plus className="size-4" />
            </span>
          </div>
          <span
            aria-hidden
            className={cn(
              "mt-4 block h-px origin-left bg-hb-sunset transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
              active ? "scale-x-100" : "scale-x-0",
            )}
          />
          <div
            className={cn(
              "grid transition-[grid-template-rows,opacity] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
              active ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
            )}
          >
            <p className="overflow-hidden pt-4 text-sm leading-relaxed text-white/80">{person.body}</p>
          </div>
        </div>
      </article>
    </motion.li>
  );
}
