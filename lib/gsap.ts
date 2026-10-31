"use client";
/**
 * The one place GSAP plugins are registered (plan §11.1). Import gsap from here, never from "gsap".
 * MorphSVG/Flip are deliberately not registered: nothing uses them and they cost ~15 KB gz.
 * MotionPath is registered locally in components/sections/Timeline.tsx (only the Nosotros page uses it).
 */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin, ScrambleTextPlugin, useGSAP);
  gsap.defaults({ ease: "expo.out", duration: 1 });
}

export { gsap, ScrollTrigger, SplitText, DrawSVGPlugin, ScrambleTextPlugin, useGSAP };
