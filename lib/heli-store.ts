"use client";
import { create } from "zustand";

export type HeliTopic = "quote" | "scenic" | "emergency" | "fleet" | "human" | string;

type HeliState = {
  open: boolean;
  topic?: HeliTopic;
  openHeli: (ctx?: { topic?: HeliTopic }) => void;
  closeHeli: () => void;
};

/** Global store so any "Hablar con Heli" CTA can open the panel with context (plan §8). */
export const useHeli = create<HeliState>((set) => ({
  open: false,
  topic: undefined,
  openHeli: (ctx) => set({ open: true, topic: ctx?.topic }),
  closeHeli: () => set({ open: false }),
}));
