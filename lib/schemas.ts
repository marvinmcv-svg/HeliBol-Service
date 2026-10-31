/** Shared (client + server) form schemas. */
import { z } from "zod";

export const serviceTypes = [
  "energy",
  "rescue",
  "fire",
  "cargo",
  "vip",
  "scenic",
  "film",
  "turnkey",
  "other",
] as const;

export const LeadSchema = z
  .object({
    name: z.string().trim().min(2).max(120),
    phone: z.string().trim().max(40).optional(),
    email: z.email().max(160).optional(),
    company: z.string().trim().max(160).optional(),
    service: z.enum(serviceTypes),
    date: z.string().trim().max(80).optional(),
    route: z.string().trim().max(240).optional(),
    pax_or_cargo: z.string().trim().max(120).optional(),
    language: z.enum(["es", "en"]),
    notes: z.string().trim().max(2000).optional(),
  })
  .refine((l) => l.phone || l.email, { message: "phone or email required", path: ["email"] });
export type Lead = z.infer<typeof LeadSchema>;

export const QuoteSchema = z
  .object({
    type: z.enum(serviceTypes),
    dateStart: z.string().trim().min(1).max(40),
    dateEnd: z.string().trim().max(40).optional().or(z.literal("")),
    flexibility: z.enum(["exact", "days", "flexible"]),
    origin: z.string().trim().min(2).max(200),
    destination: z.string().trim().max(200).optional().or(z.literal("")),
    pax: z.coerce.number().int().min(0).max(500).optional(),
    cargoKg: z.coerce.number().min(0).max(100000).optional(),
    notes: z.string().trim().max(2000).optional().or(z.literal("")),
    name: z.string().trim().min(2).max(120),
    company: z.string().trim().max(160).optional().or(z.literal("")),
    email: z.email().max(160).optional().or(z.literal("")),
    phone: z.string().trim().max(40).optional().or(z.literal("")),
    language: z.enum(["es", "en"]),
    consent: z.literal(true),
    website: z.string().max(0).optional(), // honeypot
  })
  .refine((q) => q.email || q.phone, { message: "contactRequired", path: ["email"] });
export type Quote = z.infer<typeof QuoteSchema>;

export const ContactSchema = z
  .object({
    name: z.string().trim().min(2).max(120),
    company: z.string().trim().max(160).optional().or(z.literal("")),
    email: z.email().max(160).optional().or(z.literal("")),
    phone: z.string().trim().max(40).optional().or(z.literal("")),
    message: z.string().trim().min(5).max(4000),
    language: z.enum(["es", "en"]),
    consent: z.literal(true),
    website: z.string().max(0).optional(),
  })
  .refine((c) => c.email || c.phone, { message: "contactRequired", path: ["email"] });
export type Contact = z.infer<typeof ContactSchema>;
